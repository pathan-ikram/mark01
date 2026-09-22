CREATE TABLE documents (
    id INT  PRIMARY KEY,
    user_id INT NULL,
    original_name VARCHAR(255),
    saved_name VARCHAR(255),
    file_type VARCHAR(100),
    file_size BIGINT,
    extracted_text LONGTEXT,
    analysis LONGTEXT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);