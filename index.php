<?php
//header("Location: http://localhost/teapots/frontend/pagebuilder.php?page=login");
// will move to what is wheateley configure on your own 
//exit(); // Always exit after a redirect

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teapots pricecheck</title>
    <link rel="stylesheet" href="index.css">

</head>

<body>
    <div class="container">
        <img src="images/teapotsLogoPot.png" alt="">
    </div>
    <div class="aboutUsDiv">
        <input type="button" onclick="goToProducts()" value="Products">
        <input type="button" onclick="goToAboutUs()" value="about us">
    </div>
</body>
<script>
    function goToProducts() {
        window.location.href = "http://localhost/teapots/frontend/pagebuilder.php?page=login";
    }
    function goToAboutUs() {
        window.location.href = "http://localhost/teapots/aboutUs.php";
    }
</script>

</html>