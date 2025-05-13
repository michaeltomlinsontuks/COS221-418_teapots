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
        // Helper function to get the user ID from the API key
    }

    private function validateEmail() {
        // Check if the email is valid
        // Return true or false
    }

    private function validateUsername() {
        // Check if the username is valid
        // Return true or false
    }
    
    private function validatePassword() {
        // Check if the password is valid
        // Return true or false
    }
    
    // Product Management Functions
    
    private function getProductPage() {
        // Huge function - needs to basically handle everything Product Browsing Page
        // Takes in search and filters
        // Returns products for the page
    }
    
    private function getProduct() {
        // Returns the product details for a single product
        // Might attach the price comparison to this since this should always call it
    }
    
    private function getProductComparisons() {
        // Returns the product comparisons for a single product
        // Might attach the product details to this since this should always call it
    }
    
    // Review Management Functions
    
    private function addReview() {
        //Will in part depend on how the reviews are inputted
        // - we have our reviews and then the BestBuy review average and count, which we will update as we get our own reviews
    }
    
    private function removeReview() {
        // Will in part depend on how the reviews are inputted
        // - we have our reviews and then the BestBuy review average and count, which we will update as we remove our own reviews
    }
    
    private function editReview() {
        // Will in part depend on how the reviews are inputted
        // - we have our reviews and then the BestBuy review average and count, which we will update as we edit our own reviews
        // - we will need to check if the review exists and if the user is allowed to edit it
    }
    
    private function getReviews() {
        // Returns the reviews for a single product
        // Will need to check if the product exists and if the user is allowed to view it
        // Will need to check if the user is allowed to edit or delete their own reviews
    }

    // Helper function to update product ratings
    private function updateProductRating($productID)
    {
        // Updates the reviews from BestBuy, when we get our own reviews we will need to update the product rating
    }
    
    // Filter Management Functions
    
    private function getCategories() {
       //Returns the categories - might need to edit the categories that we store in the DB
    }
    
    private function getBrands() {
        //Returns the brands - might need to edit the brands that we store in the DB
    }
}

// Create API instance and handle the request
header('Content-Type: application/json');
$api = API::getInstance();
echo json_encode($api->handleRequest());
?>
