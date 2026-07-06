## **EXPENSE TRACKER API** 

## **Mini Project Documentation** 

**Department:** B.Tech Artificial Intelligence and Machine Learning 

**Institution:** Takshashila University 

**Academic Year:** 2026-2027 

## **Abstract** 

The Expense Tracker API is a RESTful web application developed to help users manage their personal finances efficiently. The system allows users to record income and expenses, categorize transactions, track spending patterns, and generate financial summaries. The application provides secure and structured API endpoints for performing CRUD (Create, Read, Update, Delete) operations on financial records. 

## **1. Introduction** 

Managing personal finances is an important aspect of daily life. Many individuals face challenges in tracking their expenses and monitoring their income. The Expense Tracker API addresses this problem by providing a centralized platform for recording and analyzing financial transactions. 

The application enables users to maintain detailed records of expenses and income while offering insights into spending habits through summary reports. 

## **2. Problem Statement** 

Traditional methods of expense management such as notebooks and spreadsheets are time-consuming and prone to errors. There is a need for a digital solution that allows users to efficiently manage financial transactions and monitor their financial health. 

## **3. Objectives** 

- To develop a financial transaction management system. 

- 

- To record income and expense details. 

- To categorize transactions for better analysis. 

- To provide summary reports of financial activities. 

- 

- To implement CRUD operations using REST APIs. 

1 

## **4. Scope of the Project** 

The Expense Tracker API can be used by: 

- Students • Employees 

- Freelancers 

- Small business owners • Individuals managing personal finances 

The system helps users maintain accurate financial records and improve budgeting practices. 

## **5. Technology Stack** 

|**Stack**||
|---|---|
|Component|Technology|
|Frontend|HTML, CSS, JavaScript|
|Backend|Node.js|
|Framework|Express.js|
|API Type|REST API|
|Data Format|JSON|
|Development Tool|VS Code|
|Testing Tool|Postman|



## **6. API Type Used** 

## **REST API (Representational State Transfer)** 

This project uses a RESTful API architecture for communication between the frontend and backend. 

## **Features of REST API** 

- Uses HTTP Protocol 

- Supports CRUD Operations 

- Lightweight Communication 

- 

- Uses JSON Data Format 

- 

- Platform Independent 

- 

2 

## **HTTP Methods Used** 

|Method|Purpose|
|---|---|
|GET|Retrieve Data|
|POST|Create Data|
|PUT|Update Data|
|DELETE|Delete Data|



## **7. System Architecture** 

```
Expense Tracker
│
├── .vscode
│   └── settings.json
│
├── data
│   └── expenses.json
│
├── public
│   ├── app.js
│   ├── index.html
│   ├── styles.css
│   └── theme.css
│
├── node_modules
│
├── db.js
├── server.js
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

## **8. Functional Requirements** 

## **User Requirements** 

- Add income transactions 

- Add expense transactions 

- Update transaction details • Delete transactions 

- View transaction history 

3 

- Generate financial summaries 

## **System Requirements** 

- Validate user inputs 

- Store transaction records • Generate reports 

- Handle API requests and responses 

## **9. API Endpoints** 

## **Base URL** 

```
http://localhost:4000/api
```

## **9.1 Get All Transactions** 

## **Endpoint** 

```
GET /api/expenses
```

## **Query Parameters** 

|Parameter|Description|
|---|---|
|category|Filter by category|
|type|income or expense|
|from|Start date|
|to|End date|



## **Sample Response** 

```
[
```

```
{
```

```
"id":1,
"description":"Groceries",
"type":"expense",
"amount":50,
"category":"Food",
"date":"2026-07-06"
```

4 

```
}
]
```

## **9.2 Get Single Transaction** 

## **Endpoint** 

```
GET /api/expenses/:id
```

## **Response** 

```
{
"id":1,
"description":"Groceries",
"type":"expense",
"amount":50,
"category":"Food",
"date":"2026-07-06"
}
```

## **9.3 Create Transaction** 

## **Endpoint** 

```
POST /api/expenses
```

## **Request Body** 

```
{
"description":"Salary",
"type":"income",
"amount":5000,
"category":"Work",
"date":"2026-07-01"
}
```

## **Response** 

```
{
"id":2,
"description":"Salary",
"type":"income",
```

5 

```
"amount":5000,
"category":"Work",
"date":"2026-07-01"
}
```

## **9.4 Update Transaction** 

## **Endpoint** 

```
PUT /api/expenses/:id
```

## **Response** 

Returns updated transaction details. 

## **9.5 Delete Transaction** 

## **Endpoint** 

```
DELETE /api/expenses/:id
```

## **Response** 

```
204 No Content
```

## **9.6 Financial Summary** 

## **Endpoint** 

```
GET /api/summary
```

## **Response** 

```
{
```

```
"income":5000,
"expense":50,
"net":4950,
"count":2,
"categories":{
"Food":50,
```

6 

```
"Work":5000
}
```

```
}
```

## **10. Data Validation** 

|**tion**||
|---|---|
|Field|Validation Rule|
|Description|Required|
|Type|income or expense|
|Amount|Positive Number|
|Category|Required|
|Date|YYYY-MM-DD Format|



## **11. Error Handling** 

## **400 Bad Request** 

Occurs when invalid data is submitted. 

Example: 

```
{
"message":"Amount must be greater than zero"
}
```

## **404 Not Found** 

Occurs when a transaction ID does not exist. 

Example: 

```
{
"message":"Expense not found"
}
```

7 

## **12. Advantages** 

- Easy to use 

- Organized financial records 

- Better expense tracking 

- Efficient financial analysis 

- Quick report generation 

## **13. Applications** 

- Personal Finance Management 

- Student Budget Tracking 

- Freelance Income Monitoring 

- Small Business Expense Tracking 

## **14. Future Enhancements** 

- User Authentication using JWT 

- Database Integration (MySQL/MongoDB) 

- Expense Charts and Analytics 

- PDF and Excel Report Export 

- Mobile Application Support 

- Cloud Deployment 

## **15. Testing** 

The API can be tested using: 

- Postman 

- Thunder Client 

- Insomnia 

- cURL 

## **16. Conclusion** 

The Expense Tracker API is a useful financial management system that helps users maintain records of income and expenses efficiently. By implementing REST API architecture and CRUD operations, the system provides a reliable and scalable solution for personal finance management. The project demonstrates practical implementation of web APIs, backend development, and financial data handling. 

8 

