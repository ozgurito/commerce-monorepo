package com.commerce.monorepo.exception;

import lombok.Getter;

@Getter
public class BaseException extends RuntimeException {

    private final ErrorCode error;

    public BaseException(ErrorCode error) {
        super(error.getMessage());
        this.error = error;
    }

    public BaseException(ErrorCode error, String message) {
        super(message);
        this.error = error;
    }
}
