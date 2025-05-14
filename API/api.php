<?php
//api.php
//Will need to disable these headers on the production code, needed for testing though
header("Access-Control-Allow-Origin: *");  // Allows access from any origin
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once 'connection.php';

class API {
    private static $instance = null;
    private $conn;
    private $requestData;
    private $response;

    private function __construct() {
        $this->conn = getConnection();
        // Ensure proper character encoding
        $this->conn->set_charset("utf8mb4");

        // Initialize response structure
        $this->response = [
            'status' => 'error',
            'timestamp' => time(),
            'data' => [],
            'message' => ''
        ];

        // Get request data from POST or JSON input
        $this->requestData = json_decode(file_get_contents('php://input'), true);
        if (!$this->requestData) {
            $this->requestData = $_POST;
        }
    }

    public static function getInstance() {
        if (self::$instance == null) {
            self::$instance = new API();
        }
        return self::$instance;
    }

    private function validateAPIKey() {
        // Check if API key is provided
        if (!isset($this->requestData['api_key']) || empty($this->requestData['api_key'])) {
            $this->response['message'] = 'API key is required';
            return false;
        }

        $apiKey = $this->requestData['api_key'];

        // Check if the API key exists in the database
        $query = "SELECT UserID FROM Users WHERE APIKey = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $apiKey);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            $this->response['message'] = 'Invalid API key';
            return false;
        }

        return true;
    }

    private function generateAPIKey() {
        // Generate a random string for API key
        $apiKey = bin2hex(random_bytes(32));

        // Check if the API key already exists in the database
        $stmt = $this->conn->prepare("SELECT 1 FROM Users WHERE APIKey = ?");
        $stmt->bind_param("s", $apiKey);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            // If the key exists, generate a new one
            return $this->generateAPIKey();
        }

        return $apiKey;
    }

    private function hashPassword($password) {
        // Generate a random salt
        $salt = bin2hex(random_bytes(32));

        // Hash the password with the salt
        $hashedPassword = hash('sha512', $password . $salt);

        return [
            'hash' => $hashedPassword,
            'salt' => $salt
        ];
    }

    private function verifyPassword($password, $storedHash, $salt) {
        // Hash the input password with the stored salt
        $hashedPassword = hash('sha512', $password . $salt);

        // Compare the generated hash with the stored hash
        return $hashedPassword === $storedHash;
    }

    private function getUserID() {
        // Check if API key is provided in the request
        if (!isset($this->requestData['api_key']) || empty($this->requestData['api_key'])) {
            $this->response['message'] = 'API key is required';
            return false;
        }

        $apiKey = $this->requestData['api_key'];

        // Query database to find the user associated with this API key
        $query = "SELECT UserID FROM Users WHERE APIKey = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $apiKey);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            $this->response['message'] = 'Invalid API key';
            return false;
        }

        // Return the user ID
        return $result->fetch_assoc()['UserID'];
    }

    private function validateEmail($email)
    {
        //validates email format and length - max 45
        if (strlen($email) > 45 || !preg_match('/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/', $email)) {
            return false;
        }
        return true;
    }

    private function validateUsername() {
        if (!isset($this->requestData['username']) || empty($this->requestData['username'])) {
            $this->response['message'] = 'Username is required';
            return false;
        }

        $username = $this->requestData['username'];

        // Username must be 3-20 characters and contain only letters, numbers, and underscores
        if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
            $this->response['message'] = 'Username must be 3-20 characters and contain only letters, numbers, and underscores';
            return false;
        }

        // Check if username already exists in database
        $query = "SELECT UserID FROM Users WHERE Username = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $username);
        $stmt->execute();

        if ($stmt->get_result()->num_rows > 0) {
            $this->response['message'] = 'Username already exists';
            return false;
        }

        return true;
    }

    private function validatePassword() {
        if (!isset($this->requestData['password']) || empty($this->requestData['password'])) {
            $this->response['message'] = 'Password is required';
            return false;
        }

        $password = $this->requestData['password'];

        // Password must be at least 8 characters
        if (strlen($password) < 8) {
            $this->response['message'] = 'Password must be at least 8 characters';
            return false;
        }

        // Password must contain at least one uppercase letter
        if (!preg_match('/[A-Z]/', $password)) {
            $this->response['message'] = 'Password must contain at least one uppercase letter';
            return false;
        }

        // Password must contain at least one lowercase letter
        if (!preg_match('/[a-z]/', $password)) {
            $this->response['message'] = 'Password must contain at least one lowercase letter';
            return false;
        }

        // Password must contain at least one number
        if (!preg_match('/[0-9]/', $password)) {
            $this->response['message'] = 'Password must contain at least one number';
            return false;
        }

        // Password must contain at least one special character
        if (!preg_match('/[^a-zA-Z0-9]/', $password)) {
            $this->response['message'] = 'Password must contain at least one special character';
            return false;
        }

        return true;
    }

    public function handleRequest() {
        if (!isset($this->requestData['type'])) {
            $this->response['message'] = 'Request type is required';
            return $this->response;
        }

        // Skip validation for login and register
        $skipValidation = ['login', 'register'];
        if (!in_array(strtolower($this->requestData['type']), $skipValidation)) {
            if (!$this->validateAPIKey()) {
                return $this->response;
            }
        }

        switch (strtolower($this->requestData['type'])) {
            // User Management
            case 'login':
                return $this->login();
            case 'register':
                return $this->register();
                
            // Product Management
            case 'getproductpage':
                return $this->getProductPage();
            case 'getproduct':
                return $this->getProduct();
            // Review Management
            case 'addreview':
                return $this->addReview();
            case 'removereview':
                return $this->removeReview();
            case 'editreview':
                return $this->editReview();
            case 'getreviews':
                return $this->getReviews();
                
            // Filter Management
            case 'getcategories':
                return $this->getCategories();
            case 'getbrands':
                return $this->getBrands();
                
            default:
                $this->response['message'] = 'Invalid request type';
                return $this->response;
        }
    }
    
    // User Management Functions
    private function login() {
        // Check if username and password are provided
        if (!isset($this->requestData['username']) || empty($this->requestData['username'])) {
            $this->response['message'] = 'Username is required';
            return $this->response;
        }

        if (!isset($this->requestData['password']) || empty($this->requestData['password'])) {
            $this->response['message'] = 'Password is required';
            return $this->response;
        }

        $username = $this->requestData['username'];
        $password = $this->requestData['password'];

        // Get user from database
        $query = "SELECT UserID, Username, PasswordHash, Salt, APIKey FROM Users WHERE Username = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            $this->response['message'] = 'Invalid credentials';
            return $this->response;
        }

        $user = $result->fetch_assoc();

        // Verify password
        if (!$this->verifyPassword($password, $user['PasswordHash'], $user['Salt'])) {
            $this->response['message'] = 'Invalid credentials';
            return $this->response;
        }

        // Login successful
        $this->response['status'] = 'success';
        $this->response['data'] = [
            'api_key' => $user['APIKey'],
            'user_id' => $user['UserID'],
            'username' => $user['Username']
        ];
        $this->response['message'] = 'Login successful';

        return $this->response;
    }

    private function register() {
        // Check if required fields are provided
        $requiredFields = ['username', 'password', 'email'];
        foreach ($requiredFields as $field) {
            if (!isset($this->requestData[$field]) || empty($this->requestData[$field])) {
                $this->response['message'] = ucfirst($field) . ' is required';
                return $this->response;
            }
        }

        $username = $this->requestData['username'];
        $password = $this->requestData['password'];
        $email = $this->requestData['email'];

        // Validate username
        if (!$this->validateUsername()) {
            return $this->response;
        }

        // Validate email
        if (!$this->validateEmail($email)) {
            $this->response['message'] = 'Invalid email format';
            return $this->response;
        }

        // Validate password
        if (!$this->validatePassword()) {
            return $this->response;
        }

        // Hash the password and get the salt
        $passwordData = $this->hashPassword($password);
        $passwordHash = $passwordData['hash'];
        $salt = $passwordData['salt'];

        // Generate a unique API key
        $apiKey = $this->generateAPIKey();

        // Insert user into database
        $query = "INSERT INTO Users (Username, PasswordHash, Salt, APIKey, CreatedAt) 
              VALUES (?, ?, ?, ?, NOW())";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ssss", $username, $passwordHash, $salt, $apiKey);

        if ($stmt->execute()) {
            $this->response['status'] = 'success';
            $this->response['data'] = [
                'api_key' => $apiKey
            ];
            $this->response['message'] = 'Registration successful';
        } else {
            $this->response['message'] = 'Registration failed: ' . $this->conn->error;
        }

        return $this->response;
    }
    
    // Product Management Functions

    private function getProductPage()
    {
        // Validate required parameters
        $required = ['type', 'api_key'];
        foreach ($required as $field)
        {
            if (!isset($this->requestData[$field]))
            {
                $this->response['status'] = 'error';
                $this->response['timestamp'] = time();
                $this->response['data'] = [];
                $this->response['message'] = "Missing $field parameter";
                return $this->response;
            }
        }

        // Validate API key
        $apiKey = trim($this->requestData['api_key']);
        if (!$this->validateAPIKey()) {
            $this->response['status'] = 'error';
            $this->response['timestamp'] = time();
            $this->response['data'] = [];
            $this->response['message'] = "Invalid API key";
            return $this->response;
        }

        // Get parameters
        $page = isset($this->requestData['parameters']['page']) ? (int)$this->requestData['parameters']['page'] : 1;
        $limit = isset($this->requestData['parameters']['limit']) ? (int)$this->requestData['parameters']['limit'] : 10;
        $offset = ($page - 1) * $limit;
        $search = isset($this->requestData['parameters']['search']) ? $this->requestData['parameters']['search'] : '';
        $categoryName = isset($this->requestData['parameters']['category']) ? $this->requestData['parameters']['category'] : '';
        $brandName = isset($this->requestData['parameters']['brand']) ? $this->requestData['parameters']['brand'] : '';
        $minPrice = isset($this->requestData['parameters']['minPrice']) && is_numeric($this->requestData['parameters']['minPrice']) ? (float)$this->requestData['parameters']['minPrice'] : null;
        $maxPrice = isset($this->requestData['parameters']['maxPrice']) && is_numeric($this->requestData['parameters']['maxPrice']) ? (float)$this->requestData['parameters']['maxPrice'] : null;
        $sortBy = isset($this->requestData['parameters']['sortBy']) ? $this->requestData['parameters']['sortBy'] : 'Name';
        $sortOrder = isset($this->requestData['parameters']['sortOrder']) && strtoupper($this->requestData['parameters']['sortOrder']) === 'DESC' ? 'DESC' : 'ASC';

        // query from db
        $query = "SELECT p.productID, p.Name, p.Description, p.ThumbnailImage, p.ReviewAverage, p.ReviewCount, p.CarouselImages, p.Type, p.AddToCartURL, p.SalePrice, p.OnlineAvailability,
                     fp.BestCompany, fp.BestPrice, fp.DiscountPercent, fp.RegularPrice, fp.AddToCartURL AS fpAddToCartURL, fp.OnlineAvailability AS fpOnlineAvailability,
                     c.categoryID, c.categoryName, b.brandID, b.brandName
              FROM product p
              LEFT JOIN finalproduct fp ON p.productID = fp.productID
              LEFT JOIN category c ON p.CategoryName = c.categoryName
              LEFT JOIN brand b ON p.BrandName = b.brandName";
        $whereClauses = [];
        $params = [];
        $paramTypes = '';

        // Handle search(fuzzy from 216 attempt)
        $fuzzy = true;
        if ($search !== '')
        {
            $whereClauses[] = "(p.Name LIKE ? OR p.Description LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $paramTypes .= 'ss';
        }

        // Handle category
        if ($categoryName !== '') {
            $whereClauses[] = "c.categoryName = ?";
            $params[] = $categoryName;
            $paramTypes .= 's';
        }

        // Handle brand
        if ($brandName !== '') {
            $whereClauses[] = "b.brandName = ?";
            $params[] = $brandName;
            $paramTypes .= 's';
        }

        // Handle price range (using BestPrice from finalproduct from what readme says)
        if ($minPrice !== null)
        {
            $whereClauses[] = "fp.BestPrice >= ?";
            $params[] = $minPrice;
            $paramTypes .= 'd';
        }

        if ($maxPrice !== null)
        {
            $whereClauses[] = "fp.BestPrice <= ?";
            $params[] = $maxPrice;
            $paramTypes .= 'd';
        }

        //where clauses
        if (!empty($whereClauses))
        {
            $query .= " WHERE " . implode(' AND ', $whereClauses);
        }

        // Handle sort
        $validSorts = ['Name', 'SalePrice', 'ReviewAverage', 'BestPrice'];
        if (!in_array($sortBy, $validSorts))
        {
            $sortBy = 'Name';
        }
        $query .= " ORDER BY $sortBy $sortOrder";

        // Handle pagination (never done pagination so not sure if this works fully)
        $query .= " LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        $paramTypes .= 'ii';

        // Get total count for pagination
        $countQuery = "SELECT COUNT(*) as total
                   FROM product p
                   LEFT JOIN finalproduct fp ON p.productID = fp.productID
                   LEFT JOIN category c ON p.CategoryName = c.categoryName
                   LEFT JOIN brand b ON p.BrandName = b.brandName";
        if (!empty($whereClauses))
        {
            $countQuery .= " WHERE " . implode(' AND ', $whereClauses);
        }
        $countStmt = $this->conn->prepare($countQuery);
        if (!empty($params))
        {
            $countStmt->bind_param(substr($paramTypes, 0, -2), ...array_slice($params, 0, -2));
        }
        $countStmt->execute();
        $totalProducts = $countStmt->get_result()->fetch_assoc()['total'];
        $totalPages = ceil($totalProducts / $limit);

        // Execute query
        $stmt = $this->conn->prepare($query);
        if (!$stmt)
        {
            error_log("Prepare failed (getProductPage): " . $this->conn->error);
            $this->response['status'] = 'error';
            $this->response['timestamp'] = time();
            $this->response['data'] = [];
            $this->response['message'] = "Database error";
            return $this->response;
        }

        if (!empty($params))
        {
            $stmt->bind_param($paramTypes, ...$params);
        }

        if (!$stmt->execute())
        {
            error_log("Execute failed (getProductPage): " . $stmt->error);
            $stmt->close();
            $this->response['status'] = 'error';
            $this->response['timestamp'] = time();
            $this->response['data'] = [];
            $this->response['message'] = "Database error";
            return $this->response;
        }
        $result = $stmt->get_result();
        $products = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        //Readme compliance attempt
        $formattedProducts = [];
        foreach ($products as $product) {
            $formattedProducts[] = [
                'productID' => $product['productID'],
                'productName' => $product['Name'],
                'productDescription' => $product['Description'],
                'thumbnailImage' => $product['ThumbnailImage'],
                'customerReviewAverage' => $product['ReviewAverage'],
                'customerReviewCount' => $product['ReviewCount'],
                'manufacturer' => $product['brandName'],
                'bestPrice' => $product['BestPrice'] ?? $product['SalePrice'],
                'bestCompany' => $product['BestCompany'],
                'categoryID' => $product['categoryID'],
                'categoryName' => $product['categoryName']
            ];
        }

        $this->response['status'] = 'success';
        $this->response['timestamp'] = time();
        $this->response['data'] = [
            'products' => $formattedProducts,
            'pagination' =>
                [
                    'currentPage' => $page,
                    'totalPages' => $totalPages,
                    'totalProducts' => $totalProducts,
                    'limit' => $limit
                ]
        ];
        $this->response['message'] = 'Products retrieved successfully';
        return $this->response;
    }

    // Filter Management Functions
    private function getCategories()
    {

        // $parent = isset($this->requestData['parameters']['parent']) ? $this->requestData['parameters']['parent'] : null;
        // if ($parent !== null)
        // {
        //     error_log("getCategories: 'parent' parameter provided but ignored - category table has no parentID field");
        // }

        // Fetch all categories
        $query = "SELECT categoryID, categoryName FROM category ORDER BY categoryName";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();

        $categories = [];
        while ($row = $result->fetch_assoc())
        {
            $categories[] =
                [
                    'categoryID' => $row['categoryID'],
                    'categoryName' => $row['categoryName'],
                    'categoryEquivalents' => [] // Placeholder, expand if equivalents exist,not sure if this is fully right
                ];
        }

        $this->response['status'] = 'success';
        $this->response['timestamp'] = time();
        $this->response['data'] = $categories;
        $this->response['message'] = 'Categories retrieved successfully';
        return $this->response;
    }

    private function getBrands()
    {
        // Get categoryID parameter
        $categoryID = isset($this->requestData['parameters']['categoryID']) ? (int)$this->requestData['parameters']['categoryID'] : null;

        // Initialize query
        $query = "SELECT DISTINCT b.brandID, b.brandName
              FROM brand b
              INNER JOIN product p ON p.BrandName = b.brandName";
        if ($categoryID !== null)
        {
            $query .= " INNER JOIN category c ON p.CategoryName = c.categoryName";
        }
        $whereClauses = [];
        $params = [];
        $paramTypes = '';

        // filter
        if ($categoryID !== null)
        {
            $whereClauses[] = "c.categoryID = ?";
            $params[] = $categoryID;
            $paramTypes .= 'i';
        }

        // where clause
        if (!empty($whereClauses))
        {
            $query .= " WHERE " . implode(' AND ', $whereClauses);
        }
        $query .= " ORDER BY b.brandName";

        $stmt = $this->conn->prepare($query);
        if (!empty($params))
        {
            $stmt->bind_param($paramTypes, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();

        $brands = [];
        while ($row = $result->fetch_assoc())
        {
            $brands[] =
                [
                    'brandID' => $row['brandID'],
                    'brandName' => $row['brandName']
                ];
        }

        $this->response['status'] = 'success';
        $this->response['timestamp'] = time();
        $this->response['data'] = $brands;
        $this->response['message'] = 'Brands retrieved successfully';
        return $this->response;
    }

    private function getProduct() {
        // Check if product ID is provided
        if (!isset($this->requestData['product_id'])) {
            $this->response['message'] = 'Product ID is required';
            return $this->response;
        }

        $productId = (int)$this->requestData['product_id'];

        // Get product details
        $query = "SELECT * FROM Product WHERE ProductID = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $productId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            $this->response['message'] = 'Product not found';
            return $this->response;
        }

        $productData = $result->fetch_assoc();

        // Get price comparisons
        $priceComparisons = $this->getProductComparisons($productId);

        // Format the response
        $this->response['status'] = 'success';
        $this->response['data'] = [
            'product' => $productData,
            'price_comparisons' => $priceComparisons
        ];
        $this->response['message'] = 'Product details retrieved successfully';

        return $this->response;
    }

    private function getProductComparisons($productId) {
        // List of retailers
        $retailers = [
            'Bitify', 'ByteCrate', 'ByteMart', 'ChipCart', 'CoreBay',
            'FuseBasket', 'Nexonic', 'TechNova', 'VoltEdge', 'ZapNest'
        ];

        $comparisons = [];

        foreach ($retailers as $retailer) {
            $query = "SELECT regularPrice, discountedPrice FROM {$retailer} WHERE product_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("i", $productId);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $priceData = $result->fetch_assoc();
                $comparisons[$retailer] = [
                    'regularPrice' => $priceData['regularPrice'],
                    'discountedPrice' => $priceData['discountedPrice'],
                    'discountPercentage' => $priceData['regularPrice'] > 0 ?
                        round((($priceData['regularPrice'] - $priceData['discountedPrice']) / $priceData['regularPrice']) * 100, 2) : 0
                ];
            }
        }

        // Sort by discounted price (lowest first)
        uasort($comparisons, function($a, $b) {
            return $a['discountedPrice'] <=> $b['discountedPrice'];
        });

        return $comparisons;
    }
// Review Management Functions
    private function addReview() {
        // Check required fields
        if (!isset($this->requestData['product_id']) || !isset($this->requestData['rating']) || !isset($this->requestData['review_text'])) {
            $this->response['message'] = 'Product ID, rating, and review text are required';
            return $this->response;
        }

        // Get user ID from API key
        $userID = $this->getUserID();
        if (!$userID) {
            return $this->response; // Message already set in getUserID
        }

        $productId = (int)$this->requestData['product_id'];
        $rating = (int)$this->requestData['rating']; // Cast to integer instead of float
        $reviewText = trim($this->requestData['review_text']);

        // Validate rating (between 0 and 5)
        if ($rating < 0 || $rating > 5) {
            $this->response['message'] = 'Rating must be between 0 and 5';
            return $this->response;
        }

        // Check if product exists
        $query = "SELECT ProductID FROM Product WHERE ProductID = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $productId);
        $stmt->execute();
        if ($stmt->get_result()->num_rows === 0) {
            $this->response['message'] = 'Product not found';
            return $this->response;
        }

        // Check if user already reviewed this product
        $query = "SELECT ReviewID FROM Review WHERE ProductID = ? AND UserID = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ii", $productId, $userID);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            $this->response['message'] = 'You have already reviewed this product';
            return $this->response;
        }

        // Add review - use integer (i) for rating instead of double (d)
        $query = "INSERT INTO Review (ProductID, UserID, Rating, ReviewText, CreatedAt) 
              VALUES (?, ?, ?, ?, NOW())";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            $this->response['message'] = 'Database error: ' . $this->conn->error;
            return $this->response;
        }

        $stmt->bind_param("iiis", $productId, $userID, $rating, $reviewText);

        if ($stmt->execute()) {
            // Update product rating
            $this->updateProductRating($productId);

            $this->response['status'] = 'success';
            $this->response['message'] = 'Review added successfully';
        } else {
            $this->response['message'] = 'Error adding review: ' . $stmt->error;
        }

        return $this->response;
    }

    private function editReview() {
        // Check required fields
        if (!isset($this->requestData['review_id']) || !isset($this->requestData['rating']) || !isset($this->requestData['review_text'])) {
            $this->response['message'] = 'Review ID, rating, and review text are required';
            return $this->response;
        }

        // Get user ID from API key
        $userID = $this->getUserID();
        if (!$userID) {
            return $this->response; // Message already set in getUserID
        }

        $reviewId = (int)$this->requestData['review_id'];
        $rating = (int)$this->requestData['rating']; // Cast to integer instead of float
        $reviewText = trim($this->requestData['review_text']);

        // Validate rating
        if ($rating < 0 || $rating > 5) {
            $this->response['message'] = 'Rating must be between 0 and 5';
            return $this->response;
        }

        // Get product ID from review for updating later
        $query = "SELECT ProductID FROM Review WHERE ReviewID = ? AND UserID = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            $this->response['message'] = 'Database error: ' . $this->conn->error;
            return $this->response;
        }

        $stmt->bind_param("ii", $reviewId, $userID);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            $this->response['message'] = 'Review not found or you do not have permission to edit it';
            return $this->response;
        }

        $productId = $result->fetch_assoc()['ProductID'];

        // Update review - use integer (i) for rating instead of double (d)
        $query = "UPDATE Review SET Rating = ?, ReviewText = ?, UpdatedAt = NOW() 
              WHERE ReviewID = ? AND UserID = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            $this->response['message'] = 'Database error: ' . $this->conn->error;
            return $this->response;
        }

        $stmt->bind_param("isii", $rating, $reviewText, $reviewId, $userID);

        if ($stmt->execute()) {
            // Update product rating
            $this->updateProductRating($productId);

            $this->response['status'] = 'success';
            $this->response['message'] = 'Review updated successfully';
        } else {
            $this->response['message'] = 'Error updating review: ' . $stmt->error;
        }

        return $this->response;
    }

// Also update the updateProductRating function to properly handle conversion
    private function updateProductRating($productId) {
        // Calculate new review average and count
        $query = "SELECT AVG(Rating) AS average, COUNT(*) AS count FROM Review WHERE ProductID = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            error_log("Error preparing statement in updateProductRating: " . $this->conn->error);
            return;
        }

        $stmt->bind_param("i", $productId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();

        // Calculate average with proper rounding - reviews are integers but average should be decimal
        $reviewAverage = $result['average'] ? round($result['average'], 2) : 0;
        $reviewCount = (int)$result['count'];

        // Update product review stats
        $query = "UPDATE Product SET ReviewAverage = ?, ReviewCount = ? WHERE ProductID = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            error_log("Error preparing statement in updateProductRating (Product): " . $this->conn->error);
            return;
        }

        $stmt->bind_param("dii", $reviewAverage, $reviewCount, $productId);
        $stmt->execute();

        // Also update the FinalProduct table if it has a record for this product
        $query = "UPDATE FinalProduct SET ReviewAverage = ?, ReviewCount = ? WHERE ProductID = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            error_log("Error preparing statement in updateProductRating (FinalProduct): " . $this->conn->error);
            return;
        }

        $stmt->bind_param("dii", $reviewAverage, $reviewCount, $productId);
        $stmt->execute();
    }
}

// Create API instance and handle the request
header('Content-Type: application/json');
$api = API::getInstance();
echo json_encode($api->handleRequest());
?>
