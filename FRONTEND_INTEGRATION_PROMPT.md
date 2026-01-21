# Frontend Integration Guide: Post Batch to D365FO Endpoint

## Overview
A new endpoint has been added to post account receivable batches to D365FO (Dynamics 365 Finance & Operations). This endpoint validates the batch data, enqueues the posting job, and returns immediately. The actual posting happens asynchronously via a queue.

## New Endpoint

### POST `/api/v1/DataMigration/AccountReceivable/PostToDFO`

**Request Body:**
```typescript
{
  batchId: string; // Required - The ID of the batch to post
}
```

**Success Response (200):**
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

**Error Response (400 - Validation Failed):**
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
      ],
      "Invoice[0].Line[2]": [
        "Missing required field: BillingCode"
      ]
    }
  },
  meta: {
    requestId: string,
    timestamp: string,
    path: string,
    method: string
  },
  data: null
}
```

**Error Response (404 - Batch Not Found):**
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

## Updated Batch Model

The batch object now includes two new optional properties:

```typescript
interface DataBatch {
  id: string;
  company: string;
  // ... existing properties ...
  dfoIds?: string[];              // NEW: Array of D365FO invoice header IDs (InvoiceIdentifier as strings)
  dfoPostingErrors?: string[];    // NEW: Array of error messages from D365FO posting failures
  // ... other properties ...
}
```

### Property Details

**`dfoIds` (string[]):**
- Contains the D365FO `InvoiceIdentifier` values (as strings) for successfully posted invoices
- Only populated after successful posting to D365FO
- Empty or undefined if posting hasn't been attempted or failed
- Example: `["5637743016", "5637743017", "5637743018"]`

**`dfoPostingErrors` (string[]):**
- Contains error messages from D365FO posting failures
- Only populated if posting to D365FO failed
- Empty or undefined if posting succeeded or hasn't been attempted
- Example: `["Error posting header: Invalid customer account", "Rollback failed for header 5637743016: Header not found"]`

## Implementation Requirements

### 1. Post to DFO Button/Action

Add a button or action in the batch details/list view to trigger posting:

```typescript
// Example implementation
const handlePostToDFO = async (batchId: string) => {
  try {
    setLoading(true);
    const response = await api.post('/DataMigration/AccountReceivable/PostToDFO', {
      batchId
    });
    
    // Show success message with job ID
    showSuccess(`Batch queued for posting. Job ID: ${response.data.data.jobId}`);
    
    // Optionally poll or refresh batch status to check dfoIds/dfoPostingErrors
    setTimeout(() => refreshBatch(batchId), 5000);
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);
  }
};
```

### 2. Display Validation Errors

When validation fails (400 response), display the errors in a user-friendly format:

```typescript
// Example error handling
const handlePostToDFOError = (error: ApiError) => {
  if (error.response?.status === 400 && error.response?.data?.status?.validationErrors) {
    const validationErrors = error.response.data.status.validationErrors;
    
    // Format errors for display
    const errorList = Object.entries(validationErrors).map(([key, messages]) => {
      const location = key.includes('Line') 
        ? `Invoice ${key.match(/\[(\d+)\]/)?.[1]}, Line ${key.match(/Line\[(\d+)\]/)?.[1]}`
        : `Invoice ${key.match(/\[(\d+)\]/)?.[1]} Header`;
      
      return {
        location,
        fields: messages.map((msg: string) => msg.replace('Missing required field: ', ''))
      };
    });
    
    // Display in UI (e.g., modal, alert, or inline)
    showValidationErrors(errorList);
  } else {
    // Handle other errors
    showError(error.response?.data?.status?.userMessage || 'An error occurred');
  }
};
```

**UI Display Example:**
```
Validation Failed

The following invoices have missing required fields:

Invoice 0 Header:
  • PostingProfile
  • SalesTaxGroupId

Invoice 0, Line 1:
  • Quantity
  • UnitPrice

Invoice 0, Line 2:
  • BillingCode
```

### 3. Display DFO Posting Status

In the batch details view, show the posting status:

```typescript
// Example component
const BatchDFOStatus = ({ batch }: { batch: DataBatch }) => {
  if (!batch.dfoIds && !batch.dfoPostingErrors) {
    return <div>Not posted to D365FO yet</div>;
  }
  
  if (batch.dfoPostingErrors && batch.dfoPostingErrors.length > 0) {
    return (
      <div className="error-status">
        <h4>Posting Failed</h4>
        <ul>
          {batch.dfoPostingErrors.map((error, idx) => (
            <li key={idx}>{error}</li>
          ))}
        </ul>
      </div>
    );
  }
  
  if (batch.dfoIds && batch.dfoIds.length > 0) {
    return (
      <div className="success-status">
        <h4>Successfully Posted to D365FO</h4>
        <p>{batch.dfoIds.length} invoice(s) created</p>
        <details>
          <summary>View Invoice IDs</summary>
          <ul>
            {batch.dfoIds.map((id, idx) => (
              <li key={idx}>Invoice ID: {id}</li>
            ))}
          </ul>
        </details>
      </div>
    );
  }
  
  return null;
};
```

### 4. Polling/Refresh Strategy

Since posting happens asynchronously, implement a polling mechanism:

```typescript
// Option 1: Manual refresh button
<button onClick={() => refreshBatch(batchId)}>
  Check Posting Status
</button>

// Option 2: Auto-poll after posting
const pollBatchStatus = async (batchId: string, maxAttempts = 20) => {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
    
    const batch = await fetchBatch(batchId);
    
    if (batch.dfoIds || batch.dfoPostingErrors) {
      // Posting completed (success or failure)
      return batch;
    }
    
    if (batch.status !== 'Processing') {
      // Status changed but no DFO data yet
      break;
    }
  }
  
  return null; // Timeout
};
```

## Validation Error Structure

The `validationErrors` object in the 400 response has the following structure:

```typescript
{
  "Invoice[0].Header": ["Missing required field: Field1", "Missing required field: Field2"],
  "Invoice[0].Line[1]": ["Missing required field: Field3"],
  "Invoice[1].Header": ["Missing required field: Field4"],
  "Invoice[1].Line[2]": ["Missing required field: Field5", "Missing required field: Field6"]
}
```

**Key Format:**
- `Invoice[X].Header` - Header validation errors for invoice at index X
- `Invoice[X].Line[Y]` - Line validation errors for line number Y in invoice at index X

**Value Format:**
- Array of strings with format: `"Missing required field: {FieldName}"`

## Required Fields Reference

### Header Required Fields:
- `DefaultDimensionDisplayValue`
- `PostingProfile`
- `InvoiceAccount`
- `CustomerAccount`
- `SalesTaxGroupId`
- `TermsOfPayment`
- `BillingClassification`
- `SalesTaxItemGroupId` (conditional - only if `SalesTaxGroupId` is not non-taxable)

### Line Required Fields:
- `LineNumber`
- `BillingCode`
- `Description`
- `UnitPrice`
- `Quantity`
- `MainAccountDisplayValue`
- `DefaultDimensionDisplayValue`
- `SalesTaxGroupId`
- `SalesTaxItemGroupId` (conditional - only if `SalesTaxGroupId` is not non-taxable)

## User Flow Recommendations

1. **Before Posting:**
   - Show batch details
   - Display batch status (Pending, Processing, Completed, Canceled)
   - Show "Post to D365FO" button (disabled if already posted or processing)

2. **During Posting:**
   - Show loading state
   - Display "Posting in progress..." message
   - Optionally show progress indicator

3. **After Posting (Success):**
   - Show success message with job ID
   - Display `dfoIds` count and list
   - Update batch status display

4. **After Posting (Failure):**
   - Show error message
   - Display `dfoPostingErrors` array
   - Allow user to retry after fixing issues

5. **Validation Errors:**
   - Display in a clear, organized format
   - Group by invoice and line number
   - Highlight missing fields
   - Provide actionable guidance

## Example API Integration

```typescript
// API service method
export const postBatchToDFO = async (batchId: string): Promise<PostToDFOResult> => {
  const response = await axios.post(
    '/api/v1/DataMigration/AccountReceivable/PostToDFO',
    { batchId },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data.data;
};

// Usage in component
const handlePost = async () => {
  try {
    const result = await postBatchToDFO(selectedBatchId);
    toast.success(`Posted! Job ID: ${result.jobId}`);
    // Refresh batch data after a delay
    setTimeout(() => fetchBatchDetails(selectedBatchId), 5000);
  } catch (error: any) {
    if (error.response?.status === 400) {
      const validationErrors = error.response.data.status.validationErrors;
      showValidationErrorsModal(validationErrors);
    } else {
      toast.error(error.response?.data?.status?.userMessage || 'Failed to post batch');
    }
  }
};
```

## Notes

- The endpoint returns immediately after validation and enqueueing
- Actual posting happens asynchronously in the background
- Check `dfoIds` for successful posting (contains invoice IDs)
- Check `dfoPostingErrors` for failed posting (contains error messages)
- Batch status will be updated to "Processing" when posting starts
- Batch status will be updated to "Completed" on success or "Canceled" on failure
- Validation errors are returned immediately if data is invalid (before enqueueing)
