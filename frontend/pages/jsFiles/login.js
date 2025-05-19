var usernameHtml;
var passwordHtml;
var confirmLoginHtml;

document.addEventListener('DOMContentLoaded', startUp);

function initialiseVariables() {
    usernameHtml = document.getElementById('usernameID');
    passwordHtml = document.getElementById('passwordID');
    confirmLoginHtml = document.getElementById('confirmLoginID');
    confirmLoginHtml.addEventListener('click', attemptLogin);
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
    var pattern = /^[A-Za-z\W]{3,}$/
    return pattern.test(usernameHtml.value);
}
function passwordValidation() {
    // regex for password length
    var pattern = /^[A-Za-z\W]{3,}$/
    return pattern.test(passwordHtml.value);
}

function validateLogin() {
    return (usernameValidation() && passwordValidation());
}
function sendlogin() {
    // add http header items from a .env
    var request = new XMLHttpRequest();

    request.onreadystatechange = stateChangeLogin;
    var requestData =
    {
        type: "login",
        username: usernameHtml.value,
        password: passwordHtml.value,
    };
    var requestHeaderData = getLocalCredentials();
    console.log(requestHeaderData);
    request.open("POST", requestHeaderData.host, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Basic" + btoa(requestHeaderData.username + ":" + requestHeaderData.password));
    // fix to use wheately login stuff instead of the php my admin code if necessary
    request.send(requestData);

}
function stateChangeLogin() {

    if (this.state === 4) {
        if (this.status === 200) {
            var requestResponse = this.responseText;
            requestResponse = JSON.parse(responseText);
            console.log(requestResponse);
            if (requestResponse.status === "error") {
                alert("please insure that your username and password are valid");
            }
            else {
                var data = requestResponse.data;
                setLoginCookie(data.api_key, data.username);
                alert("You have successfully logged in, please enjoy your visit");
                window.location.replace(getLocalRoute() + "products");
            }

        }
        else {
            alert("An error occurred on our side...")
        }
    }
}
