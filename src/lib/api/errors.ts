import type { AxiosError } from "axios";

// Normalized API error surfaced to the UI. The service layer only ever
// throws (or rejects) with this shape so components never see raw
// axios / Django errors.
export class ApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string[]>;
  raw?: unknown;

  constructor(opts: {
    message: string;
    status: number;
    code?: string;
    fieldErrors?: Record<string, string[]>;
    raw?: unknown;
  }) {
    super(opts.message);
    this.name = "ApiError";
    this.status = opts.status;
    this.code = opts.code;
    this.fieldErrors = opts.fieldErrors;
    this.raw = opts.raw;
  }
}

export function normalizeAxiosError(err: unknown): ApiError {
  const ax = err as AxiosError<any>;
  if (ax?.isAxiosError) {
    const status = ax.response?.status ?? 0;
    const data = ax.response?.data;
    // DRF-style: { detail: "..." } or { field: ["msg", ...], ... }
    let message = ax.message;
    let fieldErrors: Record<string, string[]> | undefined;
    let code: string | undefined;
    if (data && typeof data === "object") {
      if (typeof (data as any).detail === "string") {
        message = (data as any).detail;
      } else {
        const fe: Record<string, string[]> = {};
        for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
          if (Array.isArray(v)) fe[k] = v.map(String);
          else if (typeof v === "string") fe[k] = [v];
        }
        if (Object.keys(fe).length) {
          fieldErrors = fe;
          message = Object.values(fe).flat().join(" ") || message;
        }
      }
      if (typeof (data as any).code === "string") code = (data as any).code;
    }
    return new ApiError({ message, status, code, fieldErrors, raw: data });
  }
  return new ApiError({
    message: (err as Error)?.message ?? "Unknown error",
    status: 0,
    raw: err,
  });
}
