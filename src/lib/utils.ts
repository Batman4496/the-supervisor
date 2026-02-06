
import { clsx, type ClassValue } from "clsx"
import React from "react"
import { twMerge } from "tailwind-merge"
import { ZodSafeParseResult } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function setData<T>(field: keyof T, value: any, setData: React.Dispatch<React.SetStateAction<T>>) {
  setData(prev => ({ ...prev, [field]: value }));
}

export function setZodErrors(zodResult: ZodSafeParseResult<Record<string, string>>, setError: React.Dispatch<React.SetStateAction<Record<string, string>>>) {
  zodResult.error?.issues.forEach((i) => {
    i.path.forEach((p) => {
      setData<Record<any, string>>(p, i.message, setError);
    });
  });
}

export async function browse(config = ['openDirectory']) {
  const path = await window.api.store.browse(config);
  return path;
} 