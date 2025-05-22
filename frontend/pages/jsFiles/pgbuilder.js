function routeToRegister() {
    window.location.replace(getLocalRoute() + "signup");
}
function routeToLogin() {
    window.location.replace(getLocalRoute() + "login");
}
function buildFilterbar() {
    var overlay = document.getElementById("overlay");

    var searchHtml = document.createElement("input");
    searchHtml.id = "searchID";
    searchHtml.type = "text";

    var categoryHtml = document.createElement("input");
    categoryHtml.id = "categoryID";


    var brandHtml = document.createElement("input");
    brandHtml.id = "brandID";

    var minPriceHtml = document.createElement("input");
    minPriceHtml.id = "minPriceID";
    minPriceHtml.type = "number";

    var maxPriceHtml = document.createElement("input");
    maxPriceHtml.id = "maxPriceID";
    maxPriceHtml.type = "number";

    var sortByHtml = document.createElement("select");
    sortByHtml.id = "sortByID";
    addOptionTo(sortByHtml, "sort-by :", 0);
    addOptionTo(sortByHtml, "price high-low", 'price-high');
    addOptionTo(sortByHtml, "price low-high", 'price-low');
    addOptionTo(sortByHtml, "name ", 'name');
    addOptionTo(sortByHtml, "newest ", 'newest');
    addOptionTo(sortByHtml, "best rated ", 'best-rated');

    var trFilters = document.createElement('tr');
    var tableFilters = document.createElement('table');
    tableFilters.id = "filtersRowID"

    var trHead = document.createElement('tr');
    trHead.id = "headingRowID";
    trHead.appendChild(newTH("search"));
    trHead.appendChild(newTH("category"));
    trHead.appendChild(newTH("brand"));
    trHead.appendChild(newTH('min-price'));
    trHead.appendChild(newTH("max-price"));
    trHead.appendChild(newTH('sort-by'));
    tableFilters.appendChild(trHead);


    trFilters.appendChild(newTD(searchHtml));
    trFilters.appendChild(newTD(categoryHtml));
    trFilters.appendChild(newTD(brandHtml));
    trFilters.appendChild(newTD(minPriceHtml));
    trFilters.appendChild(newTD(maxPriceHtml));
    trFilters.appendChild(newTD(sortByHtml));
    tableFilters.appendChild(trFilters);
    overlay.appendChild(tableFilters);
}
function destroyFilterbar() {
    var overlay = document.getElementById("overlay");
    while (overlay.childNodes.length > 1) {
        overlay.removeChild(overlay.childNodes[1]);
    }
}
function newTD(element) {
    var td = document.createElement('td');
    td.appendChild(element);
    return td;
}
function newTH(text) {
    var th = document.createElement('th')
    th.textContent = text;
    return th;

}
function addOptionTo(selectElement, OptionText, value) {
    //optiontext is the displayed text
    // value is something like an id that might be stored
    var option = document.createElement('option');
    option.value = value;
    option.text = OptionText;
    selectElement.appendChild(option);
}

//product handling classes use but dont change// 

var Product = function (data) {
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
    this.ImgPointer = null;
    // used to keep track exactly which 
    this.setImgPointer = function (ImgPointer) {
        this.ImgPointer = ImgPointer;
    }
    this.printStars = function () {
        var toNumber = Number(this.reviewAvg);
        var output = "";
        var numStars = 0;
        while (toNumber >= 1) {
            output += "⭐";
            toNumber--;
            numStars++;
        }
        while (numStars < 5) {
            output += "✩";
            numStars++;
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
        this.newProductsAt = this.products.length;
        this.newProductsStop = this.newProductsAt + data.length;
        for (var i = 0; i < data.length; i++) {
            this.products.push(new Product(data[i]));
        }
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
        limit: 54,
        offset: offsetHandler.getOffset(),
    }
    // set it to the value of the search box
    if (this.parameterBuilder.searchParam) {
        this.requestData.search = searchHtml.value;
    }
    if (this.parameterBuilder.categoryParam) {
        this.requestData.categories = [categoryHtml.value];
        // depends on the selected index will configure now
        // likely will store the text of the category in the option
    }
    if (this.parameterBuilder.brandParam) {
        this.requestData.brands = [brandHtml.value];
        // depends on the selected index will configure now
        // likely will store the text of the category in the option
    }
    if (this.parameterBuilder.maxPriceParam) {
        this.requestData.max_price = maxPriceHtml.value;
    }
    if (this.parameterBuilder.minPriceParam) {
        this.requestData.min_price = minPriceHtml.value;
    }
    if (this.parameterBuilder.sortByParam) {
        this.requestData.sort = sortByHtml.options[sortByHtml.selectedIndex].value;
        // depends on the selected index will configure now
        // likely will store the text of the category in the option
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
    if (categoryHtml != null && categoryHtml != undefined && categoryHtml.value != "")
        this.categoryParam = true;
    else
        this.categoryParam = false;

    if (brandHtml != null && brandHtml != undefined && brandHtml.value != "")
        this.brandParam = true;
    else
        this.brandParam = false;

    if (maxPriceHtml != null && maxPriceHtml != undefined && maxPriceHtml.value != "")
        this.maxPriceParam = true;
    else
        this.maxPriceParam = false;

    if (minPriceHtml != null && minPriceHtml != undefined && minPriceHtml.value != "")
        this.minPriceParam = true;
    else
        this.minPriceParam = false;

    if (sortByHtml != null && sortByHtml != undefined && sortByHtml.selectedIndex != 0)
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
        productHandler = new ProductHandler();
        scrollHandler = new scrollManagerClass();
        clearTD();
        requestProducts();
    }

    this.getRequestData = function () {

        var requestData = new requestDataClass();
        console.log(requestData);
        return requestData.requestData;
    }

}

