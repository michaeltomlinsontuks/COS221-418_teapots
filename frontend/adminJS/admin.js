var selectCompany;
var selectCompanyNP;
var selectNpBrand;
var selectNpCat;
var prodNameHtml;
var prodDscHtml;
var imgUrlHtml;
var priceRegHtml;
var priceDiscHtml;
var userHandlerVar;
var usernameHtml;
var emailHtml;
var passwordHtml;
var checkedHtml;

var productHandler = {};

function isAdminLoginPage() {
    return window.location.pathname.endsWith("adminLogin.php");
}

if (!isAdminLoginPage()) {
    document.addEventListener("DOMContentLoaded", setUpPage);
}


function manageUsers() {
    window.location.href = "admin.php?page=adminUsers";
}
function manageProducts() {
    window.location.href = "admin.php?page=adminProducts";
}
function setUpPage() {
    selectCompany = document.getElementById("compID");
    selectCompanyNP = document.getElementById("compNP");
    selectNpBrand = document.getElementById("brandNP");
    selectNpCat = document.getElementById('catNP');

    prodNameHtml = document.getElementById("nameID");
    prodDscHtml = document.getElementById('dscID');
    imgUrlHtml = document.getElementById('imgID');
    priceRegHtml = document.getElementById('regPriceID');
    priceDiscHtml = document.getElementById('discPriceID');

    var params = new URLSearchParams(window.location.search);
    var value = params.get('page');
    if (value === "adminProducts" || value === null) { // default to products if no page param
        initialiseManageProducts();
    } else if (value === "adminUsers") {
        initialiseManageUsers();
    }

    // Only add event listener if selectCompany exists
    if (selectCompany) {
        selectCompany.addEventListener('change', function() {
            if (selectCompany.selectedIndex > 0) {
                loadCompanyProducts(selectCompany.value);
            }
        });
    }
}
function initialiseManageProducts() {
    if (selectCompany) {
        selectCompany.disabled = false;
    }
    var api_key = getApiKeySafe();
    if (!api_key) return;

    fillCompanyBox();
    fillBrandBox();
    fillCategoriesBox();
    var request = new XMLHttpRequest();

    request.onreadystatechange = stateChangeProducts;

    var requestData = {
        type: "getadminproducts",
        api_key: api_key
    };

    var requestHeaderData = getLocalCredentials();

    request.open("POST", requestHeaderData.host, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));
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
            alert("Failed to load products.");
        }
    }
}

productHandler.addProductsAdmin = function(data) {
    this.products = data;
    insertIntoTableAdmin();
}

function insertIntoTableAdmin() {
    var table = document.getElementById("manageProdID");
    if (!table) {
        console.error("Table with ID 'manageProdID' not found!");
        return;
    }
    console.log("Products to display:", productHandler.products);
    // Clear all rows except the header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
    if (!productHandler.products || productHandler.products.length === 0) {
        var row = table.insertRow();
        var cell = row.insertCell();
        cell.colSpan = 8;
        cell.innerText = "No products found.";
        return;
    }
    productHandler.products.forEach(function(product, index) {
        var row = table.insertRow();
        row.innerHTML = `
            <td>${product.ProductID}</td>
            <td>${product.Name}</td>
            <td>${product.Description}</td>
            <td>${product.BrandName}</td>
            <td>${product.CategoryName}</td>
            <td>${product.RegularPrice}</td>
            <td>${product.BestPrice}</td>
            <td>
                <button onclick="editProduct(${index})">Edit</button>
                <button onclick="deleteProduct(${index})">Delete</button>
            </td>
        `;
    });
}

function deleteProduct(index) {
    if (selectCompany.selectedIndex === 0) {
        alert("select a company to delete the product of");
        return null;
    }

    if (!confirm("Are you sure you want to delete this product? This cannot be undone.")) {
        return;
    }

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                var requestResponse = JSON.parse(this.responseText);
                if (requestResponse.status === "error") {
                    alert("something went wrong...");
                } else {
                    alert("Delete successful. Refreshing product list...");
                    // Refresh the table after deletion
                    loadCompanyProducts(selectCompany.value);
                }
            } else {
                alert("An error occurred on our side...");
            }
        }
    };

    var cookieData = getLoginCookieAdmin();
    var api_key = cookieData.api_key;

    var requestData = {
        type: "deleteProduct",
        api_key: api_key,
        product_id: productHandler.products[index].ProductID
    };

    var requestHeaderData = getLocalCredentials();

    request.open("POST", requestHeaderData.host, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));
    request.send(JSON.stringify(requestData));
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
    var cookieData = getLoginCookieAdmin();
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
    var api_key = getApiKeySafe();
    if (!api_key) return;

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                var requestResponse = JSON.parse(this.responseText);
                if (requestResponse.status === "error") {
                    alert("something went wrong...");
                } else {
                    var data = requestResponse.data;
                    // Clear existing options except the first
                    selectCompany.length = 1;
                    selectCompanyNP.length = 1;
                    for (var i = 0; i < data.length; i++) {
                        var opt1 = document.createElement('option');
                        opt1.value = data[i].company_name;
                        opt1.textContent = data[i].company_name;
                        selectCompany.appendChild(opt1);

                        var opt2 = document.createElement('option');
                        opt2.value = data[i].company_name;
                        opt2.textContent = data[i].company_name;
                        selectCompanyNP.appendChild(opt2);
                    }
                }
            } else {
                alert("An error occurred on our side...");
            }
        }
    };

    var requestData = {
        type: "getcompanies",
        api_key: api_key,
    };

    var requestHeaderData = getLocalCredentials();

    request.open("POST", requestHeaderData.host, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));
    request.send(JSON.stringify(requestData));
}

function fillBrandBox() {
    var api_key = getApiKeySafe();
    if (!api_key) return;

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
                    for (var i = 0; i < data.length && i < 20; i++) {
                        var opt = document.createElement('option');
                        opt.value = data[i].brand_id;
                        opt.textContent = data[i].brand_name;
                        selectNpBrand.appendChild(opt);
                    }

                }
            }
            else {
                alert("An error occurred on our side...")
            }
        }


    };
    requestData = {
        type: "getbrands",
        api_key: api_key,
    }

    var requestHeaderData = getLocalCredentials();

    request.open("POST", requestHeaderData.host, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));
    request.send(JSON.stringify(requestData));

}
function addNewProduct() {
    var api_key = getApiKeySafe();
    if (!api_key) return;

    if (priceDiscHtml.value === "" || !testImgUrl() || priceRegHtml.value === "" || prodDscHtml.value === "" || prodNameHtml.value === "" || imgUrlHtml.value === "" || selectCompanyNP.selectedIndex === 0 || selectNpBrand.selectedIndex === 0 || selectNpCat.selectedIndex === 0) {
        alert("please insure all fields are correctly filled out");
        return null;
    }

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                var requestResponse = JSON.parse(this.responseText);
                if (requestResponse.status === "error") {
                    alert("something went wrong...");
                } else {
                    alert("Product added");
                }
            } else {
                alert("An error occurred on our side...");
            }
        }
    };

    var requestData = {
        type: "addProduct",
        api_key: api_key,
        name: prodNameHtml.value,
        description: prodDscHtml.value,
        brand_id: parseInt(selectNpBrand.value),
        category_id: parseInt(selectNpCat.value),
        company: selectCompanyNP.value,
        best_price: parseFloat(priceDiscHtml.value),
        regular_price: parseFloat(priceRegHtml.value),
        images: [{ image: imgUrlHtml.value }]
    };

    var requestHeaderData = getLocalCredentials();
    console.log(requestData);

    request.open("POST", requestHeaderData.host, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));
    request.send(JSON.stringify(requestData));
}
function testImgUrl() {
    var imgUrlRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;
    if (!imgUrlRegex.test(imgUrlHtml.value)) {
        alert("please insure that the provided image url is valid")
    }
    return imgUrlRegex.test(imgUrlHtml.value);

}


function fillCategoriesBox() {
    var api_key = getApiKeySafe();
    if (!api_key) return;

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
                    for (var i = 0; i < data.length && i < 20; i++) {
                        var opt = document.createElement('option');
                        opt.value = data[i].category_id;
                        opt.textContent = data[i].category_name;
                        selectNpCat.appendChild(opt);
                    }

                }
            }
            else {
                alert("An error occurred on our side...")
            }
        }


    };
    requestData = {
        type: "getcategories",
        api_key: api_key,
    }

    var requestHeaderData = getLocalCredentials();


    request.open("POST", requestHeaderData.host, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));
    request.send(JSON.stringify(requestData));

}


function initialiseManageUsers() {
    var api_key = getApiKeySafe();
    if (!api_key) return;

    usernameHtml = document.getElementById('userID');
    emailHtml = document.getElementById('emailID');
    passwordHtml = document.getElementById('passID');
    checkedHtml = document.getElementById('checkID');
    var request = new XMLHttpRequest();

    request.onreadystatechange = stateChangeUsers;

    requestData = {
        type: "getAllUsers",
        api_key: api_key,
    }

    var requestHeaderData = getLocalCredentials();

    request.open("POST", requestHeaderData.host, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));
    request.send(JSON.stringify(requestData));


}

function stateChangeUsers() {
    if (this.readyState === 4) {
        if (this.status === 200) {
            var response = JSON.parse(this.responseText);
            if (response.status === "success") {
                displayUsers(response.data);
            } else {
                alert("Error loading users");
            }
        }
    }
}

function displayUsers(users) {
    const table = document.querySelector('.manageUsers');
    // Clear all rows except the header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    users.forEach(user => {
        const row = table.insertRow();
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.created_at}</td>
            <td>${user.is_admin ? 'Yes' : 'No'}</td>
            <td>
                ${!user.is_admin ? 
                    `<button onclick="makeAdmin(${user.id})">Make Admin</button>` : 
                    ''}
                <button onclick="deleteUser(${user.id})">Delete</button>
            </td>
        `;
    });
}

function makeAdmin(userId) {
    var api_key = getApiKeySafe();
    if (!api_key) return;

    if (!confirm('Are you sure you want to make this user an admin?')) return;

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            var response = JSON.parse(this.responseText);
            if (response.status === "success") {
                alert("User made admin successfully");
                initialiseManageUsers(); // Refresh the list
            }
        }
    };

    var requestData = {
        type: "makeadmin",
        api_key: api_key,
        user_id: userId
    };

    var requestHeaderData = getLocalCredentials();
    request.open("POST", requestHeaderData.host, true);
    request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));
    sendRequest(request, requestData);
}

function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState === 4) {
            console.log("Delete user response:", this.status, this.responseText);
            if (this.status === 200) {
                var response = JSON.parse(this.responseText);
                if (response.status === "success") {
                    alert("User deleted successfully");
                    initialiseManageUsers();
                } else {
                    alert("Error deleting user: " + response.message);
                }
            }
        }
    };

    var requestData = {
        type: "deleteuser",
        api_key: getLoginCookieAdmin().api_key,
        user_id: userId
    };

    var requestHeaderData = getLocalCredentials();
    request.open("POST", requestHeaderData.host, true);
    request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));
    sendRequest(request, requestData);
}
function addNewUser() {
    if (usernameValidation() && passwordValidation() && emailValidation()) {
        var request = new XMLHttpRequest();

        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                console.log("Add user response:", this.status, this.responseText);
                if (this.status === 200) {
                    var requestResponse = this.responseText;
                    requestResponse = JSON.parse(requestResponse);
                    if (requestResponse.status === "error") {
                        alert("This username or email already exists");
                    }
                    else {
                        alert("user successfully added");
                        initialiseManageUsers();
                    }
                }
                else {
                    alert("An error occurred on our side...")
                }
            }
        };
        var cookieData = getLoginCookieAdmin();
        var api_key = cookieData.api_key;

        requestData = {
            type: "addUser",
            api_key: api_key, 
            username: usernameHtml.value,
            password: passwordHtml.value,
            email: emailHtml.value,
            is_admin: checkedHtml.checked,
        }

        var requestHeaderData = getLocalCredentials();
        console.log(requestData);

        request.open("POST", requestHeaderData.host, true);
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));
        request.send(JSON.stringify(requestData));
    }
    else {
        alert("please insure all data is properly filled in, usernames must be atleast 3 characters long");
    }
}
function usernameValidation() {
    // regex for username length
    var pattern = /^.{3,}$/
    return pattern.test(usernameHtml.value);
}
function passwordValidation() {
    // regex for password length
    var letterTest = /[a-z]+/;
    var upperLetterText = /[A-Z]+/;
    var hasDigit = /\d+/;
    var hasSymbol = /[\W_]+/;
    var testLength = /.{8,}/
    var result = letterTest.test(passwordHtml.value) && upperLetterText.test(passwordHtml.value) && hasDigit.test(passwordHtml.value) && hasSymbol.test(passwordHtml.value) && testLength.test(passwordHtml.value);
    if (result === false)
        alert("Please ensure that your password has lowercase and uppercase letters, a symbol and a number to improve security");
    return result;
}
function emailValidation() {
    // regex for password length
    var pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!pattern.test(emailHtml.value))
        alert("Please enter a valid email address");
    return pattern.test(emailHtml.value);
}
function loginAdmin() {
    var usernameHtml = document.getElementById("usernameID");
    var passwordHtml = document.getElementById("passwordID");

    // Validate inputs
    if (!validateAdminLogin()) {
        popup.construct("Please check that your username and password are filled in", false);
        return;
    }

    var request = new XMLHttpRequest();
    request.onreadystatechange = stateChangeAdminLogin;

    // Attempt to include an api_key (even if empty, to test server behavior)
    var requestData = {
        type: "login",
        username: usernameHtml.value,
        password: passwordHtml.value,
    };

    var requestHeaderData = getLocalCredentials();
    console.log('Sending request with data:', JSON.stringify(requestData));

    request.open("POST", requestHeaderData.host, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));

    request.send(JSON.stringify(requestData));
}

function validateAdminLogin() {
    var pattern = /^.{3,}$/;
    var usernameValid = pattern.test(document.getElementById("usernameID").value);
    var passwordValid = pattern.test(document.getElementById("passwordID").value);
    return usernameValid && passwordValid;
}

function stateChangeAdminLogin() {
    if (this.readyState === 4) {
        if (this.status === 200) {
            var requestResponse = JSON.parse(this.responseText);
            console.log('Full login response:', requestResponse);
            if (requestResponse.status === "error") {
                alert("Admin login unsuccessful. Please ensure your username and password are correct.");
            } else if (!requestResponse.data.is_admin) {
                alert("User is not an admin. Please use admin credentials.");
            } else {
                var data = requestResponse.data;
                setLoginCookieAdmin(data.api_key, data.username);
                alert("Admin login successful. Welcome!");
                window.location.href = "./admin.php";
            }
        } else {
            alert("An error occurred on our side...");
        }
    }
}

function sendRequest(request, requestData) {
    // You must set up the request before calling this!
    // This function just sends the JSON data.
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(requestData));
}

function loadCompanyProducts(companyName) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                var requestResponse = JSON.parse(this.responseText);
                if (requestResponse.status === "error") {
                    alert("something went wrong...");
                } else {
                    var data = requestResponse.data;
                    productHandler.addProductsAdmin(data);
                }
            } else {
                alert("Failed to load products.");
            }
        }
    };

    var cookieData = getLoginCookieAdmin();
    var api_key = cookieData.api_key;

    var requestData = {
        type: "getadminproducts",
        api_key: api_key,
        company: companyName 
    };

    var requestHeaderData = getLocalCredentials();

    request.open("POST", requestHeaderData.host, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));
    request.send(JSON.stringify(requestData));
}

function editProduct(index) {
    var table = document.getElementById("manageProdID");
    var row = table.rows[index + 1]; // +1 to skip header row
    var product = productHandler.products[index];

    // Save original HTML for cancel
    var originalHTML = row.innerHTML;

    // Replace cells with input fields
    row.innerHTML = `
        <td>${product.ProductID}</td>
        <td><input type="text" value="${product.Name}" id="editName${index}" style="width: 120px;"></td>
        <td><input type="text" value="${product.Description}" id="editDesc${index}" style="width: 200px;"></td>
        <td>${product.BrandName}</td>
        <td>${product.CategoryName}</td>
        <td><input type="number" value="${product.RegularPrice}" id="editRegPrice${index}" style="width: 80px;"></td>
        <td><input type="number" value="${product.BestPrice}" id="editBestPrice${index}" style="width: 80px;"></td>
        <td>
            <button onclick="saveProductEdit(${index})">Save</button>
            <button onclick="cancelProductEdit(${index})">Cancel</button>
        </td>
    `;

    // Store original HTML for cancel
    row.setAttribute('data-original-html', originalHTML);
}

function saveProductEdit(index) {
    var table = document.getElementById("manageProdID");
    var row = table.rows[index + 1];
    var product = productHandler.products[index];

    // Get new values
    var newName = document.getElementById(`editName${index}`).value.trim();
    var newDesc = document.getElementById(`editDesc${index}`).value.trim();
    var newRegPrice = document.getElementById(`editRegPrice${index}`).value;
    var newBestPrice = document.getElementById(`editBestPrice${index}`).value;

    if (!newName || !newDesc || newRegPrice === "" || newBestPrice === "") {
        alert("Please fill out all fields.");
        return;
    }

    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                var response = JSON.parse(this.responseText);
                if (response.status === "success") {
                    alert("Product updated successfully.");
                    loadCompanyProducts(selectCompany.value);
                } else {
                    alert("Error updating product: " + (response.message || "Unknown error"));
                }
            } else {
                alert("An error occurred on our side...");
            }
        }
    };

    var cookieData = getLoginCookieAdmin();
    var api_key = cookieData.api_key;

    var requestData = {
        type: "updateProduct",
        api_key: api_key,
        product_id: product.ProductID,
        name: newName,
        description: newDesc,
        regular_price: parseFloat(newRegPrice),
        best_price: parseFloat(newBestPrice),
        company: selectCompany.value
    };

    var requestHeaderData = getLocalCredentials();
    request.open("POST", requestHeaderData.host, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));
    request.send(JSON.stringify(requestData));
}

function cancelProductEdit(index) {
    var table = document.getElementById("manageProdID");
    var row = table.rows[index + 1];
    var originalHTML = row.getAttribute('data-original-html');
    if (originalHTML) {
        row.innerHTML = originalHTML;
    }
}

// Defensive helper for cookieData
function getApiKeySafe() {
    var cookieData = getLoginCookieAdmin && getLoginCookieAdmin();
    return cookieData && cookieData.api_key ? cookieData.api_key : null;
}