// Casing + pagination helpers used by every service to bridge
// Django (snake_case, DRF pagination) and the frontend contracts
// (camelCase, plain arrays or normalized page objects).

import type { Paginated } from "@/types";

const toCamel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
const toSnake = (s: string) =>
  s.replace(/([A-Z])/g, (m) => `_${m.toLowerCase()}`).replace(/^_/, "");

export function camelizeKeys<T = unknown>(input: unknown): T {
  if (Array.isArray(input)) return input.map((v) => camelizeKeys(v)) as unknown as T;
  if (input && typeof input === "object" && !(input instanceof Date) && !(input instanceof File) && !(input instanceof Blob)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[toCamel(k)] = camelizeKeys(v);
    }
    return out as T;
  }
  return input as T;
}

export function snakeizeKeys<T = unknown>(input: unknown): T {
  if (Array.isArray(input)) return input.map((v) => snakeizeKeys(v)) as unknown as T;
  if (input && typeof input === "object" && !(input instanceof Date) && !(input instanceof File) && !(input instanceof Blob)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[toSnake(k)] = snakeizeKeys(v);
    }
    return out as T;
  }
  return input as T;
}

// DRF PageNumberPagination shape → normalized frontend page.
export function normalizePage<T>(raw: any, mapItem: (r: any) => T): Paginated<T> {
  if (raw && Array.isArray(raw.results)) {
    return {
      count: raw.count ?? raw.results.length,
      next: raw.next ?? null,
      previous: raw.previous ?? null,
      results: raw.results.map(mapItem),
    };
  }
  const arr = Array.isArray(raw) ? raw : [];
  return { count: arr.length, next: null, previous: null, results: arr.map(mapItem) };
}

// When the frontend just wants a flat array, drop pagination.
export function unwrapList<T>(raw: any, mapItem: (r: any) => T = (x) => x as T): T[] {
  if (Array.isArray(raw)) return raw.map(mapItem);
  if (raw && Array.isArray(raw.results)) return raw.results.map(mapItem);
  return [];
}
