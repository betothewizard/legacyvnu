import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getEnv(key: string): string {
  const isBrowser = typeof window !== "undefined";

  const value = isBrowser
    ? import.meta.env[key as keyof ImportMetaEnv]
    : process.env[key];
  if (!value) {
    throw new Error(`${key} is undefined`);
  }
  return value;
}
