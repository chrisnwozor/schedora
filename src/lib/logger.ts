import "server-only";

type LogContext = Record<string, unknown>;

const SENSITIVE_KEY_PATTERN =
  /password|passcode|secret|token|authorization|cookie|email|phone|address|customerName|notes|htmlBody|textBody/i;

function redactText(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]")
    .replace(/\b(?:\+?\d[\d\s().-]{7,}\d)\b/g, "[REDACTED_PHONE]")
    .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, "Bearer [REDACTED]");
}

function sanitizeValue(value: unknown, seen = new WeakSet<object>()): unknown {
  if (
    value === null ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "string") {
    return redactText(value);
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Error) {
    const errorWithCode = value as Error & {
      code?: unknown;
      digest?: unknown;
    };

    return {
      name: value.name,
      message: redactText(value.message),
      code:
        typeof errorWithCode.code === "string" ? errorWithCode.code : undefined,
      digest:
        typeof errorWithCode.digest === "string"
          ? errorWithCode.digest
          : undefined,
      stack:
        process.env.NODE_ENV === "development"
          ? redactText(value.stack ?? "")
          : undefined,
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, seen));
  }

  if (typeof value === "object") {
    if (seen.has(value)) {
      return "[CIRCULAR]";
    }

    seen.add(value);

    const sanitized: Record<string, unknown> = {};

    for (const [key, item] of Object.entries(value)) {
      sanitized[key] = SENSITIVE_KEY_PATTERN.test(key)
        ? "[REDACTED]"
        : sanitizeValue(item, seen);
    }

    return sanitized;
  }

  return String(value);
}

function writeLog(
  level: "info" | "warn" | "error",
  event: string,
  context: LogContext = {},
) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    environment: process.env.NODE_ENV,
    context: sanitizeValue(context),
  };

  const serialized = JSON.stringify(entry);

  if (level === "error") {
    console.error(serialized);
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.info(serialized);
}

export const logger = {
  info(event: string, context: LogContext = {}) {
    writeLog("info", event, context);
  },

  warn(event: string, context: LogContext = {}) {
    writeLog("warn", event, context);
  },

  error(event: string, error: unknown, context: LogContext = {}) {
    writeLog("error", event, {
      ...context,
      error,
    });
  },
};
