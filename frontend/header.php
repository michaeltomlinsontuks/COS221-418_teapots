<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@200..700&display=swap"
        rel="stylesheet">

    <?php
    if (isset($_GET['page']) && ($_GET['page'] == 'login' || $_GET['page'] == 'signup'))
        echo "<link rel=\"stylesheet\" href=\"cssFiles/LoginRegister.css\">";
    else if (isset($_GET['page']) && $_GET['page'] == 'products') {
        echo "<link rel=\"stylesheet\" href=\"cssFiles/product.css\">";
    } else if (isset($_GET['page']))
        echo "<link rel=\"stylesheet\" href=\"cssFiles/view.css\">";
    ?>
    <link rel="stylesheet" href="cssFiles/pagebuilder.css">
    <script src="pages/jsFiles/cookies.js"></script>
    <script src="pages/jsFiles/pgbuilder.js"></script>
</head>