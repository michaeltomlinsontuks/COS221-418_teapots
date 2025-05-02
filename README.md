# CompareIt

CompareIt is a price comparison web application that enables users to browse products, compare prices from different retailers, leave reviews, and manage product data (for admins).

## Features
- User authentication and authorization
- Product browsing and searching
- Price comparison from multiple retailers
- User reviews and ratings

# Project Structure
## Database
 - Full database schema
 - ERD diagram
 - Structure Dump
 - Data Dump
## API
 - API documentation
   - Request Standards
   - Response Standards
 - API endpoints
 - API testing
## Website Backend
 - Backend Class Structure
 - Class functionality
   - Function - Input, Output, Description
 - Frontend Scripting
## Frontend
 - HTML Structure
 - CSS Styles
   - global.css

# Explanation of Mock Data
## Sources
Finding sources was extremely difficult as most e-commerce websites only have API access for sellers.
In practice a real company would have to negotiate with these companies to get access to their API.
Given these limitations, there are a few options:
- Developer API access
  - Best Buy
  - EBay
  - Amazon - Required Amazon Affiliate Program - Not technically available in South Africa
- Web Scrappers
  - APIFY - Legality issues

Ultimately we decided to use Best Buy as the source data is clean and structured. Something like an EBay has the issue with many different sellers and prices. 
The API also had the easiest to-use documentation. Then we made a MockDataGenerator to make realistic subsets for the website to use and compare between.