# API Installation Guide

## Overview
This document provides a step-by-step guide on setting up and running the API.

## Prerequisites
Ensure you have the following installed:
- **Node.js** (v22 recommended)
- **npm** (v10 recommended)
- **MongoDB**
- **Docker** (Optional for Docker setup)

## Installation
There are two types of setup:
1. Locally: You will need your own MongoDB URI and can check or modify the database as you please
2. Docker: This is a zero-config setup, and will give you all you need right out of the box. However, needing to modify the database will require more effort on your part.

For the local setup, please continue. For the Docker setup, follow [these steps](#docker-installation)

### 1. Clone the Repository
```sh
git clone https://github.com/Chiemezuo/smuv-interview.git
cd smuv-interview
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Configure Environment Variables
Rename the `.env.example` to `.env`. Remove the "`.example`"

### 4. Setup MongoDB
In the `.env`, assign the MONGODB_URI with your MongoDB URI

### 5. Start the Server
```sh
npm start
```
The API will be available at `http://localhost:3000` by default, but you can set the port in the `.env`.

### 6. Postman Collection (Optional)
If you have Postman installed, you can open the `postman_collection.json` file for easy testing.

## Testing
To navigate around the endpoints, this is a guide

### Registration
The registration endpoint is `/api/auth/register` and its payload looks like:

```json
{
    "email": "email@email.com",
    "password": "password"
}
```

The default registration is as a regular user, but as an admin, there's an optional `"role": "admin"` key-value pair:

```json
{
    "email": "email@email.com",
    "password": "password",
    "role": "admin"
}
```

### Login
The login endpoint is `/api/auth/login` and its payload is:
```json
{
    "email": "email@email.com",
    "password": "password"
}
```

### Logout
The logout endpoint is `/api/auth/logout` and it takes no payload. Only logged in users can access this.

### Create Product
This is an endpoint only accessible to logged in `admin` users with the endpoint at `/api/products/` and its payload is:
```json
{
    "name": "product name",
    "description": "product desc",
    "price": 5000
}
```

### Get Products
The endpoint for this is `/api/products/`. It takes no payload

### Get Product by ID
The endpoint for this is `/api/products/:productId`. The `productId` must be a valid project ID.

### Purchase
The endpoint for this is `/api/purchase` and the payload is:
```json
{
    "productId": "MongoDB ID",
    "quantity": 3
}
```
Only a logged in user can make a purchase

### Get Leaderboard
The endpoint for this is `/api/leaderboard/` and it takes no payload:

### Get Leaderboard by Product
The endpoint for this is `/api/leaderboard/:productId` and it takes no payload. The `productId` must be a valid project ID.

### Get Purchase History
The endpoint for this is `/api/purchase/history` and it takes no payload. It can only be accessed by a logged in user.

### Set Sale Date
The endpoint for this is `api/sales/date/`. It is only accessible to logged in admin users, and its payload is:
```json
{
    "productId": "MongoDb ID",
    "date": "ISO Date string"
}
```

## Docker Installation
For the zero-config step, follow these steps:

### 1. Clone the Repository
```sh
git clone https://github.com/Chiemezuo/smuv-interview.git
cd smuv-interview
```

### 2. Run the Docker Engine
Usually by opening your Docker application.

### 3. Run the Docker Build Command.
```sh
docker-compose up --build
```