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
        //Checks the API is possible
        //For testing just return True
        return true;
    }

    private function generateAPIKey() {
        //Not sure how this is going to be done, but the user tables looks like it will have everything we need
    }

    private function hashPassword($password) {
        //Hash the password for storage - still need to decide on the hashing algorithm
    }

    private function verifyPassword($password, $hash) {
        //Verify the password against the hash still need to decide on the hashing algorithm
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
        // Check if username and password are provided
        // Check if username and password are valid
        // Give API key from DB
    }
    
    private function register() {
        // Check if username, password, and email are provided
        // Check if username and email are valid - if the password is not a hash it needs to be validated
        // Hash the password
        // Check if username and email are unique
        // Insert user into DB
        // Generate API key
        // Return API key
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

    private function validateEmail() {
        if (!isset($this->requestData['email']) || empty($this->requestData['email'])) {
            $this->response['message'] = 'Email is required';
            return false;
        }

        $email = $this->requestData['email'];

        // Use PHP's built-in email validation with additional checks
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->response['message'] = 'Invalid email format';
            return false;
        }

        // Additional checks for domain validity
        $domain = substr(strrchr($email, "@"), 1);
        if (!checkdnsrr($domain, "MX") && !checkdnsrr($domain, "A")) {
            $this->response['message'] = 'Email domain appears to be invalid';
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
    
    // Product Management Functions
    
    private function getProductPage() {
        // Huge function - needs to basically handle everything Product Browsing Page
        // Takes in search and filters
        // Returns products for the page
    }

    // Filter Management Functions
    private function getCategories() {
        //Returns the categories - might need to edit the categories that we store in the DB
    }

    private function getBrands() {
        //Returns the brands - might need to edit the brands that we store in the DB
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
        if (!isset($this->requestData['product_id'], $this->requestData['rating'], $this->requestData['review_text'])) {
            $this->response['message'] = 'Product ID, rating, and review text are required';
            return $this->response;
        }

        // Get user ID from API key
        $userID = $this->getUserID();
        if (!$userID) {
            $this->response['message'] = 'Invalid API key';
            return $this->response;
        }

        $productId = (int)$this->requestData['product_id'];
        $rating = (float)$this->requestData['rating'];
        $reviewText = $this->requestData['review_text'];

        // Validate rating (between 1-5)
        if ($rating < 1 || $rating > 5) {
            $this->response['message'] = 'Rating must be between 1 and 5';
            return $this->response;
        }

        // Check if product exists
        $query = "SELECT * FROM Product WHERE ProductID = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $productId);
        $stmt->execute();
        if ($stmt->get_result()->num_rows === 0) {
            $this->response['message'] = 'Product not found';
            return $this->response;
        }

        // Check if user already reviewed this product
        $query = "SELECT * FROM Review WHERE ProductID = ? AND UserID = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ii", $productId, $userID);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            $this->response['message'] = 'You have already reviewed this product';
            return $this->response;
        }

        // Add review
        $query = "INSERT INTO Review (ProductID, UserID, Rating, ReviewText, CreatedAt) VALUES (?, ?, ?, ?, NOW())";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("iids", $productId, $userID, $rating, $reviewText);

        if ($stmt->execute()) {
            // Update product rating
            $this->updateProductRating($productId);

            $this->response['status'] = 'success';
            $this->response['message'] = 'Review added successfully';
            return $this->response;
        } else {
            $this->response['message'] = 'Error adding review: ' . $stmt->error;
            return $this->response;
        }
    }

    private function removeReview() {
        // Check if review ID is provided
        if (!isset($this->requestData['review_id'])) {
            $this->response['message'] = 'Review ID is required';
            return $this->response;
        }

        // Get user ID from API key
        $userID = $this->getUserID();
        if (!$userID) {
            $this->response['message'] = 'Invalid API key';
            return $this->response;
        }

        $reviewId = (int)$this->requestData['review_id'];

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

        // Delete review
        $query = "DELETE FROM Review WHERE ReviewID = ? AND UserID = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ii", $reviewId, $userID);

        if ($stmt->execute() && $stmt->affected_rows > 0) {
            // Update product rating
            $this->updateProductRating($productId);

            $this->response['status'] = 'success';
            $this->response['message'] = 'Review removed successfully';
            return $this->response;
        } else {
            $this->response['message'] = 'Error removing review: ' . $stmt->error;
            return $this->response;
        }
    }

    private function editReview() {
        // Check required fields
        if (!isset($this->requestData['review_id'], $this->requestData['rating'], $this->requestData['review_text'])) {
            $this->response['message'] = 'Review ID, rating, and review text are required';
            return $this->response;
        }

        // Get user ID from API key
        $userID = $this->getUserID();
        if (!$userID) {
            $this->response['message'] = 'Invalid API key';
            return $this->response;
        }

        $reviewId = (int)$this->requestData['review_id'];
        $rating = (float)$this->requestData['rating'];
        $reviewText = $this->requestData['review_text'];

        // Validate rating
        if ($rating < 1 || $rating > 5) {
            $this->response['message'] = 'Rating must be between 1 and 5';
            return $this->response;
        }

        // Get product ID from review for updating later
        $query = "SELECT ProductID FROM Review WHERE ReviewID = ? AND UserID = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ii", $reviewId, $userID);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            $this->response['message'] = 'Review not found or you do not have permission to edit it';
            return $this->response;
        }

        $productId = $result->fetch_assoc()['ProductID'];

        // Update review
        $query = "UPDATE Review SET Rating = ?, ReviewText = ?, UpdatedAt = NOW() WHERE ReviewID = ? AND UserID = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("dsii", $rating, $reviewText, $reviewId, $userID);

        if ($stmt->execute() && $stmt->affected_rows > 0) {
            // Update product rating
            $this->updateProductRating($productId);

            $this->response['status'] = 'success';
            $this->response['message'] = 'Review updated successfully';
            return $this->response;
        } else {
            $this->response['message'] = 'Error updating review: ' . $stmt->error;
            return $this->response;
        }
    }

    private function getReviews() {
        // Check if product ID is provided
        if (!isset($this->requestData['product_id'])) {
            $this->response['message'] = 'Product ID is required';
            return $this->response;
        }

        $productId = (int)$this->requestData['product_id'];
        $userID = $this->getUserID(); // To check if user can edit/delete their own reviews

        // Check if product exists
        $query = "SELECT * FROM Product WHERE ProductID = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $productId);
        $stmt->execute();
        if ($stmt->get_result()->num_rows === 0) {
            $this->response['message'] = 'Product not found';
            return $this->response;
        }

        // Get reviews for product
        $query = "SELECT r.*, u.Username FROM Review r 
              JOIN Users u ON r.UserID = u.UserID 
              WHERE r.ProductID = ? 
              ORDER BY r.CreatedAt DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $productId);
        $stmt->execute();
        $result = $stmt->get_result();

        $reviews = [];
        while ($row = $result->fetch_assoc()) {
            // Add edit/delete permissions for user's own reviews
            $row['canEdit'] = ($userID && $row['UserID'] == $userID);
            $row['canDelete'] = ($userID && $row['UserID'] == $userID);

            // Remove sensitive data
            unset($row['UserID']);

            $reviews[] = $row;
        }

        $this->response['status'] = 'success';
        $this->response['data'] = $reviews;
        $this->response['message'] = 'Reviews retrieved successfully';
        return $this->response;
    }

// Helper function to update product ratings
    private function updateProductRating($productId) {
        // Calculate new review average and count
        $query = "SELECT AVG(Rating) AS average, COUNT(*) AS count FROM Review WHERE ProductID = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $productId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();

        $reviewAverage = $result['average'] ? round($result['average'], 2) : 0;
        $reviewCount = (int)$result['count'];

        // Update product review stats
        $query = "UPDATE Product SET ReviewAverage = ?, ReviewCount = ? WHERE ProductID = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("dii", $reviewAverage, $reviewCount, $productId);
        $stmt->execute();

        // Also update the FinalProduct table if it has a record for this product
        $query = "UPDATE FinalProduct SET ReviewAverage = ?, ReviewCount = ? WHERE ProductID = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("dii", $reviewAverage, $reviewCount, $productId);
        $stmt->execute();
    }
    

}

// Create API instance and handle the request
header('Content-Type: application/json');
$api = API::getInstance();
echo json_encode($api->handleRequest());
?>
