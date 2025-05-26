var productHandler = new ProductHandler();
var selectCompany;
var arrayOfUpdates = [];
document.addEventListener("DOMContentLoaded", setUpPage);


function manageUsers() {
    window.location.replace(getLocalRoute() + "adminUsers");
}
function manageProducts() {
    window.location.replace(getLocalRoute() + "admin");
}
function setUpPage() {
    selectCompany = document.getElementById("compID");
    var params = new URLSearchParams(window.location.search);
    var value = params.get('page');
    if (value === "admin")
        initialiseManageProducts();
    else if (value === "adminUsers")
        initialiseManageUsers();
}
function initialiseManageProducts() {
    selectCompany.disabled = false;
    fillCompanyBox();
    var request = new XMLHttpRequest();

    request.onreadystatechange = stateChangeProducts;
    var cookieData = getLoginCookie();
    var api_key = cookieData.api_key;

    requestData = {
        type: "getproductpage",
        api_key: api_key,
        limit: 10000,
    }

    var requestHeaderData = getLocalCredentials();

    request.open("POST", requestHeaderData.host, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));    // fix to use wheately login stuff instead of the php my admin code if necessary
    // fix to use wheately login stuff instead of the php my admin code if necessary
    request.send(JSON.stringify(requestData));


}

function stateChangeProducts() {
    if (this.readyState === 4) {
        if (this.status === 200) {
            var requestResponse = this.responseText;
            requestResponse = JSON.parse(requestResponse);
            if (requestResponse.status === "error") {
                alert("something went wrong...");
            }
            else {
                var data = requestResponse.data;
                productHandler.addProductsAdmin(data);

            }
        }
        else {
            alert("An error occurred on our side...")
        }
    }
}
function insertIntoTableAdmin() {
    var table = document.getElementById("manageProdID")
    for (var i = 0; i < productHandler.products.length; i++) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        var pData = document.createElement('p');

        pData.textContent = productHandler.products[i].name;
        td.appendChild(pData);
        tr.appendChild(td);

        td = document.createElement('td');
        pData = document.createElement('p');
        pData.style.maxHeight = "50px";
        pData.style.overflowY = "auto";
        pData.textContent = productHandler.products[i].description;
        td.appendChild(pData);
        tr.appendChild(td);

        td = document.createElement('td');
        pData = document.createElement('input');
        pData.type = "number";
        pData.min = "0";
        pData.style.width = "50%";
        pData.value = productHandler.products[i].regularPrice;
        productHandler.products[i].AdminRegPrice = pData;
        pData.style.textAlign = "center";
        td.appendChild(pData);
        tr.appendChild(td);

        td = document.createElement('td');
        pData = document.createElement('input');
        pData.type = "number";
        pData.min = "0";
        pData.style.width = "50%";
        pData.value = productHandler.products[i].salePrice;
        pData.style.textAlign = "center";
        productHandler.products[i].AdminDiscPrice = pData;
        pData.id = productHandler.products[i].id;
        td.appendChild(pData);
        tr.appendChild(td);

        td = document.createElement('td');
        pData = document.createElement('p');
        pData.textContent = productHandler.products[i].brand;
        td.appendChild(pData);
        tr.appendChild(td);

        td = document.createElement('td');
        pData = document.createElement('p');
        pData.textContent = productHandler.products[i].category;
        td.appendChild(pData);
        tr.appendChild(td);


        td = document.createElement('td');
        pData = document.createElement('input');
        pData.type = "button";
        pData.value = "update";
        pData.id = i;
        arrayOfUpdates.push(pData.id);
        pData.addEventListener('click', function () {
            sendUpdateToProdID(this.id);
        })

        td.appendChild(pData);
        tr.appendChild(td);




        table.appendChild(tr);
    }

}
function sendUpdateToProdID(index) {
    if (selectCompany.selectedIndex === 0) {
        alert("select a company to update the product for")
        return null;
    }

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {

        if (this.readyState === 4) {
            if (this.status === 200) {
                var requestResponse = this.responseText;
                requestResponse = JSON.parse(requestResponse);
                if (requestResponse.status === "error") {
                    alert("something went wrong...");
                }
                else {
                    alert("update successful");

                }
            }
            else {
                alert("An error occurred on our side...")
            }
        }


    };
    var cookieData = getLoginCookie();
    var api_key = cookieData.api_key;

    requestData = {
        type: "updateProduct",
        api_key: api_key,
        prodID: productHandler.products[index].id,
        bestPrice: productHandler.products[index].AdminDiscPrice.value,
        regularPrice: productHandler.products[index].AdminRegPrice.value,
        company: selectCompany.options[selectCompany.selectedIndex].value,
    }

    var requestHeaderData = getLocalCredentials();

    request.open("POST", requestHeaderData.host, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));    // fix to use wheately login stuff instead of the php my admin code if necessary
    // fix to use wheately login stuff instead of the php my admin code if necessary
    console.log(requestData);
    request.send(JSON.stringify(requestData));

}

function fillCompanyBox() {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {

        if (this.readyState === 4) {
            if (this.status === 200) {
                var requestResponse = this.responseText;
                requestResponse = JSON.parse(requestResponse);
                if (requestResponse.status === "error") {
                    alert("something went wrong...");
                }
                else {
                    var data = requestResponse.data;
                    for (var i = 0; i < data.length; i++) {
                        var opt = document.createElement('option');
                        opt.value = data[i].company_name;
                        opt.textContent = data[i].company_name;
                        selectCompany.appendChild(opt);
                    }

                }
            }
            else {
                alert("An error occurred on our side...")
            }
        }


    };
    var cookieData = getLoginCookie();
    var api_key = cookieData.api_key;

    requestData = {
        type: "getcompanies",
        api_key: api_key,
    }

    var requestHeaderData = getLocalCredentials();

    request.open("POST", requestHeaderData.host, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));    // fix to use wheately login stuff instead of the php my admin code if necessary
    // fix to use wheately login stuff instead of the php my admin code if necessary
    request.send(JSON.stringify(requestData));

}



function initialiseManageUsers() {

}

function stateChangeUsers() {

}