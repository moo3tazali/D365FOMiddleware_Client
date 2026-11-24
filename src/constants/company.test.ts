import { describe, expect, it } from 'vitest';

import {
  COMPANY_CODE_VALUES,
  COMPANY_CODES,
  COMPANY_REQUIRED_MESSAGE,
  assertUploadCompany,
  getCompanyLabel,
  isCompanyCode,
} from './company';
import { CompanyFilterQuerySchema } from '@/components/company-filter';

describe('company codes', () => {
  it('lists exactly the supported legal entities', () => {
    expect(Object.values(COMPANY_CODES)).toEqual(['m-p', 'mas']);
    expect(COMPANY_CODE_VALUES).toEqual(['m-p', 'mas']);
  });

  it('accepts only supported codes', () => {
    expect(isCompanyCode('mas')).toBe(true);
    expect(isCompanyCode('m-p')).toBe(true);
    expect(isCompanyCode('MAS')).toBe(false);
    expect(isCompanyCode('')).toBe(false);
    expect(isCompanyCode(undefined)).toBe(false);
  });

  it('shows labels for known codes and the raw code for unknown ones', () => {
    expect(getCompanyLabel('mas')).toBe('MAS (mas)');
    expect(getCompanyLabel('m-p')).toBe('M-P (m-p)');
    expect(getCompanyLabel('acme')).toBe('acme');
    expect(getCompanyLabel(undefined)).toBe('—');
  });

  it('refuses to send an upload without a supported company', () => {
    expect(() => assertUploadCompany('mas')).not.toThrow();
    expect(() => assertUploadCompany('')).toThrow(COMPANY_REQUIRED_MESSAGE);
    expect(() => assertUploadCompany(undefined)).toThrow(
      COMPANY_REQUIRED_MESSAGE,
    );
  });
});

describe('company filter query', () => {
  it('parses a server filter value and rejects unknown companies', () => {
    expect(CompanyFilterQuerySchema.parse({ company: 'mas' })).toEqual({
      company: 'mas',
    });
    expect(CompanyFilterQuerySchema.parse({})).toEqual({});
    expect(
      CompanyFilterQuerySchema.safeParse({ company: 'acme' }).success,
    ).toBe(false);
  });
});
