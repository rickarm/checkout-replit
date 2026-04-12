/**
 * Checkout API client — thin fetch wrapper.
 *
 * Uses VITE_API_URL as the base URL and attaches the Clerk JWT as a
 * Bearer token on every authenticated request.
 */

import { useAuth } from "@clerk/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Frontend and backend share the same Replit domain — use relative URLs.
// (VITE_API_URL is intentionally ignored: the old Mac Mini secret would
//  override it and point calls at the wrong host.)
const BASE = "";

// ── Types ────────────────────────────────────────────────────────────────────

export interface EntrySummary {
  id: string;
  date: string;
  templateId: string;
  mtime: string;
}

export interface EntrySection {
  title: string;
  content: string;
}

export interface EntryDetail {
  id: string;
  date: string;
  templateId: string;
  markdown: string;
  sections: EntrySection[];
  metadata: Record<string, unknown>;
  source: { backend: string };
}

export interface TemplateQuestion {
  id: string;
  order: number;
  title: string;
  prompt: string;
  example: string | null;
  required: boolean;
  type: "text" | "number";
  min?: number;
  max?: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  questions: TemplateQuestion[];
}

export interface DriveStatus {
  connected: boolean;
  folderId: string | null;
}

// ── Core fetch ───────────────────────────────────────────────────────────────

async function apiFetch(
  path: string,
  getToken: () => Promise<string | null>,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  return res;
}

async function apiFetchJson<T>(
  path: string,
  getToken: () => Promise<string | null>,
  options: RequestInit = {}
): Promise<T> {
  const res = await apiFetch(path, getToken, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useTemplate() {
  const { getToken } = useAuth();
  return useQuery<Template>({
    queryKey: ["checkout/template"],
    queryFn: () =>
      apiFetchJson<Template>("/api/template", getToken),
    staleTime: Infinity,
  });
}

export function useEntries(filters: { month?: string; year?: string } = {}) {
  const { getToken } = useAuth();
  const search = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters).filter(([, v]) => Boolean(v))
    )
  ).toString();
  const path = `/api/entries${search ? `?${search}` : ""}`;
  return useQuery<{ entries: EntrySummary[] }>({
    queryKey: ["checkout/entries", filters],
    queryFn: () =>
      apiFetchJson<{ entries: EntrySummary[] }>(path, getToken),
  });
}

export function useEntry(id: string | undefined) {
  const { getToken } = useAuth();
  return useQuery<EntryDetail>({
    queryKey: ["checkout/entry", id],
    queryFn: () =>
      apiFetchJson<EntryDetail>(`/api/entries/${id}`, getToken),
    enabled: !!id,
  });
}

export function useCreateEntry() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<
    EntrySummary,
    Error,
    { date: string; answers: Record<string, string> }
  >({
    mutationFn: (data) =>
      apiFetchJson<EntrySummary>("/api/entries", getToken, {
        method: "POST",
        body: JSON.stringify({ ...data, templateId: "checkout-v1" }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checkout/entries"] });
    },
  });
}

export function useUpdateEntry() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<
    unknown,
    Error,
    { id: string; answers: Record<string, string> }
  >({
    mutationFn: ({ id, answers }) =>
      apiFetchJson(`/api/entries/${id}`, getToken, {
        method: "PATCH",
        body: JSON.stringify({ answers }),
      }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["checkout/entry", id] });
      qc.invalidateQueries({ queryKey: ["checkout/entries"] });
    },
  });
}

export function useDriveStatus() {
  const { getToken } = useAuth();
  return useQuery<DriveStatus>({
    queryKey: ["checkout/drive-status"],
    queryFn: () =>
      apiFetchJson<DriveStatus>("/auth/google/status", getToken),
    retry: false,
  });
}
