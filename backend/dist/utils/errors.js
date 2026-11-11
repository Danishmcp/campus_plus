export class AppError extends Error {
    statusCode;
    isOperational;
    errors;
    constructor(message, statusCode = 500, errors) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.errors = errors;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}
export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden: Insufficient permissions') {
        super(message, 403);
    }
}
export class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}
export class BadRequestError extends AppError {
    constructor(message = 'Bad Request', errors) {
        super(message, 400, errors);
    }
}
export class ValidationError extends AppError {
    constructor(message = 'Validation Failed', errors) {
        super(message, 422, errors);
    }
}
