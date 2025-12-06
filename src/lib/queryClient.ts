"use client";

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export async function apiRequest(
  method: string,
  path: string,
  body?: any,
  init?: RequestInit
) {
  const options: RequestInit = {
    method,
    ...init,
    headers: {
      ...(init?.headers || {}),
    },
  };

  if (body instanceof FormData) {
    options.body = body;
  } else if (body !== undefined) {
    options.body = JSON.stringify(body);
    (options.headers as any)["Content-Type"] = "application/json";
  }

  const res = await fetch(path, options);
  return res;
}
