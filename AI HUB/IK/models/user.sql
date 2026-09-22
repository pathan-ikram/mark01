CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100),
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    profile_image VARCHAR(255),
    phone VARCHAR(20),
    country VARCHAR(50),
    role ENUM('user','admin') DEFAULT 'user',
    subscription ENUM('free','pro','premium') DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);