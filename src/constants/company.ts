/**
 * Legal entities (D365FO dataAreaId values) an upload can target.
 * Keep in sync with the backend's SUPPORTED_COMPANY_CODES.
 */
export const COMPANY_CODES = {
  MESCO_PORT: 'm-p',
  MAS: 'mas',
} as const;

export type CompanyCode = (typeof COMPANY_CODES)[keyof typeof COMPANY_CODES];

export const COMPANY_OPTIONS: ReadonlyArray<{
  value: CompanyCode;
  label: string;
}> = [
  { value: COMPANY_CODES.MESCO_PORT, label: 'M-P (m-p)' },
  { value: COMPANY_CODES.MAS, label: 'MAS (mas)' },
];

export const isCompanyCode = (value: unknown): value is CompanyCode =>
  COMPANY_OPTIONS.some((option) => option.value === value);

/** Display label for a company code; unknown values are shown as-is. */
export const getCompanyLabel = (code: string | null | undefined): string => {
  if (!code) return '—';
  return COMPANY_OPTIONS.find((option) => option.value === code)?.label ?? code;
};

export const COMPANY_REQUIRED_MESSAGE = 'Please select a company.';

/** Throws before any request is sent when the company is missing or unsupported. */
export function assertUploadCompany(
  companyId: unknown,
): asserts companyId is CompanyCode {
  if (!isCompanyCode(companyId)) {
    throw new Error(COMPANY_REQUIRED_MESSAGE);
  }
}

/** Tuple of supported codes, for z.enum in search and form schemas. */
export const COMPANY_CODE_VALUES = COMPANY_OPTIONS.map(
  (option) => option.value,
) as [CompanyCode, ...CompanyCode[]];
