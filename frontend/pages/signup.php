<div class="signup">
    <table>
        <tr>
            <td>
                username
                <br>
                <input type="text" value="" placeholder="..." id="usernameID">

            </td>
        </tr>
        <tr>
            <td>
                email
                <br>
                <input type="text" value="" placeholder="...@gmail.com" id="emailID">

            </td>
        </tr>

        <tr>
            <td class="passTd">
                password
                <div class="passCombo">
                    <input class="passwordText" type="password" value="" placeholder="..." id="passwordID">
                    <input class="eyeButton" type="image" src="images/eye.png" onclick="revealPassword()">
                </div>
            </td>
        </tr>
        <tr>
            <td class="passTd">
                confirm password
                <div class="passCombo">
                    <input class="passwordText" type="password" value="" placeholder="..." id="confirmPasswordID">
                    <input class="eyeButton" type="image" src="images/eye.png" onclick="revealPasswordConfirm()">
                </div>
            </td>
        </tr>
        <tr>
            <td class="passTd">
                <input type="button" value="confirm" id="confirmLoginID">
            </td>
        </tr>

    </table>

</div>
<script src="pages/jsFiles/signup.js"></script>