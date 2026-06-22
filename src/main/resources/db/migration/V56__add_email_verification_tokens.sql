CREATE TABLE email_verification_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(100)  NOT NULL UNIQUE,
    expires_at  TIMESTAMP     NOT NULL,
    used        BOOLEAN       NOT NULL DEFAULT false,
    created_at  TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP     NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_verification_tokens_token   ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
