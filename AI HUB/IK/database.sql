CREATE TABLE code_history (
    id INT  PRIMARY KEY,
    user_id INT,
    language VARCHAR(50),
    prompt LONGTEXT,
    generated_code LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id) REFERENCES users(id)
);