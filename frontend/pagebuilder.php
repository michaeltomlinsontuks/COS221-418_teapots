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
setcookie('wheateleyAuthentication', $cookieData);

// comment out host and set it to your route to the api.php
$localEnvJson = array(
    "host" => "http://localhost/teapots/API/api.php",
    'username' => "root",
    'password' => "",
);

$cookieData = json_encode($localEnvJson);
setcookie('localAuthentication', $cookieData);
setcookie("localRoute", "http://localhost/teapots/frontend/pagebuilder.php?page=");
//comment out and change it to be your local route 
$loggedInStatus = isset($_COOKIE['userdata']);
?>

<body>

    <div class="headingBar">


        <?php



        if (isset($_GET['page']) && $_GET['page'] == "products") {
            echo "<div class=\"filterOverlay\" id=\"overlay\">";
            echo "<input  type = \"image\" src = \"images/menu.png\" class = \"menu\" id=\"menu\">";
            echo "</div>";
        }
        ?>
        <div class="titleUnder">


            <?php
            if (isset($_GET['page'])) {

                if ($_GET['page'] == 'login' || $_GET['page'] == 'products' || $_GET['page'] == 'view' || $_GET['page'] == 'signup' || $_GET['page'] = "logout")
                    echo $_GET['page'];
                else {
                    echo "No changing the pages yourself";
                    echo "<br>";
                    echo "<img src =\"images/thumbdown.png\">";
                    echo "<br>";
                    die();
                }

                $page = $_GET['page'];
                if ($page == "signup" || $page == "login") {
                    if ($page == "signup") {
                        $page = "login?";
                        echo "<input type=\"button\" id = \"CHID\" value =$page onclick=\"routeToLogin()\"  class = \"changeDir\">";
                    } else {
                        $page = "signup?";
                        echo "<input type=\"button\" id = \"CHID\" value =$page onclick=\"routeToRegister()\"  class = \"changeDir\">";
                    }
                } else {

                    echo "<input type=\"button\" id = \"CHID\" value =\"Sign Out\" onclick=\"signOut()\"  class = \"changeDir\">";
                }

            }

            ?>
        </div>

    </div>


    <div class="contentContainer" id="mainContainerContent">

        <svg class="waveHeading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#ffffff" fill-opacity="1"
                d="M0,192L40,186.7C80,181,160,171,240,160C320,149,400,139,480,149.3C560,160,640,192,720,197.3C800,203,880,181,960,165.3C1040,149,1120,139,1200,128C1280,117,1360,107,1400,101.3L1440,96L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z">
            </path>
        </svg>


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
                    if ($loggedInStatus) {
                        include_once("pages/products.php");
                    } else {
                        header("Location: http://localhost/teapots/frontend/pagebuilder.php?page=login");
                    }
                    break;
                case ("view"):
                    if ($loggedInStatus && isset($_GET['prodID'])) {
                        include_once("pages/view.php");
                    } else if ($loggedInStatus)
                        header("Location: http://localhost/teapots/frontend/pagebuilder.php?page=products");
                    else {
                        header("Location: http://localhost/teapots/frontend/pagebuilder.php?page=login");
                    }
                    break;
                case ('logout'):
                    setcookie("userdata", "slur", time() - 3600, "/");
                    header("Location: http://localhost/teapots/frontend/pagebuilder.php?page=login");
                    exit;
                default:
                    header("Location: http://localhost/teapots/frontend/pagebuilder.php?page=login");
                    break;
            }
        else
            include_once "pages/products.php";
        ?>
        <?php


        require_once("footer.php")
            ?>

        <svg class="wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#f3f4f5" fill-opacity="1"
                d="M0,32L34.3,69.3C68.6,107,137,181,206,197.3C274.3,213,343,171,411,160C480,149,549,171,617,160C685.7,149,754,107,823,117.3C891.4,128,960,192,1029,202.7C1097.1,213,1166,171,1234,160C1302.9,149,1371,171,1406,181.3L1440,192L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z">
            </path>
        </svg>

    </div>
</body>