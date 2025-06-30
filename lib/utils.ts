import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextResponse } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function jsonResponse(data: any, status = 200, cookies?: ResponseCookie[]) {
  const response = NextResponse.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });

  // Jika ada cookies, tambahkan dengan opsi secure
  if (cookies) {
    cookies.forEach(cookie => {
      response.cookies.set({
        ...cookie,
        secure: true,
        httpOnly: true,
        sameSite: 'lax'
      });
    });
  }

  return response;
}

interface ResponseCookie {
  name: string;
  value: string;
  maxAge?: number;
  path?: string;
}