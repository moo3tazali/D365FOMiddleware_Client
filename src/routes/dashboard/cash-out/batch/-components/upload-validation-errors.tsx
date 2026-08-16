import { useState } from 'react';
import AlertCircleIcon from 'lucide-react/dist/esm/icons/alert-circle';

import type { ErrorRes } from '@/interfaces/api-res';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const INITIAL_VISIBLE_ERRORS = 50;

export interface UploadValidationItem {
  location: string;
  message: string;
}

export function getUploadValidationItems(
  error: ErrorRes | null | undefined,
): UploadValidationItem[] {
  if (!error?.validationErrors) return [];

  return Object.entries(error.validationErrors).flatMap(
    ([location, messages]) => {
      const normalizedMessages = Array.isArray(messages)
        ? messages
        : [String(messages)];
      return normalizedMessages.map((message) => ({ location, message }));
    },
  );
}

export const UploadValidationErrors = ({ error }: { error: ErrorRes }) => {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_ERRORS);
  const errors = getUploadValidationItems(error);
  const visibleErrors = errors.slice(0, visibleCount);
  const hiddenCount = errors.length - visibleErrors.length;

  if (errors.length === 0) return null;

  return (
    <section
      aria-labelledby='cash-out-upload-validation-title'
      className='overflow-hidden rounded-xl border border-destructive/25 bg-destructive/5'
    >
      <div className='flex items-start gap-3 border-b border-destructive/15 px-5 py-4'>
        <div className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10'>
          <AlertCircleIcon className='size-4 text-destructive' />
        </div>
        <div className='space-y-1'>
          <h4
            id='cash-out-upload-validation-title'
            className='text-sm font-semibold text-foreground'
          >
            {errors.length.toLocaleString('en-US')} validation error
            {errors.length === 1 ? '' : 's'} found
          </h4>
          <p className='text-sm text-muted-foreground'>
            {error.message} Review the affected source lines below, correct the
            Excel file, and upload it again.
          </p>
        </div>
      </div>

      <div className='max-h-[28rem] overflow-y-auto p-3 sm:p-4'>
        <div className='space-y-2'>
          {visibleErrors.map((validationError, index) => (
            <div
              key={`${validationError.location}-${validationError.message}-${index}`}
              className='rounded-lg border border-border bg-background px-4 py-3 shadow-sm'
            >
              <Badge variant='outline' color='muted' size='small'>
                {validationError.location}
              </Badge>
              <p className='mt-2 text-sm leading-relaxed text-foreground'>
                {validationError.message}
              </p>
            </div>
          ))}
        </div>
      </div>

      {(hiddenCount > 0 || visibleCount > INITIAL_VISIBLE_ERRORS) && (
        <div className='flex flex-wrap justify-end gap-2 border-t border-destructive/15 px-4 py-3'>
          {visibleCount > INITIAL_VISIBLE_ERRORS && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => setVisibleCount(INITIAL_VISIBLE_ERRORS)}
            >
              Show first {INITIAL_VISIBLE_ERRORS}
            </Button>
          )}
          {hiddenCount > 0 && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() =>
                setVisibleCount((current) =>
                  Math.min(current + INITIAL_VISIBLE_ERRORS, errors.length),
                )
              }
            >
              Show next {Math.min(INITIAL_VISIBLE_ERRORS, hiddenCount)} (
              {hiddenCount.toLocaleString('en-US')} remaining)
            </Button>
          )}
        </div>
      )}
    </section>
  );
};
