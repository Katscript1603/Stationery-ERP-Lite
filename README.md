# Stationery ERP Lite: Automated Inventory & POS Management System

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blueviolet.svg)](https://www.mysql.com/)

An enterprise-grade, lightweight ERP web application engineered for retail stationery businesses. **Stationery ERP Lite** addresses operational bottlenecks such as manual ledger errors, stockout risks, and slow checkout speeds through a decoupled architecture featuring a real-time **Point of Sale (POS)** engine and **Automated Inventory Tracking**.

---

## Project & Academic Metadata

* **Institution:** Van Lang University — Faculty of Information Technology
* **Course:** Application Programming Project
* **Student Name:** Cao Thiện Nhân
* **Student ID:** 207CT47866
* **Academic Advisor:** Dr. Nguyễn Trí Hải
* **Academic Year:** 2025–2026

---

## Key Features

### 1. Point of Sale (POS) Checkout Engine
* **Dynamic Product Grid:** Displays items with real-time SKUs, prices, and available stock levels.
* **Interactive Shopping Cart:** Real-time quantity manipulation (`+` / `-`), custom discounts, and instant subtotal calculation.
* **Overstock Prevention:** Client-side and server-side validation to block transactions exceeding available stock.

### 2. Real-Time Inventory Control
* **Atomic Stock Deduction:** Transactions execute under Spring `@Transactional` boundaries, immediately updating database stock levels without requiring full-page reloads.
* **Visual Low-Stock Alerts:** Automatic UI highlighting (Red row alert) whenever an item's quantity drops below its configured `min_stock_threshold`.
* **Direct Stock Update:** Integrated modal for quick inventory re-stocking and audits directly from the frontend.

### 3. Decoupled Architecture & Security
* **RESTful Communication:** Stateless JSON data exchange between ReactJS and Spring Boot.
* **Flexible CORS Configuration:** Configured to dynamically match client origin patterns across local development ports (`3000`, `3001`).

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend Framework** | Java 17 / Spring Boot 3.x | Core REST API, business logic, dependency injection |
| **ORM / Data Access** | Spring Data JPA / Hibernate | Object-Relational Mapping with 3NF relational integrity |
| **Frontend Framework** | ReactJS 18 (SPA) | Component-based UI with virtual DOM rendering |
| **HTTP Client** | Axios | Non-blocking asynchronous REST calls |
| **Database** | MySQL Server 8.0 | ACID-compliant relational persistence |
| **Build Tools** | Maven & npm | Package and dependency management |

---

## Quick Start & Local Setup Guide

### Prerequisites
* **JDK 17** or higher
* **Node.js** (v18+ LTS) & **npm**
* **MySQL Server 8.0+** & **MySQL Workbench**

---

### Step 1: Database Initialization (MySQL)

1. Open **MySQL Workbench** and execute the following SQL script to set up the 3NF schema and sample data:

```sql
CREATE DATABASE IF NOT EXISTS stationery_erp;
USE stationery_erp;

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    cost_price DECIMAL(15, 2) NOT NULL,
    retail_price DECIMAL(15, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock_threshold INT NOT NULL DEFAULT 10,
    category_id BIGINT,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(15, 2) NOT NULL,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    final_amount DECIMAL(15, 2) NOT NULL
);

-- 4. Order Details Table
CREATE TABLE IF NOT EXISTS order_details (
    order_detail_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT,
    product_id BIGINT,
    quantity INT NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Seed Initial Test Data
INSERT INTO categories (category_name) VALUES ('Pens & Writing'), ('Paper Products'), ('Office Supplies');

INSERT INTO products (sku, product_name, cost_price, retail_price, stock_quantity, min_stock_threshold, category_id) VALUES 
('SKU001', 'Thien Long Ballpoint Pen TL-027', 3000, 5000, 100, 20, 1),
('SKU002', 'Double A A4 Paper 70gsm', 65000, 85000, 15, 20, 2),
('SKU003', 'A5 Leather Notebook', 45000, 75000, 50, 10, 3),
('SKU004', 'Clear Tape 5cm (Pack of 6)', 40000, 65000, 8, 10, 3);
```

---

### Step 2: Backend Configuration & Launch (Spring Boot)

1. Open the **`erp`** folder in **IntelliJ IDEA**.
2. Update **`src/main/resources/application.properties`** with your database credentials and public key retrieval flags:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/stationery_erp?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=123456

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

3. Run `ErpApplication.java`. The backend service will start on **`http://localhost:8080`**.

---

### Step 3: Frontend Setup & Launch (ReactJS)

1. Open the **`stationery-erp-ui`** folder in **VS Code**.
2. Open the terminal and install node packages:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
4. Access the web interface at **`http://localhost:3000`** (or **`http://localhost:3001`**).

---

## REST API Endpoint Documentation

| Method | Endpoint | Description | Sample Request Payload / Query |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Fetch all products with stock status | N/A |
| `POST` | `/api/products` | Add a new stationery product | `{ "sku": "SKU005", "productName": "Casio FX-580", ... }` |
| `PUT` | `/api/products/{id}/stock` | Update stock quantity directly | `?quantity=150` |
| `POST` | `/api/pos/checkout` | Process POS cart checkout & deduct stock | `{ "discountAmount": 5000, "items": [...] }` |

---

## Testing & Quality Assurance

* **Backend Testing:** Unit testing with **JUnit 5** for inventory logic and checkout validation.
* **UAT & Integration:** Verified cross-origin REST communication between ReactJS (Port 3001) and Spring Boot (Port 8080).
* **Negative Test Scenarios:** Validated edge cases including negative quantity inputs, overstock cart additions, and server connection dropouts.

---

## License & Academic Integrity

This project is developed solely for academic purposes as part of the **Application Programming Project** course at Van Lang University. Unauthorized commercial redistribution is prohibited.
