-- FitGear database (MySQL / MariaDB). Import in phpMyAdmin or: mysql -u root < fitgear.sql
CREATE DATABASE IF NOT EXISTS fitgear CHARACTER SET utf8mb4;
USE fitgear;
DROP TABLE IF EXISTS payments, order_items, orders, cart, products, categories, users;
CREATE TABLE users(id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(80) NOT NULL,email VARCHAR(120) NOT NULL UNIQUE,password VARCHAR(255) NOT NULL,role ENUM('customer','admin') DEFAULT 'customer',created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE categories(id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(60) NOT NULL UNIQUE);
CREATE TABLE products(id INT AUTO_INCREMENT PRIMARY KEY,category_id INT NOT NULL,name VARCHAR(150) NOT NULL,price DECIMAL(10,2) NOT NULL,stock INT NOT NULL DEFAULT 0,image VARCHAR(100) DEFAULT 'default.jpg',active TINYINT DEFAULT 1,FOREIGN KEY(category_id) REFERENCES categories(id));
CREATE TABLE cart(id INT AUTO_INCREMENT PRIMARY KEY,user_id INT NOT NULL,product_id INT NOT NULL,qty INT NOT NULL DEFAULT 1,UNIQUE KEY u_p(user_id,product_id),FOREIGN KEY(user_id) REFERENCES users(id),FOREIGN KEY(product_id) REFERENCES products(id));
CREATE TABLE orders(id INT AUTO_INCREMENT PRIMARY KEY,user_id INT NOT NULL,total DECIMAL(10,2) NOT NULL,address VARCHAR(255) NOT NULL,status ENUM('Placed','Packed','Shipped','Delivered') DEFAULT 'Placed',created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES users(id));
CREATE TABLE order_items(id INT AUTO_INCREMENT PRIMARY KEY,order_id INT NOT NULL,product_id INT NOT NULL,qty INT NOT NULL,price DECIMAL(10,2) NOT NULL,FOREIGN KEY(order_id) REFERENCES orders(id),FOREIGN KEY(product_id) REFERENCES products(id));
CREATE TABLE payments(id INT AUTO_INCREMENT PRIMARY KEY,order_id INT NOT NULL UNIQUE,method VARCHAR(40),txn_id VARCHAR(40),amount DECIMAL(10,2),status VARCHAR(20) DEFAULT 'Paid',FOREIGN KEY(order_id) REFERENCES orders(id));
INSERT INTO users(name,email,password,role) VALUES('Admin','admin@fitgear.com','$2b$10$e14NbNrLwl7Z5wguzcGFq.i34g5fz2zVsrsr7YaNjWK4/yeyoFyUm','admin');
INSERT INTO categories(name) VALUES ('Whey Protein'),('Combos'),('Mass Gainer'),('Creatine'),('Shakers');
INSERT INTO products(category_id,name,price,stock,image) VALUES
(1,'Gold Standard 100% Whey',3499,24,'a1.jpg'),
(2,'Gold Standard Whey + Creatine Combo',3899,16,'a2.jpg'),
(1,'Legion Whey+ Dutch Chocolate',3299,11,'a3.jpg'),
(1,'Isopure Whey Isolate',4999,11,'a4.jpg'),
(1,'Performance Whey',2799,21,'a5.jpg'),
(2,'Birdman Protein + Creatine',3199,13,'a6.jpg'),
(2,'Myotrax Whey Isolate + Creatine',3599,22,'a7.jpg'),
(2,'Vega Protein + Creatine',3399,26,'a8.jpg'),
(3,'Nutrimuscle Mass Gainer 3kg',2599,25,'a9.jpg'),
(4,'Labrada CreaLean Powder',1799,24,'a10.jpg'),
(4,'Urban Creatine Gummies',1499,13,'a11.jpg'),
(4,'Myprotein Impact Creatine',1999,20,'b1.jpg'),
(2,'NAKPRO Impact Whey + Creatine',2999,17,'b2.jpg'),
(2,'GNC Pro Performance Stack',4299,25,'b3.jpg'),
(1,'Kaged Post-Workout Protein',3799,18,'b4.jpg'),
(5,'Lifelong Gym Shaker 700ml',399,18,'b5.jpg'),
(5,'Boldfit Spider Shaker',449,17,'b6.jpg'),
(5,'Cult Shaker for Gym',499,16,'b7.jpg'),
(5,'Boldfit Blue-Lid Shaker',349,19,'b8.jpg'),
(5,'Carbamide Forte Storm Shaker',549,15,'b9.jpg');
