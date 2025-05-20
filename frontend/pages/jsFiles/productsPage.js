
//### var initialization ###
//~~~~~~~~~~~~~//

// classes //
var currentRequestState;
var productHandler;
var user;
// classes //
//~~~~~~~~~~~~~//


var table;
var menuBtn;
var overlay;
var overlayExtended;
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

    scrollHandler = new scrollManagerClass();
    document.getElementById('scrollDivID').addEventListener('scroll', scrollHandler.updateScrollTop);
    user = new userClass();
    offsetHandler = new offsetClass();
    currentRequestState = new RequestStateHandler();
    productHandler = new ProductHandler();


    menuBtn.addEventListener("click", function () {

        if (overlayExtended === false) {
            overlay.style.animation = "overlayGrow 1.5s ease-in-out forwards"
            overlayExtended = true;
            setTimeout(function () {
                buildFilterbar();
            }, 500);
            // initialise the vars for it here


        }
        else {
            overlay.style.animation = "overlayShrink 1.5s ease-in-out forwards"
            overlayExtended = false;
            setTimeout(function () {
                destroyFilterbar();

            }, 500);

            //set the vars here as null

        }
    })
    requestProducts();
    // insertTd();
}

// inserts the td into the table pre / post  request
function insertTd() {
    var index = productHandler.newProductsAt;
    for (var i = 0; i < (productHandler.newProductsStop - productHandler.newProductsAt) / 3; i++) {
        tr = document.createElement("tr");
        for (var cols = 0; cols < 3; cols++, index++) {
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
            titleDiv.appendChild(document.createTextNode(productHandler.products[index].name));

            var priceDiv = document.createElement("div");
            priceDiv.appendChild(document.createTextNode("$ " + productHandler.products[index].salePrice));

            var ratingDiv = document.createElement("div");
            ratingDiv.appendChild(document.createTextNode(productHandler.products[index].printStars()));

            textDiv.appendChild(titleDiv);
            textDiv.appendChild(priceDiv);
            textDiv.appendChild(ratingDiv);
            textDiv.className = "productsText";

            var imgInput = document.createElement("input");
            imgInput.type = "image";
            imgInput.src = productHandler.products[index].mainImg;
            imgInput.alt = "Image goes here";
            imgDiv.className = "productImageDiv";
            productHandler.products[index].setImgPointer(imgDiv);

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

    var requestData = currentRequestState.getRequestData();

    var requestHeaderData = getLocalCredentials();

    request.open("POST", requestHeaderData.host, true);
    request.setRequestHeader("Content-Type", "application/json");

    request.setRequestHeader("Authorization", "Basic" + btoa(requestHeaderData.username + ":" + requestHeaderData.password));
    // fix to use wheately login stuff instead of the php my admin code if necessary

    request.send(JSON.stringify(requestData));
}
function stateProductRequest() {

    if (this.readyState === 4) {
        if (this.status === 200) {
            var requestResponse = this.responseText;
            requestResponse = JSON.parse(requestResponse);
            console.log(requestResponse);
            if (requestResponse.status === "error") {
                alert("something went wrong...");
            }
            else {
                var data = requestResponse.data;
                productHandler.addProducts(data);
            }
        }
        else {
            alert("An error occurred on our side...")
        }
    }
}
var Product = function (data) {
    // console.log(data);
    this.id = data.id;
    this.name = data.name;
    this.brand = data.brand;
    this.category = data.category;

    this.reviewAvg = data.reviewAverage;
    this.reviewCount = data.reviewCount;
    this.regularPrice = data.regularPrice;
    this.salePrice = data.salePrice;
    this.discountPercent = data.discountPercent;
    this.inStock = data.inStock;
    this.bestCompany = data.bestCompany;
    this.productCarousel = JSON.parse(data.CarouselImages);
    this.mainImg = this.productCarousel[0].image;
    // console.log(this.productCarousel[0].image)
    this.ImgPointer = null;
    // used to keep track exactly which 
    this.setImgPointer = function (imgPointer) {
        this.imgPointer = imgPointer;
    }
    this.printStars = function () {
        var toNumber = Number(this.reviewAvg);
        var output = "";
        while (toNumber >= 1) {
            output += "⭐";
            toNumber--;
        }
        return output;
    }
}
// holds an array of all the products   
var ProductHandler = function () {
    // data sent in should already be the data array
    this.newProductsAt = 0;
    this.newProductsStop = 54;
    this.products = [];
    this.addProducts = function (data) {
        // data should be an array
      //  console.log(data);
        this.newProductsAt = this.products.length;
        this.newProductsStop = this.newProductsAt + data.length;
        for (var i = 0; i < data.length; i++) {
            this.products.push(new Product(data[i]));
        }
        //console.log("from ",this.newProductsAt,"to ",this.newProductsStop)
        console.log(this.newProductsAt, this.newProductsStop);
        if (this.newProductsAt !== this.newProductsStop)
            insertTd();

    }
}
// a class made for sending requests
// will build a JSON based on the current values of the page

var requestDataClass = function () {
    // gets built at every request 
    this.parameterBuilder = new parameterBuilderClass();
    this.requestData =
    {
        type: "getproductpage",
        api_key: user.api_key,
        parameters: this.parameter,
        limit: 54,
        offset: offsetHandler.getOffset(),
    }
    // set it to the value of the search box
    if (this.parameterBuilder.searchParam) {
        this.requestData.search = "";
    }
    if (this.parameterBuilder.categoryParam) {
        this.requestData.category = "";
    }
    if (this.parameterBuilder.brandParam) {
        this.requestData.brand = "";
    }
    if (this.parameterBuilder.maxPriceParam) {
        this.requestData.maxPrice = "";
    }
    if (this.parameterBuilder.minPriceParam) {
        this.requestData.minPrice = "";
    }
    if (this.parameterBuilder.sortByParam) {
        this.requestData.sortBy = "";
    }
}
var userClass = function () {
    var cookieData = getLoginCookie();
    this.api_key = cookieData.api_key;
    this.username = cookieData.username;
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
var offsetClass = function () {
    this.offset = 0;

    this.updateOffset = function () {
        this.offset += 54;
    }
    this.getOffset = function () {
        var storedOffset = this.offset;
        this.updateOffset();
        return storedOffset;
    }
}
var RequestStateHandler = function () {


    this.createNewRequestState = function () {
        offsetHandler = new offsetClass();
    }

    this.getRequestData = function () {

        var requestData = new requestDataClass();
        console.log(requestData);
        return requestData.requestData;
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
// class may not be necessary
var scrollManagerClass = function () {

    this.scrolldivElement = document.getElementById('scrollDivID');
    this.scrollTop = this.scrolldivElement.scrollTop;
    this.blockRequest = false;
    this.updateScrollTop = updateScrollTop;


}
function updateScrollTop() {
    if (scrollHandler.blockRequest == false) {

        scrollHandler.scrollTop = scrollHandler.scrolldivElement.scrollTop;
        if (scrollHandler.scrollTop >= scrollHandler.scrolldivElement.scrollHeight / 2) {
            if (productHandler.newProductsAt !== productHandler.newProductsStop)
                requestProducts();
        }

        var intervalBeforeRequest = setTimeout(function () {
            scrollHandler.blockRequest = false;
        }, 1000);
        scrollHandler.blockRequest = true;
    }

}
