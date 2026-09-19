package com.swaranidhi.exception;

import java.time.LocalDateTime;

public class ErrorResponse {

    private boolean success = false;
    private String message;
    private LocalDateTime timestamp = LocalDateTime.now();
    private String path;

    public ErrorResponse() {}

    public ErrorResponse(String message, String path) {
        this.success = false;
        this.message = message;
        this.timestamp = LocalDateTime.now();
        this.path = path;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
}
