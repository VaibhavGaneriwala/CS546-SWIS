# 📦 Smart Warehouse Inventory System

A web-based application that helps warehouse managers monitor and control inventory levels with real-time visibility and intelligent automation.

## 🚀 Project Overview

The **Smart Warehouse Inventory System** provides tools to track inventory in real-time, audit stock discrepancies, and generate actionable insights through dashboards and predictive analytics. Built using MongoDB, Node.js, and plain HTML/CSS/JavaScript, it ensures a lightweight yet powerful solution.

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js
- **Database:** MongoDB
- **Real-Time Updates:** AJAX (Fetch API)
- **Visualization:** Chart.js (for dashboards)
- **Notifications:** Email/SMS integration (e.g., Nodemailer, Twilio)

## 🌟 Core Features

- **Real-Time Inventory Tracking**
  - Add/remove items dynamically with instant updates.
- **Automated Inventory Auditing**
  - Periodic checks to flag discrepancies between expected and actual stock levels.
- **Interactive Dashboards**
  - Visualize stock levels, turnover rates, and trends.

## 🔮 Extra Features

- **Predictive Restocking**
  - Suggests restocking based on historical usage data.
- **Automated Notifications**
  - Sends alerts when stock hits critical thresholds.

## 📂 Project Structure

```
smart-warehouse/
├── backend/
│   ├── models/
│   ├── routes/ 
│   ├── controllers/
│   └── server.js
├── public/
│   ├── css/
│   ├── js/
│   └── index.html
├── .env
├── package.json
└── README.md
```

## ⚙️ Setup Instructions

### 1. Clone the Repository

```
git clone https://github.com/VaibhavGaneriwala/CS546-SWIS.git
```

```
cd CS546-SWIS/
```

### 2. Install Dependencies

```
npm install
```

### 3. Create `.env` File

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/warehouse-db
```

### 4. Run the Application

\`\`\`bash
npm start
\`\`\`

Visit `http://localhost:3000` in your browser.

## 🧪 Sample API Routes

- \`GET /api/inventory\` – Get all items
- \`POST /api/inventory\` – Add a new item
- \`PUT /api/inventory/:id\` – Update stock for an item
- \`DELETE /api/inventory/:id\` – Remove an item

## 📈 Future Improvements

- Enhancing Automation
- Advanced Reporting & Analytics
- Integration with Other Systems

## 🤝 Contributors

- Vaibhav Ganeriwala
- Erik Bobinski
- Neha Sutariya
- Terynce Chan

## 📄 License

This project is licensed under the [MIT License](LICENSE).