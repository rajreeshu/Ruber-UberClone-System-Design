# Application Setup Guide

Follow the instructions below to configure and launch the application components. Ensure you have **Java**, **Node.js**, and **SQL Server** installed on your system before proceeding.

---

## 1. Backend Service (Spring Boot)
The backend handles the business logic and database connectivity.

### 1.1 Database Preparation
* Ensure your **SQL Server** instance is running.
* Create the required database and tables if it doesn't already exist.

#### Configuration
* Navigate to `src/main/resources/application-profile.properties`  {profile can be DEV, UAT, PROD}
* Update the database connection strings to match your environment:
    * **Host/URL**: `spring.datasource.url`
    * **Credentials**: `spring.datasource.username` and `spring.datasource.password`

### 1.2 Redis Prepration
* Ensure your **Redis Server** instance is running. 
* Blog for installing Redis on Mac: https://medium.com/@techworldthink/installing-redis-on-a-mac-using-homebrew-8d9745963523


#### Configuration
* Navigate to `src/main/resources/application-profile.properties`  {profile can be DEV, UAT, PROD}
* Update the redis connection strings to match your environment:
    * **Host/URL**: `spring.data.redis.host`
    * **Port**: `spring.data.redis.port`

### 1.3 Execution
* Open a terminal in the backend root directory.
* Run the application using Maven:
    ```bash
    ./mvnw spring-boot:run
    ```
    *(Or run the main class from your preferred IDE)*

---

## 2. Frontend Service (Angular)
The frontend provides the user interface for the booking system.

### 2.1 Dependency Installation
* Open a terminal in the frontend root directory.
* Install the required packages:
    ```bash
    npm install
    ```

### 2.2 Environment Setup
* Open `src/environments/environment.ts`.
* Update the `backendHost` or `apiUrl` variable to point to your running Spring Boot service (e.g., `http://localhost:8080`).

### 2.3 Execution
* Start the Angular development server:
    ```bash
    ng serve
    ```
* Once compiled, navigate to `http://localhost:4200` in your web browser.

---

## 3. Booking Instructions
1.  **Access the Dashboard**: Once the UI loads, verify the connection status.
2.  **Select Drivers**: Choose the required quantity of **NCP Drivers** from the selection menu.
3.  **Confirm Booking**: Click the **Book Ride** button to submit your request.

---

### Troubleshooting
* **Port Conflicts**: Ensure port 8080 (Backend) and 4200 (Frontend) are available.
* **CORS**: Ensure the Backend is configured to allow requests from the Frontend origin.