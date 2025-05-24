<div class="login">
    <table>
        <tr>
            <td>
                username
                <br>
                <input type="text" value="" placeholder="..." id="usernameID">
                <br>
            </td>
        </tr>
        <tr>
            <td class="passTd">
                password
                <br>
                <div class="passCombo">
                    <input class="passwordText" type="password" value="" placeholder="..." id="passwordID">
                    <input class="eyeButton" type="image" src="images/eye.png" onclick="revealPassword()">
                </div>
            </td>
        </tr>
        <tr>
            <td class="confirmLoginTD">
                <input type="button" value="confirm" id="confirmLoginID">
            </td>
        </tr>
    </table>

</div>
<script src="pages/jsFiles/login.js"></script>