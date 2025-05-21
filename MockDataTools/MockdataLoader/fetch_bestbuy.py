import requests
import json
import time
import os

# Replace with your actual API key if different
api_key = "5FaxuIgE2GAMQmdVYivr4hGb"

# Define your categories and corresponding output file names
categories = [
    ("abcat0100000", "tv_home_theater.json"),
    ("abcat0200000", "audio_headphones.json"),
    ("abcat0300000", "car_electronics.json"),
    ("abcat0400000", "cameras.json"),
    ("abcat0500000", "computers.json"),
    ("abcat0800000", "cell_phones.json"),
    ("abcat0900000", "appliances.json")
]

# Attributes based on Best Buy Detail, FinalProduct format, and relevant Images
attributes = (
    "sku,upc,name,longDescription,customerReviewCount,customerReviewAverage,"
    "manufacturer,addToCartUrl,salePrice,onlineAvailability,"
    "categoryPath.name,image,thumbnailImage,angleImage,backViewImage,topViewImage,"
    "leftViewImage,rightViewImage,type"
)

for category_id, filename in categories:
    # Construct the URL with the dynamic category ID
    url = (
        f"https://api.bestbuy.com/v1/products((categoryPath.id={category_id}))?"
        f"apiKey={api_key}&sort=sku.asc&show={attributes}&pageSize=100&format=json"
    )
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        products = data.get('products', [])
        transformed_products = []

        for product in products:
            # Handle categoryPath as a list of dictionaries
            category_path = product.get("categoryPath", [])
            category = category_path[-1] if category_path else {}
            category_name = category.get("name", "")

            # Collect all relevant images into a list, removing duplicates and nulls
            image_fields = [
                ("image", product.get("image")),
                ("thumbnailImage", product.get("thumbnailImage")),
                ("angleImage", product.get("angleImage")),
                ("backViewImage", product.get("backViewImage")),
                ("topViewImage", product.get("topViewImage")),
                ("leftViewImage", product.get("leftViewImage")),
                ("rightViewImage", product.get("rightViewImage")),

            ]

            # Filter out empty or None values and remove duplicates
            unique_images = []
            seen_urls = set()
            for image_type, image_url in image_fields:
                if image_url and image_url not in seen_urls:
                    unique_images.append({image_type: image_url})
                    seen_urls.add(image_url)

            # If no images are available, add a placeholder
            if not unique_images:
                unique_images.append({"thumbnailImage": product.get("thumbnailImage", "https://placeholder.com/default")})

            transformed_product = {
                "ProductID": product.get("sku", product.get("upc", None)),
                "addToCartURL": product.get("addToCartUrl", ""),
                "customerReviewAverage": product.get("customerReviewAverage", 0.0),
                "customerReviewCount": product.get("customerReviewCount", 0),
                "longDescription": product.get("longDescription", ""),
                "manufacturer": product.get("manufacturer", ""),
                "name": product.get("name", ""),
                "salePrice": product.get("salePrice", 0.0),
                "onlineAvailability": product.get("onlineAvailability", False),
                "thumbnailImage": product.get("thumbnailImage", product.get("image", "")),
                "CarouselImageArray": unique_images,
                "category": category_name,
                "type": product.get("type", "HardGood")  # Fixed default
            }
            transformed_products.append(transformed_product)

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump({
                "products": transformed_products,
                "total": len(transformed_products),
                "page": 1,
                "pageSize": 100
            }, f, indent=2)
        print(f"Saved {len(transformed_products)} products to {filename}")
    else:
        print(f"Error fetching data for {category_id}: {response.status_code} - {response.text}")
    time.sleep(0.2)