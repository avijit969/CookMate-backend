# API Documentation

## General Routes

### 1. Welcome Page
Returns a welcome HTML page for the API.

- **URL**: `GET /`
- **Response**:
  - `200 OK`: Returns HTML content (`text/html`).

### 2. Health Check
Checks if the API is running smoothly.

- **URL**: `GET /api/health`
- **Response**:
  - `200 OK`:
    ```json
    {
      "message": "Everything run smoothly 😊"
    }
    ```

## User Routes
Base URL: `/api/users`

### 1. Get Authenticated User
Retrieves the authenticated user.

- **URL**: `GET /`
- **Authentication**: Required (Cookie/Token)
- **Response**:
  - `200 OK`:
    ```json
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "url"
    }
    ```
  - `401 Unauthorized`: Invalid credentials.
  - `500 Internal Server Error`

### 2. Create User (Register)
Registers a new user.

- **URL**: `POST /`
- **Body** (JSON):
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Response**:
  - `201 Created`:
    ```json
    {
      "message": "User created successfully",
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "isVerified": false,
        "createdAt": "timestamp"
      }
    }
    ```
    *Note: An email with a 6-digit verification code is sent to the user.*
  - `400 Bad Request`: If fields are missing (`All fields are required`) or user already exists (`User already exist`).
  - `500 Internal Server Error`

### 3. Verify User (Email Verification)
Verifies a user account using the 6-digit code sent via email.

- **URL**: `POST /verify`
- **Body** (JSON):
  ```json
  {
    "token": "123456"
  }
  ```
- **Response**:
  - `200 OK`:
    ```json
    {
      "message": "Account verified successfully!"
    }
    ```
    *Note: A welcome email is sent upon successful verification.*
  - `400 Bad Request`: Invalid or expired token/code.
  - `500 Internal Server Error`

### 4. Login User
Authenticates a user and sets a session cookie.

- **URL**: `POST /login`
- **Body** (JSON):
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Response**:
  - `200 OK`:
    ```json
    {
      "message": "User logged in successfully",
      "accessToken": "jwt_token_here"
    }
    ```
    *Note: Also sets a `token` cookie (HTTPOnly, Secure).*
  - `400 Bad Request`: If email or password missing.
  - `404 Not Found`: User not found.
  - `401 Unauthorized`: Invalid credentials.
  - `500 Internal Server Error`

### 5. Logout User
Logs out the current user by clearing the session cookie.

- **URL**: `POST /logout`
- **Authentication**: Required
- **Response**:
  - `200 OK`:
    ```json
    {
      "message": "User logged out successfully"
    }
    ```
  
### 6. Update User Details
Updates the authenticated user's profile (name, avatar).

- **URL**: `PUT /`
- **Authentication**: Required
- **Body** (JSON):
  ```json
  {
    "name": "Jane Doe",
    "avatar": "https://pub-r2.com/new-avatar.jpg"
  }
  ```
- **Response**:
  - `200 OK`:
    ```json
    {
      "message": "User updated successfully",
      "user": {
        "id": "uuid",
        "name": "Jane Doe",
        "avatar": "https://pub-r2.com/new-avatar.jpg"
      }
    }
    ```
  - `400 Bad Request`: If name or avatar is missing.
  - `500 Internal Server Error`

---

## Recipe Routes
Base URL: `/api/recipes`

### 1. Create Recipe
Creates a new recipe.

- **URL**: `POST /`
- **Authentication**: Required
- **Body** (JSON):
  ```json
  {
    "title": "Pasta Carbonara",
    "description": "A classic Italian pasta dish.",
    "instructions": "1. Boil pasta. 2. Cook pancetta...",
    "image": "https://pub-r2.com/recipe-image.jpg",
    "ingredients": [
      {
        "name": "Spaghetti",
        "type": "Grains",
        "quantity": "500",
        "unit": "g"
      },
      {
        "name": "Eggs",
        "type": "Dairy",
        "quantity": "3",
        "unit": "pcs"
      }
    ]
  }
  ```
- **Response**:
  - `201 Created`:
    ```json
    {
      "message": "Recipe created successfully",
      "recipe": {
        "id": "uuid",
        "title": "Pasta Carbonara"
      }
    }
    ```
  - `400 Bad Request`: If title, ingredients, or instructions are missing.
  - `500 Internal Server Error`

### 2. Get Recipe by ID
Retrieves details of a specific recipe. Redis caching is implemented for performance.

- **URL**: `GET /recipe/:id`
- **Request Parameters**:
  - `id`: The UUID of the recipe.
- **Response**:
  - `200 OK`:
    ```json
    {
      "recipe": {
        "id": "uuid",
        "title": "Pasta Carbonara",
        "description": "...",
        "instructions": "...",
        "ingredients": [ ... ]
      }
    }
    ```
  - `404 Not Found`: Recipe not found.
  - `500 Internal Server Error`

### 3. Get All Recipes
Retrieves a paginated list of recipes. Redis caching is implemented for performance.

- **URL**: `GET /`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1).
  - `limit` (optional): Number of items per page (default: 10).
- **Response**:
  - `200 OK`:
    ```json
    {
      "page": 1,
      "limit": 10,
      "count": 100,
      "hasNextPage": true,
      "recipes": [
        {
          "id": "uuid",
          "title": "Pasta Carbonara",
          "createdBy": {
             "name": "John Doe",
             "email": "john@example.com",
             "avatar": "url"
          },
          "ingredients": [ ... ]
        }
      ]
    }
    ```
  - `500 Internal Server Error`

### 4. Search Recipe by Name
Searches for recipes by name (case-insensitive).

- **URL**: `GET /search/:name`
- **Authentication**: Required
- **Request Parameters**:
  - `name`: The name or partial name of the recipe.
- **Response**:
  - `200 OK`:
    ```json
    {
      "recipe": { ... }
    }
    ```
  - `404 Not Found`: Recipe not found.
  - `500 Internal Server Error`

### 5. Get User Recipes
Retrieves all recipes created by the authenticated user.

- **URL**: `GET /user`
- **Authentication**: Required
- **Response**:
  - `200 OK`:
    ```json
    {
      "recipes": [ ... ]
    }
    ```
  - `404 Not Found`: No recipes found.
  - `500 Internal Server Error`

### 6. Delete Recipe
Deletes a recipe by its ID.

- **URL**: `DELETE /recipe/:id`
- **Authentication**: Required
- **Request Parameters**:
  - `id`: The UUID of the recipe to delete.
- **Response**:
  - `200 OK`:
    ```json
    {
      "message": "Recipe deleted successfully"
    }
    ```
  - `401 Unauthorized`: If the user is not the owner of the recipe.
  - `404 Not Found`: Recipe not found.
  - `500 Internal Server Error`

---

## Upload Routes
Base URL: `/api/upload`

### 1. Upload Image
Uploads an image file to Cloudflare R2.

- **URL**: `POST /`
- **Authentication**: Required
- **Body** (Multipart Form Data):
  - `file`: The image file to upload.
- **Response**:
  - `200 OK`:
    ```json
    {
      "message": "Image uploaded successfully",
      "url": "filename-or-public-url"
    }
    ```
  - `400 Bad Request`: If "file" is missing.
  - `500 Internal Server Error`: For S3/R2 errors.
