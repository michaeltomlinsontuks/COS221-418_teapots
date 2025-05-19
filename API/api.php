<?php
//The new api.php file - decided to start over and bring stuff across because the new database is quite different
//Will need to disable these headers on the production code, needed for testing though
header("Access-Control-Allow-Origin: *");  // Allows access from any origin
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once 'connection.php';

class API
{
    private static $instance = null;
    private $conn;
    private $requestData;
    private $response;

    private function __construct()
    {
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

    public static function getInstance()
    {
        if (self::$instance == null) {
            self::$instance = new API();
        }
        return self::$instance;
    }

    private function validateAPIKey()
    {
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

    private function generateAPIKey()
    {
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

    private function hashPassword($password)
    {
        // Generate a random salt
        $salt = bin2hex(random_bytes(32));

        // Hash the password with the salt
        $hashedPassword = hash('sha512', $password . $salt);

        return [
            'hash' => $hashedPassword,
            'salt' => $salt
        ];
    }

    private function verifyPassword($password, $storedHash, $salt)
    {
        // Hash the input password with the stored salt
        $hashedPassword = hash('sha512', $password . $salt);

        // Compare the generated hash with the stored hash
        return $hashedPassword === $storedHash;
    }

    private function getUserID()
    {
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

    private function validateUsername()
    {
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

    private function validatePassword()
    {
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

    public function handleRequest()
    {
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
            case 'getcompanies':
                return $this->getCompanies();

            default:
                $this->response['message'] = 'Invalid request type';
                return $this->response;
        }
    }

    // User Management Functions
    private function login()
    {
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

    private function register()
    {
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
        $query = "INSERT INTO Users (Email,Username, PasswordHash, Salt, APIKey, CreatedAt) 
              VALUES (?,?, ?, ?, ?, NOW())";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("sssss", $email, $username, $passwordHash, $salt, $apiKey);

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

    //Get Product Page function needs to be reworked for the new database

    //Get Product function needs to be reworked for the new database

    //Get Product Comparisons needs to be reworked for the new database

    //Review functionality is broken needs to work with the database

    //GetCategories function needs to be reworked for the new database

    //GetBrands function needs to be reworked for the new database

    //New GetCompanies function needs to be made for the new database

    private function getCategories()
    {
        $query = "SELECT CategoryID, CategoryName FROM Category ORDER BY CategoryName";
        $result = $this->conn->query($query);

        $categories = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $categories[] = [
                    'category_id' => $row['CategoryID'],
                    'category_name' => $row['CategoryName']
                ];
            }
        }

        $this->response['status'] = 'success';
        $this->response['data'] = $categories;

        return $this->response;
    }

    private function getBrands()
    {
        $query = "SELECT BrandID, BrandName FROM Brand ORDER BY BrandName";
        $result = $this->conn->query($query);

        $brands = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $brands[] = [
                    'brand_id' => $row['BrandID'],
                    'brand_name' => $row['BrandName']
                ];
            }
        }

        $this->response['status'] = 'success';
        $this->response['data'] = $brands;

        return $this->response;
    }

    private function getCompanies()
    {
        $query = "SELECT CompanyID, Name FROM Company ORDER BY Name";
        $result = $this->conn->query($query);

        $companies = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $companies[] = [
                    'company_id' => $row['CompanyID'],
                    'company_name' => $row['Name']
                ];
            }
        }

        $this->response['status'] = 'success';
        $this->response['data'] = $companies;

        return $this->response;
    }

    private function addReview()
    {
        // Check required fields
        if (
            !isset($this->requestData['product_id']) || !isset($this->requestData['rating']) ||
            !isset($this->requestData['review_title']) || !isset($this->requestData['review_description'])
        ) {
            $this->response['message'] = 'Product ID, rating, title and description are required';
            return $this->response;
        }

        // Get user ID from API key
        $userID = $this->getUserID();
        if (!$userID) {
            return $this->response; // Message already set in getUserID
        }

        $productId = (int) $this->requestData['product_id'];
        $rating = (int) $this->requestData['rating']; // Cast to integer
        $reviewTitle = trim($this->requestData['review_title']);
        $reviewDescription = trim($this->requestData['review_description']);

        // Validate rating (between 1 and 5)
        if ($rating < 1 || $rating > 5) {
            $this->response['message'] = 'Rating must be between 1 and 5';
            return $this->response;
        }

        // Check if product exists
        $query = "SELECT ProductID FROM BestProduct WHERE ProductID = ?";
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

        // Add review
        $query = "INSERT INTO Review (ProductID, UserID, ReviewTitle, ReviewDescription, ReviewRating, Timestamp)
              VALUES (?, ?, ?, ?, ?, NOW())";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            $this->response['message'] = 'Database error: ' . $this->conn->error;
            return $this->response;
        }

        $stmt->bind_param("iissi", $productId, $userID, $reviewTitle, $reviewDescription, $rating);

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

    private function removeReview()
    {
        // Check required fields
        if (!isset($this->requestData['review_id'])) {
            $this->response['message'] = 'Review ID is required';
            return $this->response;
        }

        // Get user ID from API key
        $userID = $this->getUserID();
        if (!$userID) {
            return $this->response; // Message already set in getUserID
        }

        $reviewId = (int) $this->requestData['review_id'];

        // Get product ID from review for updating later
        $query = "SELECT ProductID FROM Review WHERE ReviewID = ? AND UserID = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ii", $reviewId, $userID);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            $this->response['message'] = 'Review not found or you do not have permission to delete it';
            return $this->response;
        }

        $productId = $result->fetch_assoc()['ProductID'];

        // Delete the review
        $query = "DELETE FROM Review WHERE ReviewID = ? AND UserID = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ii", $reviewId, $userID);

        if ($stmt->execute()) {
            // Update product rating
            $this->updateProductRating($productId);

            $this->response['status'] = 'success';
            $this->response['message'] = 'Review deleted successfully';
        } else {
            $this->response['message'] = 'Error deleting review: ' . $stmt->error;
        }

        return $this->response;
    }

    private function editReview()
    {
        // Check required fields
        if (
            !isset($this->requestData['review_id']) || !isset($this->requestData['rating']) ||
            !isset($this->requestData['review_title']) || !isset($this->requestData['review_description'])
        ) {
            $this->response['message'] = 'Review ID, rating, title and description are required';
            return $this->response;
        }

        // Get user ID from API key
        $userID = $this->getUserID();
        if (!$userID) {
            return $this->response; // Message already set in getUserID
        }

        $reviewId = (int) $this->requestData['review_id'];
        $rating = (int) $this->requestData['rating'];
        $reviewTitle = trim($this->requestData['review_title']);
        $reviewDescription = trim($this->requestData['review_description']);

        // Validate rating
        if ($rating < 1 || $rating > 5) {
            $this->response['message'] = 'Rating must be between 1 and 5';
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

        // Update review
        $query = "UPDATE Review SET ReviewRating = ?, ReviewTitle = ?, ReviewDescription = ?, Timestamp = NOW()
              WHERE ReviewID = ? AND UserID = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            $this->response['message'] = 'Database error: ' . $this->conn->error;
            return $this->response;
        }

        $stmt->bind_param("issii", $rating, $reviewTitle, $reviewDescription, $reviewId, $userID);

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

    private function getReviews()
    {
        // Check required fields
        if (!isset($this->requestData['product_id'])) {
            $this->response['message'] = 'Product ID is required';
            return $this->response;
        }

        $productId = (int) $this->requestData['product_id'];

        // Get reviews for the product
        $query = "SELECT r.ReviewID, r.UserID, u.Username, r.ReviewRating, r.ReviewTitle, r.ReviewDescription,
              r.Timestamp
              FROM Review r
              JOIN Users u ON r.UserID = u.UserID
              WHERE r.ProductID = ?
              ORDER BY r.Timestamp DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $productId);
        $stmt->execute();
        $result = $stmt->get_result();

        $reviews = [];
        while ($row = $result->fetch_assoc()) {
            $reviews[] = [
                'review_id' => $row['ReviewID'],
                'user_id' => $row['UserID'],
                'username' => $row['Username'],
                'rating' => (int) $row['ReviewRating'],
                'title' => $row['ReviewTitle'],
                'description' => $row['ReviewDescription'],
                'timestamp' => $row['Timestamp']
            ];
        }

        $this->response['status'] = 'success';
        $this->response['data'] = $reviews;

        return $this->response;
    }

    private function updateProductRating($productId)
    {
        // Calculate new review average and count
        $query = "SELECT AVG(ReviewRating) AS average, COUNT(*) AS count FROM Review WHERE ProductID = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            error_log("Error preparing statement in updateProductRating: " . $this->conn->error);
            return;
        }

        $stmt->bind_param("i", $productId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();

        // Calculate average with proper rounding
        $reviewAverage = $result['average'] ? round($result['average'], 2) : 0;
        $reviewCount = (int) $result['count'];

        // Update product review stats
        $query = "UPDATE BestProduct SET ReviewAverage = ?, ReviewCount = ? WHERE ProductID = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            error_log("Error preparing statement in updateProductRating: " . $this->conn->error);
            return;
        }

        $stmt->bind_param("dii", $reviewAverage, $reviewCount, $productId);
        $stmt->execute();
    }

    private function getProduct()
    {
        // Check if product ID is provided
        if (!isset($this->requestData['product_id'])) {
            $this->response['message'] = 'Product ID is required';
            return $this->response;
        }

        $productId = (int) $this->requestData['product_id'];

        // Get product details
        $query = "SELECT bp.ProductID, bp.Name, bp.Description, bp.ThumbnailImage, bp.ReviewAverage, 
                     bp.ReviewCount, bp.CarouselImages, bp.BestPrice AS SalePrice, 
                     bp.OnlineAvailability, bp.AddToCartURL, 'HardGood' AS Type, 
                     b.BrandName, c.CategoryName
               FROM BestProduct bp
               LEFT JOIN Brand b ON bp.BrandID = b.BrandID
               LEFT JOIN Category c ON bp.CategoryID = c.CategoryID
               WHERE bp.ProductID = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $productId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            $this->response['message'] = 'Product not found';
            return $this->response;
        }

        $productData = $result->fetch_assoc();

        // Format ReviewAverage to have 2 decimal places
        if (isset($productData['ReviewAverage'])) {
            $productData['ReviewAverage'] = number_format($productData['ReviewAverage'], 2);
        }

        // Format SalePrice to have 2 decimal places
        if (isset($productData['SalePrice'])) {
            $productData['SalePrice'] = number_format($productData['SalePrice'], 2);
        }

        // Get price comparisons
        $priceComparisons = $this->getProductComparisons($productId);

        // Format the response
        $this->response['status'] = 'success';
        $this->response['timestamp'] = time();
        $this->response['data'] = [
            'product' => $productData,
            'price_comparisons' => $priceComparisons
        ];
        $this->response['message'] = 'Product details retrieved successfully';

        return $this->response;
    }

    private function getProductComparisons($productId)
    {
        // List of retailers
        $retailers = [
            'Bitify',
            'ByteCrate',
            'ByteMart',
            'ChipCart',
            'CoreBay',
            'FuseBasket',
            'Nexonic',
            'TechNova',
            'VoltEdge',
            'ZapNest'
        ];

        $comparisons = [];

        foreach ($retailers as $retailer) {
            $query = "SELECT RegularPrice, DiscountedPrice, OnlineAvailability 
                  FROM $retailer WHERE ProductID = ?";

            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("i", $productId);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $priceData = $result->fetch_assoc();
                $regularPrice = $priceData['RegularPrice'];
                $discountedPrice = $priceData['DiscountedPrice'];

                // Calculate discount percentage
                $discountPercentage = 0;
                if ($regularPrice > 0 && $regularPrice > $discountedPrice) {
                    $discountPercentage = round(
                        (($regularPrice - $discountedPrice) / $regularPrice) * 100,
                        2
                    );
                }

                // Only include retailer if they have the product
                if ($priceData['OnlineAvailability']) {
                    $comparisons[$retailer] = [
                        'regularPrice' => number_format($regularPrice, 2),
                        'discountedPrice' => number_format($discountedPrice, 2),
                        'discountPercentage' => $discountPercentage
                    ];
                }
            }
        }
        // Sort by discounted price (lowest first)
        uasort($comparisons, function ($a, $b) {
            return floatval($a['discountedPrice']) <=> floatval($b['discountedPrice']);
        });

        return $comparisons;
    }

    private function getProductPage()
    {
        // Default parameters
        $limit = isset($this->requestData['limit']) ? (int) $this->requestData['limit'] : 51;
        $offset = isset($this->requestData['offset']) ? (int) $this->requestData['offset'] : 0;
        $sort = isset($this->requestData['sort']) ? $this->requestData['sort'] : 'price-low';
        $inStockOnly = isset($this->requestData['in_stock_only']) &&
            ($this->requestData['in_stock_only'] === true ||
                $this->requestData['in_stock_only'] === 'true' ||
                $this->requestData['in_stock_only'] === 1 ||
                $this->requestData['in_stock_only'] === '1');
        $search = isset($this->requestData['search']) ? trim($this->requestData['search']) : '';

        $parameters = [];
        $whereConditions = [];
        $joins = [];

        // Search functionality
        if (!empty($search)) {
            $searchParam = '%' . $search . '%';
            $searchFields = [
                'bp.Name',
                'bp.Description',
                'b.BrandName',
                'c.CategoryName'
            ];

            $searchConditions = [];
            foreach ($searchFields as $field) {
                $searchConditions[] = "$field LIKE ?";
                $parameters[] = $searchParam;
            }

            $whereConditions[] = '(' . implode(' OR ', $searchConditions) . ')';
        }

        // In-stock filter
        if ($inStockOnly) {
            $whereConditions[] = "bp.OnlineAvailability = 1";
        }

        // Brand filter
        if (isset($this->requestData['brands']) && is_array($this->requestData['brands'])) {
            if (!in_array('all', $this->requestData['brands']) && !empty($this->requestData['brands'])) {
                $brandPlaceholders = array_fill(0, count($this->requestData['brands']), '?');
                $whereConditions[] = "b.BrandName IN (" . implode(',', $brandPlaceholders) . ")";
                $parameters = array_merge($parameters, $this->requestData['brands']);
            }
        }

        // Category filter
        if (isset($this->requestData['categories']) && is_array($this->requestData['categories'])) {
            if (!in_array('all', $this->requestData['categories']) && !empty($this->requestData['categories'])) {
                $categoryPlaceholders = array_fill(0, count($this->requestData['categories']), '?');
                $whereConditions[] = "c.CategoryName IN (" . implode(',', $categoryPlaceholders) . ")";
                $parameters = array_merge($parameters, $this->requestData['categories']);
            }
        }

        // Company filter
        if (isset($this->requestData['companies']) && is_array($this->requestData['companies'])) {
            if (!in_array('all', $this->requestData['companies']) && !empty($this->requestData['companies'])) {
                $companyConditions = [];

                // Map company names to their respective table names
                $companyTables = [
                    'Bitify' => 'Bitify',
                    'ByteCrate' => 'ByteCrate',
                    'ByteMart' => 'ByteMart',
                    'ChipCart' => 'ChipCart',
                    'CoreBay' => 'CoreBay',
                    'FuseBasket' => 'FuseBasket',
                    'Nexonic' => 'Nexonic',
                    'TechNova' => 'TechNova',
                    'VoltEdge' => 'VoltEdge',
                    'ZapNest' => 'ZapNest'
                ];

                foreach ($this->requestData['companies'] as $company) {
                    if (isset($companyTables[$company])) {
                        $tableAlias = strtolower(substr($company, 0, 3)); // Create a short alias
                        $joins[] = "JOIN {$companyTables[$company]} {$tableAlias} ON bp.ProductID = {$tableAlias}.ProductID";

                        if ($inStockOnly) {
                            $companyConditions[] = "{$tableAlias}.OnlineAvailability = 1";
                        } else {
                            $companyConditions[] = "{$tableAlias}.ProductID IS NOT NULL";
                        }
                    }
                }

                if (!empty($companyConditions)) {
                    $whereConditions[] = '(' . implode(' OR ', $companyConditions) . ')';
                }
            }
        }

        // Price range filter
        if (isset($this->requestData['min_price']) && is_numeric($this->requestData['min_price'])) {
            $whereConditions[] = "bp.BestPrice >= ?";
            $parameters[] = (float) $this->requestData['min_price'];
        }

        if (isset($this->requestData['max_price']) && is_numeric($this->requestData['max_price'])) {
            $whereConditions[] = "bp.BestPrice <= ?";
            $parameters[] = (float) $this->requestData['max_price'];
        }

        // Base query
        $query = "SELECT DISTINCT bp.ProductID, bp.Name, bp.Description, bp.ThumbnailImage,
             bp.ReviewAverage, bp.ReviewCount, bp.BestPrice, bp.RegularPrice,
             bp.DiscountPercent, bp.OnlineAvailability, b.BrandName, c.CategoryName, bp.BestCompany
          FROM BestProduct bp
          LEFT JOIN Brand b ON bp.BrandID = b.BrandID
          LEFT JOIN Category c ON bp.CategoryID = c.CategoryID";

        // Add joins for company filters
        if (!empty($joins)) {
            $query .= " " . implode(" ", $joins);
        }

        // Count query for pagination
        $countQuery = "SELECT COUNT(DISTINCT bp.ProductID) as total
              FROM BestProduct bp
              LEFT JOIN Brand b ON bp.BrandID = b.BrandID
              LEFT JOIN Category c ON bp.CategoryID = c.CategoryID";

        // Add joins to count query too
        if (!empty($joins)) {
            $countQuery .= " " . implode(" ", $joins);
        }

        // Apply WHERE conditions
        if (!empty($whereConditions)) {
            $whereClause = " WHERE " . implode(' AND ', $whereConditions);
            $query .= $whereClause;
            $countQuery .= $whereClause;
        }

        // Sorting
        switch ($sort) {
            case 'price-high':
                $query .= " ORDER BY bp.BestPrice DESC";
                break;
            case 'name':
                $query .= " ORDER BY bp.Name ASC";
                break;
            case 'newest':
                $query .= " ORDER BY bp.LastUpdated DESC";
                break;
            case 'best-rated':
                $query .= " ORDER BY bp.ReviewAverage DESC, bp.ReviewCount DESC";
                break;
            case 'price-low':
            default:
                $query .= " ORDER BY bp.BestPrice ASC";
                break;
        }

        // Pagination
        $query .= " LIMIT ? OFFSET ?";

        // Get total count for pagination
        $countStmt = $this->conn->prepare($countQuery);
        if (!empty($parameters)) {
            $types = str_repeat('s', count($parameters));
            $countStmt->bind_param($types, ...$parameters);
        }
        $countStmt->execute();
        $totalCount = $countStmt->get_result()->fetch_assoc()['total'];

        // Execute main query
        $stmt = $this->conn->prepare($query);
        if (!empty($parameters)) {
            $allParams = array_merge($parameters, [$limit, $offset]);
            $types = str_repeat('s', count($parameters)) . 'ii';
            $stmt->bind_param($types, ...$allParams);
        } else {
            $stmt->bind_param('ii', $limit, $offset);
        }
        $stmt->execute();
        $result = $stmt->get_result();

        $products = [];

        // Process results
        while ($row = $result->fetch_assoc()) {
            // Calculate discount percentage if not already available
            $discountPercent = $row['DiscountPercent'];
            if ($discountPercent === null && $row['RegularPrice'] > 0 && $row['RegularPrice'] > $row['BestPrice']) {
                $discountPercent = round(
                    (($row['RegularPrice'] - $row['BestPrice']) / $row['RegularPrice']) * 100
                );
            }

            $product = [
                'id' => $row['ProductID'],
                'name' => $row['Name'],
                'brand' => $row['BrandName'],
                'category' => $row['CategoryName'],
                'thumbnail' => $row['ThumbnailImage'],
                'reviewAverage' => number_format((float) $row['ReviewAverage'], 2),
                'reviewCount' => $row['ReviewCount'],
                'regularPrice' => number_format((float) $row['RegularPrice'], 2),
                'salePrice' => number_format((float) $row['BestPrice'], 2),
                'discountPercent' => $discountPercent,
                'inStock' => (bool) $row['OnlineAvailability'],
                'bestCompany' => $row['BestCompany']
            ];

            $products[] = $product;
        }

        $this->response['status'] = 'success';
        $this->response['data'] = $products;
        $this->response['pagination'] = [
            'total' => $totalCount,
            'offset' => $offset,
            'limit' => $limit,
            'has_more' => ($offset + $limit) < $totalCount
        ];

        return $this->response;
    }

}

// Create API instance and handle the request
header('Content-Type: application/json');
$api = API::getInstance();
echo json_encode($api->handleRequest());
?>