<?php
require_once("header.php")
    ?>

<body>

    <div class="headingBar">
        <?php
        if (isset($_GET['page']))
            echo $_GET['page'];
        else
            echo "products"
                ?>
        </div>

        <div class="contentContainer">
            <?php
        // the get is all that is changed on links 
        //link pagebuilder.php?page="####"
        //onclick="location.href = 'pagebuilder.php?page=products'" />
        //can do this in the items themselves
        if (isset($_GET['page']))
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
                    include_once("pages/products.php");
                    break;
            }
        else
            include_once "pages/products.php";
        ?>
        <?php
        require_once("footer.php")
            ?>
    </div>
</body>