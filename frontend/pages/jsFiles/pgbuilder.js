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
    var divFilters = document.createElement('div');
    divFilters.appendChild(searchHtml);
    divFilters.appendChild(categoryHtml);
    divFilters.appendChild(brandHtml);
    divFilters.appendChild(sortByHtml);
    divFilters.appendChild(minPriceHtml);
    divFilters.appendChild(maxPriceHtml);

    overlay.appendChild(divFilters);
}
function destroyFilterbar() {
    var overlay = document.getElementById("overlay");
    while (overlay.childNodes.length > 1) {
        overlay.removeChild(overlay.childNodes[1]);
    }
}