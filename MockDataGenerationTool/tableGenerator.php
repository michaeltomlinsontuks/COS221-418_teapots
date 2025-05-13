<?php
//Creates table in the database for a user inputted company name,
// the prices are then randomly adjusted and discounts applied based on parameters
include_once 'connection.php';

// Function to get user input for table name and other parameters
function getInputParameters() {
    $params = [
        'tableName' => 'TestCompany',
        'productPercentage' => 75,
        'priceMin' => 20,
        'priceMax' => 20,
        'discountMin' => 0,
        'discountMax' => 40,
        'discountedProductPercentage' => 100
    ];

    if (php_sapi_name() === 'cli') {
        echo "Enter company name for the new table: ";
        $handle = fopen("php://stdin", "r");
        $line = fgets($handle);
        fclose($handle);
        $line = trim($line);
        if (!empty($line)) {
            $params['tableName'] = $line;
        }
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $params['tableName'] = isset($_POST['tableName']) && !empty($_POST['tableName']) ?
            trim($_POST['tableName']) : $params['tableName'];
        $params['productPercentage'] = isset($_POST['productPercentage']) ? (int)$_POST['productPercentage'] : $params['productPercentage'];
        $params['priceMin'] = isset($_POST['priceMin']) ? (int)$_POST['priceMin'] : $params['priceMin'];
        $params['priceMax'] = isset($_POST['priceMax']) ? (int)$_POST['priceMax'] : $params['priceMax'];
        $params['discountMin'] = isset($_POST['discountMin']) ? (int)$_POST['discountMin'] : $params['discountMin'];
        $params['discountMax'] = isset($_POST['discountMax']) ? (int)$_POST['discountMax'] : $params['discountMax'];
        $params['discountedProductPercentage'] = isset($_POST['discountedProductPercentage']) ?
            (int)$_POST['discountedProductPercentage'] : $params['discountedProductPercentage'];
    }

    return $params;
}

$conn = getConnection();
// After getting input parameters
$params = getInputParameters();

// Validate and clean the table name
$tableName = preg_replace('/[^a-zA-Z0-9_]/', '', $params['tableName']);

// Check if the table name is empty after sanitization
if (empty($tableName)) {
    die("Error: Please provide a valid table name containing only letters, numbers, or underscores.");
}
$productPercentage = $params['productPercentage'];
$priceMin = $params['priceMin'];
$priceMax = $params['priceMax'];
$discountMin = $params['discountMin'];
$discountMax = $params['discountMax'];
$discountedProductPercentage = $params['discountedProductPercentage'];

// Update table and column names to match the database schema
$prodTableName = "Product";
$productID = "ProductID";
$initialPrice = "SalePrice";

//Select all the products
$query = "SELECT $productID, $initialPrice FROM $prodTableName";
$result = mysqli_query($conn, $query);

if (!$result) {
    die("Query failed: " . mysqli_error($conn));
}

//pick a selection of the total products based on percentage
$numProducts = mysqli_num_rows($result);
$targetCount = (int)($numProducts * ($productPercentage / 100));

$allProducts = [];
while ($row = mysqli_fetch_assoc($result)) {
    $allProducts[] = $row;
}

// Randomly select products and check for duplicates
$randomProducts = [];
$selectedProductIds = [];
shuffle($allProducts);

foreach ($allProducts as $product) {
    if (!in_array($product[$productID], $selectedProductIds)) {
        $selectedProductIds[] = $product[$productID];
        $randomProducts[] = $product;

        if (count($randomProducts) >= $targetCount) {
            break;
        }
    }
}

// Calculate how many products should receive a discount
$numProductsToDiscount = ceil(count($randomProducts) * ($discountedProductPercentage / 100));

// Process each product
for ($i = 0; $i < count($randomProducts); $i++) {
    // Adjust initial price for all products
    $adjustmentFactor = (mt_rand(-$priceMin, $priceMax) / 100) + 1;
    $randomProducts[$i]['regularPrice'] = round($randomProducts[$i][$initialPrice] * $adjustmentFactor, 2);

    // Apply discount only to the percentage of products that should get discounts
    if ($i < $numProductsToDiscount) {
        $discountPercentage = mt_rand($discountMin, $discountMax);
    } else {
        $discountPercentage = 0; // No discount
    }

    $randomProducts[$i]['discountedPrice'] = round($randomProducts[$i]['regularPrice'] * (1 - $discountPercentage/100), 2);
}

$createTableQuery = "CREATE TABLE IF NOT EXISTS `$tableName` (
    product_id INT NOT NULL,
    regularPrice DECIMAL(10, 2) NOT NULL,
    discountedPrice DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (product_id),
    CONSTRAINT `fk_{$tableName}_product_id` FOREIGN KEY (product_id) REFERENCES `$prodTableName`(`$productID`)
)";

if (!mysqli_query($conn, $createTableQuery)) {
    die("Error creating table: " . mysqli_error($conn));
}

// Insert products into the new table
$insertQuery = "INSERT INTO $tableName (product_id, regularPrice, discountedPrice) VALUES (?, ?, ?)";
$stmt = mysqli_prepare($conn, $insertQuery);

if (!$stmt) {
    die("Error preparing statement: " . mysqli_error($conn));
}

// Insert each product
foreach ($randomProducts as $product) {
    mysqli_stmt_bind_param($stmt, "idd",
        $product[$productID],
        $product['regularPrice'],
        $product['discountedPrice']
    );

    if (!mysqli_stmt_execute($stmt)) {
        echo "Error inserting product " . $product[$productID] . ": " . mysqli_stmt_error($stmt) . "\n";
    }
}

mysqli_stmt_close($stmt);
echo "Successfully created table '$tableName' with " . count($randomProducts) . " products using the following parameters:<br>";
echo "- Product percentage: $productPercentage%<br>";
echo "- Price adjustment range: -$priceMin% to +$priceMax%<br>";
echo "- Percentage of products discounted: $discountedProductPercentage%<br>";
echo "- Discount range: $discountMin% to $discountMax%";

mysqli_close($conn);
?>