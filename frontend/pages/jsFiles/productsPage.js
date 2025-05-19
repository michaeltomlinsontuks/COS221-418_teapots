
//### var initialization ###
var currentRequestState;
var table;
var menuBtn;
var overlay;
var overlayExtended;
var user;
var searchHtml;
var categoryHtml;
var brandHtml;
var minPriceHtml;
var maxPriceHtml;
var sortByHtml;
//### var initialization ###
document.addEventListener("DOMContentLoaded", initialiseVar);

function initialiseVar() {
    table = document.getElementById("PTID");
    menuBtn = document.getElementById("menu");
    overlay = document.getElementById("overlay");
    overlayExtended = false;
    user = userClass();
    currentRequestState = requestStateHandler();
    menuBtn.addEventListener("click", function () {

        if (overlayExtended === false) {
            overlay.style.animation = "overlayGrow 1.5s ease-in-out forwards"
            overlayExtended = true;
        }
        else {
            overlay.style.animation = "overlayShrink 1.5s ease-in-out forwards"
            overlayExtended = false;
        }
    })

    // insertTd();
}

// inserts the td into the table pre / post  request
function insertTd() {
    for (var i = 0; i < 20; i++) {
        tr = document.createElement("tr");
        for (var cols = 0; cols < 3; cols++) {
            td = document.createElement("td");
            // each td made up of 2 divs a div for the image (half the td in width()
            // and the other half split in 3 
            var containerDiv = document.createElement("div");
            containerDiv.className = "productContainer";

            var imgDiv = document.createElement("div");
            var textDiv = document.createElement("div");

            // text div is further broken into 3 divs
            //title , price , rating
            var titleDiv = document.createElement("div");
            titleDiv.appendChild(document.createTextNode("title"));

            var priceDiv = document.createElement("div");
            priceDiv.appendChild(document.createTextNode("price"));

            var ratingDiv = document.createElement("div");
            ratingDiv.appendChild(document.createTextNode("⭐⭐⭐**"));

            textDiv.appendChild(titleDiv);
            textDiv.appendChild(priceDiv);
            textDiv.appendChild(ratingDiv);
            textDiv.className = "productsText";



            var imgInput = document.createElement("input");
            imgInput.type = "image";
            imgInput.src = "";
            imgInput.alt = "Image goes here";
            imgInput.className = "productImage";
            imgDiv.className = "productImageDiv";

            imgDiv.appendChild(imgInput);
            containerDiv.appendChild(imgDiv);
            containerDiv.appendChild(textDiv);
            td.appendChild(containerDiv);
            tr.appendChild(td);


        }
        table.appendChild(tr);
    }
}

function requestProducts() {
    var request = new XMLHttpRequest();

    request.onreadystatechange = stateProductRequest;

    var requestData = 

    var requestHeaderData = getLocalCredentials();

    request.open("POST", requestHeaderData.host, true);
    request.setRequestHeader("Content-Type", "application/json");

    request.setRequestHeader("Authorization", "Basic" + btoa(requestHeaderData.username + ":" + requestHeaderData.password));
    // fix to use wheately login stuff instead of the php my admin code if necessary

    request.send(JSON.stringify(requestData));
}
function stateProductRequest() {

}
var Product = function (data) {
    this.id = data.id;
    this.name = data.name;
    this.brand = data.brand;
    this.category = data.category;
    this.thumbnail = data.thumbnail;
    this.reviewAvg = data.reviewAverage;
    this.reviewCount = data.reviewCount;
    this.regularPrice = data.regularPrice;
    this.salePrice = data.salePrice;
    this.discountPercent = data.discountPercent;
    this.inStock = data.inStock;
    this.bestCompany = data.bestCompany;

    this.ImgPointer = null;

    function setImgPointer(imgPointer) {
        this.imgPointer = imgPointer;
    }
}
// holds an array of all the products   
var ProductHandler = function () {
    this.products = [];
    this.constructor = function (data) {
        // data should be an array
        for (var i = 0; i < data.length; i++) {
            this.products.push(Product(data[i]));
        }
    }
}
// a class made for sending requests
// will build a JSON based on the current values of the page

var requestDataClass = function () {
    // gets built at every request 
    this.parameterBuilder = parameterBuilderClass();
    this.
        this.requestData =
    {
        type: "getproductpage",
        api_key: user.api_key,
        parameters: this.parameter,
        limit: 54,
        offset: 

    }
    // set it to the value of the search box
    if (this.parameterBuilder.searchParam) {
        this.parameter.searchParam = "";
    }
    if (this.parameterBuilder.categoryParam) {
        this.parameter.category = "";
    }
    if (this.parameterBuilder.brandParam) {
        this.parameter.brand = "";
    }
    if (this.parameterBuilder.maxPriceParam) {
        this.parameter.maxPrice = "";
    }
    if (this.parameterBuilder.minPriceParam) {
        this.parameter.minPrice = "";
    }
    if (this.parameterBuilder.sortByParam) {
        this.parameter.sortBy = "";
    }
}
var userClass = function () {
    this.cookieData = getLoginCookie();
    this.api_key = this.cookieData.api_key;
    this.username = this.cookieData.username;
}
var parameterBuilderClass = function () {
    // creates the parameters, such that the request does not need to be manually altered 
    if (searchHtml != null && searchHtml != undefined && searchHtml.value != "")
        this.searchParam = true;
    else
        this.searchParam = false;

    // will likely be a sortbox 
    if (categoryHtml != null && categoryHtml != undefined && categoryHtml.selectedIndex != 0)
        this.categoryParam = true;
    else
        this.categoryParam = false;

    if (brandHtml != null && brandHtml != undefined && brandHtml.selectedIndex != 0)
        this.brandPram = true;
    else
        this.brandPram = false;

    if (maxPriceHtml != null && maxPriceHtml != undefined && maxPriceHtml.value != "")
        this.maxPriceParam = true;
    else
        this.maxPriceParam = false;

    if (minPriceHtml != null && minPriceHtml != undefined && minPriceHtml.value != "")
        this.minPriceParam = true;
    else
        this.minPriceParam = false;

    if (sortByHtml != null && sortByHtml != undefined && searchHtml.selectedIndex != 0)
        this.sortByParam = true;
    else
        this.sortByParam = false;
}
var offsetHandler = function () {
    this.offset = 0;

    this.updateOffset()
    {
        this.offset += 54;
    }
}
var requestStateHandler = function () {
    this.requestData = requestDataClass();
    this.offset = offsetHandler();

    this.createNewRequestState()
    {
        this.requestData = requestDataClass();
        this.offset = offsetHandler();
    }
}
/*
assumed indexes for sortByHtml
0 == sort-by (nothing)
1 == name
2 == newest
3 == best-rated
4 == price-high
5 == price-low
*/