CREATE TABLE document_history (
    id INT PRIMARY KEY,

    user_id INT NOT NULL,

    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50),
    document_size BIGINT,

    document_path VARCHAR(500) NOT NULL,

    extracted_text LONGTEXT,

    ai_summary LONGTEXT,

    ai_response LONGTEXT,

    model_name VARCHAR(100),

    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);