<?php
require_once 'config.php';
setcookie("localRoute", "http://localhost/teapots/frontend/pagebuilder.php?page=");
?>

<!DOCTYPE html>
<html lang="en">

<head>    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teapots pricecheck</title>
    <link rel="stylesheet" href="index.css">
    <script src="frontend/pages/jsFiles/cookies.js"></script>

</head>

<body>
    <div class="container">
        <img src="http://localhost/teapots/images/teapotsLogoPot.png" alt="">
    </div>
    <div class="aboutUsDiv">
        <input type="button" onclick="goToProducts()" value="Products">
        <input type="button" onclick="goToAboutUs()" value="about us">
    </div>
</body>
<script>    function goToProducts() {
        window.location.href = getCookie("localRoute") + "login";
    }
    function goToAboutUs() {
        window.location.href = "aboutUs.php";
    }
</script>

</html>