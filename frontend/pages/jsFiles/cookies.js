
// this page is used for cookie managing
function setLoginCookie(api_key, username) {
    data =
    {
        api_key: api_key,
        username: username,
    }
    data = encodeURIComponent(JSON.stringify(data));
    document.cookie = 'userdata=' + data + "path=/; Secure; HttpOnly; SameSite=Strict";
}
function getLoginCookie() {
    var result = getCookie("userdata");
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
