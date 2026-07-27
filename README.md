#  STATIONERY ERP - POS & INVENTORY MANAGEMENT SYSTEM

A lightweight Enterprise Resource Planning (ERP) web application designed for retail stationery stores. This project focuses on a streamlined **Point of Sale (POS) checkout process** and **Real-Time Inventory Management** to optimize daily store operations.

##  STUDENT INFORMATION
* **Student Name:** [Your Name Here]
* **Student ID:** [Your Student ID]
* **Class / Major:** [Your Class] - Information Technology
* **Instructor / Supervisor:** Mr./Ms. [Instructor's Name]

---

##  KEY FEATURES

### 1. Point of Sale (POS) Interface
* **Visual Product Catalog:** Displays products with real-time SKUs, retail prices, and current stock quantities.
* **Interactive Cart Management:** Easily add products to the cart, increase/decrease quantities (`+` / `-`), or remove items (`🗑️`).
* **Real-Time Calculations:** Automatically calculates item subtotals, custom discounts, and the final checkout amount.

### 2. Real-Time Inventory Control
* **Automatic Stock Deduction:** Upon completing a checkout, product stock quantities are immediately updated and deducted in the MySQL database without requiring a page reload.
* **Low Stock Alerts:** Automatically triggers a **visual red alert** for products whose stock quantities drop to or below the configured Minimum Stock Threshold.
* **Overstock Protection:** Prevents staff from adding more items to the POS cart than the currently available physical stock.

### 3. Direct UI Inventory Management
* **Built-in Product Entry Form:** Add new stationery products directly into the database via an intuitive frontend modal/form.
* **Quick Stock Adjustments:** Features an on-screen **"🔄 Update Stock"** button, allowing store managers to quickly adjust inventory numbers during restocks or inventory audits.

---

## 🛠️ TECHNOLOGY STACK
* **Backend:** Java 17, Spring Boot 3.x (Spring Web, Spring Data JPA), Hibernate ORM, Lombok.
* **Frontend:** ReactJS, Axios, HTML5/CSS3.
* **Database:** MySQL Server 8.0.
* **Architecture:** RESTful API, Monorepo Architecture.

---

##  INSTALLATION & SETUP GUIDE

To run this project locally, ensure you have **JDK 17+**, **Node.js (LTS version)**, and **MySQL Server & Workbench** installed on your machine.

### STEP 1: Database Setup (MySQL)
1. Open **MySQL Workbench** and connect to your local MySQL server.
2. Open a new SQL query tab (`Ctrl + T`) and execute the following script to create the database schema and sample data:

```sql
CREATE DATABASE IF NOT EXISTS stationery_erp;
USE stationery_erp;

CREATE TABLE IF NOT EXISTS categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);

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

CREATE TABLE IF NOT EXISTS orders (
    order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(15, 2) NOT NULL,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    final_amount DECIMAL(15, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS order_details (
    order_detail_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT,
    product_id BIGINT,
    quantity INT NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Insert sample data for testing
INSERT INTO categories (category_name) VALUES ('Pens & Writing'), ('Office Paper'), ('Notebooks'), ('Office Supplies');
INSERT INTO products (sku, product_name, cost_price, retail_price, stock_quantity, min_stock_threshold, category_id) VALUES 
('SKU001', 'Thien Long Ballpoint Pen TL-027', 3000, 5000, 100, 20, 1),
('SKU002', 'Double A A4 Paper 70gsm', 65000, 85000, 15, 20, 2),
('SKU003', 'Premium Leather Notebook A5', 45000, 75000, 50, 10, 3),
('SKU004', 'Clear Scotch Tape 5cm (Pack of 6)', 40000, 65000, 8, 10, 4);