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