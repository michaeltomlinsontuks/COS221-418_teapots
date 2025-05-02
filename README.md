# CompareIt

CompareIt is a next-generation price comparison web application that aggregates up-to-date price listings from various online and physical retailers globally. Our platform offers a clean, user-friendly experience that enables users to browse products, compare prices from different retailers, leave reviews, and manage product data.

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
- [Database Structure](#database-structure)
- [Development Standards](#development-standards)
- [Mock Data Explanation](#mock-data-explanation)

## Features

- **User Authentication and Authorization**: Secure login, registration, and API key generation
- **Product Browsing**: Browse and search for products across multiple categories
- **Advanced Filtering**: Filter products based on brand, retailer, user rating, and more
- **Price Comparison**: View dynamic lists of retailers offering products with up-to-date pricing
- **User Reviews and Ratings**: Submit, edit, and view product reviews and ratings
- **Admin Management**: Manage product data, categories, and retailer information
- **Responsive Design**: Clean interface optimized for both desktop and mobile devices

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
- `sort` (string, optional): Field to sort by
- `order` (string, optional): Sort order ("asc" or "desc")
- `filters` (object, optional): Filter criteria (categories, brands, etc.)

**Response:**
- Array of product objects with basic information:
  - `productID` (integer): Unique product identifier
  - `productName` (string): Product name
  - `productDescription` (string): Short product description
  - `productImage` (string): URL to product image
  - `rating` (number): Average user rating
  - `brandName` (string): Brand name

##### `getProduct`

Retrieves detailed information about a specific product.

**Parameters:**
- `productID` (integer): Unique product identifier

**Response:**
- Detailed product object:
  - `productID` (integer): Unique product identifier
  - `productName` (string): Product name
  - `productDescription` (string): Detailed product description
  - `productImage` (string): URL to primary product image
  - `productImages` (array): URLs to additional product images
  - `rating` (number): Average user rating
  - `brandID` (integer): Brand identifier
  - `brandName` (string): Brand name
  - `categories` (array): List of product categories

##### `getProductComparisons`

Retrieves price comparisons from different retailers for a specific product.

**Parameters:**
- `productID` (integer): Unique product identifier

**Response:**
- Array of comparison objects:
  - `apiID` (integer): Unique identifier for the retailer API
  - `apiName` (string): Retailer name
  - `price` (number): Current price
  - `discountPercentage` (number): Discount percentage if applicable
  - `originalPrice` (number): Original price before discount
  - `inStock` (boolean): Whether the product is in stock
  - `lastUpdated` (string): Timestamp of last price update

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

Retrieves available product brands.

**Parameters:**
- `categoryID` (integer, optional): Filter brands by category

**Response:**
- Array of brand objects:
  - `brandID` (integer): Unique brand identifier
  - `brandName` (string): Brand name

##### `getAPIs`

Retrieves information about available retailer APIs.

**Parameters:**
- None

**Response:**
- Array of API objects:
  - `apiID` (integer): Unique API identifier
  - `apiName` (string): Retailer name
  - `apiType` (string): API type or category

## External API Integration

CompareIt integrates with various external APIs to retrieve up-to-date product information and pricing. For development purposes, we primarily use:

- **Best Buy API**: [Best Buy Developer API Documentation](https://developer.bestbuy.com/)

*Additional API integrations will be documented here as they are implemented.*

## Database Structure

### Core Tables

#### Product
- `ProductID` (PK): Uniquely identifies the product
- `ProductName`: Title for the product
- `ProductDescription`: Product description
- `ProductImage`: Primary product image URL
- `ProductImages`: Additional product images (JSON array)
- `BrandID` (FK): Reference to Brand table
- `Rating`: Computed average rating

#### Brand
- `BrandID` (PK): Uniquely identifies the brand
- `BrandName`: Brand name

#### Categories
- `CategoryID` (PK): Uniquely identifies the category
- `CategoryName`: Category name
- `CategoryEquivalents`: Array of website-specific categories

#### ProductCategoryMap
- `ProductID` (FK): Reference to Product table
- `CategoryID` (FK): Reference to Categories table

#### APIList
- `apiID` (PK): Uniquely identifies the API
- `apiName`: Name of the retailer API
- `apiRequestStructure`: API request format
- `apiResponseStructure`: API response format

#### ProductAPIMap
- `apiID` (FK): Reference to APIList table
- `productID` (FK): Reference to Product table

#### User
- `userID` (PK): Uniquely identifies the user
- `username`: User's username
- `password`: Password hash (SHA-512)
- `apiKey`: User's API key

#### Review
- `reviewID` (PK): Uniquely identifies the review
- `userID` (FK): Reference to User table
- `productID` (FK): Reference to Product table
- `reviewTitle`: Review title
- `reviewDescription`: Review content
- `reviewRating`: Rating (1-5)
- `reviewDate`: Timestamp of when the review was created

#### Best Buy
- `productID` (FK): Reference to Product table
- `Price`: Current price
- `DiscountPercentage`: Discount percentage if applicable

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

## Mock Data Explanation

### Sources

Finding sources was extremely difficult as most e-commerce websites only have API access for sellers.
In practice, a real company would have to negotiate with these companies to get access to their API.
Given these limitations, there are a few options:

- **Developer API access**
  - Best Buy
  - EBay
  - Amazon - Required Amazon Affiliate Program - Not technically available in South Africa
- **Web Scrappers**
  - APIFY - Legality issues

Ultimately we decided to use Best Buy as the source data is clean and structured. Something like EBay has the issue with many different sellers and prices. The API also had the easiest-to-use documentation. Then we made a MockDataGenerator to create realistic subsets for the website to use and compare between.
