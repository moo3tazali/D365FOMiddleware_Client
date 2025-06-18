import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FlattenObj<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends string ? T[K] : FlattenObj<T[K]>;
    }[keyof T]
  : never;

export const tryParse = <T>(value?: string): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const enumToOptions = <T extends Record<string, string | number>>(
  enumObj: T
): { label: string; value: number }[] => {
  return Object.entries(enumObj)
    .filter(([, value]) => typeof value === 'number')
    .map(([key, value]) => ({
      label: key.replace(/([a-z])([A-Z])/g, '$1 $2'),
      value: value as number,
    }));
};
