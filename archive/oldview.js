document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get("id");

    if (!idFromUrl) {
        alert("No product ID provided.");
        return;
    }

    let productData = JSON.parse(localStorage.getItem("selectedProduct"));

    if (!productData) {
        const xhr = new XMLHttpRequest();
        const headers = getLocalCredentials();

        xhr.open("POST", headers.host, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "Basic " + btoa(headers.username + ":" + headers.password));

        const apiKey = getLoginCookie().api_key;

        const payload = JSON.stringify({
            type: "getproduct",
            api_key: apiKey,
            product_id: idFromUrl
        });

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const res = JSON.parse(xhr.responseText);
                if (res.status === "success") {
                    productData = res.data;
                    localStorage.setItem("selectedProduct", JSON.stringify(productData));
                    fillPage(productData);
                } else {
                    alert("Failed to load product data: " + res.message);
                }
            }
        };

        xhr.send(payload);
    } else {
        fillPage(productData);
    }

    function fillPage(product) {
        const title = document.querySelector(".contentContainer h2");
        if (title) title.textContent = product.name || "Product Name";

        const desc = document.querySelector(".contentContainer p:nth-child(2)");
        if (desc) desc.textContent = product.description || "No description available.";

        const meta = document.querySelector(".contentContainer p:nth-child(3)");
        if (meta) {
            meta.textContent = "ID: " + product.id + " | Brand: " + product.brand + " | Category: " + product.category;
        }

        const mainImg = document.getElementById("mainImage");
        if (mainImg) {
            mainImg.src = product.mainImg || "https://via.placeholder.com/300";
            mainImg.alt = product.name || "Product Image";
        }

        const carouselList = product.productCarousel.filter(function (img) {
            return img.image || img.angleImage || img.leftViewImage;
        });

        let index = 0;
        const prev = document.querySelector(".carousel-control.prev");
        const next = document.querySelector(".carousel-control.next");

        function updateImage() {
            const imgData = carouselList[index];
            const src = imgData.image || imgData.angleImage || imgData.leftViewImage;
            mainImg.src = src;
        }

        if (carouselList.length > 0) {
            updateImage();
        }

        prev.addEventListener("click", function () {
            index = (index - 1 + carouselList.length) % carouselList.length;
            updateImage();
        });

        next.addEventListener("click", function () {
            index = (index + 1) % carouselList.length;
            updateImage();
        });

        const priceBody = document.querySelector(".price-table tbody");
        if (priceBody) {
            priceBody.innerHTML = "";

            const priceReq = new XMLHttpRequest();
            priceReq.open("POST", headers.host, true);
            priceReq.setRequestHeader("Content-Type", "application/json");
            priceReq.setRequestHeader("Authorization", "Basic " + btoa(headers.username + ":" + headers.password));

            priceReq.onreadystatechange = function () {
                if (priceReq.readyState === 4 && priceReq.status === 200) {
                    const result = JSON.parse(priceReq.responseText);
                    if (result.status === "success") {
                        const priceList = result.data.price_comparisons;
                        for (let company in priceList) {
                            if (priceList.hasOwnProperty(company)) {
                                let row = document.createElement("tr");

                                let td1 = document.createElement("td");
                                td1.textContent = company;
                                td1.style.border = "1px solid black";
                                td1.style.padding = "5px";

                                let td2 = document.createElement("td");
                                td2.textContent = "$" + priceList[company].discountedPrice;
                                td2.style.border = "1px solid black";
                                td2.style.padding = "5px";

                                row.appendChild(td1);
                                row.appendChild(td2);
                                priceBody.appendChild(row);
                            }
                        }
                    } else {
                        console.error("API error:", result.message);
                    }
                }
            };

            priceReq.send(JSON.stringify({
                type: "getproduct",
                api_key: apiKey,
                product_id: idFromUrl
            }));
        }

        const bestPrice = document.querySelector(".bottom-section div:nth-child(1) p");
        if (bestPrice) bestPrice.textContent = "Best Price: $" + (product.salePrice || "N/A");

        const ratingDisplay = document.getElementById("ratingDisplay");
        if (ratingDisplay) {
            let stars = "";
            let ratingVal = Math.floor(parseFloat(product.reviewAvg || 0));
            for (let r = 0; r < 5; r++) {
                stars += r < ratingVal ? "⭐" : "✩";
            }
            ratingDisplay.textContent = "Rating: " + stars;
        }

        const reviews = document.querySelector(".bottom-section div:nth-child(3) p");
        if (reviews) {
            const reviewXhr = new XMLHttpRequest();
            reviewXhr.open("POST", headers.host, true);
            reviewXhr.setRequestHeader("Content-Type", "application/json");
            reviewXhr.setRequestHeader("Authorization", "Basic " + btoa(headers.username + ":" + headers.password));

            reviewXhr.onreadystatechange = function () {
                if (reviewXhr.readyState === 4 && reviewXhr.status === 200) {
                    const reviewData = JSON.parse(reviewXhr.responseText);
                    if (reviewData.status === "success" && reviewData.data.length > 0) {
                        let allReviews = reviewData.data;
                        reviews.textContent = "";
                        for (let r = 0; r < allReviews.length; r++) {
                            reviews.textContent += allReviews[r].username + " (" + allReviews[r].rating + "⭐): " + allReviews[r].title + " - " + allReviews[r].description + "\n";
                        }
                    } else {
                        reviews.textContent = "No reviews available.";
                    }
                }
            };

            reviewXhr.send(JSON.stringify({
                type: "getreviews",
                api_key: apiKey,
                product_id: idFromUrl
            }));
        }

        const rateBtn = document.getElementById("rateButton");

        rateBtn.addEventListener("click", function () {
            const userInput = prompt("Rate this product (1-5):");
            if (userInput && !isNaN(userInput) && userInput >= 1 && userInput <= 5) {
                const ratingPost = new XMLHttpRequest();
                ratingPost.open("POST", headers.host, true);
                ratingPost.setRequestHeader("Content-Type", "application/json");
                ratingPost.setRequestHeader("Authorization", "Basic " + btoa(headers.username + ":" + headers.password));

                ratingPost.onreadystatechange = function () {
                    if (ratingPost.readyState === 4 && ratingPost.status === 200) {
                        const feedback = JSON.parse(ratingPost.responseText);
                        if (feedback.status === "success") {
                            alert("Rating submitted successfully!");
                            window.location.reload();
                        } else {
                            alert("Failed to submit rating: " + feedback.message);
                        }
                    }
                };

                ratingPost.send(JSON.stringify({
                    type: "addreview",
                    api_key: apiKey,
                    product_id: idFromUrl,
                    rating: parseInt(userInput),
                    review_title: "Quick Rating",
                    review_description: "Rated via button"
                }));
            } else {
                alert("Please enter a valid rating between 1 and 5.");
            }
        });
    }
});
