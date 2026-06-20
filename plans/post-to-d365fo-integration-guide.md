# Post to D365FO Integration Guide

## Overview

This guide provides a step-by-step plan for integrating the Post to D365FO endpoint into any module (Account Receivable, Vendor, etc.). The implementation follows a consistent pattern across all modules.

## Prerequisites

- The module must have a batch workflow similar to accounts receivable
- The module must have a service class (e.g., `AccountReceivable`, `Vendor`)
- The module must have batch view pages with footer and result components

## Required Information

To implement this integration, you only need to provide:

- **Endpoint Path**: The POST endpoint path (e.g., `/DataMigration/AccountReceivable/PostToDFO` or `/DataMigration/Vendor/PostToDFO`)
- **Module Name**: The module identifier used in routes and services (e.g., `accountReceivable`, `vendor`)

## Implementation Steps

### 1. Update Data Batch Interface

**File:** `src/interfaces/data-batch.ts`

The interface should already include:

- `dfoIds?: string[]` - Array of D365FO invoice header IDs
- `dfoPostingErrors?: string[]` - Array of error messages from posting failures

**Status:** ✅ Already completed (shared across all modules)

### 2. Add API Route

**File:** `src/services/core/api-routes.ts`

Add the route constant to the appropriate module section:

```typescript
MODULE_NAME: {
  // ... existing routes
  POST_TO_DFO: '/DataMigration/ModuleName/PostToDFO',
}
```

**Example for Vendor:**

```typescript
VENDOR: {
  // ... existing routes
  POST_TO_DFO: '/DataMigration/Vendor/PostToDFO',
}
```

### 3. Add API Service Method

**File:** `src/services/api/[module-service].ts`

Add the `postToDFO` method to the service class:

```typescript
interface PostToDFOResponse {
  jobId: string;
  message: string;
}

// Inside the service class:
public postToDFO = async (batchId: string): Promise<PostToDFOResponse> => {
  return syncService.save<PostToDFOResponse, { batchId: string }>(
    API_ROUTES.DATA_MIGRATION.MODULE_NAME.POST_TO_DFO,
    { batchId }
  );
};
```

**Example for Vendor:**

```typescript
public postToDFO = async (batchId: string): Promise<PostToDFOResponse> => {
  return syncService.save<PostToDFOResponse, { batchId: string }>(
    API_ROUTES.DATA_MIGRATION.VENDOR.POST_TO_DFO,
    { batchId }
  );
};
```

### 4. Update Submit Batch Hook

**File:** `src/routes/dashboard/[module]/batch/-hooks/use-submit-batch.ts`

Replace the existing implementation with:

```typescript
import { useCallback, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import toast from 'react-hot-toast';

import { useMutation } from '@/hooks/use-mutation';
import { useServices } from '@/hooks/use-services';
import type { TDataBatch } from '@/interfaces/data-batch';
import { useParsedPagination } from '@/hooks/use-parsed-pagination';
import type { ErrorRes } from '@/interfaces/api-res';

export const useSubmitBatch = () => {
  const { dataBatch, [moduleService] } = useServices(); // e.g., accountReceivable, vendor
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]> | null
  >(null);

  const batchNumber = useParams({
    from: '/dashboard/[module]/batch/$batchId', // e.g., '/dashboard/accounts-receivable/batch/$batchId'
  }).batchId;

  const defaultPagination = useParsedPagination();

  const { mutate, isPending } = useMutation({
    operationName: 'post to D365FO',
    mutationFn: (batchId: string) => [moduleService].postToDFO(batchId),
    refetchQueries: [
      [...dataBatch.queryKey, { batchNumber }],
      [...dataBatch.getQueryKey('[module]', defaultPagination)], // e.g., 'accountReceivable', 'vendor'
    ],
    toastMsgs: {
      loading: 'Posting to D365FO...',
      success: '', // Will be replaced in onSuccess
      error: 'Failed to post batch to D365FO',
    },
    onSuccess: (data) => {
      // Dismiss the default success toast and show custom one with jobId
      toast.dismiss();
      const response = data as { jobId: string; message: string };
      toast.success(`Batch queued for posting. Job ID: ${response.jobId}`, {
        duration: 5000,
      });
    },
    onError: (error: ErrorRes) => {
      if (error.code === 400 && error.validationErrors) {
        setValidationErrors(error.validationErrors);
      }
    },
  });

  const onSubmit = useCallback(
    (values: TDataBatch) => {
      mutate(values.id);
    },
    [mutate]
  );

  const closeValidationModal = useCallback(() => {
    setValidationErrors(null);
  }, []);

  return { onSubmit, isPending, validationErrors, closeValidationModal };
};
```

**Key Replacements:**

- `[moduleService]`: The service name from `useServices()` (e.g., `accountReceivable`, `vendor`)
- `[module]`: The module identifier (e.g., `'accountReceivable'`, `'vendor'`)
- Route path: Update the `from` parameter in `useParams`

### 5. Update Batch Footer Component

**File:** `src/routes/dashboard/[module]/batch/-components/batch-footer.tsx`

**Changes needed:**

1. **Update imports:**

```typescript
import CloudUpload from 'lucide-react/dist/esm/icons/cloud-upload';
// Remove: import Rocket from 'lucide-react/dist/esm/icons/rocket';
import { ValidationErrorsModal } from '@/routes/dashboard/accounts-receivable/batch/-components/validation-errors-modal';
```

2. **Update SubmitBtn component:**

```typescript
const SubmitBtn = ({ data }: { data: TDataBatch }) => {
  const { onSubmit, isPending, validationErrors, closeValidationModal } =
    useSubmitBatch();

  const showSubmit = data.status === TDataBatchStatus.Pending;
  const isAlreadyPosted =
    (data.dfoIds && data.dfoIds.length > 0) ||
    (data.dfoPostingErrors && data.dfoPostingErrors.length > 0);
  const isDisabled = isPending || isAlreadyPosted;

  if (!showSubmit)
    return (
      <Button
        asChild
        size='lg'
        disabled={isPending}
        className='sm:max-w-xs ms-auto w-full'
      >
        <Link to={ROUTES.DASHBOARD.[MODULE].BATCH.NEW}>
          <Upload className='size-5' />
          New Entry
        </Link>
      </Button>
    );
  return (
    <>
      <div className='flex sm:flex-row gap-2.5 w-full ms-auto sm:max-w-xl *:flex-1'>
        <Button
          asChild
          size='lg'
          disabled={isPending}
          className={isPending ? 'opacity-50 pointer-events-none' : ''}
        >
          <Link to={ROUTES.DASHBOARD.[MODULE].BATCH.NEW}>
            <Upload className='size-5' />
            New Entry
          </Link>
        </Button>

        <Button
          size='lg'
          variant='success'
          disabled={isDisabled}
          onClick={() => onSubmit(data)}
        >
          <CloudUpload className='size-5' />
          Post to D365FO
        </Button>
      </div>
      {validationErrors && (
        <ValidationErrorsModal
          open={!!validationErrors}
          onClose={closeValidationModal}
          validationErrors={validationErrors}
        />
      )}
    </>
  );
};
```

**Key Replacements:**

- `[MODULE]`: The module constant from ROUTES (e.g., `ACCOUNTS_RECEIVABLE`, `VENDOR`)
- Change button text from "Submit" to "Post to D365FO"
- Change icon from `Rocket` to `CloudUpload`

### 6. Update Batch Result Component

**File:** `src/routes/dashboard/[module]/batch/-components/batch-result.tsx`

**Changes needed:**

1. **Add import:**

```typescript
import { BatchDFOStatus } from '@/routes/dashboard/accounts-receivable/batch/-components/batch-dfo-status';
```

2. **Add DFO status display:**

```typescript
{batch && <BatchDFOStatus batch={batch} />}
```

Add this after the existing `BatchResultAlert` component.

3. **Update alert message:**
   Change the text from:

```typescript
<span className='font-medium px-1'>Submit</span>
to send them to Dynamics.
```

To:

```typescript
<span className='font-medium px-1'>Post to D365FO</span>
to send them to Dynamics 365 Finance & Operations.
```

## Shared Components

The following components are shared and can be reused across all modules:

1. **Validation Errors Modal**
   - Location: `src/routes/dashboard/accounts-receivable/batch/-components/validation-errors-modal.tsx`
   - Import from: `@/routes/dashboard/accounts-receivable/batch/-components/validation-errors-modal`

2. **DFO Status Component**
   - Location: `src/routes/dashboard/accounts-receivable/batch/-components/batch-dfo-status.tsx`
   - Import from: `@/routes/dashboard/accounts-receivable/batch/-components/batch-dfo-status`

These components are generic and work with any module's batch data.

## API Response Format

### Success Response (200)

```typescript
{
  status: {
    code: 200,
    message: "Success"
  },
  meta: {
    requestId: string,
    timestamp: string,
    path: string,
    method: string
  },
  data: {
    jobId: string,        // Queue job ID for tracking
    message: string       // Status message
  }
}
```

### Error Response (400 - Validation Failed)

```typescript
{
  status: {
    code: 400,
    userMessage: "Some fields are invalid. Please review and try again.",
    developerMessage: "Validation failed for invoice data",
    errorCode: "VAL_001",
    validationErrors: {
      "Invoice[0].Header": [
        "Missing required field: PostingProfile",
        "Missing required field: SalesTaxGroupId"
      ],
      "Invoice[0].Line[1]": [
        "Missing required field: Quantity",
        "Missing required field: UnitPrice"
      ]
    }
  },
  meta: { ... },
  data: null
}
```

### Error Response (404 - Batch Not Found)

```typescript
{
  status: {
    code: 404,
    userMessage: "The requested resource was not found.",
    developerMessage: "Batch with ID {batchId} not found",
    errorCode: "RES_404"
  },
  meta: { ... },
  data: null
}
```

## Validation Error Format

The `validationErrors` object has the following structure:

```typescript
{
  "Invoice[X].Header": ["Missing required field: Field1", "Missing required field: Field2"],
  "Invoice[X].Line[Y]": ["Missing required field: Field3"]
}
```

**Key Format:**

- `Invoice[X].Header` - Header validation errors for invoice at index X
- `Invoice[X].Line[Y]` - Line validation errors for line number Y in invoice at index X

**Value Format:**

- Array of strings with format: `"Missing required field: {FieldName}"`

## Testing Checklist

- [ ] API route added to `api-routes.ts`
- [ ] Service method `postToDFO` added to service class
- [ ] Submit batch hook updated to use `postToDFO`
- [ ] Batch footer button renamed to "Post to D365FO"
- [ ] Batch footer button icon changed to `CloudUpload`
- [ ] Validation errors modal integrated
- [ ] DFO status component integrated in batch result
- [ ] Alert message updated to reference "Post to D365FO"
- [ ] Button disabled when batch already posted
- [ ] Success toast shows job ID
- [ ] Validation errors displayed in modal on 400 error
- [ ] Batch data refetches after successful post

## Quick Reference: Module-Specific Values

When implementing for a new module, replace these placeholders:

| Placeholder       | Example (Account Receivable)                    | Example (Vendor)                   |
| ----------------- | ----------------------------------------------- | ---------------------------------- |
| `[moduleService]` | `accountReceivable`                             | `vendor`                           |
| `[MODULE]`        | `ACCOUNTS_RECEIVABLE`                           | `VENDOR`                           |
| `[module]`        | `'accountReceivable'`                           | `'vendor'`                         |
| Route path        | `/dashboard/accounts-receivable/batch/$batchId` | `/dashboard/vendor/batch/$batchId` |
| Endpoint          | `/DataMigration/AccountReceivable/PostToDFO`    | `/DataMigration/Vendor/PostToDFO`  |

## Notes

- The endpoint returns immediately after validation and enqueueing
- Actual posting happens asynchronously in the background
- Check `dfoIds` for successful posting (contains invoice IDs)
- Check `dfoPostingErrors` for failed posting (contains error messages)
- Batch status will be updated to "Processing" when posting starts
- Batch status will be updated to "Completed" on success or "Canceled" on failure
- Validation errors are returned immediately if data is invalid (before enqueueing)
