# CompareIt

CompareIt is a next-generation price comparison web application aggregating product listings from various online retailers. Our platform provides a clean, user-friendly experience for users to browse products, compare prices across different retailers, leave reviews, and find the best deals. We also offer filtering by criteria like price and brand, and managing user accounts with secure authentication. Combining real-world data with mock pricing, CompareIt delivers a realistic shopping experience, emphasizing performance, security, and usability.

## 418 Teapots Group Members

-   Damian Moustakis (u24564738)
-   Aaron Kim (u21494305)
-   Michael Tomlinson (u24569705)
-   Ayrtonn Taljaard (u24856462)
-   Dawid Eales (u24608892)
-   Wilmar Smit (u24584216)

## Table of Contents

-   [Market Research (Task 1)](#market-research-task-1)
-   [Mock Data Generation (Task 6)](#mock-data-generation-task-6)
-   [Development Guidelines (Task 8 & 10)](#development-guidelines-task-8--10)
-   [Demo Details (Task 9)](#demo-details-task-9)
-   [Database Design](#database-design)
    -   [Structure (Task 2)](#structure-task-2)
    -   [Relational Mapping (Task 3)](#relational-mapping-task-3)
    -   [Relational Constraints (Task 4)](#relational-constraints-task-4)
    -   [Optimisation (Task 7)](#optimisation-task-7)
-   [Website Functionality (Task 5)](#website-functionality-task-5)
    -   [API](#api)
    -   [Backend JS](#backend-js)
    -   [Frontend](#frontend)
-   [Individual Contributions](#individual-contributions)
    -   [Damian Moustakis (u24564738)](#damian-moustakis-u24564738)
    -   [Aaron Kim (u21494305)](#aaron-kim-u21494305)
    -   [Michael Tomlinson (u24569705)](#michael-tomlinson-u24569705)
    -   [Ayrtonn Taljaard (u24856462)](#ayrtonn-taljaard-u24856462)
    -   [Dawid Eales (u24608892)](#dawid-eales-u24608892)
    -   [Wilmar Smit (u24584216)](#wilmar-smit-u24584216)

## Market Research (Task 1)
### Competing Products
**Analyzed Competitors:**

- **PriceCheck**, **Smartprice**, **GoogleShopping** - Wide product range but poor user experience, confusing navigation
- **Troli** - Best UX focused on groceries only, clear onboarding process

**Key Gaps Identified:**

- Lack of technology product focus in South Africa
- Poor user guidance and functionality explanation
- No gamified or interactive design elements

**CompareIt Solution:**

- Technology-focused scope (laptops, desktops, components, consoles)
- Clean, gamified design with interactive elements
- Improved user experience addressing SA tech market markup issues

### Data Sources

- **Given API** choices - these didn't have good quality/enough data
- **Web scrapers** - questionable legality - hard to implement
- **eBay Developer API** - lots of variety between products - how do you easily compare iPhone to iPhone - without accidentally comparing an iPhone Case
- **Amazon Affiliate Program API** - unable to apply for Affiliate Program in South Africa
- **Best Buy Developer API** - Our Choice - Good Documentation - Able to get API key - easy to use query builder - lots of tech products - we decided to use this as a parent products dataset
## Mock Data Generation (Task 6)

### JSON Extraction
We tested the Best Buy API and choose several categories to give us a good spread of products:
- Appliances
- Audio Headphones
- Cameras
- Car Electronics
- Cell Phones
- Computers
- TV Home Theater

**[Best Buy API Data Extractor](MockDataTools/MockdataLoader/fetch_bestbuy.py)**

### Extracting Products from JSON
- Used PHP to insert products into a Best Products Table
- **[JSON to Database Product Extractor](MockDataTools/MockdataLoader)**

### Mock Data Generator & Generation
**[Mock Data Generator](MockDataTools/MockDataGenerationTool)**

![Mock Data Generator Interface](images/MockDataGenerator.png)

### Price Calculation
Searched all the mock companies and find who offers the best price
Update the best products table

**[Price Calculator](MockDataTools/PriceCalculation)**

## Development Guidelines (Task 8 & 10)

### Git Workflow & Commits

- **Commit frequently** 
    - Commit when you complete a function/class, not at end of day
    -  **Detailed commit messages**
        - Other team members need to understand what you've implemented
    - **Branch strategy**
        - Separate branches for each website section
    - **Pull requests**
        - Testing and review process before merging to main branch
    - **Only working code**
        - Ensure functionality works before committing to main

### Code Standards

- **Comment your code**
    - For teammate understanding and demo purposes
-  **Clear documentation**
    - All API requests and functionality should be documented in README
-  **Keep README current**
    - Should serve as living documentation for the project

## Demo Details (Task 9)

## Database Design

### Structure (Task 2)

### Relational Mapping (Task 3)

### Relational Constraints (Task 4)

### Optimisation (Task 7)

## Website Functionality (Task 5)

### API

### Backend JS

### Frontend

## Individual Contributions

### Damian Moustakis (u24564738)

### Aaron Kim (u21494305)

### Michael Tomlinson (u24569705)
- Initial research on product competitors
- Research on data sources
- Best Buy API Key Application
- Data Extraction from JSONs
- Mock Data Generator and Generation
- Price Calculation
- Git Repo Setup
- Config Commit Protections
- API Design
- API Core Functionality
- Powerpoint
- README Formatting
### Ayrtonn Taljaard (u24856462)

### Dawid Eales (u24608892)

### Wilmar Smit (u24584216)
