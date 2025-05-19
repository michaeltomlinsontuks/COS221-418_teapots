var usernameHtml;
var passwordHtml;
var confirmLoginHtml;
document.addEventListener('DOMContentLoaded', startUp);
function initialiseVariables() {
    usernameHtml = document.getElementById('usernameID');
    passwordHtml = document.getElementById('passwordID');
    confirmLoginHtml = document.getElementById('confirmLoginID');
}
function startUp() {
    initialiseVariables();
}
function attemptLogin() {
    if (validateLogin()) {
        sendlogin();
    }
    else {
        alert('Please check that your username and password are filled in');
        // remove and add a personalised popup 
    }
}
function usernameValidation() {
    // regex for username length
}
function passwordValidation() {
    // regex for password length
}

function validateLogin() {
    return (passwordValidation() && usernameValidation());
}
function sendlogin() {
    // add http header items from a .env
    var request = new XMLHttpRequest();

    request.onreadystatechange = stateChangeLogin;
    var requestData =
    {

    };
    request.open("POST", "https://example.com/login", true);
    request.setRequestHeader("Content-Type", "application/json");
}
function stateChangeLogin() {

    if (this.state === 4) {
        if (this.status === 200) {
            var requestResponse = this.responseText;
            requestResponse = JSON.parse(responseText);
            if (requestResponse.status === "error") {
                alert("please insure that your username and password are valid");
            }
            else {
                var data = requestResponse.data;
                setLoginCookie(data.api_key, data.username);
                alert("You have successfully logged in, please enjoy your visit");
                window.location.href = "";
            }

        }
        else {
            alert("An error occurred on our side...")
        }
    }
}
