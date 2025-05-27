var node = function (src) {
    this.src = src;
    this.next = null;
    this.prev = null;
    this.data = document.createElement('img');
    this.data.src = this.src;
    this.mainImg = document.getElementById('mainImgId');
    this.data.addEventListener('click', () => {


        var tempsrc = this.src;
        this.src = this.mainImg.src;
        this.data.src = this.mainImg.src;
        this.mainImg.src = tempsrc;
    });

};

var LinkedList = function () {
    this.head = null;
    this.numNodes = 0;

    this.construct = function (data) {
        // gets the list of data 
        // deciphers it and adds the item into ll
        var allLinks = data;

        for (var i = 0; i < allLinks.length; i++) {
            var value = allLinks[i];
            if (Object.keys(value)[0] !== "thumbnailImage") {
                value = Object.values(value)[0];
                this.insertItem(value);
            }
        }

    }

    this.insertItem = function (src) {
        if (this.head === null) {
            this.head = new node(src);
            this.head.next = null;
            this.head.prev = null;
            this.numNodes++;
        }
        else {
            var nodePtr = this.head;
            while (nodePtr.next != null) { // head means at the end
                nodePtr = nodePtr.next;
            }
            // the next = head            
            nodePtr.next = new node(src);
            nodePtr.next.prev = nodePtr;
            nodePtr = nodePtr.next;
            nodePtr.next = null;
            this.numNodes++;
        }
    };

    this.printList = function () {
        var nodePtr = this.head;
        var output = "head ";
        var count = 0;

        while ((nodePtr != null) || count === 0) {
            nodePtr = nodePtr.next;
            count++;
        }

    };
    this.insertIntoView = function () {

        var imageDiv = document.getElementById("carouselContainerID");
        var nodePtr = this.head;
        for (var i = 0; i < this.numNodes; i++) {
            imageDiv.appendChild(nodePtr.data);
            nodePtr = nodePtr.next;
        }
    };

    this.emptyView = function () {
        var imageDiv = document.getElementById("carouselContainerID");
        while (imageDiv.firstChild)
            imageDiv.removeChild(imageDiv.firstChild);
    };

    this.index = function (index) {
        var count = 0;
        var nodePtr = this.head;
        while (count != index) {
            nodePtr = nodePtr.next;
            count++;
        }
        return nodePtr;
    };

};

document.addEventListener("DOMContentLoaded", function () {

    //Retriving product form localStorage
    var product = JSON.parse(localStorage.getItem("selectedProduct"));
    if (!product) {
        alert("No product data found.");
        return;
    }

    //Populating ID, Brand, Category
    var dscidElement = document.getElementById("DSCID");
    if (dscidElement) {
        dscidElement.textContent =
            "ID: " + product.id +
            " | Brand: " + product.brand +
            " | Category: " + product.category;
    }

    //Populating the description
    var descElement = document.getElementById("description");
    if (descElement) {
        descElement.textContent = product.description || "No description available.";
    }
    console.log(product)
    var imgLL = new LinkedList();
    imgLL.construct(product.productCarousel);
    imgLL.printList();
    imgLL.insertIntoView();
    //Filtering out any thumbnail images
    /*
    var carouselImages = product.productCarousel.filter(function (imgObj) 
    {
        return imgObj.image || imgObj.angleImage || imgObj.leftViewImage;
    });
    var currentIndex = 0;
    var carouselImageElement = document.getElementById("carouselImage");
    var prevBtn = document.getElementById("prevBtn");
    var nextBtn = document.getElementById("nextBtn");
    
    
    function updateCarousel() 
    {
        var imgObj = carouselImages[currentIndex];
        var imgSrc = imgObj.image || imgObj.thumbnailImage || imgObj.angleImage || imgObj.leftViewImage;
        carouselImageElement.src = imgSrc;
    }
    
    //Event listener to visit previous carousel images
    prevBtn.addEventListener("click", function () 
    {
        currentIndex = (currentIndex - 1 + carouselImages.length) % carouselImages.length;
        updateCarousel();
    });
    
    //Event listener to visit next carousel images
    nextBtn.addEventListener("click", function () 
    {
        currentIndex = (currentIndex + 1) % carouselImages.length;
        updateCarousel();
    });
    
    
    updateCarousel();
    */
    //Populating title
    var titleElement = document.getElementById("titleID");
    if (titleElement) {
        titleElement.textContent = product.name;
    }

    //Ppopulating Main Image
    var mainImgElement = document.querySelector(".mainImg img");
    if (mainImgElement) {
        mainImgElement.src = product.mainImg;
        mainImgElement.alt = product.name;
    }

    //Populating Rating
    var ratingCell = document.getElementById("ratingCell");
    if (ratingCell) {
        var stars = "";
        var rating = Math.floor(parseFloat(product.reviewAvg));
        for (var i = 0; i < 5; i++) {
            stars += i < rating ? "⭐" : "✩";
        }
        ratingCell.textContent = "Rating: " + stars;
    }

    //Populating Best Price
    var bestPriceCell = document.getElementById("bestPriceCell");
    if (bestPriceCell) {
        bestPriceCell.textContent = "Best Price: $" + product.salePrice;
    }

    var request = new XMLHttpRequest();

    var requestHeaderData = getLocalCredentials();

    request.open("POST", requestHeaderData.host, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));    // fix to use wheately login stuff instead of the php my admin code if necessary

    var apiKey = getLoginCookie().api_key;
    var productId = product.id;

    var body = JSON.stringify({
        type: "getproduct",
        api_key: apiKey,
        product_id: productId
    });

    //Retrieving all version of this product that the different companies offer
    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var response = JSON.parse(this.responseText);
            if (response.status === "success") {
                var comparisons = response.data.price_comparisons;
                var pricesTable = document.querySelector(".pricesTable");
                pricesTable.innerHTML = "";
                var headerRow = document.createElement("tr");
                var th1 = document.createElement("th");
                th1.textContent = "Company";
                var th2 = document.createElement("th");
                th2.textContent = "Discounted Price";
                headerRow.appendChild(th1);
                headerRow.appendChild(th2);
                pricesTable.appendChild(headerRow);

                //Populating Company tables and pricing for product
                for (var company in comparisons) {
                    if (comparisons.hasOwnProperty(company)) {
                        var row = document.createElement("tr");

                        var companyCell = document.createElement("td");
                        companyCell.textContent = company;

                        var priceCell = document.createElement("td");
                        priceCell.textContent = "$" + comparisons[company].discountedPrice;

                        row.appendChild(companyCell);
                        row.appendChild(priceCell);
                        pricesTable.appendChild(row);
                    }
                }
            }
            else {
                console.error("API error:", response.message);
            }
        }
    };

    request.send(body);


    var username = getLoginCookie().username;
    var reviewsContainer = document.getElementById("reviewsContainer");
    var leaveReviewBtn = document.getElementById("leaveReviewBtn");
    var reviewPopup = document.getElementById("reviewPopup");
    var reviewFormTitle = document.getElementById("reviewFormTitle");
    var reviewTitleInput = document.getElementById("reviewTitle");
    var reviewDescriptionInput = document.getElementById("reviewDescription");
    var reviewRatingInput = document.getElementById("reviewRating");
    var submitReviewBtn = document.getElementById("submitReviewBtn");
    var cancelReviewBtn = document.getElementById("cancelReviewBtn");
    var userReview = null;

    function loadReviews() {
        var req = new XMLHttpRequest();
        req.open("POST", requestHeaderData.host, true);
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));

        req.onreadystatechange = function () {
            if (req.readyState === 4 && req.status === 200) {
                var res = JSON.parse(req.responseText);
                reviewsContainer.innerHTML = "";
                if (res.status === "success") {
                    var reviews = res.data;
                    userReview = null;
                    for (var i = 0; i < reviews.length; i++) {
                        if (reviews[i].username === username) {
                            userReview = reviews[i];
                        }
                        var box = document.createElement("div");
                        box.className = "reviewBox";
                        box.innerHTML = "<strong>" + reviews[i].username + "</strong> (" + reviews[i].rating + "\u2B50): <em>" + reviews[i].title + 
                        "</em><br>" + reviews[i].description +
                        "<br><small>" + reviews[i].timestamp + "</small><hr>";
                        reviewsContainer.appendChild(box);
                    }
                    leaveReviewBtn.textContent = userReview ? "Edit Your Review" : "Leave a Review";
                } 
                else 
                {
                    reviewsContainer.textContent = "No reviews available.";
            }
        }
    };

    req.send(JSON.stringify({
        type: "getreviews",
        api_key: apiKey,
        product_id: productId
    }));
}

    leaveReviewBtn.addEventListener("click", function () {
        if (userReview) {
            //Editing a review
            reviewFormTitle.textContent = "Edit Your Review";
            reviewTitleInput.value = userReview.title;
            reviewDescriptionInput.value = userReview.description;
            reviewRatingInput.value = userReview.rating;
        } 
        else {
            //Leaving a review
            reviewFormTitle.textContent = "Leave a Review";
            reviewTitleInput.value = "";
            reviewDescriptionInput.value = "";
            reviewRatingInput.value = "5";
        }

        reviewPopup.style.display = "block";
    });
    cancelReviewBtn.addEventListener("click", function () {
        reviewPopup.style.display = "none";
    });

    submitReviewBtn.addEventListener("click", function () {
        var title = reviewTitleInput.value.trim();
        var description = reviewDescriptionInput.value.trim();
        var rating = parseInt(reviewRatingInput.value);

        if (!title || !description || isNaN(rating)) {
            alert("All fields are required.");
            return;
        }

        var payload = {
            type: userReview ? "editreview" : "addreview",
            api_key: apiKey,
            rating: rating,
            review_title: title,
            review_description: description
        };

        if (userReview) {
            payload.review_id = userReview.review_id;
        } 
        else {
            payload.product_id = productId;
        }

        var sendReq = new XMLHttpRequest();
        sendReq.open("POST", requestHeaderData.host, true);
        sendReq.setRequestHeader("Content-Type", "application/json");
        sendReq.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));

        sendReq.onreadystatechange = function () {
            if (sendReq.readyState === 4 && sendReq.status === 200) {
                var res = JSON.parse(sendReq.responseText);
                if (res.status === "success") {
                    alert("Your review has been submitted!");
                    reviewPopup.style.display = "none";
                    loadReviews();
                } 
                else {
                    alert("Failed to submit: " + res.message);
                }
            }
        };

    sendReq.send(JSON.stringify(payload));
});

    document.getElementById("deleteReviewBtn").addEventListener("click", function () {
    if (!userReview) return;

    if (!confirm("Are you sure you want to delete your review?")) return;

    var deleteReq = new XMLHttpRequest();
    deleteReq.open("POST", requestHeaderData.host, true);
    deleteReq.setRequestHeader("Content-Type", "application/json");
    deleteReq.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));
    deleteReq.onreadystatechange = function () {
        if (deleteReq.readyState === 4 && deleteReq.status === 200) {
            var res = JSON.parse(deleteReq.responseText);
            if (res.status === "success") {
                alert("Your review has been deleted.");
                reviewPopup.style.display = "none";
                loadReviews();
            } 
            else {
                alert("Failed to delete review: " + res.message);
            }
        }
    };

    deleteReq.send(JSON.stringify({
        type: "removereview",
        api_key: apiKey,
        review_id: userReview.review_id
    }));
});
    loadReviews();
    
});
