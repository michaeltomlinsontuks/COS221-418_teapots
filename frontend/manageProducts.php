<div class="scrollDivUsers">
    <table id="manageProdID" class="manageProducts">
        <tr>
            <th>
                title
            </th>
            <th>
                dsc
            </th>
            <th>
                regular price
            </th>
            <th>
                discount price
            </th>
            <th>
                brand
            </th>
            <th>
                category
            </th>
            <th>
                update
            </th>
            <th>
                delete
            </th>
        </tr>
    </table>
</div>
<div style="height: 30%;text-align:centre;">

    <table class="addProduct">
        <tr>
            <td colspan="8">
                add new product
            </td>
        </tr>
        <tr>
            <td>
                <p>name</p>
                <input type="text">
            </td>
            <td>
                <p>dsc</p>
                <input type="text">
            </td>
            <td>
                <p>Regular price</p>
                <input min="1" type="number">
            </td>
            <td>
                <p>Discount price</p>
                <input min="1" type="number">
            </td>
            <td>
                <p>Brand</p>
                <select>
                    <option value="">Select brand </option>
                </select>
            </td>
            <td>
                <p>category</p>
                <select>
                    <option value="">Select category</option>
                </select>
            </td>
            <td>
                <p>company</p>
                <select>
                    <option value="">select company</option>
                </select>
            </td>


            <td>
                <p>submit</p>
                <input style="width:100%" type="button" value="confirm">
            </td>
        </tr>
    </table>
</div>
<?php
// added rows in js 
?>