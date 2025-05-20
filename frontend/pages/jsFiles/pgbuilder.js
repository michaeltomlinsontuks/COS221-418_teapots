function routeToRegister() {
    window.location.replace(getLocalRoute() + "signup");
}
function routeToLogin() {
    window.location.replace(getLocalRoute() + "login");
}
function buildFilterbar() {
    var overlay = document.getElementById("overlay");
    var searchHtml = document.createElement("input");
    var categoryHtml = document.createElement("select");
    var brandHtml = document.createElement("select");
    var minPriceHtml = document.createElement("input");
    var maxPriceHtml = document.createElement("input");
    var sortByHtml = document.createElement("select");
    var trFilters = document.createElement('tr');
    var tableFilters = document.createElement('table');
    tableFilters.id = "filtersRowID"

    var trHead = document.createElement('tr');
    trHead.appendChild(newTH("search"));
    trHead.appendChild(newTH("category"));
    trHead.appendChild(newTH("brand"));
    trHead.appendChild(newTH('sort-by'));
    trHead.appendChild(newTH('min-price'));
    trHead.appendChild(newTH("max-price"));
    tableFilters.appendChild(trHead);


    console.log(newTD(searchHtml));
    trFilters.appendChild(newTD(searchHtml));
    trFilters.appendChild(newTD(categoryHtml));
    trFilters.appendChild(newTD(brandHtml));
    trFilters.appendChild(newTD(sortByHtml));
    trFilters.appendChild(newTD(minPriceHtml));
    trFilters.appendChild(newTD(maxPriceHtml));
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
function newTH(text)
{
    var th = document.createElement('th')
    th.textContent = text;
    return th;

}