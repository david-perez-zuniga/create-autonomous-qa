export type ErrorCode =
  | "E_DIR_EXISTS"
  | "E_INVALID_NAME"
  | "E_CONFLICT_FLAGS"
  | "E_TEMPLATE_MISSING"
  | "E_PERMISSION"
  | "E_COPY_FAILED"
  | "E_CONFIG_FAILED"
  | "E_UNKNOWN";

export class CliError extends Error {
  public readonly code: ErrorCode;
  public readonly cause?: unknown;

  constructor(code: ErrorCode, message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = "CliError";
    this.code = code;

    if (options && "cause" in options) {
      this.cause = options.cause;
    }
  }
}

export function isCliError(error: unknown): error is CliError {
  return error instanceof CliError;
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
