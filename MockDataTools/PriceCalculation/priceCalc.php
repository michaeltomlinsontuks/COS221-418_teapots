<?php
include_once 'connection.php';

// Array of company table names created by tableGenerator.php
// Update this array with your actual table names
$companyTables = [
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

function updateFinalProducts($companyTables) {
    $conn = getConnection();

    // Enable error reporting
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    // Log detailed errors
    $errors = [];
    $successCount = 0;
    $errorCount = 0;
    $duplicateCount = 0;

    try {
        // Start transaction for better data consistency
        mysqli_begin_transaction($conn);

        // Get all products from Product table
        $query = "SELECT * FROM Product";
        $result = mysqli_query($conn, $query);

        if (!$result) {
            throw new Exception("Error fetching products: " . mysqli_error($conn));
        }

        while ($product = mysqli_fetch_assoc($result)) {
            $productId = $product['ProductID'];
            $bestPrice = null;
            $bestCompany = null;
            $regularPrice = null;

            // Lookup status - track which products were found in which tables
            $lookupStatus = [];

            // Check each company table for this product
            foreach ($companyTables as $company) {
                $priceQuery = "SELECT regularPrice, discountedPrice FROM `$company` 
                               WHERE product_id = ?";

                $stmt = mysqli_prepare($conn, $priceQuery);
                mysqli_stmt_bind_param($stmt, "i", $productId);
                mysqli_stmt_execute($stmt);
                $priceResult = mysqli_stmt_get_result($stmt);

                if ($priceResult && mysqli_num_rows($priceResult) > 0) {
                    $priceData = mysqli_fetch_assoc($priceResult);
                    $lookupStatus[$company] = true;

                    // If this is the first price found or it's better than previous best
                    if ($bestPrice === null || $priceData['discountedPrice'] < $bestPrice) {
                        $bestPrice = $priceData['discountedPrice'];
                        $regularPrice = $priceData['regularPrice'];
                        $bestCompany = $company;
                    }
                } else {
                    $lookupStatus[$company] = false;
                }
                mysqli_stmt_close($stmt);
            }

            // If we found pricing for this product
            if ($bestPrice !== null) {
                // Calculate discount percentage
                $discountPercent = 0;
                if ($regularPrice > 0) {
                    $discountPercent = (($regularPrice - $bestPrice) / $regularPrice) * 100;
                }

                // Check if product already exists in FinalProduct
                $checkQuery = "SELECT ProductID FROM FinalProduct WHERE ProductID = ?";
                $checkStmt = mysqli_prepare($conn, $checkQuery);
                mysqli_stmt_bind_param($checkStmt, "i", $productId);
                mysqli_stmt_execute($checkStmt);
                $checkResult = mysqli_stmt_get_result($checkStmt);
                $exists = mysqli_num_rows($checkResult) > 0;
                mysqli_stmt_close($checkStmt);

                try {
                    if ($exists) {
                        // Update existing record using prepared statement
                        $updateQuery = "UPDATE FinalProduct SET 
                                      ReviewCount = ?, 
                                      ReviewAverage = ?, 
                                      BestCompany = ?, 
                                      BestPrice = ?, 
                                      DiscountPercent = ?, 
                                      RegularPrice = ?, 
                                      AddToCartURL = ?, 
                                      OnlineAvailability = ? 
                                      WHERE ProductID = ?";

                        $updateStmt = mysqli_prepare($conn, $updateQuery);
                        mysqli_stmt_bind_param($updateStmt, "idsdddsii",
                            $product['ReviewCount'],
                            $product['ReviewAverage'],
                            $bestCompany,
                            $bestPrice,
                            $discountPercent,
                            $regularPrice,
                            $product['AddToCartURL'],
                            $product['OnlineAvailability'],
                            $productId
                        );

                        if (mysqli_stmt_execute($updateStmt)) {
                            $successCount++;
                        } else {
                            $errorCount++;
                            $errors[] = "Update failed for product $productId: " . mysqli_stmt_error($updateStmt);
                        }
                        mysqli_stmt_close($updateStmt);
                    } else {
                        // Insert new record using prepared statement
                        $insertQuery = "INSERT INTO FinalProduct 
                                      (ProductID, ReviewCount, ReviewAverage, BestCompany, BestPrice, 
                                       DiscountPercent, RegularPrice, AddToCartURL, OnlineAvailability) 
                                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

                        $insertStmt = mysqli_prepare($conn, $insertQuery);
                        mysqli_stmt_bind_param($insertStmt, "idsdddsii",
                            $productId,
                            $product['ReviewCount'],
                            $product['ReviewAverage'],
                            $bestCompany,
                            $bestPrice,
                            $discountPercent,
                            $regularPrice,
                            $product['AddToCartURL'],
                            $product['OnlineAvailability']
                        );

                        if (mysqli_stmt_execute($insertStmt)) {
                            $successCount++;
                        } else {
                            $errorCount++;
                            $errors[] = "Insert failed for product $productId: " . mysqli_stmt_error($insertStmt);
                        }
                        mysqli_stmt_close($insertStmt);
                    }
                } catch (Exception $e) {
                    $errorCount++;
                    $errors[] = "Error processing product $productId: " . $e->getMessage();
                }
            }
        }

        // Commit transaction
        mysqli_commit($conn);

    } catch (Exception $e) {
        // Rollback on error
        mysqli_rollback($conn);
        $errors[] = "Transaction failed: " . $e->getMessage();
    }

    mysqli_close($conn);
    return [
        "success" => $successCount,
        "errors" => $errorCount,
        "duplicates" => $duplicateCount,
        "errorDetails" => $errors
    ];
}

// Execute the function and display results
$result = updateFinalProducts($companyTables);
echo "Price calculation complete. Successfully processed {$result['success']} products with {$result['errors']} errors.<br>";

// Display detailed error information
if (count($result['errorDetails']) > 0) {
    echo "<h3>Error Details:</h3>";
    echo "<ul>";
    foreach ($result['errorDetails'] as $error) {
        echo "<li>" . htmlspecialchars($error) . "</li>";
    }
    echo "</ul>";
}
?>