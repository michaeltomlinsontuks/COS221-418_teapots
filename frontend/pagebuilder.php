<?php
require_once("header.php");
include_once 'config.php';
// if necessary to user at some stage for http requests
$EnvJson = array(
    "host" => DB_HOST,
    'username' => DB_USER,
    'password' => DB_PASS,
);
$cookieData = json_encode($EnvJson);
//$cookieData = urlencode($cookieData);
setcookie('wheateleyAuthentication', $cookieData);

$localEnvJson = array(
    "host" => "http://localhost/teapots/API/api.php",
    'username' => "root",
    'password' => "",
);

$cookieData = json_encode($localEnvJson);
//$cookieData = urlencode($cookieData);
setcookie('localAuthentication', $cookieData);

setcookie("localRoute", urlencode("http://localhost/teapots/frontend/pagebuilder.php?page="))
    // only add the part after page =

    ?>

<body>

    <div class="headingBar">

        <?php



        if (isset($_GET['page']) && $_GET['page'] == "products") {
            echo "<div class=\"filterOverlay\" id=\"overlay\">";
            echo "<input type = \"image\" src = \"images/menu.png\" class = \"menu\" id=\"menu\">";
            echo "</div>";
        }
        ?>
        <div class="titleUnder">


            <?php
            if (isset($_GET['page'])) {
                echo $_GET['page'];

                $page = $_GET['page'];
                if ($page == "signup" || $page == "login") {
                    if ($page == "signup")
                        $page = "login?";
                    else
                        $page = "signup?";

                    echo "<input type=\"button\" id = \"CHID\" value =$page  class = \"changeDir\">";
                }

            } else
                echo "products";
            ?>
        </div>

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
                case ("signup"):
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