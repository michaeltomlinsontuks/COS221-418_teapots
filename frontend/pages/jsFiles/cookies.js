
// this page is used for cookie managing
function setLoginCookie(api_key, username) {
    data =
    {
        api_key: api_key,
        username: username,
    }
    data = encodeURIComponent(JSON.stringify(data));
    document.cookie = 'userdata=' + data + "; path=/;";
}
function setLoginCookieAdmin(api_key, username) {
    data =
    {
        api_key: api_key,
        username: username,
    }
    data = encodeURIComponent(JSON.stringify(data));
    document.cookie = 'userdataAdmin=' + data + "; path=/;";
}

function getLoginCookie() {
    var result = getCookie("userdata");
    if (result != null) {
        var data = JSON.parse(result);
        return data;
    }
}
function getLoginCookieAdmin() {
    var result = getCookie("userdataAdmin");
    if (result != null) {
        var data = JSON.parse(result);
        return data;
    }
}
function getLocalCredentials() {
    var result = getCookie('localAuthentication');
    if (result != null) {
        var data = JSON.parse(result);
        return data;
    }

}
function getCookie(name) {
    var cookies = document.cookie.split('; ');
    for (var i = 0; i < cookies.length; i++) {
        cookiesPair = cookies[i].split('=');
        if (cookiesPair[0] === name) {
            return decodeURIComponent(cookiesPair[1]);
        }
    }
    return null;
}
function getLocalRoute() {
    return getCookie("localRoute");
}
function signOut() {
    document.cookie = "userdata=; max-age=0; path=/;";
    document.cookie = "userdataAdmin=; max-age=0; path=/;"
    window.location.replace(getLocalRoute() + "logout");
}