/**
 * @file entities.ts
 * @package apps/api
 * @purpose Defines the core domain entities and validation rules. Part of the clean architecture Domain Layer.
 * @dependencies None
 * @security Encapsulate core rules here to ensure frontend/backend validation align.
 * @future_implementation Include class-validator annotations to enable automated JSON payload validation checks.
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ResourceNotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found.`);
    this.name = "ResourceNotFoundError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized access.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class IntegrityVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IntegrityVerificationError";
  }
}

/**
 * Validates a GitHub profile URL pattern.
 */
export function validateGithubUrl(url: string): boolean {
  const githubRegex = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/;
  return githubRegex.test(url);
}

/**
 * Validates email structures.
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
