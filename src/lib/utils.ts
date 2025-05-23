import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FlattenObj<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends string
        ? T[K]
        : FlattenObj<T[K]>;
    }[keyof T]
  : never;
