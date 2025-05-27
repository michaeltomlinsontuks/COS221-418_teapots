<div class="viewContainer">

    <div class="carouselContainer" id="carouselContainerID">

    </div>

    <div class="infoContainer">
        <div class="mainImg">
            <img id="mainImgId" src="images/teapotsLogoPot.png" alt=" img">

        </div>
        <!-- pages/pageAssets/temp.gif -->
        <div class="rightInfo">

            <table class="rightInfoTable">
                
                <tr id="titleRow">
                    <td>
                        <p id="titleID">No title</p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p id="DSCID">No info available</p>
                        <p style="overflow:auto;max-height: 300px; max-width: 90%;" id="description">No description available</p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div style="max-height: 200px; overflow-y: auto;">
                        <table class="pricesTable">
                        </table>
                        </div>
                    </td>
                </tr>
            </table>

            <!-- Review Section  -->
            <div class="reviewSection">
                <h2>Customer Reviews</h2>
                <div id="reviewsScrollWrapper">
                    <div id="reviewsContainer"></div>
                </div>
                <button id="leaveReviewBtn"></button>
            </div>
        </div>
        <div class="bottomInfo">
            <table>
                <tr>
                    <td id="bestPriceCell"></td>
                </tr>
                <tr>
                    <td id="ratingCell"></td>
                </tr>
            </table>
        </div>
    </div>
</div>

<!-- Review Popup -->
<div id="reviewPopup" class="popup" style="display: none;">
    <h3 id="reviewFormTitle">Leave a Review</h3>
    <label for="reviewTitle">Title:</label><br>
    <input type="text" id="reviewTitle"><br><br>

    <label for="reviewDescription">Description:</label><br>
    <textarea id="reviewDescription" rows="4" cols="50"></textarea><br><br>

    <label for="reviewRating">Rating:</label>
    <select id="reviewRating">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
    </select><br><br>
    <div class="popupButtons">
    <div class="leftButtons">
        <button id="submitReviewBtn">Submit</button>
        <button id="cancelReviewBtn">Cancel</button>
    </div>
        <button id="deleteReviewBtn" style="display: none;">Delete Review</button>
    </div>
</div>

<script src="pages/jsFiles/viewPage.js"></script>