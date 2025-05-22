
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

                searchHtml = document.getElementById('searchID');
                categoryHtml = document.getElementById('categoryID');
                brandHtml = document.getElementById("brandID");
                maxPriceHtml = document.getElementById('maxPriceID');
                minPriceHtml = document.getElementById('minPriceID');
                sortByHtml = document.getElementById('sortByID');

                searchHtml.addEventListener('change', currentRequestState.createNewRequestState);
                categoryHtml.addEventListener('change', currentRequestState.createNewRequestState);
                brandHtml.addEventListener('change', currentRequestState.createNewRequestState);
                maxPriceHtml.addEventListener('change', currentRequestState.createNewRequestState);
                minPriceHtml.addEventListener('change', currentRequestState.createNewRequestState);
                sortByHtml.addEventListener('change', currentRequestState.createNewRequestState);
            }, 800);
            // initialise the vars for it here

        }
        else {
            overlay.style.animation = "overlayShrink 1.5s ease-in-out forwards"
            overlayExtended = false;
            setTimeout(function () {
                destroyFilterbar();

            }, 700);
            searchHtml.removeEventListener('change', currentRequestState.createNewRequestState);
            categoryHtml.removeEventListener('change', currentRequestState.createNewRequestState);
            brandHtml.removeEventListener('change', currentRequestState.createNewRequestState);
            maxPriceHtml.removeEventListener('change', currentRequestState.createNewRequestState);
            minPriceHtml.removeEventListener('change', currentRequestState.createNewRequestState);
            sortByHtml.removeEventListener('change', currentRequestState.createNewRequestState);
            searchHtml = null;
            categoryHtml = null;
            brandHtml = null;
            maxPriceHtml = null;
            minPriceHtml = null;
            sortByHtml = null;
            //set the vars here as null

        }
    })
    requestProducts();
    // insertTd();
}

// inserts the td into the table pre / post  request
function insertTd() {
    var index = productHandler.newProductsAt;

    var rowsNeeded = Math.floor((productHandler.newProductsStop - productHandler.newProductsAt) / 3);

    var productsNeeded = (productHandler.newProductsStop - productHandler.newProductsAt);
    // insures that remainders are handled 

    if ((productHandler.newProductsStop - productHandler.newProductsAt) % 3 !== 0) {
        rowsNeeded++;
    }


    for (var i = 0; i < rowsNeeded; i++) {
        tr = document.createElement("tr");


        for (var cols = 0; cols < 3 && productsNeeded > 0; cols++, index++, productsNeeded--) {

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
function updateScrollTop() {
    if (scrollHandler.blockRequest == false) {

        scrollHandler.scrollTop = scrollHandler.scrolldivElement.scrollTop;

        if (scrollHandler.scrollTop >= scrollHandler.scrolldivElement.scrollHeight * scrollHandler.divisor) {
            if (scrollHandler.divisor <= 0.9) {
                scrollHandler.divisor = scrollHandler.divisor + (scrollHandler.half / 2);

                scrollHandler.half /= 2;
            }
            if (productHandler.newProductsAt !== productHandler.newProductsStop) {
                requestProducts();
                var intervalBeforeRequest = setTimeout(function () {
                    scrollHandler.blockRequest = false;
                }, 1000);
                scrollHandler.blockRequest = true;
            }
        }


    }

}
var scrollManagerClass = function () {

    this.divisor = 0.5;
    this.half = 0.5;
    this.scrolldivElement = document.getElementById('scrollDivID');
    this.scrollTop = this.scrolldivElement.scrollTop;
    this.blockRequest = false;
    this.updateScrollTop = updateScrollTop;


}
function clearTD() {
    while (table.firstChild) {
        table.removeChild(table.firstChild)
    }
}