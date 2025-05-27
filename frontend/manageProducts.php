<div class="scrollDivUsers">
    <table id="manageProdID" class="manageProducts">
        <tr>
            <th>
                ID
            </th>
            <th>
                Name
            </th>
            <th>
                Description
            </th>
            <th>
                Brand
            </th>
            <th>
                Category
            </th>
            <th>
                Regular Price
            </th>
            <th>
                Best Price
            </th>
            <th>
                Actions
            </th>
        </tr>
    </table>
</div>
<div style="height: 30%;text-align:centre;">

    <table class="addProduct">
        <tr>
            <td colspan="9">
                add new product
            </td>
        </tr>
        <tr>
            <td>
                <p>name</p>
                <input id="nameID" type="text">
            </td>
            <td>
                <p>description</p>
                <input id="dscID" type="text">
            </td>
            <td>
                <p>Image Url</p>
                <input id="imgID" type="text">
            </td>
            <td>
                <p>Regular price</p>
                <input id="regPriceID" min="1" type="number">
            </td>
            <td>
                <p>Discount price</p>
                <input id="discPriceID" min="1" type="number">
            </td>
            <td>
                <p>Brand</p>
                <select id="brandNP">
                    <option value="">Select brand </option>
                </select>
            </td>
            <td>
                <p>category</p>
                <select id="catNP">
                    <option value="">Select category</option>
                </select>
            </td>
            <td>
                <p>company</p>
                <select id="compNP">
                    <option value="">select company</option>
                </select>
            </td>


            <td>
                <p>submit</p>
                <input style="width:100%" type="button" value="confirm" onclick="addNewProduct()">
            </td>
        </tr>
    </table>
</div>
<?php
// added rows in js 
?>