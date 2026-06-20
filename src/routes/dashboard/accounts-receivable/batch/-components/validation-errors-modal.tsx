import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/modal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AlertCircleIcon from 'lucide-react/dist/esm/icons/alert-circle';

interface ValidationErrorsModalProps {
  open: boolean;
  onClose: () => void;
  validationErrors: Record<string, string[]>;
}

interface ParsedError {
  /** Invoice index from API, or null when API returns "Invoice[?]" */
  invoiceIndex: number | null;
  location: 'Header' | 'Line';
  lineNumber?: number;
  fields: string[];
}

export const ValidationErrorsModal = ({
  open,
  onClose,
  validationErrors,
}: ValidationErrorsModalProps) => {
  const parsedErrors = parseValidationErrors(validationErrors);

  return (
    <ResponsiveModal open={open} onOpenChange={onClose}>
      <ResponsiveModalContent side='bottom' className='max-h-[80vh]'>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Validation Failed</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            The following invoices have missing required fields:
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className='space-y-4 py-4'>
          {parsedErrors.map((error, index) => (
            <Alert key={index} variant='destructive'>
              <AlertCircleIcon />
              <AlertTitle>
                {error.location === 'Header'
                  ? `Invoice ${error.invoiceIndex ?? '?'} Header`
                  : `Invoice ${error.invoiceIndex ?? '?'}, Line ${error.lineNumber}`}
              </AlertTitle>
              <AlertDescription>
                <ul className='list-disc list-inside space-y-1 mt-2'>
                  {error.fields.map((field, fieldIndex) => (
                    <li key={fieldIndex}>{field}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
};

/** Matches "Invoice[0].Header", "Invoice[?].Header" */
const HEADER_REGEX = /Invoice\[(\d+|\?)\]\.Header/;
/** Matches "Invoice[0].Line[1]", "Invoice[?].Line[1]" */
const LINE_REGEX = /Invoice\[(\d+|\?)\]\.Line\[(\d+)\]/;

function parseValidationErrors(
  validationErrors: Record<string, string[]>,
): ParsedError[] {
  const grouped = new Map<string, ParsedError>();

  for (const [key, messages] of Object.entries(validationErrors)) {
    const headerMatch = key.match(HEADER_REGEX);
    const lineMatch = key.match(LINE_REGEX);

    if (headerMatch) {
      const rawIndex = headerMatch[1];
      const invoiceIndex = rawIndex === '?' ? null : parseInt(rawIndex, 10);
      const mapKey = `invoice-${rawIndex}-header`;

      if (!grouped.has(mapKey)) {
        grouped.set(mapKey, {
          invoiceIndex,
          location: 'Header',
          fields: [],
        });
      }

      const error = grouped.get(mapKey)!;
      const fields = messages.map((msg) =>
        msg.replace(/^Missing required field:\s*/i, ''),
      );
      error.fields.push(...fields);
    } else if (lineMatch) {
      const rawIndex = lineMatch[1];
      const invoiceIndex = rawIndex === '?' ? null : parseInt(rawIndex, 10);
      const lineNumber = parseInt(lineMatch[2], 10);
      const mapKey = `invoice-${rawIndex}-line-${lineNumber}`;

      if (!grouped.has(mapKey)) {
        grouped.set(mapKey, {
          invoiceIndex,
          location: 'Line',
          lineNumber,
          fields: [],
        });
      }

      const error = grouped.get(mapKey)!;
      const fields = messages.map((msg) =>
        msg.replace(/^Missing required field:\s*/i, ''),
      );
      error.fields.push(...fields);
    }
  }

  return Array.from(grouped.values()).sort((a, b) => {
    const aIdx = a.invoiceIndex ?? -1;
    const bIdx = b.invoiceIndex ?? -1;
    if (aIdx !== bIdx) return aIdx - bIdx;
    if (a.location === 'Header' && b.location === 'Line') return -1;
    if (a.location === 'Line' && b.location === 'Header') return 1;
    if (a.location === 'Line' && b.location === 'Line') {
      return (a.lineNumber || 0) - (b.lineNumber || 0);
    }
    return 0;
  });
}
