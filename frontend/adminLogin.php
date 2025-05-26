<?php
?>
<div class="adminLogin">
    <table>
        <tr>
            <td><input type="text" id="usernameID" placeholder="username"></td>
        </tr>
        <tr>
            <td><input type="password" id="passwordID" placeholder="password"></td>
        </tr>
        <tr>
            <td><input type="button" value="Login" onclick="loginAdmin()"></td>
        </tr>
    </table>
</div>
<!-- Make sure these scripts are included in the correct order -->
<script src="pages/jsFiles/cookies.js"></script>
<script src="adminJS/admin.js"></script>