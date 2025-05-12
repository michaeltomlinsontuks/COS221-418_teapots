//### var initialization ###

var table;

//### var initialization ###
document.addEventListener("DOMContentLoaded", initialiseVar);

function initialiseVar() {
    table = document.getElementById("PTID");
    insertTd();
}

// inserts the td into the table pre / post  request
function insertTd() {
    for (var i = 0; i < 20; i++) {
        tr = document.createElement("tr");
        for (var cols = 0; cols < 3; cols++) {
            td = document.createElement("td");
            // each td made up of 2 divs a div for the image (half the td in width()
            // and the other half split in 3 
            var containerDiv = document.createElement("div");
            containerDiv.className = "productContainer";

            var imgDiv = document.createElement("div");
            var textDiv = document.createElement("div");

            // text div is further broken into 3 divs
            //title , price , rating
            var titleDiv = document.createElement("div");
            titleDiv.appendChild(document.createTextNode("title"));

            var priceDiv = document.createElement("div");
            priceDiv.appendChild(document.createTextNode("price"));

            var ratingDiv = document.createElement("div");
            ratingDiv.appendChild(document.createTextNode("⭐⭐⭐**"));

            textDiv.appendChild(titleDiv);
            textDiv.appendChild(priceDiv);
            textDiv.appendChild(ratingDiv);
            textDiv.className = "productsText";



            var imgInput = document.createElement("input");
            imgInput.type = "image";
            imgInput.src = "insertIn";
            imgInput.alt = "Image goes here";
            imgInput.className = "productImage";
            imgDiv.className = "productImageDiv";

            imgDiv.appendChild(imgInput);
            containerDiv.appendChild(imgDiv);
            containerDiv.appendChild(textDiv);
            td.appendChild(containerDiv);
            tr.appendChild(td);


        }
        table.appendChild(tr);
    }
}