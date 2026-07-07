# Expense-Tracker
Mini Project

## API Endpoints

The Expense Tracker API provides the following endpoints for managing expenses and income transactions.

### Base URL
```
http://localhost:4000/api
```

### 1. Get All Expenses
**Endpoint:** `GET /api/expenses`

**Query Parameters:**
- `category` (optional) - Filter by expense category
- `type` (optional) - Filter by type: `income` or `expense`
- `from` (optional) - Filter from date (ISO format: YYYY-MM-DD)
- `to` (optional) - Filter to date (ISO format: YYYY-MM-DD)

**Response:** Array of expenses sorted by date (newest first)
```json
[
  {
    "id": 1,
    "description": "Groceries",
    "type": "expense",
    "amount": 50.00,
    "category": "Food",
    "date": "2026-07-06"
  }
]
```

### 2. Get Single Expense
**Endpoint:** `GET /api/expenses/:id`

**Response:** Single expense object
```json
{
  "id": 1,
  "description": "Groceries",
  "type": "expense",
  "amount": 50.00,
  "category": "Food",
  "date": "2026-07-06"
}
```

**Error:** Returns 404 if expense not found

### 3. Create Expense
**Endpoint:** `POST /api/expenses`

**Request Body:**
```json
{
  "description": "string (required)",
  "type": "income or expense (required)",
  "amount": "number > 0 (required)",
  "category": "string (required)",
  "date": "ISO date string (required)"
}
```

**Response:** Status 201, returns created expense with ID
```json
{
  "id": 2,
  "description": "Salary",
  "type": "income",
  "amount": 5000.00,
  "category": "Work",
  "date": "2026-07-01"
}
```

**Errors:** Returns 400 if validation fails

### 4. Update Expense
**Endpoint:** `PUT /api/expenses/:id`

**Request Body:** Same as Create Expense

**Response:** Updated expense object

**Errors:** Returns 404 if not found, 400 if validation fails

### 5. Delete Expense
**Endpoint:** `DELETE /api/expenses/:id`

**Response:** Status 204 (No Content)

**Errors:** Returns 404 if not found

### 6. Get Summary
**Endpoint:** `GET /api/summary`

**Response:** Summary statistics
```json
{
  "income": 5000.00,
  "expense": 50.00,
  "net": 4950.00,
  "count": 2,
  "categories": {
    "Food": 50.00,
    "Work": 5000.00
  }
}
```

## Data Validation

- **Description**: Required, non-empty string
- **Type**: Required, must be `income` or `expense`
- **Amount**: Required, must be a positive number greater than zero
- **Category**: Required, non-empty string
- **Date**: Required, valid ISO date format (YYYY-MM-DD) 
