# Global Insight API: Dynamic Country Data Platform 🌐

This Node.js Express backend serves as a robust platform for aggregating and managing global country data. It dynamically fetches information from external APIs, stores it in a MySQL database using Sequelize, and provides a comprehensive RESTful API for access, alongside generating visual summaries of the data.

## Features ✨

*   **Dynamic Data Aggregation**: Fetches comprehensive country details (population, capital, region, flag) from REST Countries and exchange rates from Open ER API.
*   **Intelligent Caching**: Stores processed country data, including estimated GDP, in a MySQL database for efficient retrieval and reduced external API calls.
*   **RESTful API**: Exposes endpoints for retrieving all countries, filtering by region or currency, sorting by GDP, fetching individual country details, and deleting country records.
*   **Data Refresh Mechanism**: On-demand endpoint to trigger a full refresh of country data, ensuring the database remains up-to-date.
*   **Visual Data Summary**: Generates and serves a `summary.png` image displaying key statistics like total countries, last refresh timestamp, and top 5 countries by estimated GDP.
*   **Robust Error Handling**: Implements custom middleware for graceful handling of API errors, database errors (Sequelize validation), and unfound routes, providing clear error messages.
*   **ORM Integration**: Leverages Sequelize for seamless object-relational mapping, simplifying database interactions and schema management.

## Technologies Used 🛠️

| Technology      | Description                                                    |
| :-------------- | :------------------------------------------------------------- |
| **Node.js**     | JavaScript runtime for building scalable server-side applications. |
| **Express.js**  | Fast, unopinionated, minimalist web framework for Node.js.     |
| **Sequelize**   | Promise-based Node.js ORM for MySQL and other databases.       |
| **MySQL2**      | Official MySQL driver for Node.js, used by Sequelize.          |
| **Axios**       | Promise-based HTTP client for making API requests.             |
| **Jimp**        | JavaScript Image Manipulation Program for image generation.    |
| **Dotenv**      | Loads environment variables from a `.env` file.                |

## Getting Started 🚀

Follow these steps to set up and run the project locally.

### Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Elderusr/HNG-stage-2
    cd HNG-stage-2
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the root directory of the project and add the following required environment variables:

```dotenv
PORT=3000
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASS=your_database_password
DB_HOST=your_database_host # e.g., localhost or 127.0.0.1
EXCHANGE_RATE_API_URL=https://open.er-api.com/v6/latest/USD
COUNTRIES_API_URL=https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies
```

**Note**: Ensure your MySQL database is running and accessible from the specified `DB_HOST` and `DB_PORT` (if not default 3306). The application will attempt to synchronize models (`sequelize.sync({ alter: true })`) on startup, creating or updating tables as needed.

### Running the Application

1.  **Start in Development Mode (with Nodemon)**:
    ```bash
    npm start
    ```
    The server will restart automatically on code changes.

2.  **Start in Production Mode**:
    ```bash
    npm run start:prod
    ```

The server will be running on the `PORT` specified in your `.env` file (default: `http://localhost:3000`).

## Usage 🎯

Once the server is running, you can interact with the API:

1.  **Initial Data Refresh**:
    The database will be empty upon initial setup. You must trigger a data refresh to populate it.
    Send a `POST` request to the refresh endpoint:
    ```bash
    curl -X POST http://localhost:3000/countries/refresh
    ```
    This will fetch data from external APIs, process it, store it in your database, and also generate the `summary.png` image.

2.  **Accessing Country Data**:
    *   **View all countries**: `GET http://localhost:3000/countries`
    *   **Filter countries by region**: `GET http://localhost:3000/countries?region=Africa`
    *   **Filter countries by currency**: `GET http://localhost:3000/countries?currency=NGN`
    *   **Sort countries by GDP (descending)**: `GET http://localhost:3000/countries?sort=gdp_desc`
    *   **Get a specific country by name**: `GET http://localhost:3000/countries/Nigeria`
    *   **Delete a country by name**: `DELETE http://localhost:3000/countries/Nigeria`

3.  **Checking System Status**:
    Retrieve the total number of countries in the database and the timestamp of the last data refresh.
    ```bash
    GET http://localhost:3000/status
    ```

4.  **Viewing the Data Summary Image**:
    After a data refresh, an image summarizing the data (top 5 countries by GDP, total countries, last refreshed date) is generated. You can view it by navigating to:
    ```bash
    GET http://localhost:3000/countries/image
    ```
    This endpoint will serve the `summary.png` file from the `/cache` directory.

---

# Global Insight API

## Overview
This is a Node.js API built with Express, designed to fetch, process, and serve global country data. It utilizes Sequelize as an ORM for MySQL, integrating external data sources via Axios and generating data summaries with Jimp.

## Features
- Express: Facilitates the development of a robust RESTful API.
- Sequelize: Provides an Object-Relational Mapper for seamless MySQL database interactions.
- Axios: Handles HTTP requests for integrating with external data APIs.
- Jimp: Enables dynamic generation of image-based data summaries.
- Dotenv: Manages environment variables for secure and flexible configuration.

## Getting Started
### Installation
1.  Clone the repository:
    ```bash
    git clone git@github.com:Elderusr/HNG-stage-2.git
    cd HNG-stage-2
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
### Environment Variables
The following environment variables are required. Create a `.env` file in the root directory and populate it:
- `PORT`: The port on which the server will run. Example: `3000`
- `DB_NAME`: The name of your MySQL database. Example: `country_db`
- `DB_USER`: The username for your MySQL database. Example: `root`
- `DB_PASS`: The password for your MySQL database. Example: `password123`
- `DB_HOST`: The host for your MySQL database. Example: `localhost`
- `EXCHANGE_RATE_API_URL`: URL for the exchange rate API. Example: `https://open.er-api.com/v6/latest/USD`
- `COUNTRIES_API_URL`: URL for the countries data API. Example: `https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies`

## API Documentation
### Base URL
`http://localhost:PORT` (Replace `PORT` with your configured port, e.g., `3000`)

### Endpoints

#### GET /ping
**Overview**: Checks if the server is running.
**Request**:
No payload required.
**Response**:
```json
{
  "message": "Server is running!"
}
```
**Errors**:
- `500`: Internal server error (unlikely for this endpoint unless server is misconfigured)

#### POST /countries/refresh
**Overview**: Triggers a full data refresh from external APIs, updating the country database and generating a summary image.
**Request**:
No payload required.
**Response**:
```json
{
  "status": "success",
  "totalCountries": 250,
  "lastRefreshedAt": "2023-10-27T10:00:00.000Z"
}
```
**Errors**:
- `503`: External data source unavailable (e.g., `error: "External data source unavailable"`, `details: "Could not fetch data from Open ER API"`)
- `500`: Internal server error (e.g., `error: "Internal server error"` if image generation fails after data refresh)

#### GET /countries/image
**Overview**: Serves the generated `summary.png` image.
**Request**:
No payload required.
**Response**:
Binary image data (Content-Type: `image/png`).
**Errors**:
- `404`: Summary image not found (`error: "Summary image not found"`)
- `500`: Internal server error (if there are issues reading the file)

#### GET /status
**Overview**: Retrieves the total number of countries stored and the timestamp of the last data refresh.
**Request**:
No payload required.
**Response**:
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2023-10-27T10:00:00.000Z"
}
```
**Errors**:
- `500`: Internal server error

#### GET /countries
**Overview**: Retrieves a list of all countries, with optional filtering and sorting.
**Request**:
Query Parameters:
- `region` (Optional): Filter countries by region (e.g., `?region=Africa`).
- `currency` (Optional): Filter countries by currency code (e.g., `?currency=NGN`).
- `sort` (Optional): Sort order.
  - `gdp_desc`: Sort by estimated GDP in descending order (nulls last).
  - Default: Sort by `name` in ascending order.
**Response**:
```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139587,
    "currency_code": "NGN",
    "exchange_rate": "780.00000000",
    "estimated_gdp": "300000000000.00000000",
    "flag_url": "https://flagcdn.com/ng.svg",
    "created_at": "2023-10-27T10:00:00.000Z",
    "last_refreshed_at": "2023-10-27T10:00:00.000Z"
  }
]
```
**Errors**:
- `500`: Internal server error

#### GET /countries/:name
**Overview**: Retrieves detailed information for a single country by its exact name.
**Request**:
Path Parameter:
- `name` (Required): The case-sensitive name of the country (e.g., `/countries/Nigeria`).
**Response**:
```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139587,
  "currency_code": "NGN",
  "exchange_rate": "780.00000000",
  "estimated_gdp": "300000000000.00000000",
  "flag_url": "https://flagcdn.com/ng.svg",
  "created_at": "2023-10-27T10:00:00.000Z",
  "last_refreshed_at": "2023-10-27T10:00:00.000Z"
}
```
**Errors**:
- `404`: Country not found (`error: "Country not found"`)
- `500`: Internal server error

#### DELETE /countries/:name
**Overview**: Deletes a single country record by its exact name.
**Request**:
Path Parameter:
- `name` (Required): The case-sensitive name of the country to delete (e.g., `/countries/Nigeria`).
**Response**:
```json
{
  "message": "Country deleted successfully"
}
```
**Errors**:
- `404`: Country not found (`error: "Country not found"`)
- `500`: Internal server error

---

## License
This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

## Badges

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)](https://sequelize.org/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)