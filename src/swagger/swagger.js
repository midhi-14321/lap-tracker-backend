const swaggerUi = require("swagger-ui-express");

//OPTIONS
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Racing Tracker API",
    version: "1.0.0",
    description:
      "Simple API for tracking racing laps, sessions, users and stats",
  },
  servers: [
    {
      url: "http://localhost:2000",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Auth", description: "User authentication" },
    { name: "Sessions", description: "Racing session management" },
    { name: "Users", description: "User operations" },
    { name: "Admin", description: "Admin operations" },
    { name: "Laps", description: "Laps operations" },
  ],
  paths: {
    //REGISTER
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description: "Create a new user account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userName", "email", "password"],
                properties: {
                  userName: {
                    type: "string",
                    example: "john_doe",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    example: "john@example.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "password123",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    userId: { type: "string" },
                  },
                },
              },
            },
          },
          400: { description: "Validation error" },
          500: { description: "Server error" },
        },
      },
    },
    //LOGIN
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        description: "Authenticate user and get JWT token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "john@example.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "password123",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    token: { type: "string" },
                    user: {
                      type: "object",
                      properties: {
                        userId: { type: "string" },
                        userName: { type: "string" },
                        email: { type: "string" },
                        role: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "Invalid credentials" },
          404: { description: "User not found" },
          500: { description: "Server error" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout user",
        description: "Logout and clear authentication token",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Logout successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          500: { description: "Server error" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Users"],
        summary: "Get current user",
        description: "Get details of logged-in user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "User details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        userName: { type: "string" },
                        email: { type: "string" },
                        role: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          404: { description: "User not found" },
          500: { description: "Server error" },
        },
      },
    },

    // Delete Schema
    "/api/session/delete/{sessionId}": {
      delete: {
        tags: ["Sessions"],
        summary: "Delete a specific session",
        description: "Delete a session by ID (must be session owner)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "sessionId",
            in: "path",
            required: true,
            description: "ID of the session to delete",
            schema: {
              type: "string",
              format: "uuid",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
          },
        ],
        responses: {
          200: {
            description: "Session deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Session deleted successfully",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid session ID",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Invalid session ID",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized - authentication required",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Authentication required",
                    },
                  },
                },
              },
            },
          },
          403: {
            description: "Forbidden - not the session owner",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Not allowed to delete this session",
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Session not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Session not found",
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Server error deleting session",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/lap/delete/{lapId}": {
      delete: {
        tags: ["Laps"],
        summary: "Delete a specific lap",
        description: "Delete a lap by ID (must be lap owner)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "lapId",
            in: "path",
            required: true,
            description: "ID of the lap to delete",
            schema: {
              type: "integer",
              example: 1,
            },
          },
        ],
        responses: {
          200: {
            description: "Lap deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Lap deleted successfully",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid lap ID",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Invalid lap ID",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized - authentication required",
          },
          403: {
            description: "Forbidden - not the lap owner",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "You cannot delete this lap",
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Lap not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Lap not found",
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Server error while deleting lap",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/session/delete-all": {
      delete: {
        tags: ["Sessions"],
        summary: "Delete all sessions of logged-in user",
        description: "Delete all sessions and their laps for the current user",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Sessions deleted successfully",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    {
                      type: "object",
                      properties: {
                        message: {
                          type: "string",
                          example: "All sessions deleted successfully",
                        },
                      },
                    },
                    {
                      type: "object",
                      properties: {
                        message: {
                          type: "string",
                          example: "No sessions to delete",
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: "Unauthorized - authentication required",
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Server error deleting sessions",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/lap/delete-all": {
      delete: {
        tags: ["Laps"],
        summary: "Delete all laps of logged-in user",
        description: "Delete all laps from all sessions of the current user",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Laps deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "All laps deleted successfully",
                    },
                    deletedCount: {
                      type: "integer",
                      example: 5,
                      description: "Number of laps deleted",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized - authentication required",
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Server error while deleting laps",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // USER DASHBOARD

    // Add this to your swagger.js file's paths section:

    "/api/session/start": {
      post: {
        tags: ["Sessions"],
        summary: "Start a new session",
        description: "Start a new racing session for the logged-in user",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Session started successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Session started",
                    },
                    sessionId: {
                      type: "string",
                      format: "uuid",
                      example: "123e4567-e89b-12d3-a456-426614174000",
                    },
                    startTime: {
                      type: "string",
                      format: "date-time",
                      example: "2024-01-15T10:30:00.000Z",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "User already has an active session",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "User already has an active session",
                    },
                    sessionId: {
                      type: "string",
                      example: "123e4567-e89b-12d3-a456-426614174000",
                    },
                    startTime: {
                      type: "string",
                      example: "2024-01-15T09:45:00.000Z",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized - invalid or missing token",
          },
          500: {
            description: "Server error",
          },
        },
      },
    },

    "/api/session/end": {
      post: {
        tags: ["Sessions"],
        summary: "End an active session",
        description: "End a currently active session",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["sessionId"],
                properties: {
                  sessionId: {
                    type: "string",
                    format: "uuid",
                    example: "123e4567-e89b-12d3-a456-426614174000",
                    description: "ID of the session to end",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Session ended successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Session ended",
                    },
                    sessionId: {
                      type: "string",
                      format: "uuid",
                    },
                    endTime: {
                      type: "string",
                      format: "date-time",
                    },
                    duration: {
                      type: "string",
                      example: "01:30:25",
                      description: "Duration in HH:MM:SS format",
                    },
                  },
                },
              },
            },
          },
          400: {
            description:
              "Bad request - session already ended or missing sessionId",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Session already ended",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
          },
          403: {
            description: "Forbidden - not the session owner",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Not allowed to end this session",
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Session not found",
          },
          500: {
            description: "Server error",
          },
        },
      },
    },

    "/api/session/lap/start": {
      post: {
        tags: ["Laps"],
        summary: "Start a new lap",
        description: "Start timing a new lap within an active session",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["sessionId"],
                properties: {
                  sessionId: {
                    type: "string",
                    format: "uuid",
                    example: "123e4567-e89b-12d3-a456-426614174000",
                    description: "ID of the active session",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Lap started successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Lap started",
                    },
                    lapId: {
                      type: "string",
                      format: "uuid",
                      example: "abcdef12-3456-7890-abcd-ef1234567890",
                    },
                    lapStart: {
                      type: "string",
                      format: "date-time",
                      example: "2024-01-15T10:30:15.000Z",
                    },
                  },
                },
              },
            },
          },
          400: {
            description:
              "Cannot start lap - session ended or lap already active",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    {
                      type: "object",
                      properties: {
                        error: {
                          type: "string",
                          example: "Cannot start lap: session already ended",
                        },
                      },
                    },
                    {
                      type: "object",
                      properties: {
                        error: {
                          type: "string",
                          example: "A lap is already active",
                        },
                        lapId: {
                          type: "string",
                        },
                        lapStart: {
                          type: "string",
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "Session not found",
          },
          500: {
            description: "Server error",
          },
        },
      },
    },

    "/api/session/lap/end": {
      post: {
        tags: ["Laps"],
        summary: "End an active lap",
        description: "Stop timing the current lap",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["lapId"],
                properties: {
                  lapId: {
                    type: "string",
                    format: "uuid",
                    example: "abcdef12-3456-7890-abcd-ef1234567890",
                    description: "ID of the lap to end",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Lap ended successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    lapId: {
                      type: "string",
                      format: "uuid",
                    },
                    endTime: {
                      type: "string",
                      format: "date-time",
                    },
                    duration: {
                      type: "string",
                      example: "00:01:45",
                      description: "Lap duration in HH:MM:SS format",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Lap already ended or missing lapId",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Lap already ended",
                    },
                    lapId: {
                      type: "string",
                    },
                    lapEnd: {
                      type: "string",
                    },
                    duration: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "Lap not found",
          },
          500: {
            description: "Server error",
          },
        },
      },
    },

    "/api/session/active": {
      get: {
        tags: ["Sessions"],
        summary: "Get active session",
        description: "Get currently active session for logged-in user",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Active session information",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    {
                      type: "object",
                      properties: {
                        session: {
                          type: "object",
                          properties: {
                            id: {
                              type: "string",
                              format: "uuid",
                              example: "123e4567-e89b-12d3-a456-426614174000",
                            },
                            startTime: {
                              type: "string",
                              format: "date-time",
                              example: "2024-01-15T10:30:00.000Z",
                            },
                          },
                        },
                      },
                    },
                    {
                      type: "object",
                      properties: {
                        session: {
                          type: "null",
                          example: null,
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
          },
          500: {
            description: "Server error",
          },
        },
      },
    },

    // ADMIN operations

    "/api/admin/stats": {
      get: {
        tags: ["Admin"],
        summary: "Get admin dashboard statistics",
        description: "Get overall statistics for the application (admin only)",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Admin statistics retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    totalUsers: {
                      type: "integer",
                      example: 150,
                      description: "Total number of registered users",
                    },
                    totalSessions: {
                      type: "integer",
                      example: 420,
                      description: "Total number of sessions",
                    },
                    totalLaps: {
                      type: "integer",
                      example: 1250,
                      description: "Total number of laps",
                    },
                    activeSessions: {
                      type: "integer",
                      example: 5,
                      description: "Currently active sessions",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized - authentication required",
          },
          403: {
            description: "Forbidden - admin access required",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Admin access required",
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Server error",
          },
        },
      },
    },

    "/api/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "Get all users with pagination",
        description: "Get paginated list of all users (admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
              example: 1,
            },
            description: "Page number for pagination",
          },
          {
            name: "limit",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 10,
              example: 10,
            },
            description: "Number of items per page",
          },
          {
            name: "search",
            in: "query",
            schema: {
              type: "string",
              example: "john",
            },
            description: "Search term for username or email",
          },
        ],
        responses: {
          200: {
            description: "Users list retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    users: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                            format: "uuid",
                            example: "123e4567-e89b-12d3-a456-426614174000",
                          },
                          userName: {
                            type: "string",
                            example: "john_doe",
                          },
                          email: {
                            type: "string",
                            format: "email",
                            example: "john@example.com",
                          },
                          role: {
                            type: "string",
                            enum: ["user", "admin"],
                            example: "user",
                          },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2024-01-15T10:30:00.000Z",
                          },
                        },
                      },
                    },
                    page: {
                      type: "integer",
                      example: 1,
                    },
                    limit: {
                      type: "integer",
                      example: 10,
                    },
                    total: {
                      type: "integer",
                      example: 150,
                    },
                    totalPages: {
                      type: "integer",
                      example: 15,
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden - admin access required" },
          500: { description: "Server error" },
        },
      },
    },

    "/api/admin/users/{userId}": {
      delete: {
        tags: ["Admin"],
        summary: "Delete a user",
        description:
          "Delete a user and all their data (admin only, cannot delete self)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            description: "ID of the user to delete",
          },
        ],
        responses: {
          200: {
            description: "User deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "User deleted successfully",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Cannot delete own account",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Cannot delete your own account",
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden - admin access required" },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "User not found",
                    },
                  },
                },
              },
            },
          },
          500: { description: "Server error" },
        },
      },
    },

    "/api/admin/users/{userId}/role": {
      patch: {
        tags: ["Admin"],
        summary: "Update user role",
        description: "Update the role of a user (admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            description: "ID of the user to update",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["role"],
                properties: {
                  role: {
                    type: "string",
                    enum: ["user", "admin"],
                    example: "admin",
                    description: "New role for the user",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Role updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Role updated successfully",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid role",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Invalid role",
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden - admin access required" },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "User not found",
                    },
                  },
                },
              },
            },
          },
          500: { description: "Server error" },
        },
      },
    },

    "/api/admin/sessions": {
      get: {
        tags: ["Admin"],
        summary: "Get all sessions with pagination",
        description: "Get paginated list of all sessions (admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
              example: 1,
            },
            description: "Page number for pagination",
          },
          {
            name: "limit",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 10,
              example: 10,
            },
            description: "Number of items per page",
          },
          {
            name: "search",
            in: "query",
            schema: {
              type: "string",
              example: "john",
            },
            description: "Search term for username",
          },
        ],
        responses: {
          200: {
            description: "Sessions list retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    sessions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                            format: "uuid",
                            example: "123e4567-e89b-12d3-a456-426614174000",
                          },
                          userName: {
                            type: "string",
                            example: "john_doe",
                          },
                          sessionName: {
                            type: "string",
                            example: "Morning Practice",
                          },
                          lapCount: {
                            type: "integer",
                            example: 20,
                          },
                          bestLapTime: {
                            type: "string",
                            example: "01:30.456",
                          },
                          trackCondition: {
                            type: "string",
                            enum: ["dry", "wet", "damp"],
                            example: "dry",
                          },
                          startTime: {
                            type: "string",
                            format: "date-time",
                            example: "2024-01-15T10:30:00.000Z",
                          },
                          endTime: {
                            type: "string",
                            format: "date-time",
                            example: "2024-01-15T11:30:00.000Z",
                          },
                          duration: {
                            type: "string",
                            example: "01:00:00",
                          },
                          lapCount: {
                            type: "integer",
                            example: 15,
                            description:
                              "Number of laps in this session (from JOIN)",
                          },
                        },
                      },
                    },
                    page: {
                      type: "integer",
                      example: 1,
                    },
                    limit: {
                      type: "integer",
                      example: 10,
                    },
                    total: {
                      type: "integer",
                      example: 420,
                    },
                    totalPages: {
                      type: "integer",
                      example: 42,
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden - admin access required" },
          500: { description: "Server error" },
        },
      },
    },

    "/api/admin/sessions/{sessionId}": {
      delete: {
        tags: ["Admin"],
        summary: "Delete any session (admin)",
        description: "Delete any session regardless of ownership (admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "sessionId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            description: "ID of the session to delete",
          },
        ],
        responses: {
          200: {
            description: "Session deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Session deleted successfully",
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden - admin access required" },
          404: {
            description: "Session not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Session not found",
                    },
                  },
                },
              },
            },
          },
          500: { description: "Server error" },
        },
      },
    },

    "/api/admin/laps": {
      get: {
        tags: ["Admin"],
        summary: "Get all laps with pagination",
        description: "Get paginated list of all laps (admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
              example: 1,
            },
            description: "Page number for pagination",
          },
          {
            name: "limit",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 10,
              example: 10,
            },
            description: "Number of items per page",
          },
          {
            name: "search",
            in: "query",
            schema: {
              type: "string",
              example: "john",
            },
            description: "Search term for username",
          },
        ],
        responses: {
          200: {
            description: "Laps list retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    laps: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          lapId: {
                            type: "string",
                            format: "uuid",
                            example: "abcdef12-3456-7890-abcd-ef1234567890",
                          },
                          sessionId: {
                            type: "string",
                            format: "uuid",
                            example: "123e4567-e89b-12d3-a456-426614174000",
                          },
                          lapStart: {
                            type: "string",
                            format: "date-time",
                            example: "2024-01-15T10:30:15.000Z",
                          },
                          lapEnd: {
                            type: "string",
                            format: "date-time",
                            example: "2024-01-15T10:31:45.000Z",
                          },
                          duration: {
                            type: "string",
                            example: "00:01:30",
                          },
                          userName: {
                            type: "string",
                            example: "john_doe",
                          },
                        },
                      },
                    },
                    page: {
                      type: "integer",
                      example: 1,
                    },
                    limit: {
                      type: "integer",
                      example: 10,
                    },
                    total: {
                      type: "integer",
                      example: 1250,
                    },
                    totalPages: {
                      type: "integer",
                      example: 125,
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden - admin access required" },
          500: { description: "Server error" },
        },
      },
    },

    "/api/admin/laps/{lapId}": {
      delete: {
        tags: ["Admin"],
        summary: "Delete any lap (admin)",
        description: "Delete any lap regardless of ownership (admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "lapId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
              example: "abcdef12-3456-7890-abcd-ef1234567890",
            },
            description: "ID of the lap to delete",
          },
        ],
        responses: {
          200: {
            description: "Lap deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Lap deleted successfully",
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden - admin access required" },
          404: {
            description: "Lap not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Lap not found",
                    },
                  },
                },
              },
            },
          },
          500: { description: "Server error" },
        },
      },
    },
    // Add these to your swagger.js file's paths section:

    "/api/user/sessions": {
      get: {
        tags: ["Sessions"],
        summary: "Get logged-in user sessions",
        description:
          "Get paginated list of sessions for the currently authenticated user",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
              example: 1,
            },
            description: "Page number for pagination",
          },
          {
            name: "limit",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 10,
              example: 10,
            },
            description: "Number of items per page",
          },
        ],
        responses: {
          200: {
            description: "User sessions retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    page: {
                      type: "integer",
                      example: 1,
                    },
                    limit: {
                      type: "integer",
                      example: 10,
                    },
                    total: {
                      type: "integer",
                      example: 25,
                    },
                    totalPages: {
                      type: "integer",
                      example: 3,
                    },
                    sessions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                            format: "uuid",
                            example: "123e4567-e89b-12d3-a456-426614174000",
                          },
                          startTime: {
                            type: "string",
                            format: "date-time",
                            example: "2024-01-15T10:30:00.000Z",
                          },
                          endTime: {
                            type: "string",
                            format: "date-time",
                            example: "2024-01-15T11:30:00.000Z",
                          },
                          duration: {
                            type: "string",
                            example: "01:00:00",
                            description: "Session duration in HH:MM:SS format",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized - authentication required",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Authentication required",
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Failed to fetch sessions",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/laps/user": {
      get: {
        tags: ["Laps"],
        summary: "Get logged-in user laps",
        description:
          "Get paginated list of laps for the currently authenticated user across all sessions",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
              example: 1,
            },
            description: "Page number for pagination",
          },
          {
            name: "limit",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 6,
              example: 6,
            },
            description: "Number of items per page",
          },
        ],
        responses: {
          200: {
            description: "User laps retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    laps: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          lapId: {
                            type: "string",
                            format: "uuid",
                            example: "abcdef12-3456-7890-abcd-ef1234567890",
                          },
                          sessionId: {
                            type: "string",
                            format: "uuid",
                            example: "123e4567-e89b-12d3-a456-426614174000",
                          },
                          lapStart: {
                            type: "string",
                            format: "date-time",
                            example: "2024-01-15T10:30:15.000Z",
                          },
                          lapEnd: {
                            type: "string",
                            format: "date-time",
                            example: "2024-01-15T10:31:45.000Z",
                          },
                          duration: {
                            type: "string",
                            example: "00:01:30",
                            description: "Lap duration in HH:MM:SS format",
                          },
                        },
                      },
                    },
                    page: {
                      type: "integer",
                      example: 1,
                    },
                    totalPages: {
                      type: "integer",
                      example: 5,
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized - authentication required",
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Server error fetching laps",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/user/stats": {
      get: {
        tags: ["Users"],
        summary: "Get user statistics",
        description:
          "Get statistics for the currently authenticated user (total sessions, total laps, average lap duration)",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "User statistics retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    totalSessions: {
                      type: "integer",
                      example: 15,
                      description:
                        "Total number of sessions created by the user",
                    },
                    totalLaps: {
                      type: "integer",
                      example: 120,
                      description: "Total number of laps recorded by the user",
                    },
                    avgLapDuration: {
                      type: "number",
                      format: "float",
                      example: 95.75,
                      description:
                        "Average lap duration in seconds (0 if no laps with duration)",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized - authentication required",
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Server error",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const setupSwagger = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: "Lap Tracker API Docs",
      customCss: ".swagger-ui .topbar { display: none }",
      customfavIcon: "/favicon.ico",
    })
  );

  console.log(" API Documentation: http://localhost:2000/api-docs");
};

module.exports = setupSwagger;
