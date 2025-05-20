<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <?php
    if (isset($_GET['page']) && ($_GET['page'] == 'login' || $_GET['page'] == 'signup'))
        echo "<link rel=\"stylesheet\" href=\"cssFiles/LoginRegister.css\">";
    else {
        echo "<link rel=\"stylesheet\" href=\"cssFiles/product.css\">";
    }
    ?>
    <link rel="stylesheet" href="cssFiles/pagebuilder.css">
    <link rel="stylesheet" href="cssFiles/D.css">
    <script src="pages/jsFiles/cookies.js"></script>
    <script src="pages/jsFiles/pgbuilder.js"></script>
</head>