<?php
require_once("header.php")
    ?>

<body>
    <?php
    // the get is all that is changed on links 
    //link pagebuilder.php?page="####"
    //onclick="location.href = 'pagebuilder.php?page=products'" />
    
    switch ($_GET['page']) {
        case ("login"):
            include_once("pages/login.php");
            break;
        case ("signUp"):
            include_once("pages/signup.php");
            break;
        case ("products"):
            include_once("pages/products.php");
            break;
        case ("view"):
            include_once("pages/view.php");
            break;
        default:
            break;
    }
    ?>
    <?php
    require_once("footer.php")
        ?>

</body>