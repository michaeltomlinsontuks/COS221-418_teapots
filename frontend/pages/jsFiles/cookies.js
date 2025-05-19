
// this page is used for cookie managing
function setLoginCookie(api_key, username) {
    data =
    {
        api_key: api_key,
        username: username,
    }
    data = encodeURIComponent(JSON.stringify(data));
    console.log(data);
    document.cookie = 'userdata=' + data;
}
function getLoginCookie() {
    var result = getCookie("userdata");
    if (result != null) {
        var data = JSON.parse(result);
        console.log(data);
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
