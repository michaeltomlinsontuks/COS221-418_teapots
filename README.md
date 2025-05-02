# CompareIt

CompareIt is a next-generation price comparison web application that aggregates product listings from various online retailers. Our platform provides a clean, user-friendly experience for users to browse products, compare prices across different retailers, leave reviews, and find the best deals.

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [API Documentation](#api-documentation)
  - [Request Format](#request-format)
  - [Response Format](#response-format)
  - [Authentication](#authentication)
  - [API Endpoints](#api-endpoints)
    - [User Management](#user-management)
    - [Product Management](#product-management)
    - [Review Management](#review-management)
    - [Filter Management](#filter-management)
- [External API Integration](#external-api-integration)
- [Mock Data Generation](#mock-data-generation)
- [Database Structure](#database-structure)
- [Development Standards](#development-standards)

## Features

- **User Authentication and Authorization**: Secure login, registration, and API key generation
- **Product Browsing**: Browse and search for products across multiple categories
- **Advanced Filtering**: Filter products based on brand, category, user rating, and more
- **Price Comparison**: View dynamic lists of retailers offering products with comparative pricing
- **User Reviews and Ratings**: Submit, edit, and view product reviews and ratings
- **Responsive Design**: Clean interface optimized for both desktop and mobile devices
- **Product Image Carousel**: View multiple product images for better product assessment
- **Sorting Options**: Sort products by name, price, discount percentage, and more

## Project Structure

### Database
- Full database schema
- ERD diagram
- Structure Dump
- Data Dump

### API
- API documentation
  - Request Standards
  - Response Standards
- API endpoints
- API testing

### Website Backend
- Backend Class Structure
- Class functionality
  - Function - Input, Output, Description
- Frontend Scripting

### Frontend
- HTML Structure
- CSS Styles
  - global.css

## Installation

*[Installation instructions to be added]*

## API Documentation

Our API follows RESTful principles with consistent request and response formats. All interactions with the CompareIt API use a standardized structure to ensure ease of integration and maintenance.

### Request Format

All API requests must follow this standard JSON format:

```json
{
  "type": "lowercasesingleword",
  "apiKey": "USER_API_KEY_OR_GUEST_KEY",
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

| Field | Description |
|-------|-------------|
| `type` | Required. The API function name (lowercase, single word) |
| `apiKey` | Required. User's API key or guest key for authentication |
| `parameters` | Optional. Object containing additional function-specific parameters |

### Response Format

All API responses follow this standard JSON format:

```json
{
  "status": "success",
  "timestamp": "1683456789",
  "data": [
    {
      "id": "1",
      "property": "value"
      // Additional response data
    }
  ],
  "message": "Operation completed successfully"
}
```

| Field | Description |
|-------|-------------|
| `status` | Response status: "success" or "error" |
| `timestamp` | Unix timestamp of when the response was generated |
| `data` | Array containing the requested data (may be empty for some operations) |
| `message` | Descriptive message, particularly useful for debugging errors |

### Authentication

The API supports two authentication modes:

1. **User Authentication**: Requires a valid API key generated for the user
2. **Guest Mode**: Uses a special guest API key format: `GUEST_[random_string]`

API keys are randomly generated using the user's email as a salt for added security.

#### API Key Functions

| Function | Description |
|----------|-------------|
| `generateAPIKey` | Generates a new API key for a registered user |
| `validateAPIKey` | Validates an API key, supporting both user and guest modes |

### API Endpoints

#### User Management

##### `login`

Authenticates a user and returns session information.

**Parameters:**
- `username` (string): User's username
- `password` (string): User's password (will be hashed using SHA-512)

**Response:**
- `userID` (integer): Unique identifier for the authenticated user
- `apiKey` (string): API key for subsequent requests
- `username` (string): Username of the authenticated user

##### `register`

Creates a new user account.

**Parameters:**
- `username` (string): Desired username
- `password` (string): Password (will be hashed before storage)
- `email` (string): User's email address

**Response:**
- `userID` (integer): Unique identifier for the newly created user
- `apiKey` (string): API key for subsequent requests

##### `getUserID`

Retrieves the user ID associated with an API key.

**Parameters:**
- `apiKey` (string): API key to validate

**Response:**
- `userID` (integer): User's unique identifier

##### `validatePassword`

Validates a user's password.

**Parameters:**
- `username` (string): User's username
- `password` (string): Password to validate

**Response:**
- `valid` (boolean): Whether the password is valid

##### `verifyPassword`

Verifies a password against a stored hash.

**Parameters:**
- `password` (string): Password to verify
- `hash` (string): Stored password hash

**Response:**
- `valid` (boolean): Whether the password matches the hash

##### `hashPassword`

Generates a secure hash for a password using SHA-512.

**Parameters:**
- `password` (string): Password to hash

**Response:**
- `hash` (string): Secure hash of the password

#### Product Management

##### `getProductPage`

Retrieves a list of products with basic information for display on the product browsing page.

**Parameters:**
- `page` (integer, optional): Page number for pagination
- `limit` (integer, optional): Number of products per page
- `search` (string, optional): Search term for filtering products
- `sort` (string, optional): Field to sort by (name, price, discount)
- `order` (string, optional): Sort order ("asc" or "desc")
- `filters` (object, optional): Filter criteria (categories, brands, etc.)

**Response:**
- Array of product objects with basic information:
  - `productID` (integer): Unique product identifier
  - `productName` (string): Product name
  - `productDescription` (string): Short product description
  - `thumbnailImage` (string): URL to product thumbnail image
  - `customerReviewAverage` (number): Average user rating
  - `customerReviewCount` (integer): Number of reviews
  - `manufacturer` (string): Brand/manufacturer name
  - `bestPrice` (number): Best available price across retailers
  - `bestCompany` (string): Retailer offering the best price

##### `getProduct`

Retrieves detailed information about a specific product.

**Parameters:**
- `productID` (integer): Unique product identifier

**Response:**
- Detailed product object:
  - `productID` (integer): Unique product identifier
  - `productName` (string): Product name
  - `longDescription` (string): Detailed product description
  - `thumbnailImage` (string): URL to primary product image
  - `imageGallery` (array): URLs to additional product images (from carousel)
  - `customerReviewAverage` (number): Average user rating
  - `customerReviewCount` (integer): Number of reviews
  - `manufacturer` (string): Brand/manufacturer name
  - `modelNumber` (string): Manufacturer's model number
  - `category` (string): Product category
  - `onlineAvailability` (boolean): Whether the product is available online

##### `getProductComparisons`

Retrieves price comparisons from different retailers for a specific product.

**Parameters:**
- `productID` (integer): Unique product identifier

**Response:**
- Array of comparison objects:
  - `companyID` (integer): Unique identifier for the retailer
  - `companyName` (string): Retailer name
  - `price` (number): Current price
  - `discountPercentage` (number): Discount percentage if applicable
  - `originalPrice` (number): Original price before discount
  - `inStock` (boolean): Whether the product is in stock
  - `addToCartURL` (string): URL for adding the product to cart at the retailer

#### Review Management

##### `addReview`

Adds a new product review.

**Parameters:**
- `userID` (integer): User's unique identifier
- `productID` (integer): Product's unique identifier
- `reviewTitle` (string): Review title
- `reviewDescription` (string): Review content
- `reviewRating` (integer): Rating from 1 to 5

**Response:**
- `reviewID` (integer): Unique identifier for the new review

##### `removeReview`

Removes a product review.

**Parameters:**
- `reviewID` (integer): Review's unique identifier
- `userID` (integer): User's unique identifier (for authorization)

**Response:**
- `success` (boolean): Whether the removal was successful

##### `editReview`

Edits an existing product review.

**Parameters:**
- `reviewID` (integer): Review's unique identifier
- `userID` (integer): User's unique identifier (for authorization)
- `reviewTitle` (string, optional): Updated review title
- `reviewDescription` (string, optional): Updated review content
- `reviewRating` (integer, optional): Updated rating from 1 to 5

**Response:**
- `success` (boolean): Whether the edit was successful

##### `getReviews`

Retrieves reviews for a specific product.

**Parameters:**
- `productID` (integer): Product's unique identifier
- `page` (integer, optional): Page number for pagination
- `limit` (integer, optional): Number of reviews per page
- `sort` (string, optional): Field to sort by
- `order` (string, optional): Sort order ("asc" or "desc")

**Response:**
- Array of review objects:
  - `reviewID` (integer): Unique review identifier
  - `userID` (integer): User's unique identifier
  - `username` (string): User's username
  - `reviewTitle` (string): Review title
  - `reviewDescription` (string): Review content
  - `reviewRating` (integer): Rating from 1 to 5
  - `reviewDate` (string): Timestamp of review creation

#### Filter Management

##### `getCategories`

Retrieves available product categories.

**Parameters:**
- `parent` (integer, optional): Parent category ID for hierarchical categories

**Response:**
- Array of category objects:
  - `categoryID` (integer): Unique category identifier
  - `categoryName` (string): Category name
  - `categoryEquivalents` (array): Equivalent categories from different sources

##### `getBrands`

Retrieves available product brands/manufacturers.

**Parameters:**
- `categoryID` (integer, optional): Filter brands by category

**Response:**
- Array of brand objects:
  - `brandID` (integer): Unique brand identifier
  - `brandName` (string): Brand name

## External API Integration

CompareIt primarily integrates with the Best Buy API to retrieve accurate product information:

- **Best Buy API**: [Best Buy Developer API Documentation](https://bestbuyapis.github.io/api-documentation/)

The Best Buy API provides comprehensive product data including:
- Product specifications
- Images
- Pricing
- Customer reviews
- Categorization

## Mock Data Generation

For development and demonstration purposes, CompareIt uses a custom MockDataGenerator to create realistic pricing data across multiple fictional retailers.

### MockDataGenerator Features

- Creates 10 fictional retail company data sources
- Generates prices based on Best Buy pricing with ±10% variation
- Creates realistic discount percentages
- Maintains stock status information
- Generates Add-to-Cart URLs
- Available at: [GitHub - Mock Data Generator](https://github.com/michaeltomlinsontuks/MockDataGenerator/)

## Database Structure

### Core Tables

#### Product
- `productID` (PK): Uniquely identifies the product
- `productName`: Title for the product
- `longDescription`: Detailed product description
- `thumbnailImage`: Primary product image URL
- `customerReviewAverage`: Average rating from reviews
- `customerReviewCount`: Total number of reviews
- `manufacturer`: Brand/manufacturer name
- `modelNumber`: Manufacturer's model number
- `releaseDate`: Product release date
- `category`: Product category
- `onlineAvailability`: Whether product is available online
- `bestPrice`: Best available price across retailers
- `bestCompany`: Retailer offering the best price

#### ImageGallery
- `imageID` (PK): Uniquely identifies the image
- `productID` (FK): Reference to Product table
- `imageURL`: URL to the image
- `imageType`: Type of image (main, angle, back, top, etc.)

#### Brand
- `brandID` (PK): Uniquely identifies the brand
- `brandName`: Brand/manufacturer name

#### Categories
- `categoryID` (PK): Uniquely identifies the category
- `categoryName`: Category name
- `categoryEquivalents`: Array of website-specific categories

#### CompanyList
- `companyID` (PK): Uniquely identifies the retail company
- `companyName`: Name of the retail company
- `companyLogo`: URL to company logo

#### ProductPricing
- `priceID` (PK): Uniquely identifies the price entry
- `productID` (FK): Reference to Product table
- `companyID` (FK): Reference to CompanyList table
- `price`: Current price
- `originalPrice`: Original price before discount
- `discountPercentage`: Discount percentage if applicable
- `inStock`: Whether the product is in stock
- `addToCartURL`: URL for adding product to cart

#### User
- `userID` (PK): Uniquely identifies the user
- `username`: User's username
- `password`: Password hash (SHA-512)
- `email`: User's email address
- `apiKey`: User's API key

#### Review
- `reviewID` (PK): Uniquely identifies the review
- `userID` (FK): Reference to User table
- `productID` (FK): Reference to Product table
- `reviewTitle`: Review title
- `reviewDescription`: Review content
- `reviewRating`: Rating (1-5)
- `reviewDate`: Timestamp of when the review was created

*Full database schema details are available in the Database folder.*

## Development Standards

### API Standards
- All requests follow a standardized format for consistency
- Comprehensive error handling with descriptive messages
- Prepared SQL statements to prevent injection attacks
- Extensive testing on Postman for reliability

### Backend Standards
- Well-commented code for functionality clarity
- Reusable components for maintainability
- UI elements extracted in constructors for easy updating
- Structured class system for organized development

### Frontend Standards
- Global CSS for consistent styling and easy theme updates
- Responsive design using percentage-based sizing
- Minimalistic, clean user interface
- Accessibility considerations for all users
- Best Buy logo included in footer (contractual requirement)
