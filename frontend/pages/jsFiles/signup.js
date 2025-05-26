var usernameHtml;
var passwordHtml;
var emailHtml;
var confirmPassHtml;
var confirmLoginHtml;

document.addEventListener('DOMContentLoaded', startUp);

function initialiseVariables() {
    usernameHtml = document.getElementById('usernameID');
    passwordHtml = document.getElementById('passwordID');
    confirmPassHtml = document.getElementById('confirmPasswordID');
    emailHtml = document.getElementById('emailID');
    confirmLoginHtml = document.getElementById('confirmLoginID');
    confirmLoginHtml.addEventListener('click', attemptRegister);
}
function startUp() {
    initialiseVariables();
}
function attemptRegister() {
    if (validateRegister()) {
        sendRegister();
    }
    else {
        // remove and add a personalised popup 
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
        popup.construct("Please ensure that your password has lowercase and uppercase letters, a symbol and a number to improve security", false);
    return result;
}
function passwordConfirmValidation() {
    // regex for password length
    if (passwordHtml.value !== confirmPassHtml.value)
        popup.construct("Passwords do not match", false);
    return passwordHtml.value === confirmPassHtml.value;
}
function emailValidation() {
    // regex for password length
    var pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!pattern.test(emailHtml.value))
        popup.construct("Please enter a valid email address", false);
    return pattern.test(emailHtml.value);
}

function validateRegister() {
    return (usernameValidation() && passwordValidation() && passwordConfirmValidation() && emailValidation());
}
function sendRegister() {
    // add http header items from a .env
    var request = new XMLHttpRequest();
    request.onreadystatechange = stateChangeRegister;
    var requestData =
    {
        type: "register",
        username: usernameHtml.value,
        password: passwordHtml.value,
        email: emailHtml.value
    };

    var requestHeaderData = getLocalCredentials();

    request.open("POST",requestHeaderData.host, true);
    request.setRequestHeader("Content-Type", "application/json");

 request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));    // fix to use wheately login stuff instead of the php my admin code if necessary

    request.send(JSON.stringify(requestData));
}
function stateChangeRegister() {
    if (this.readyState === 4) {
        if (this.status === 200) {
            var requestResponse = this.responseText;
            requestResponse = JSON.parse(requestResponse);
            if (requestResponse.status === "error") {
                console.error(requestResponse);
                popup.construct("This username or email already exists, please use a different username or email, or login if you already have an account", false);
            }
            else {
                var data = requestResponse.data;
                setLoginCookie(data.api_key, data.username);
                popup.construct("You have successfully created an account and have been logged in, please enjoy your visit", true, true);
            }

        }
        else {

            popup.construct("An error has occurred on our side", false);
        }
    }
}
function revealPassword() {
    if (passwordHtml.type === "password") {
        passwordHtml.type = "text";
        passwordHtml.placeholder = "abc";
    }
    else {
        passwordHtml.type = "password";
        passwordHtml.placeholder = "..."
    }
}
function revealPasswordConfirm() {
    if (confirmPassHtml.type === "password") {
        confirmPassHtml.type = "text";
        confirmPassHtml.placeholder = "abc";
    }
    else {
        confirmPassHtml.type = "password";
        confirmPassHtml.placeholder = "..."
    }
}