CREATE TABLE chat_history (
    id INT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200),
    user_message LONGTEXT NOT NULL,
    ai_response LONGTEXT NOT NULL,
    model_name VARCHAR(100),
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_chat_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);