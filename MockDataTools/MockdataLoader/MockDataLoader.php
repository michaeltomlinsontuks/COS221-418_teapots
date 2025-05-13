<?php
// Disable time limit to prevent timeout
set_time_limit(0);
ini_set('max_execution_time', 0);

// Enable output buffering for real-time feedback
ob_implicit_flush(true);
ob_end_flush();

include_once 'connection.php';

$conn = getConnection();

if ($conn) {
    echo "<h2 style='color: green;'>Connected to the database successfully!</h2>";
    flush();
} else {
    echo "<h2 style='color: red;'>Failed to connect to the database.</h2>";
    exit;
}

/*
 * MockdataLoader/JSONS/appliances.json
 * MockdataLoader/JSONS/audio_headphones.json
 * MockdataLoader/JSONS/cameras.json
 * MockdataLoader/JSONS/computers.json
 * MockdataLoader/JSONS/car_electronics.json
 * MockdataLoader/JSONS/cell_phones.json
 * MockdataLoader/JSONS/tv_home_theater.json
 */

function extractProducts(array $jsonData): array {
    $products = [];
    foreach ($jsonData['products'] as $item) {
        $carousel = $item['CarouselImageArray'] ?? [];
        $images = [
            'image' => null,
            'angleImage' => null,
            'backViewImage' => null,
            'topViewImage' => null,
        ];
        foreach ($carousel as $img) {
            foreach ($images as $key => $val) {
                if (isset($img[$key])) {
                    $images[$key] = $img[$key];
                }
            }
        }
        $products[] = [
            'addToCartURL' => $item['addToCartURL'] ?? null,
            'customerReviewAverage' => $item['customerReviewAverage'] ?? null,
            'customerReviewCount' => $item['customerReviewCount'] ?? null,
            'longDescription' => $item['longDescription'] ?? null,
            'brand' => $item['manufacturer'] ?? null,
            'name' => $item['name'] ?? null,
            'bestPrice' => $item['salePrice'] ?? null,
            'bestCompany' => 'MockCompany', // Set as needed
            'onlineAvailability' => $item['onlineAvailability'] ?? null,
            'thumbnailImage' => $item['thumbnailImage'] ?? null,
            'carouselImageArray' => $carousel,
            'image' => $images['image'],
            'angleImage' => $images['angleImage'],
            'backViewImage' => $images['backViewImage'],
            'topViewImage' => $images['topViewImage'],
            'category' => $item['category'] ?? null,
            'type' => $item['type'] ?? null,
        ];
    }
    return $products;
}

// Function to check if product already exists
function productExists($conn, $productName, $brandName) {
    $stmt = $conn->prepare("SELECT ProductID FROM Product WHERE Name = ? AND BrandName = ?");
    $stmt->bind_param("ss", $productName, $brandName);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->num_rows > 0;
}


// Function to insert brand if it doesn't exist and return BrandID
function insertBrand($conn, $brandName) {
    if (empty($brandName)) return null;

    // Check if brand exists
    $stmt = $conn->prepare("SELECT BrandID FROM Brand WHERE BrandName = ?");
    $stmt->bind_param("s", $brandName);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['BrandID'];
    }

    // Insert new brand
    $stmt = $conn->prepare("INSERT INTO Brand (BrandName) VALUES (?)");
    $stmt->bind_param("s", $brandName);
    $stmt->execute();
    return $conn->insert_id;
}

// Function to insert category if it doesn't exist and return CategoryID
function insertCategory($conn, $categoryName) {
    if (empty($categoryName)) return null;

    // Check if category exists
    $stmt = $conn->prepare("SELECT CategoryID FROM Category WHERE CategoryName = ?");
    $stmt->bind_param("s", $categoryName);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['CategoryID'];
    }

    // Insert new category
    $stmt = $conn->prepare("INSERT INTO Category (CategoryName) VALUES (?)");
    $stmt->bind_param("s", $categoryName);
    $stmt->execute();
    return $conn->insert_id;
}

// Function to insert product data
function insertProduct($conn, $product) {
    // Prepare carousel images as JSON
    $carouselImagesJson = json_encode($product['carouselImageArray']);

    // Convert boolean to integer for database
    $onlineAvailability = $product['onlineAvailability'] ? 1 : 0;

    $stmt = $conn->prepare("INSERT INTO Product 
        (Name, ReviewCount, ReviewAverage, Description, BrandName, CategoryName,
         ThumbnailImage, CarouselImages, Type, AddToCartURL, SalePrice, OnlineAvailability) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $stmt->bind_param("sidsssssssdi",
        $product['name'],
        $product['customerReviewCount'],
        $product['customerReviewAverage'],
        $product['longDescription'],
        $product['brand'],
        $product['category'],
        $product['thumbnailImage'],
        $carouselImagesJson,
        $product['type'],
        $product['addToCartURL'],
        $product['bestPrice'],
        $onlineAvailability
    );

    $stmt->execute();
    return $conn->insert_id;
}

// Function to insert final product data
//function insertFinalProduct($conn, $product, $productId) {
//    // Convert boolean to integer for database
//    $onlineAvailability = $product['onlineAvailability'] ? 1 : 0;
//
//    // Calculate regular price (example: 10% higher than best price)
//    $regularPrice = $product['bestPrice'] * 1.1;
//    $discountPercent = 10.00; // 10% discount
//
//    $stmt = $conn->prepare("INSERT INTO FinalProduct
//        (ProductID, ReviewCount, ReviewAverage, BestCompany, BestPrice,
//         DiscountPercent, RegularPrice, AddToCartURL, OnlineAvailability)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
//
//    $stmt->bind_param("idsdddsdi",
//        $productId,
//        $product['customerReviewCount'],
//        $product['customerReviewAverage'],
//        $product['bestCompany'],
//        $product['bestPrice'],
//        $discountPercent,
//        $regularPrice,
//        $product['addToCartURL'],
//        $onlineAvailability
//    );
//
//    $stmt->execute();
//}

// Process all JSON files
$jsonFiles = [
    './JSONS/appliances.json',
    './JSONS/audio_headphones.json',
    './JSONS/cameras.json',
    './JSONS/computers.json',
    './JSONS/car_electronics.json',
    './JSONS/cell_phones.json',
    './JSONS/tv_home_theater.json'
];

$totalProducts = 0;
$skippedProducts = 0;

foreach ($jsonFiles as $file) {
    if (file_exists($file)) {
        echo "<p>Processing file: " . basename($file) . " ...</p>";
        flush();

        // Read and decode JSON file
        $jsonData = json_decode(file_get_contents($file), true);

        if (!$jsonData) {
            echo "<p style='color: red;'>Error decoding JSON from " . basename($file) . "</p>";
            flush();
            continue;
        }

        // Extract products from JSON
        $products = extractProducts($jsonData);
        $fileProductCount = 0;
        $fileSkippedCount = 0;

        echo "<p>Found " . count($products) . " products in " . basename($file) . "</p>";
        flush();

        // Process each product
        foreach ($products as $index => $product) {
            // Check if product already exists
            if (productExists($conn, $product['name'], $product['brand'])) {
                echo "<span style='color: orange;'>Skipping duplicate product: " . htmlspecialchars($product['name']) . "</span><br>";
                $fileSkippedCount++;
                $skippedProducts++;

                // Flush every 10 products to update the browser
                if ($index % 10 === 0) {
                    flush();
                }
                continue;
            }

            // Insert brand and category first
            insertBrand($conn, $product['brand']);
            insertCategory($conn, $product['category']);

            // Insert product and get ID
            $productId = insertProduct($conn, $product);

            // Insert final product data
            //insertFinalProduct($conn, $product, $productId);

            $fileProductCount++;
            $totalProducts++;

            echo "<span style='color: green;'>Added product: " . htmlspecialchars($product['name']) . "</span><br>";

            // Flush every 10 products to update the browser
            if ($index % 10 === 0) {
                flush();
            }
        }

        echo "<p><strong>File progress:</strong> Added " . $fileProductCount . " products, skipped " .
            $fileSkippedCount . " duplicates from " . basename($file) . "</p>";
        flush();
    } else {
        echo "<p style='color: red;'>File not found: " . $file . "</p>";
        flush();
    }
}

echo "<h2>Import summary:</h2>";
echo "<p>Total products loaded: " . $totalProducts . "</p>";
echo "<p>Total duplicates skipped: " . $skippedProducts . "</p>";
$conn->close();
?>