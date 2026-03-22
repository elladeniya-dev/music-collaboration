package com.harmonix.constant;

public final class AppConstants {

    private AppConstants() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    // API Paths
    public static final String API_BASE_PATH = "/api";
    public static final String AUTH_PATH = API_BASE_PATH + "/auth";
    public static final String USERS_PATH = API_BASE_PATH + "/users";
    public static final String JOB_POSTS_PATH = API_BASE_PATH + "/job-posts";
    public static final String MESSAGES_PATH = API_BASE_PATH + "/messages";
    public static final String CHAT_HEADS_PATH = API_BASE_PATH + "/chat-heads";
    public static final String COLLABORATION_REQUESTS_PATH = API_BASE_PATH + "/collaboration-requests";
    public static final String SERVICES_PATH = API_BASE_PATH + "/services";

    // Cookie Names
    public static final String TOKEN_COOKIE_NAME = "token";

    // Default Values
    public static final String DEFAULT_USER_TYPE = "pending";
    public static final int TOKEN_MAX_AGE_SECONDS = 3600;

    // Message Types
    public static final String MESSAGE_TYPE_TEXT = "text";
    public static final String MESSAGE_TYPE_IMAGE = "image";
    public static final String MESSAGE_TYPE_FILE = "file";

    // Status Values
    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_ACCEPTED = "accepted";
    public static final String STATUS_REJECTED = "rejected";
    public static final String STATUS_READ = "read";
    public static final String STATUS_DELIVERED = "delivered";
    public static final String STATUS_SENT = "sent";
}
