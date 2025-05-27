document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    if (!productId) {
        alert("No product ID provided.");
        return;
    }

    var product = JSON.parse(localStorage.getItem("selectedProduct"));
    if (!product) {
        var request = new XMLHttpRequest();
        var requestHeaderData = getLocalCredentials();
        request.open("POST", requestHeaderData.host, true);
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));

        var apiKey = getLoginCookie().api_key;
        var body = JSON.stringify({
            type: "getproduct",
            api_key: apiKey,
            product_id: productId
        });

        request.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var response = JSON.parse(this.responseText);
                if (response.status === "success") {
                    product = response.data;
                    localStorage.setItem("selectedProduct", JSON.stringify(product));
                    populatePage(product);
                } else {
                    alert("Failed to load product data: " + response.message);
                }
            }
        };
        request.send(body);
    } else {
        populatePage(product);
    }

    function populatePage(product) {
        var titleElement = document.querySelector(".contentContainer h2");
        if (titleElement) {
            titleElement.textContent = product.name || "Product Name";
        }

        var descElement = document.querySelector(".contentContainer p:nth-child(2)");
        if (descElement) {
            descElement.textContent = product.description || "No description available.";
        }

        var brandCategoryElement = document.querySelector(".contentContainer p:nth-child(3)");
        if (brandCategoryElement) {
            brandCategoryElement.textContent =
                "ID: " + product.id +
                " | Brand: " + product.brand +
                " | Category: " + product.category;
        }

        var mainImageElement = document.getElementById("mainImage");
        if (mainImageElement) {
            mainImageElement.src = product.mainImg || "https://via.placeholder.com/300";
            mainImageElement.alt = product.name || "Product Image";
        }

        var carouselImages = product.productCarousel.filter(function (imgObj) {
            return imgObj.image || imgObj.angleImage || imgObj.leftViewImage;
        });
        var currentIndex = 0;
        var prevBtn = document.querySelector(".carousel-control.prev");
        var nextBtn = document.querySelector(".carousel-control.next");

        function updateCarousel() {
            var imgObj = carouselImages[currentIndex];
            var imgSrc = imgObj.image || imgObj.angleImage || imgObj.leftViewImage;
            mainImageElement.src = imgSrc;
        }

        if (carouselImages.length > 0) {
            updateCarousel();
        }

        prevBtn.addEventListener("click", function () {
            currentIndex = (currentIndex - 1 + carouselImages.length) % carouselImages.length;
            updateCarousel();
        });

        nextBtn.addEventListener("click", function () {
            currentIndex = (currentIndex + 1) % carouselImages.length;
            updateCarousel();
        });

        var priceTableBody = document.querySelector(".price-table tbody");
        if (priceTableBody) {
            priceTableBody.innerHTML = "";
            var request = new XMLHttpRequest();
            request.open("POST", requestHeaderData.host, true);
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));

            request.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    var response = JSON.parse(this.responseText);
                    if (response.status === "success") {
                        var comparisons = response.data.price_comparisons;
                        for (var company in comparisons) {
                            if (comparisons.hasOwnProperty(company)) {
                                var row = document.createElement("tr");
                                var companyCell = document.createElement("td");
                                companyCell.textContent = company;
                                companyCell.style.border = "1px solid black";
                                companyCell.style.padding = "5px";

                                var priceCell = document.createElement("td");
                                priceCell.textContent = "$" + comparisons[company].discountedPrice;
                                priceCell.style.border = "1px solid black";
                                priceCell.style.padding = "5px";

                                row.appendChild(companyCell);
                                row.appendChild(priceCell);
                                priceTableBody.appendChild(row);
                            }
                        }
                    } else {
                        console.error("API error:", response.message);
                    }
                }
            };

            request.send(JSON.stringify({
                type: "getproduct",
                api_key: apiKey,
                product_id: productId
            }));
        }

        var bestPriceElement = document.querySelector(".bottom-section div:nth-child(1) p");
        if (bestPriceElement) {
            bestPriceElement.textContent = "Best Price: $" + (product.salePrice || "N/A");
        }

        var ratingElement = document.getElementById("ratingDisplay");
        if (ratingElement) {
            var stars = "";
            var rating = Math.floor(parseFloat(product.reviewAvg || 0));
            for (var i = 0; i < 5; i++) {
                stars += i < rating ? "⭐" : "✩";
            }
            ratingElement.textContent = "Rating: " + stars;
        }

        var reviewsElement = document.querySelector(".bottom-section div:nth-child(3) p");
        if (reviewsElement) {
            var req = new XMLHttpRequest();
            req.open("POST", requestHeaderData.host, true);
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));

            req.onreadystatechange = function () {
                if (req.readyState === 4 && req.status === 200) {
                    var res = JSON.parse(req.responseText);
                    if (res.status === "success" && res.data.length > 0) {
                        var reviews = res.data;
                        reviewsElement.textContent = "";
                        for (var i = 0; i < reviews.length; i++) {
                            reviewsElement.textContent += reviews[i].username + " (" + reviews[i].rating + "⭐): " + reviews[i].title + " - " + reviews[i].description + "\n";
                        }
                    } else {
                        reviewsElement.textContent = "No reviews available.";
                    }
                }
            };

            req.send(JSON.stringify({
                type: "getreviews",
                api_key: apiKey,
                product_id: productId
            }));
        }

        var rateButton = document.getElementById("rateButton");
        rateButton.addEventListener("click", function () {
            var rating = prompt("Rate this product (1-5):");
            if (rating && !isNaN(rating) && rating >= 1 && rating <= 5) {
                var sendReq = new XMLHttpRequest();
                sendReq.open("POST", requestHeaderData.host, true);
                sendReq.setRequestHeader("Content-Type", "application/json");
                sendReq.setRequestHeader("Authorization", "Basic " + btoa(requestHeaderData.username + ":" + requestHeaderData.password));

                sendReq.onreadystatechange = function () {
                    if (sendReq.readyState === 4 && sendReq.status === 200) {
                        var res = JSON.parse(sendReq.responseText);
                        if (res.status === "success") {
                            alert("Rating submitted successfully!");
                            window.location.reload();
                        } else {
                            alert("Failed to submit rating: " + res.message);
                        }
                    }
                };

                sendReq.send(JSON.stringify({
                    type: "addreview",
                    api_key: apiKey,
                    product_id: productId,
                    rating: parseInt(rating),
                    review_title: "Quick Rating",
                    review_description: "Rated via button"
                }));
            } else {
                alert("Please enter a valid rating between 1 and 5.");
            }
        });
    }
});