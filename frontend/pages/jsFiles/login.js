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

}