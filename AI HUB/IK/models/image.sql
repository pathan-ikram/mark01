CREATE TABLE image_history (
    id INT PRIMARY KEY,
    user_id INT NOT NULL,
    prompt LONGTEXT NOT NULL,
    negative_prompt LONGTEXT,
    image_name VARCHAR(255),
    image_path VARCHAR(500) NOT NULL,
    model_name VARCHAR(100),
    width INT DEFAULT 1024,
    height INT DEFAULT 1024,
    seed BIGINT,
    steps INT,
    cfg_scale DECIMAL(4,2),
    generation_time DECIMAL(6,2),
    status ENUM DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_image_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);