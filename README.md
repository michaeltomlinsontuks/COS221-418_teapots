# CompareIt

CompareIt is a price comparison web application that enables users to browse products, compare prices from different retailers, leave reviews, and manage product data (for admins).

## Setup Instructions
1. **Install Prerequisites**
    - Apache web server
    - MariaDB
    - PHP (with PDO extension)
2. **Database Setup**
    - Create a database named `compareit`
    - Import `database/schema.sql` and `database/data.sql`
    - Configure connection in `includes/db.php`:
      ```php
      $dsn = 'mysql:host=localhost;dbname=compareit';
      $username = 'root';
      $password = '';
      $pdo = new PDO($dsn, $username, $password);
      ```
3. **Deploy Application**
    - Place the project folder in your web server’s root directory (e.g., `/var/www/html/CompareIt`)
    - Access via `http://localhost/CompareIt/`
4. **Run**
    - Ensure the server is running and navigate to the URL

## API Documentation
All requests are made to `/api/api.php` with JSON responses.

### Authentication
- **Login**
    - `POST /api?action=login&username=<username>&password=<password>`
    - Response: `{"status": "success", "apiKey": "<key>"}`
- **Register**
    - `POST /api?action=register&username=<username>&password=<password>`
    - Response: `{"status": "success", "message": "User registered"}`

### Products
- **Get Products**
    - `GET /api?action=getProducts&category=<cat>&brand=<brand>&sortBy=<field>&order=<asc/desc>&limit=<n>&offset=<n>`
    - Response: `{"status": "success", "data": [{ "ProductID": 1, "Name": "Product", ... }, ...]}`
- **Get Product**
    - `GET /api?action=getProduct&id=<id>`
    - Response: `{"status": "success", "data": { "ProductID": 1, "Name": "Product", ... }}`
- **Get Product Prices**
    - `GET /api?action=getProductPrices&productId=<id>`
    - Response: `{"status": "success", "data": [{ "Retailer": "Store", "Price": 99.99 }, ...]}`

### Reviews
- **Add Review** (Requires `APIKey` in header)
    - `POST /api?action=addReview&productId=<id>&rating=<1-5>&comment=<text>`
    - Response: `{"status": "success", "message": "Review added"}`
- **Get Reviews**
    - `GET /api?action=getReviews&productId=<id>`
    - Response: `{"status": "success", "data": [{ "Rating": 5, "Comment": "Great!", ... }, ...]}`

## Usage
- **Browse Products**: Visit `/pages/products.php` to filter and sort products
- **View Product**: Click a product to see details at `/pages/product.php?id=<id>`
- **Leave Reviews**: Log in and submit reviews on the product page
- **Admin Tasks**: Log in as an admin user to manage data at `/pages/admin.php`