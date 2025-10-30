Country Currency & Exchange Rate API
A RESTful API that fetches country data from external APIs, enriches it with exchange rates, and provides CRUD operations with generated summary visualizations.
📋 Features

External API Integration: Fetches data from RestCountries and ExchangeRate APIs
Currency Matching: Automatically matches countries with their exchange rates
GDP Estimation: Calculates estimated GDP using population and exchange rates
Image Generation: Creates visual summaries with statistics
Advanced Filtering: Query by region, currency, or sort by GDP/name
Database Caching: Stores data in MySQL for fast access
RESTful Design: Clean, predictable API endpoints
TypeScript: Full type safety and excellent IDE support
Error Handling: Comprehensive error handling with helpful messages

🚀 Quick Start
Prerequisites

Node.js v14 or higher (Download)
MySQL 5.7+ or MariaDB (Download)
npm or yarn (comes with Node.js)

Installation

Clone the repository

bash   git clone https://github.com/yourusername/country-currency-api.git
   cd country-currency-api

Install dependencies

bash   npm install

Set up database

bash   # Login to MySQL
   mysql -u root -p

   # Create database
   CREATE DATABASE country_currency_db;

   # Exit MySQL
   exit;

   # Run schema (optional - app creates tables automatically)
   mysql -u root -p country_currency_db < database.sql

Configure environment

bash   # Copy example env file
   cp .env.example .env

   # Edit .env with your database credentials
   nano .env  # or use any text editor
Required variables in .env:
env   PORT=3000
   NODE_ENV=development
   
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=country_currency_db
   DB_PORT=3306

Run the application
Development mode (auto-restart on changes):

bash   npm run dev
Production mode (compiled):
bash   npm run build
   npm start

Verify it's working

bash   curl http://localhost:3000/
You should see API information with available endpoints.
📡 API Endpoints
POST /countries/refresh
Fetches fresh data from external APIs and updates the database.
Request:
bashcurl -X POST http://localhost:3000/countries/refresh
Response (200 OK):
json{
  "message": "Countries data refreshed successfully",
  "total_countries": 250,
  "last_refreshed_at": "2025-10-26T18:00:00Z"
}
Response (503 Service Unavailable):
json{
  "error": "External data source unavailable",
  "details": "Countries API did not respond"
}

GET /countries
Get all countries with optional filtering and sorting.
Query Parameters:

region - Filter by region (e.g., Africa, Europe)
currency - Filter by currency code (e.g., NGN, USD)
sort - Sort order: gdp_desc, gdp_asc, name_asc, name_desc

Examples:
bash# Get all countries
curl http://localhost:3000/countries

# Filter by region
curl http://localhost:3000/countries?region=Africa

# Filter by currency
curl http://localhost:3000/countries?currency=NGN

# Combined filters with sorting
curl http://localhost:3000/countries?region=Africa&sort=gdp_desc
Response (200 OK):
json[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-26T18:00:00Z"
  }
]

GET /countries/:name
Get a single country by name (case-insensitive).
Example:
bashcurl http://localhost:3000/countries/Nigeria
Response (200 OK):
json{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 1600.23,
  "estimated_gdp": 25767448125.2,
  "flag_url": "https://flagcdn.com/ng.svg",
  "last_refreshed_at": "2025-10-26T18:00:00Z"
}
Response (404 Not Found):
json{
  "error": "Country not found"
}

DELETE /countries/:name
Delete a country by name.
Example:
bashcurl -X DELETE http://localhost:3000/countries/Nigeria
Response (200 OK):
json{
  "message": "Country \"Nigeria\" deleted successfully"
}
Response (404 Not Found):
json{
  "error": "Country not found"
}

GET /status
Get system status and statistics.
Example:
bashcurl http://localhost:3000/status
Response (200 OK):
json{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-26T18:00:00Z"
}

GET /countries/image
Get the generated summary image (PNG).
Example:
bash# View in browser
open http://localhost:3000/countries/image

# Download with curl
curl http://localhost:3000/countries/image --output summary.png
Response: PNG image with country statistics
Response (404 Not Found):
json{
  "error": "Summary image not found",
  "hint": "Call POST /countries/refresh to generate the image"
}
🏗️ Project Structure
country-currency-api/
├── src/
│   ├── config/
│   │   └── database.ts          # MySQL connection & pooling
│   ├── models/
│   │   └── Country.ts            # Database queries (CRUD)
│   ├── controllers/
│   │   └── countryController.ts  # Request handlers
│   ├── services/
│   │   ├── countryService.ts     # External API calls & business logic
│   │   └── imageService.ts       # Image generation
│   ├── routes/
│   │   └── countryRoutes.ts      # API endpoint definitions
│   ├── middleware/
│   │   └── errorHandler.ts       # Global error handling
│   ├── utils/
│   │   └── validation.ts         # Input validation
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   └── server.ts                 # Application entry point
├── cache/                        # Generated images (created at runtime)
├── .env                          # Environment variables (NOT in git)
├── .env.example                  # Example environment variables
├── .gitignore                    # Git exclusions
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── database.sql                  # Database schema
└── README.md                     # This file
Architecture Overview
Layered Architecture:

Routes (routes/) - URL mapping to controllers
Controllers (controllers/) - HTTP request/response handling
Services (services/) - Business logic & external API calls
Models (models/) - Database operations
Middleware (middleware/) - Cross-cutting concerns (errors, logging)

Design Principles:

Separation of Concerns: Each layer has single responsibility
Dependency Injection: Loose coupling between layers
Type Safety: TypeScript for catching errors at compile time
Error Boundaries: Comprehensive error handling at each layer

🔧 Configuration
Environment Variables
All configuration is done through .env file:
VariableDescriptionDefaultRequiredPORTServer port3000NoNODE_ENVEnvironment (development/production)developmentNoDB_HOSTMySQL hostlocalhostYesDB_USERMySQL usernamerootYesDB_PASSWORDMySQL password-YesDB_NAMEDatabase namecountry_currency_dbYesDB_PORTMySQL port3306NoCOUNTRIES_API_URLCountries API URLRestCountries defaultNoEXCHANGE_API_URLExchange rates API URLExchangeRate API defaultNo
Database Configuration
The application uses MySQL with connection pooling:

Connection Limit: 10 concurrent connections
Auto-reconnect: Handles disconnections gracefully
UTF-8 Support: Full Unicode character support
Timezone: UTC for consistency

🧪 Testing
Manual Testing with curl
bash# 1. Refresh data
curl -X POST http://localhost:3000/countries/refresh

# 2. Get all countries
curl http://localhost:3000/countries

# 3. Filter by region
curl http://localhost:3000/countries?region=Africa

# 4. Get specific country
curl http://localhost:3000/countries/Nigeria

# 5. Check status
curl http://localhost:3000/status

# 6. View image
open http://localhost:3000/countries/image
Testing with Postman

Import the API endpoints
Set base URL to http://localhost:3000
Test each endpoint with different parameters

Automated Testing (Future Enhancement)
typescript// Example test with Jest & Supertest
import request from 'supertest';
import app from './src/server';

describe('API Tests', () => {
  test('GET /countries returns 200', async () => {
    const response = await request(app).get('/countries');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
📦 Dependencies
Production Dependencies

express: Web framework
mysql2: MySQL client with promises
dotenv: Environment variable management
axios: HTTP client for external APIs
canvas: Image generation
cors: Cross-origin resource sharing

Development Dependencies

typescript: TypeScript compiler
ts-node-dev: Development server with auto-reload
@types/express: TypeScript types for Express
@types/node: TypeScript types for Node.js
@types/cors: TypeScript types for CORS

🚢 Deployment
Deploying to Railway

Install Railway CLI

bash   npm install -g @railway/cli

Login to Railway

bash   railway login

Initialize project

bash   railway init

Add MySQL database

bash   railway add
   # Select MySQL

Set environment variables

bash   railway variables set NODE_ENV=production
   # DB variables auto-set by Railway MySQL

Deploy

bash   railway up
Deploying to Heroku

Install Heroku CLI

bash   npm install -g heroku

Login and create app

bash   heroku login
   heroku create your-app-name

Add ClearDB MySQL

bash   heroku addons:create cleardb:ignite

Set environment variables

bash   heroku config:set NODE_ENV=production

Deploy

bash   git push heroku main
Deploying to AWS EC2

Launch EC2 instance (Ubuntu 20.04 recommended)
Connect via SSH

bash   ssh -i your-key.pem ubuntu@your-ec2-ip

Install Node.js and MySQL

bash   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs mysql-server

Clone and setup

bash   git clone your-repo-url
   cd country-currency-api
   npm install
   npm run build

Configure MySQL and environment

bash   sudo mysql
   CREATE DATABASE country_currency_db;
   CREATE USER 'apiuser'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON country_currency_db.* TO 'apiuser'@'localhost';
   exit;
   
   # Create .env file with credentials

Run with PM2

bash   sudo npm install -g pm2
   pm2 start dist/server.js --name country-api
   pm2 startup
   pm2 save
🔒 Security Best Practices

Environment Variables: Never commit .env to git
SQL Injection: All queries use parameterized statements
CORS: Configure allowed origins in production
Rate Limiting: Add rate limiting middleware (recommended)
Input Validation: All user input validated before processing
Error Messages: Hide stack traces in production
HTTPS: Use SSL/TLS in production (reverse proxy recommended)

Recommended Security Additions
typescript// Add to server.ts
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/countries/refresh', limiter);

// CORS for production
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
🐛 Troubleshooting
Common Issues
1. "Cannot connect to database"
bash# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u root -p

# Check credentials in .env
2. "Port 3000 already in use"
bash# Find process using port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change PORT in .env
3. "Module not found"
bash# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
4. "External API timeout"

Check internet connection
Verify API URLs in .env
APIs might be temporarily down (retry later)

5. "Image generation failed"
bash# Install canvas dependencies (Linux)
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Mac
brew install pkg-config cairo pango libpng jpeg giflib librsvg
6. "TypeScript compilation errors"
bash# Clean build
rm -rf dist
npm run build

# Check tsconfig.json is present
📊 Performance Optimization
Current Optimizations

Connection Pooling: Reuses database connections
Batch Processing: Saves countries in batches during refresh
Parallel API Calls: Fetches from both APIs simultaneously
Indexed Queries: Database indexes on frequently queried columns
Caching: Generated images stored and reused

Future Enhancements

Redis Caching: Cache API responses
Query Optimization: Add more database indexes
CDN: Serve images from CDN
Compression: Enable gzip compression
Load Balancing: Multiple server instances

🔄 Data Flow
Refresh Operation (POST /countries/refresh)
1. Client → POST /countries/refresh
2. Controller → Service: refreshCountries()
3. Service → External APIs (parallel):
   - RestCountries API → Country data
   - ExchangeRate API → Exchange rates
4. Service → Process data:
   - Match currencies with rates
   - Calculate estimated GDP
5. Service → Model: Save countries (batched)
6. Model → Database: INSERT/UPDATE
7. Service → Image Service: Generate summary
8. Image Service → File System: Save image
9. Controller → Client: Success response
Query Operation (GET /countries?region=Africa)
1. Client → GET /countries?region=Africa
2. Controller → Validate query params
3. Controller → Model: getAllCountries({ region: "Africa" })
4. Model → Database: SELECT with WHERE clause
5. Database → Model: Country records
6. Model → Controller: Country array
7. Controller → Client: JSON response
📈 API Response Times
Typical response times (depends on external APIs and database):
EndpointAverage TimeNotesGET /< 10msNo database queryGET /status< 50msSimple queryGET /countries50-200msDepends on filtersGET /countries/:name20-100msSingle record lookupDELETE /countries/:name30-150msSingle delete operationPOST /countries/refresh10-30sExternal API calls + processingGET /countries/image< 100msFile system read
🤝 Contributing
Contributions are welcome! Please follow these guidelines:

Fork the repository
Create a feature branch: git checkout -b feature/amazing-feature
Commit changes: git commit -m 'Add amazing feature'
Push to branch: git push origin feature/amazing-feature
Open a Pull Request

Code Style

Use TypeScript
Follow existing patterns
Add comments for complex logic
Run npm run build before committing
Ensure no TypeScript errors

📝 License
This project is licensed under the MIT License.
👥 Authors

Your Name - Your GitHub

🙏 Acknowledgments

RestCountries API - Country data
ExchangeRate API - Currency exchange rates
Express - Web framework
TypeScript - Type safety

📞 Support
For support, email your-email@example.com or open an issue on GitHub.
🗺️ Roadmap
Version 1.1 (Planned)

 Redis caching for API responses
 WebSocket support for real-time updates
 GraphQL API alongside REST
 Historical exchange rate tracking
 More detailed country statistics

Version 1.2 (Planned)

 User authentication & API keys
 Rate limiting per user
 CSV/Excel export functionality
 Advanced filtering (population range, etc.)
 Bulk operations support

Version 2.0 (Future)

 Microservices architecture
 Event-driven updates
 Machine learning GDP predictions
 Multi-currency support
 Real-time collaboration features

📚 Additional Resources
External APIs Used

RestCountries: Documentation
ExchangeRate API: Documentation

Related Technologies

Express.js: Official Docs
TypeScript: Handbook
MySQL: Documentation
Node.js: Guides

Tutorials & Guides

Building RESTful APIs with Express
TypeScript Best Practices
MySQL Query Optimization
Docker Containerization
CI/CD with GitHub Actions


Made with ❤️ using Node.js, TypeScript, and Express