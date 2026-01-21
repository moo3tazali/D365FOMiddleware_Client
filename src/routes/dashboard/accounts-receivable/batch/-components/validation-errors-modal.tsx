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
  invoiceIndex: number;
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
                  ? `Invoice ${error.invoiceIndex} Header`
                  : `Invoice ${error.invoiceIndex}, Line ${error.lineNumber}`}
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

function parseValidationErrors(
  validationErrors: Record<string, string[]>
): ParsedError[] {
  const grouped = new Map<string, ParsedError>();

  for (const [key, messages] of Object.entries(validationErrors)) {
    // Parse key format: "Invoice[0].Header" or "Invoice[0].Line[1]"
    const headerMatch = key.match(/Invoice\[(\d+)\]\.Header/);
    const lineMatch = key.match(/Invoice\[(\d+)\]\.Line\[(\d+)\]/);

    if (headerMatch) {
      const invoiceIndex = parseInt(headerMatch[1], 10);
      const mapKey = `invoice-${invoiceIndex}-header`;

      if (!grouped.has(mapKey)) {
        grouped.set(mapKey, {
          invoiceIndex,
          location: 'Header',
          fields: [],
        });
      }

      const error = grouped.get(mapKey)!;
      // Extract field names from messages like "Missing required field: PostingProfile"
      const fields = messages.map((msg) =>
        msg.replace(/^Missing required field:\s*/i, '')
      );
      error.fields.push(...fields);
    } else if (lineMatch) {
      const invoiceIndex = parseInt(lineMatch[1], 10);
      const lineNumber = parseInt(lineMatch[2], 10);
      const mapKey = `invoice-${invoiceIndex}-line-${lineNumber}`;

      if (!grouped.has(mapKey)) {
        grouped.set(mapKey, {
          invoiceIndex,
          location: 'Line',
          lineNumber,
          fields: [],
        });
      }

      const error = grouped.get(mapKey)!;
      // Extract field names from messages
      const fields = messages.map((msg) =>
        msg.replace(/^Missing required field:\s*/i, '')
      );
      error.fields.push(...fields);
    }
  }

  // Convert map to array and sort by invoice index, then by location (Header first)
  return Array.from(grouped.values()).sort((a, b) => {
    if (a.invoiceIndex !== b.invoiceIndex) {
      return a.invoiceIndex - b.invoiceIndex;
    }
    if (a.location === 'Header' && b.location === 'Line') return -1;
    if (a.location === 'Line' && b.location === 'Header') return 1;
    if (a.location === 'Line' && b.location === 'Line') {
      return (a.lineNumber || 0) - (b.lineNumber || 0);
    }
    return 0;
  });
}
