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
        if (!isset($this->requestData['apiKey']) || empty($this->requestData['apiKey'])) {
            $this->response['message'] = 'API key is required';
            return false;
        }

        $apiKey = $this->requestData['apiKey'];

        // Handle guest API keys
        if (strpos($apiKey, 'GUEST_') === 0) {
            // Limited access for guest users
            return true;
        }

        // Check if the API key exists in the database
        $stmt = $this->conn->prepare("SELECT 1 FROM User WHERE apiKey = ?");
        $stmt->bind_param("s", $apiKey);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            $this->response['message'] = 'Invalid API key';
            return false;
        }

        return true;
    }

    private function generateAPIKey($email) {
        // Generate a random API key
        $random = bin2hex(random_bytes(16));
        
        // Use email as salt for added security
        $salt = substr(md5($email), 0, 10);
        
        return $salt . '_' . $random;
    }

    private function hashPassword($password) {
        // Hash the password using SHA-512
        return hash('sha512', $password);
    }

    private function verifyPassword($password, $hash) {
        // Verify the password against the stored hash
        return hash('sha512', $password) === $hash;
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
            case 'getuserid':
                return $this->getUserID();
            case 'validatepassword':
                return $this->validatePassword();
            case 'verifypassword':
                return $this->verifyPassword();
            case 'hashpassword':
                return $this->hashPassword();
                
            // Product Management
            case 'getproductpage':
                return $this->getProductPage();
            case 'getproduct':
                return $this->getProduct();
            case 'getproductcomparisons':
                return $this->getProductComparisons();
                
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
        if (!isset($this->requestData['parameters']['username']) || 
            !isset($this->requestData['parameters']['password'])) {
            $this->response['message'] = 'Username and password are required';
            return $this->response;
        }
        
        $username = $this->requestData['parameters']['username'];
        $password = $this->requestData['parameters']['password'];
        
        // Query user from database
        $stmt = $this->conn->prepare("SELECT userID, username, password, apiKey FROM User WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $this->response['message'] = 'User not found';
            return $this->response;
        }
        
        $user = $result->fetch_assoc();
        
        // Verify password
        if ($this->verifyPassword($password, $user['password'])) {
            $this->response['status'] = 'success';
            $this->response['data'] = [
                [
                    'userID' => $user['userID'],
                    'apiKey' => $user['apiKey'],
                    'username' => $user['username']
                ]
            ];
            $this->response['message'] = 'Login successful';
        } else {
            $this->response['message'] = 'Invalid credentials';
        }
        
        return $this->response;
    }
    
    private function register() {
        if (!isset($this->requestData['parameters']['username']) || 
            !isset($this->requestData['parameters']['password']) || 
            !isset($this->requestData['parameters']['email'])) {
            $this->response['message'] = 'Username, password, and email are required';
            return $this->response;
        }
        
        $username = $this->requestData['parameters']['username'];
        $password = $this->requestData['parameters']['password'];
        $email = $this->requestData['parameters']['email'];
        
        // Check if username or email already exists
        $stmt = $this->conn->prepare("SELECT 1 FROM User WHERE username = ? OR email = ?");
        $stmt->bind_param("ss", $username, $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $this->response['message'] = 'Username or email already exists';
            return $this->response;
        }
        
        // Hash password and generate API key
        $hashedPassword = $this->hashPassword($password);
        $apiKey = $this->generateAPIKey($email);
        
        // Insert new user
        $stmt = $this->conn->prepare("INSERT INTO User (username, password, email, apiKey) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $username, $hashedPassword, $email, $apiKey);
        
        if ($stmt->execute()) {
            $userID = $stmt->insert_id;
            $this->response['status'] = 'success';
            $this->response['data'] = [
                [
                    'userID' => $userID,
                    'apiKey' => $apiKey
                ]
            ];
            $this->response['message'] = 'Registration successful';
        } else {
            $this->response['message'] = 'Failed to register user: ' . $stmt->error;
        }
        
        return $this->response;
    }
    
    private function getUserID() {
        if (!isset($this->requestData['parameters']['apiKey'])) {
            $this->response['message'] = 'API key is required';
            return $this->response;
        }
        
        $apiKey = $this->requestData['parameters']['apiKey'];
        
        $stmt = $this->conn->prepare("SELECT userID FROM User WHERE apiKey = ?");
        $stmt->bind_param("s", $apiKey);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $this->response['message'] = 'Invalid API key';
            return $this->response;
        }
        
        $user = $result->fetch_assoc();
        $this->response['status'] = 'success';
        $this->response['data'] = [
            [
                'userID' => $user['userID']
            ]
        ];
        
        return $this->response;
    }
    
    private function validatePassword() {
        if (!isset($this->requestData['parameters']['username']) || 
            !isset($this->requestData['parameters']['password'])) {
            $this->response['message'] = 'Username and password are required';
            return $this->response;
        }
        
        $username = $this->requestData['parameters']['username'];
        $password = $this->requestData['parameters']['password'];
        
        $stmt = $this->conn->prepare("SELECT password FROM User WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $this->response['status'] = 'success';
            $this->response['data'] = [
                [
                    'valid' => false
                ]
            ];
            return $this->response;
        }
        
        $user = $result->fetch_assoc();
        $valid = $this->verifyPassword($password, $user['password']);
        
        $this->response['status'] = 'success';
        $this->response['data'] = [
            [
                'valid' => $valid
            ]
        ];
        
        return $this->response;
    }
    
    // Product Management Functions
    
    private function getProductPage() {
        // Extract parameters
        $parameters = $this->requestData['parameters'] ?? [];
        $page = $parameters['page'] ?? 1;
        $limit = $parameters['limit'] ?? 10;
        $search = $parameters['search'] ?? '';
        $sort = $parameters['sort'] ?? 'name';
        $order = $parameters['order'] ?? 'asc';
        $filters = $parameters['filters'] ?? [];
        
        // Calculate offset
        $offset = ($page - 1) * $limit;
        
        // Build query
        $query = "SELECT p.productID, p.productName, p.productDescription, p.thumbnailImage, 
                 p.customerReviewAverage, p.customerReviewCount, p.manufacturer, 
                 MIN(pp.price) as bestPrice, 
                 (SELECT cl.companyName FROM CompanyList cl 
                  JOIN ProductPricing pp2 ON cl.companyID = pp2.companyID 
                  WHERE pp2.productID = p.productID 
                  ORDER BY pp2.price ASC LIMIT 1) as bestCompany
                 FROM Product p
                 LEFT JOIN ProductPricing pp ON p.productID = pp.productID";
        
        $whereConditions = [];
        $queryParams = [];
        
        // Add search condition
        if (!empty($search)) {
            $whereConditions[] = "(p.productName LIKE ? OR p.productDescription LIKE ? OR p.manufacturer LIKE ?)";
            $searchParam = "%$search%";
            $queryParams[] = $searchParam;
            $queryParams[] = $searchParam;
            $queryParams[] = $searchParam;
        }
        
        // Add filter conditions
        if (!empty($filters)) {
            if (isset($filters['categories']) && !empty($filters['categories'])) {
                $categoryPlaceholders = implode(',', array_fill(0, count($filters['categories']), '?'));
                $whereConditions[] = "p.category IN ($categoryPlaceholders)";
                foreach ($filters['categories'] as $category) {
                    $queryParams[] = $category;
                }
            }
            
            if (isset($filters['brands']) && !empty($filters['brands'])) {
                $brandPlaceholders = implode(',', array_fill(0, count($filters['brands']), '?'));
                $whereConditions[] = "p.manufacturer IN ($brandPlaceholders)";
                foreach ($filters['brands'] as $brand) {
                    $queryParams[] = $brand;
                }
            }
            
            if (isset($filters['minRating']) && is_numeric($filters['minRating'])) {
                $whereConditions[] = "p.customerReviewAverage >= ?";
                $queryParams[] = $filters['minRating'];
            }
        }
        
        // Combine where conditions
        if (!empty($whereConditions)) {
            $query .= " WHERE " . implode(' AND ', $whereConditions);
        }
        
        // Add grouping
        $query .= " GROUP BY p.productID";
        
        // Add sorting
        $validSortFields = ['name' => 'p.productName', 'price' => 'bestPrice', 'discount' => 'discountPercentage'];
        $sortField = $validSortFields[$sort] ?? 'p.productName';
        $sortOrder = strtoupper($order) === 'DESC' ? 'DESC' : 'ASC';
        $query .= " ORDER BY $sortField $sortOrder";
        
        // Add pagination
        $query .= " LIMIT ?, ?";
        $queryParams[] = (int)$offset;
        $queryParams[] = (int)$limit;
        
        // Execute query
        $stmt = $this->conn->prepare($query);
        if (!empty($queryParams)) {
            $types = str_repeat('s', count($queryParams) - 2) . 'ii';
            $stmt->bind_param($types, ...$queryParams);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        
        // Fetch results
        $products = [];
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
        
        $this->response['status'] = 'success';
        $this->response['data'] = $products;
        $this->response['message'] = 'Products retrieved successfully';
        
        return $this->response;
    }
    
    private function getProduct() {
        if (!isset($this->requestData['parameters']['productID'])) {
            $this->response['message'] = 'Product ID is required';
            return $this->response;
        }
        
        $productID = (int)$this->requestData['parameters']['productID'];
        
        $query = "SELECT p.productID, p.productName, p.longDescription, p.thumbnailImage, 
                 p.customerReviewAverage, p.customerReviewCount, p.manufacturer, 
                 p.modelNumber, p.category, p.onlineAvailability
                 FROM Product p
                 WHERE p.productID = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $productID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $this->response['message'] = 'Product not found';
            return $this->response;
        }
        
        $product = $result->fetch_assoc();
        
        // Get image gallery
        $imageQuery = "SELECT imageURL FROM ImageGallery WHERE productID = ?";
        $imageStmt = $this->conn->prepare($imageQuery);
        $imageStmt->bind_param("i", $productID);
        $imageStmt->execute();
        $imageResult = $imageStmt->get_result();
        
        $imageGallery = [];
        while ($img = $imageResult->fetch_assoc()) {
            $imageGallery[] = $img['imageURL'];
        }
        
        $product['imageGallery'] = $imageGallery;
        
        $this->response['status'] = 'success';
        $this->response['data'] = [$product];
        $this->response['message'] = 'Product retrieved successfully';
        
        return $this->response;
    }
    
    private function getProductComparisons() {
        if (!isset($this->requestData['parameters']['productID'])) {
            $this->response['message'] = 'Product ID is required';
            return $this->response;
        }
        
        $productID = (int)$this->requestData['parameters']['productID'];
        
        $query = "SELECT c.companyID, c.companyName, pp.price, pp.discountPercentage, 
                 pp.originalPrice, pp.inStock, pp.addToCartURL
                 FROM ProductPricing pp
                 JOIN CompanyList c ON pp.companyID = c.companyID
                 WHERE pp.productID = ?
                 ORDER BY pp.price ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $productID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $comparisons = [];
        while ($row = $result->fetch_assoc()) {
            $comparisons[] = $row;
        }
        
        $this->response['status'] = 'success';
        $this->response['data'] = $comparisons;
        $this->response['message'] = 'Product comparisons retrieved successfully';
        
        return $this->response;
    }
    
    // Review Management Functions
    
    private function addReview() {
        $params = $this->requestData['parameters'] ?? [];
        
        if (!isset($params['userID']) || !isset($params['productID']) || 
            !isset($params['reviewTitle']) || !isset($params['reviewDescription']) || 
            !isset($params['reviewRating'])) {
            $this->response['message'] = 'Missing required parameters for adding a review';
            return $this->response;
        }
        
        $userID = (int)$params['userID'];
        $productID = (int)$params['productID'];
        $reviewTitle = $params['reviewTitle'];
        $reviewDescription = $params['reviewDescription'];
        $reviewRating = (int)$params['reviewRating'];
        
        if ($reviewRating < 1 || $reviewRating > 5) {
            $this->response['message'] = 'Review rating must be between 1 and 5';
            return $this->response;
        }
        
        $stmt = $this->conn->prepare("INSERT INTO Review 
                                    (userID, productID, reviewTitle, reviewDescription, reviewRating, reviewDate) 
                                    VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->bind_param("iissi", $userID, $productID, $reviewTitle, $reviewDescription, $reviewRating);
        
        if ($stmt->execute()) {
            $reviewID = $stmt->insert_id;
            
            // Update product average rating
            $this->updateProductRating($productID);
            
            $this->response['status'] = 'success';
            $this->response['data'] = [
                [
                    'reviewID' => $reviewID
                ]
            ];
            $this->response['message'] = 'Review added successfully';
        } else {
            $this->response['message'] = 'Failed to add review: ' . $stmt->error;
        }
        
        return $this->response;
    }
    
    private function removeReview() {
        $params = $this->requestData['parameters'] ?? [];
        
        if (!isset($params['reviewID']) || !isset($params['userID'])) {
            $this->response['message'] = 'Review ID and User ID are required';
            return $this->response;
        }
        
        $reviewID = (int)$params['reviewID'];
        $userID = (int)$params['userID'];
        
        $stmt = $this->conn->prepare("SELECT productID FROM Review WHERE reviewID = ? AND userID = ?");
        $stmt->bind_param("ii", $reviewID, $userID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $this->response['message'] = 'Review not found or you are not authorized to remove it';
            return $this->response;
        }
        
        $productID = $result->fetch_assoc()['productID'];
        
        $stmt = $this->conn->prepare("DELETE FROM Review WHERE reviewID = ?");
        $stmt->bind_param("i", $reviewID);
        
        if ($stmt->execute()) {
            // Update product average rating
            $this->updateProductRating($productID);
            
            $this->response['status'] = 'success';
            $this->response['data'] = [
                [
                    'success' => true
                ]
            ];
            $this->response['message'] = 'Review removed successfully';
        } else {
            $this->response['message'] = 'Failed to remove review: ' . $stmt->error;
        }
        
        return $this->response;
    }
    
    private function editReview() {
        $params = $this->requestData['parameters'] ?? [];
        
        if (!isset($params['reviewID']) || !isset($params['userID'])) {
            $this->response['message'] = 'Review ID and User ID are required';
            return $this->response;
        }
        
        $reviewID = (int)$params['reviewID'];
        $userID = (int)$params['userID'];
        
        $stmt = $this->conn->prepare("SELECT productID FROM Review WHERE reviewID = ? AND userID = ?");
        $stmt->bind_param("ii", $reviewID, $userID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $this->response['message'] = 'Review not found or you are not authorized to edit it';
            return $this->response;
        }
        
        $productID = $result->fetch_assoc()['productID'];
        
        $updateFields = [];
        $queryParams = [];
        
        if (isset($params['reviewTitle'])) {
            $updateFields[] = "reviewTitle = ?";
            $queryParams[] = $params['reviewTitle'];
        }
        
        if (isset($params['reviewDescription'])) {
            $updateFields[] = "reviewDescription = ?";
            $queryParams[] = $params['reviewDescription'];
        }
        
        if (isset($params['reviewRating'])) {
            $reviewRating = (int)$params['reviewRating'];
            if ($reviewRating < 1 || $reviewRating > 5) {
                $this->response['message'] = 'Review rating must be between 1 and 5';
                return $this->response;
            }
            $updateFields[] = "reviewRating = ?";
            $queryParams[] = $reviewRating;
        }
        
        if (empty($updateFields)) {
            $this->response['message'] = 'No fields to update';
            return $this->response;
        }
        
        $queryParams[] = $reviewID;
        
        $query = "UPDATE Review SET " . implode(", ", $updateFields) . " WHERE reviewID = ?";
        $stmt = $this->conn->prepare($query);
        
        $types = str_repeat('s', count($queryParams) - 1) . 'i';
        $stmt->bind_param($types, ...$queryParams);
        
        if ($stmt->execute()) {
            // Update product average rating if rating was changed
            if (isset($params['reviewRating'])) {
                $this->updateProductRating($productID);
            }
            
            $this->response['status'] = 'success';
            $this->response['data'] = [
                [
                    'success' => true
                ]
            ];
            $this->response['message'] = 'Review updated successfully';
        } else {
            $this->response['message'] = 'Failed to update review: ' . $stmt->error;
        }
        
        return $this->response;
    }
    
    private function getReviews() {
        $params = $this->requestData['parameters'] ?? [];
        
        if (!isset($params['productID'])) {
            $this->response['message'] = 'Product ID is required';
            return $this->response;
        }
        
        $productID = (int)$params['productID'];
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 10;
        $sort = $params['sort'] ?? 'reviewDate';
        $order = $params['order'] ?? 'desc';
        
        $offset = ($page - 1) * $limit;
        
        $validSortFields = ['reviewDate', 'reviewRating', 'reviewTitle'];
        $sortField = in_array($sort, $validSortFields) ? $sort : 'reviewDate';
        $sortOrder = strtoupper($order) === 'ASC' ? 'ASC' : 'DESC';
        
        $query = "SELECT r.reviewID, r.userID, u.username, r.reviewTitle, 
                 r.reviewDescription, r.reviewRating, r.reviewDate
                 FROM Review r
                 JOIN User u ON r.userID = u.userID
                 WHERE r.productID = ?
                 ORDER BY r.$sortField $sortOrder
                 LIMIT ?, ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("iii", $productID, $offset, $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $reviews = [];
        while ($row = $result->fetch_assoc()) {
            $reviews[] = $row;
        }
        
        $this->response['status'] = 'success';
        $this->response['data'] = $reviews;
        $this->response['message'] = 'Reviews retrieved successfully';
        
        return $this->response;
    }
    
    // Filter Management Functions
    
    private function getCategories() {
        $params = $this->requestData['parameters'] ?? [];
        $parentID = $params['parent'] ?? null;
        
        $query = "SELECT categoryID, categoryName, categoryEquivalents 
                 FROM Categories";
        
        if ($parentID !== null) {
            $query .= " WHERE parentID = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("i", $parentID);
        } else {
            $stmt = $this->conn->prepare($query);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        $categories = [];
        while ($row = $result->fetch_assoc()) {
            if (is_string($row['categoryEquivalents'])) {
                $row['categoryEquivalents'] = json_decode($row['categoryEquivalents'], true) ?? [];
            }
            $categories[] = $row;
        }
        
        $this->response['status'] = 'success';
        $this->response['data'] = $categories;
        $this->response['message'] = 'Categories retrieved successfully';
        
        return $this->response;
    }
    
    private function getBrands() {
        $params = $this->requestData['parameters'] ?? [];
        $categoryID = $params['categoryID'] ?? null;
        
        if ($categoryID !== null) {
            $query = "SELECT DISTINCT b.brandID, b.brandName
                     FROM Brand b
                     JOIN Product p ON b.brandID = p.brand
                     WHERE p.category = ?
                     ORDER BY b.brandName";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("i", $categoryID);
        } else {
            $query = "SELECT brandID, brandName
                     FROM Brand
                     ORDER BY brandName";
            
            $stmt = $this->conn->prepare($query);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        $brands = [];
        while ($row = $result->fetch_assoc()) {
            $brands[] = $row;
        }
        
        $this->response['status'] = 'success';
        $this->response['data'] = $brands;
        $this->response['message'] = 'Brands retrieved successfully';
        
        return $this->response;
    }
    
    // Helper function to update product ratings
    private function updateProductRating($productID) {
        $query = "UPDATE Product p
                SET p.customerReviewAverage = (
                    SELECT AVG(reviewRating) FROM Review WHERE productID = ?
                ),
                p.customerReviewCount = (
                    SELECT COUNT(*) FROM Review WHERE productID = ?
                )
                WHERE p.productID = ?";
                
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("iii", $productID, $productID, $productID);
        $stmt->execute();
    }
}

// Create API instance and handle the request
header('Content-Type: application/json');
$api = API::getInstance();
echo json_encode($api->handleRequest());
?>
