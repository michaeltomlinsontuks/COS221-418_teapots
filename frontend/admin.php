<div class="adminPage">
    <table style="table-layout:fixed;">
        <tr>
            <td>
                <input type="button" value="manage Users" onclick="manageUsers()">
            </td>
            <td>
                <select disabled id="compID">
                    <option value="">select a company</option>
                </select>
            </td>
            <td>
                <input type="button" value="manage products" onclick="manageProducts()">
            </td>
        </tr>
    </table>

    <?php
    $page = isset($_GET['page']) ? $_GET['page'] : '';
    if ($page == "adminUsers") {
        include "manageUsers.php";
    } else {
        include "manageProducts.php";
    }
    ?>
</div>
<script src="pages/jsFiles/cookies.js"></script>
<script src="adminJS/admin.js"></script>