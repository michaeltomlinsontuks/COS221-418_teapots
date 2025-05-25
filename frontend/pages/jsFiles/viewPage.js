document.addEventListener("DOMContentLoaded", function () 
{

//Retriving product form localStorage
var product = JSON.parse(localStorage.getItem("selectedProduct"));
if (!product) 
{
    alert("No product data found.");
     return;
}

//Populating ID, Brand, Category
var dscidElement = document.getElementById("DSCID");
if (dscidElement) 
{
    dscidElement.textContent = 
        "ID: " + product.id + 
        " | Brand: " + product.brand + 
        " | Category: " + product.category;
}

//Populating the description
var descElement = document.getElementById("description");
if (descElement) 
{
    descElement.textContent = product.description || "No description available.";
}

//Filtering out any thumbnail images
var carouselImages = product.productCarousel.filter(function (imgObj) 
{
    return imgObj.image || imgObj.angleImage || imgObj.leftViewImage;
});
var currentIndex = 0;
var carouselImageElement = document.getElementById("carouselImage");
var prevBtn = document.getElementById("prevBtn");
var nextBtn = document.getElementById("nextBtn");


function updateCarousel() 
{
    var imgObj = carouselImages[currentIndex];
    var imgSrc = imgObj.image || imgObj.thumbnailImage || imgObj.angleImage || imgObj.leftViewImage;
    carouselImageElement.src = imgSrc;
}

//Event listener to visit previous carousel images
prevBtn.addEventListener("click", function () 
{
    currentIndex = (currentIndex - 1 + carouselImages.length) % carouselImages.length;
    updateCarousel();
});

//Event listener to visit next carousel images
nextBtn.addEventListener("click", function () 
{
    currentIndex = (currentIndex + 1) % carouselImages.length;
    updateCarousel();
});


updateCarousel();

//Populating title
var titleElement = document.getElementById("titleID");
if (titleElement) 
{
    titleElement.textContent = product.name;
}

//Ppopulating Main Image
var mainImgElement = document.querySelector(".mainImg img");
if (mainImgElement) 
{
    mainImgElement.src = product.mainImg;
    mainImgElement.alt = product.name;
}

//Populating Rating
var ratingCell = document.querySelector(".bottomInfo td:last-child");
if (ratingCell) 
{
    var stars = "";
    var rating = parseFloat(product.reviewAvg);
    for (var i = 0; i < 5; i++) 
    {
        stars += i < rating ? "⭐" : "✩";
    }
    ratingCell.textContent = `Rating: ${product.reviewAvg} (${stars})`;
}

//Populating Best Price
var bestPriceCell = document.querySelector(".bottomInfo td:first-child");
if (bestPriceCell) 
{
    bestPriceCell.textContent = "Best Price: $" + product.salePrice;
}

var request = new XMLHttpRequest();
request.open("POST", "http://localhost/teapots/API/api.php", true);
request.setRequestHeader("Content-Type", "application/json");

var apiKey = getLoginCookie().api_key; 
var productId = product.id;

var body = JSON.stringify({
    type: "getproduct",
    api_key: apiKey,
    product_id: productId
});

//Retrieving all version of this product that the different companies offer
request.onreadystatechange = function () 
{
        if (this.readyState === 4 && this.status === 200) 
        {
            var response = JSON.parse(this.responseText);
            if (response.status === "success") 
            {
                var comparisons = response.data.price_comparisons;
                var pricesTable = document.querySelector(".pricesTable");
                pricesTable.innerHTML = "";
                var headerRow = document.createElement("tr");
                var th1 = document.createElement("th");
                th1.textContent = "Company";
                var th2 = document.createElement("th");
                th2.textContent = "Discounted Price";
                headerRow.appendChild(th1);
                headerRow.appendChild(th2);
                pricesTable.appendChild(headerRow);

                //Populating Company tables and pricing for product
                for (var company in comparisons) 
                {
                    if (comparisons.hasOwnProperty(company)) 
                    {
                        var row = document.createElement("tr");

                        var companyCell = document.createElement("td");
                        companyCell.textContent = company;

                        var priceCell = document.createElement("td");
                        priceCell.textContent = "$" + comparisons[company].discountedPrice;

                        row.appendChild(companyCell);
                        row.appendChild(priceCell);
                        pricesTable.appendChild(row);
                    }
                }
            } 
            else 
            {
                console.error("API error:", response.message);
            }
        }
    };

    request.send(body);
});
