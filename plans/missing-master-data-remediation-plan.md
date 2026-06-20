# Missing Customer Remediation: Corrective Implementation Plan

## Merge Status

**Merge blocked.**

The current implementation must not merge until all critical phases and merge gates in this document pass.

## Scope

This plan corrects the existing inline customer creation and batch reprocessing implementation. It preserves the current endpoints:

- `GET /DataMigration/DataBatch/:batchId/missing-master-data`
- `POST /Finance/MasterData/customers/from-missing-data/:missingDataId`
- `POST /DataMigration/DataBatch/:batchId/reprocess`

The first supported missing master-data type remains `customer`.

## Phase 1: Separate Customer Creation From Reprocessing

Customer creation and batch reprocessing are separate state transitions. A successful D365FO POST must remain successful even if cache updates or reprocessing fail later.

Replace the overloaded missing-data `status` lifecycle with explicit states:

```ts
type CustomerCreationStatus =
  | 'missing'
  | 'creating'
  | 'created'
  | 'create_failed';

type BatchReprocessStatus =
  | 'not_started'
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed';
```

Add fields to `data_batch_missing_master_data`:

```ts
creationStatus: CustomerCreationStatus;
reprocessStatus: BatchReprocessStatus;
createdData?: Record<string, unknown>;
createErrorMessage?: string;
reprocessErrorMessage?: string;
reprocessAttempts: number;
```

Creation command behavior:

1. Atomically claim a record with `creationStatus` equal to `missing` or `create_failed`.
2. Validate backend authority rules from Phase 5.
3. Check D365FO for an existing matching customer before POST.
4. POST only when no matching D365FO customer exists.
5. Persist `createdData` from the D365FO response.
6. Set `creationStatus: "created"` and `reprocessStatus: "pending"`.
7. Update both local validation stores from Phase 4.
8. Request reprocessing as a separate operation.
9. Return customer creation success even if reprocessing fails.

Retry behavior:

- If `creationStatus === "created"` or `createdData` exists, never POST again.
- Retry only cache repair and batch reprocessing.
- If the first D365FO POST timed out ambiguously, query D365FO by the stored missing identifier before deciding to POST again.

Recommended response:

```ts
type CreateCustomerFromMissingDataResponse = {
  customer: ICustomer;
  creationStatus: 'created';
  reprocessStatus: BatchReprocessStatus;
  reprocessErrorMessage?: string;
};
```

## Phase 2: Normalize Missing Record Identity

The repository must return application DTOs, not raw lean Mongo documents.

Add an interface such as:

```ts
type IDataBatchMissingMasterData = {
  id: string;
  batchId: string;
  company: string;
  entryProcessorType: EntryProcessorTypes;
  type: 'customer';
  missingField: 'CustomerAccount' | 'TaxExemptNumber';
  missingValue: string;
  creationStatus: CustomerCreationStatus;
  reprocessStatus: BatchReprocessStatus;
  affectedCount: number;
  formDefaults?: Record<string, unknown>;
  readonlyFormFields: string[];
  createdData?: Record<string, unknown>;
  createErrorMessage?: string;
  reprocessErrorMessage?: string;
};
```

Update `DataBatchMissingMasterDataMongoRepository.getList()` and `findById()` to map:

```ts
id: document._id.toString();
```

Do not expose or consume `_id` in the frontend.

## Phase 3: Register Missing Customers Across Every Processor Family

All enhanced record models must support the same required missing-master-data contract.

### Shared model contract

Make `AddMissingMasterData()` and `GetMissingMasterData()` mandatory on `DynDataModel`; do not leave them optional.

Refactor `EntryDynDataModel` to extend the shared `DynDataModel` instead of maintaining a separate private error implementation. This gives the contract to:

- Cash processors through `CashEntryDynDataModel`
- Vendor processors through `VendorEntryDynDataModel`
- AR processors through `DynAccountReceivableLineModel`
- Closing processors through `DynClosingJournalEntryModel`

The shared registration payload remains:

```ts
type MissingMasterDataItem = {
  type: 'customer';
  missingField: 'CustomerAccount' | 'TaxExemptNumber';
  missingValue: string;
  formDefaults: Record<string, unknown>;
};
```

### Customer-account validation

`DimensionValidationService` owns registration when a non-empty `Customer` or `SubCustomer` dimension value is absent from `financial_dimension_values`.

Use canonical API field names:

```ts
missingField: 'CustomerAccount';
formDefaults: {
  CustomerAccount: missingValue;
}
```

Register once per enhanced record even when both Customer and SubCustomer contain the same missing account.

### AR Yard tax-number validation

`AccountReceivableYardEntryProcessor.resolveCustomerAccount()` must register directly when lookup by normalized tax number fails:

```ts
missingField: 'TaxExemptNumber';
missingValue: normalizedTaxNumber;
formDefaults: {
  TaxExemptNumber: normalizedTaxNumber;
}
```

Do not wait for shared dimension validation because Yard returns an empty customer account after the tax lookup fails.

Do not register an empty tax number as creatable master data. Keep it as a normal source validation error.

### Processor coverage matrix

Add parameterized tests proving missing customer registration for:

- AR Freight
- AR Freight Credit Note
- AR Trucking
- AR Trucking Credit Note
- AR Yard
- Cash In Freight
- Cash In Trucking
- Cash Out Freight
- Cash Out Trucking
- Vendor Freight
- Vendor Trucking
- Vendor Payment Freight
- Vendor Payment Trucking
- Closing Freight
- Closing Freight Difference
- Closing Trucking

`ClosingCustodySettlementEntryProcessor` is excluded while its customer dimensions remain disabled.

## Phase 4: Update the Validation Sources Used During Reprocessing

Customer creation must update both stores used by current processors:

1. `customers`
   - Used by AR Yard to resolve `TaxExemptNumber -> CustomerAccount`.
2. `financial_dimension_values`
   - Used by shared Customer/SubCustomer dimension validation.

After D365FO creation succeeds:

```ts
await masterDataService.upsertCustomersAsync(company, [mappedCustomer]);
await masterDataService.upsertFinancialDimensionValuesAsync([
  {
    financialDimensionKey: 'Customer',
    value: createdCustomer.CustomerAccount,
    description: createdCustomer.Name,
    isSuspended: 'No',
    isBlockedForManualEntry: 'No',
    isTotal: 'No',
  },
]);
```

Use the returned D365FO customer as the source of truth.

Before reprocessing, verify:

- the customer exists in `customers`;
- the customer account exists under the `Customer` financial dimension;
- a tax-number remediation can resolve through the Yard customer lookup.

A full customer or financial-dimension sync is not required for this workflow.

## Phase 5: Enforce Backend Authority And Idempotency

The backend owns all immutable identifiers.

Before creating or retrying:

1. Load the missing-data record or return 404.
2. Require `type === "customer"`.
3. Load the related batch or return 404.
4. Require `batch.status === DataBatchStatus.PendingPosting`.
5. Reject `creationStatus === "creating"`.
6. If already created, return the existing created customer and retry only pending/failed reprocessing.

Identifier rules:

- `missingField === "CustomerAccount"`:
  - force `CustomerAccount = missingValue`;
  - reject a different DTO customer account.
- `missingField === "TaxExemptNumber"`:
  - force `TaxExemptNumber = missingValue`;
  - reject a different DTO tax number;
  - allow the user to supply the new customer account.

After D365FO responds, verify:

- `dataAreaId` matches the batch company;
- CustomerAccount remediation returns the expected `CustomerAccount`;
- TaxExemptNumber remediation returns the expected normalized `TaxExemptNumber`.

Never log the complete customer payload or full D365FO response.

## Phase 6: Make Batch Reprocessing Non-Destructive

### Concurrency lock

Add an atomic repository operation:

```ts
claimForRevalidation(
  batchId: string,
): Promise<IDataBatch | null>;
```

It must update only:

```ts
{ _id: batchId, status: DataBatchStatus.PendingPosting }
```

to:

```ts
{
  status: DataBatchStatus.Revalidating;
}
```

If no document is updated, return HTTP 409. Do not allow a second call while already `Revalidating`.

### Validation generations

Do not delete the active enhanced records or errors before replacement data is ready.

Add:

```ts
DataBatch.activeValidationRunId: string;
DataEnhancedRecord.validationRunId: string;
DataBatchError.validationRunId: string;
```

Reprocessing algorithm:

1. Claim the batch atomically.
2. Load source records.
3. Reject an empty source set without changing active data.
4. Format and validate entirely before persistence.
5. Generate a new `validationRunId`.
6. Insert new enhanced records and errors under that run ID.
7. Update missing-master-data records for the new result.
8. Atomically switch `DataBatch.activeValidationRunId` to the new run and update counts/status.
9. Delete records from older validation runs after the switch.

All enhanced/error reads and downloads must filter by the batch's `activeValidationRunId`.

On failure:

- keep the previous active validation run unchanged;
- return batch status to `PendingPosting`;
- set the relevant missing record's `reprocessStatus: "failed"` and error message;
- allow a safe reprocess retry without recreating the customer.

## Phase 7: Reset Frontend Modal State

Reset all form fields whenever `missingRecord.id` changes.

Preferred implementation:

```tsx
<CreateCustomerModal
  key={selectedRecord.id}
  missingRecord={selectedRecord}
  ...
/>
```

Also derive readonly behavior from `readonlyFormFields` rather than only comparing a hardcoded field string.

After customer creation:

- show creation success independently from reprocessing;
- show `Reprocessing`, `Resolved`, or `Reprocessing failed`;
- offer `Retry reprocessing` when creation succeeded but reprocessing failed;
- never offer `Create customer` again for a created record.

## Phase 8: Tests

### Backend creation tests

Add tests for `CreateCustomerFromMissingDataHandler`:

1. D365FO creation succeeds and reprocessing succeeds.
2. D365FO creation succeeds but reprocessing fails:
   - creation remains `created`;
   - `createdData` remains stored;
   - reprocess status becomes `failed`;
   - response does not claim customer creation failed.
3. Retry after reprocessing failure does not call D365FO POST again.
4. Existing matching D365FO customer is reused after an ambiguous prior failure.
5. Missing record does not exist.
6. Missing record is not a customer.
7. Batch is not `PendingPosting`.
8. Record is already being created.
9. DTO CustomerAccount conflicts with stored missing value.
10. DTO TaxExemptNumber conflicts with stored missing value.
11. D365FO response does not match the stored identifier.

### Repository tests

Use a real test MongoDB for repository behavior:

1. `getList()` maps `_id` to `id`.
2. `findById()` maps `_id` to `id`.
3. Unique batch/type/field/value index prevents duplicates.
4. Creation claim is atomic.
5. Revalidation claim is atomic.

### Processor tests

Use parameterized tests for the processor coverage matrix from Phase 3.

Include explicit Yard cases:

- unknown non-empty tax number registers one `TaxExemptNumber` candidate;
- duplicate affected Yard rows deduplicate at batch persistence;
- empty tax number produces an error but no creatable candidate.

### Cache and reprocessing tests

1. Created customer is inserted into `customers`.
2. Created customer account is inserted into `financial_dimension_values`.
3. AR Yard reprocessing resolves a tax-number missing customer.
4. Shared dimension validation resolves a customer-account missing customer.
5. Reprocessing failure leaves the old active validation run readable.
6. Concurrent reprocessing returns 409.
7. Empty source records do not replace active enhanced records/errors.

### Frontend tests

1. API record `id` is passed to customer creation.
2. Selecting another missing record resets modal values.
3. Stored missing identifier is readonly.
4. Created customer with failed reprocessing shows retry, not create.
5. Successful retry refreshes missing data, batch, and error queries.

## Phase 9: Secondary Tooling Fix

Add the missing frontend dev dependency required by the current ESLint configuration:

```text
eslint-config-prettier
```

Then run lint without auto-fix on the changed frontend files.

## Merge Gates

Do not merge until all are true:

- Backend build passes.
- Frontend build and typecheck pass.
- Backend lint passes.
- Frontend lint passes.
- All new backend feature tests pass.
- All new frontend feature tests pass.
- Every processor in the coverage matrix registers missing customers.
- Customer creation is idempotent.
- Reprocessing failure cannot change creation success into failure.
- Reprocessing failure cannot destroy the active batch output.
- The frontend always receives and sends a defined missing-record `id`.

## Recommended Commit Order

1. Normalize missing-data DTOs and `_id -> id` mapping.
2. Introduce separate creation/reprocessing lifecycle fields.
3. Unify enhanced model missing-data support.
4. Add complete processor registration coverage.
5. Update both customer validation stores after creation.
6. Enforce backend authority and idempotent creation.
7. Add atomic reprocessing lock and validation generations.
8. Update frontend state and retry UX.
9. Add backend and frontend feature tests.
10. Fix frontend ESLint dependency and run final verification.
