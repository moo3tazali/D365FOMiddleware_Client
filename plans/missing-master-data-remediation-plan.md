# Missing Master Data Remediation Plan

## Goal

Let an operator resolve batch errors caused by missing D365FO master data without leaving the middleware workflow. The first supported remediation type is creating missing Customers in D365FO, while the UI and backend contract should leave room for future remediation types such as main accounts and cost centers.

## Current Codebase Shape

- Backend app: `D365FOMiddleware_Nestbackend`, NestJS with CQRS.
- Frontend app: `dynamics-fo-middleware`, React 19 with TanStack Router and Query.
- Batch errors already flow through `GET /DataMigration/DataBatch/error-list`.
- Every batch module already has an error route like `/dashboard/accounts-receivable/batch/$batchId/errors/`.
- Shared frontend error grouping lives in `src/components/batch-error-table.tsx`.
- Customer master data is synced through `POST /Finance/MasterData/customers/sync`.
- The existing customer sync job rejects concurrent customer sync requests with HTTP 409 when a pending or processing customer sync already exists.
- D365FO customer reads are handled by `CustomerService`; it currently supports GET/search methods only.
- D365FO POST support already exists at the lower client layer through `D365FOClientService.post`.

## Updated Recommendation: Store Missing Master Data Explicitly

Use a new Mongo collection for structured missing master data created during batch processing.

This is better than making the frontend parse batch error messages because:

- Processors know the missing data at the moment they discover it.
- The frontend can call a purpose-built endpoint and render ready-to-act rows.
- We can store the affected enhanced records, source IDs, properties, and line numbers up front.
- Later batch repair can update only the relevant enhanced records and errors instead of rediscovering matches from text.

Recommended collection name:

`data_batch_missing_master_data`

Recommended document shape:

```ts
type MissingMasterDataStatus = 'missing' | 'creating' | 'created' | 'failed' | 'ignored';
type MissingMasterDataType = 'customer' | 'mainAccount' | 'costCenter';

type DataBatchMissingMasterData = {
  id: string;
  batchId: string;
  company: string;
  entryProcessorType: EntryProcessorTypes;
  type: MissingMasterDataType;
  missingField: string;
  missingValue: string;
  displayName?: string;
  status: MissingMasterDataStatus;

  affected: Array<{
    sourceRecordIds: string[];
    enhancedRecordIds: string[];
    enhancedRecordIndexes: number[];
    lineNumber?: number;
    propertiesToUpdate: string[];
    errorMessages: string[];
    errorProperties: string[];
  }>;

  dataToUpdate: Record<string, unknown>;
  formDefaults: Record<string, unknown>;
  readonlyFormFields: string[];
  createdData?: Record<string, unknown>;
  createdAtDfo?: string;
  createdBy?: string;
  createErrorMessage?: string;
};
```

Indexes:

- `{ batchId: 1, status: 1 }`
- `{ batchId: 1, type: 1, missingField: 1, missingValue: 1 }` unique
- `{ company: 1, type: 1, missingField: 1, missingValue: 1 }`

The unique key should deduplicate the same missing customer within one batch while still allowing the document to accumulate all affected source/enhanced records.

Do not add a generic `MissingMasterDataLookupKind` union for v1. For a missing customer, the processor will know exactly one identifier: either `CustomerAccount` or `TaxExemptNumber`. Store that as `missingField` and `missingValue`. The create modal should render that field as readonly and ask the user only for the remaining data needed to create the customer.

## Processor Emission

Add a structured missing-data mechanism to the enhanced data model or processor context.

Recommended API on `DynDataModel`:

```ts
AddMissingMasterData(input: {
  type: MissingMasterDataType;
  missingField: string;
  missingValue: string;
  message: string;
  enhancedRecordIndex: number;
  sourceRecordIds: string[];
  enhancedRecordIds: string[];
  errorProperties: string[];
  propertiesToUpdate: string[];
  dataToUpdate?: Record<string, unknown>;
  formDefaults?: Record<string, unknown>;
  readonlyFormFields?: string[];
}): void;

GetMissingMasterData(): MissingMasterDataItem[];
```

Example from AR Yard customer-by-tax-number lookup:

```ts
line.AddMissingMasterData({
  type: 'customer',
  missingField: 'TaxExemptNumber',
  missingValue: taxNumber,
  message: `No customer found using normalized TaxExemptNumber "${taxNumber}" from source Tax No "${sourceTaxNo}".`,
  enhancedRecordIndex: index,
  sourceRecordIds: line.SourceIds,
  enhancedRecordIds: [String(line.LineNumber ?? index)],
  errorProperties: ['CustomerAccount'],
  propertiesToUpdate: [
    'CustomerAccount',
    'InvoiceAccount',
    'DimensionModel.customer',
    'DimensionModel.subCustomer',
    'DefaultDimensionDisplayValue',
    'HeaderDefaultDimensionDisplayValue',
  ],
  dataToUpdate: {
    TaxExemptNumber: taxNumber,
  },
  formDefaults: {
    TaxExemptNumber: taxNumber,
    dataAreaId: company,
  },
  readonlyFormFields: ['TaxExemptNumber'],
});
```

This should not replace normal `AddError` yet. The processor should still add a validation error so existing batch behavior remains unchanged.

## Batch Creation Persistence

Extend `DataBatchService.createAsync` after the batch and enhanced/error records are created:

1. Collect `GetMissingMasterData()` from each enhanced record.
2. Group by `batchId + type + missingField + missingValue`.
3. Store one missing-master-data document per unique missing value.
4. Attach all affected source IDs, enhanced record IDs, enhanced record indexes, line numbers, properties to update, and error properties to clear.

This means the frontend no longer needs to parse text. It can call one endpoint:

`GET /DataMigration/DataBatch/:batchId/missing-master-data`

Optional query filters:

- `type=customer`
- `status=missing`

Response:

```ts
type MissingMasterDataListResponse = {
  items: DataBatchMissingMasterData[];
  total: number;
};
```

## Customer Creation Flow With Missing Data Records

Use the missing-data document as the command target.

Recommended endpoint:

`POST /Finance/MasterData/customers/from-missing-data/:missingDataId`

Request body contains user-entered customer fields. The backend loads the missing-data document and uses it to:

1. Confirm the document is still `status: "missing"` or retryable `status: "failed"`.
2. Prefill/validate the readonly customer identifier from `missingField` and `missingValue`.
3. Create the customer in D365FO.
4. Upsert the local customer cache immediately.
5. Mark the missing-data document as `created`.
6. Store `createdData`.
7. Attempt batch repair for affected records if enabled.
8. Queue customer sync only if no customer sync is already active.

Alternative endpoint:

`POST /Finance/MasterData/customers`

This is still useful for generic customer creation, but the missing-data-specific endpoint is cleaner for this workflow because it ties creation, status update, and later batch repair to one tracked missing-data record.

## Batch Repair Model

Your proposed fields make active repair much safer. After customer creation, the backend can use `affected[].enhancedRecordIndexes`, `affected[].propertiesToUpdate`, and `dataToUpdate` to update only the enhanced records that depended on the missing customer.

Recommended V1.5 repair command:

`POST /DataMigration/DataBatch/:batchId/missing-master-data/:missingDataId/apply`

Behavior for customer remediation:

1. Load the missing-data document and created customer.
2. For each affected enhanced record:
   - find the record by stored enhanced-record index first
   - update only the paths listed in `propertiesToUpdate`
   - for customer creation, use `createdData.CustomerAccount` to set `CustomerAccount`, `InvoiceAccount`, `DimensionModel.customer`, and `DimensionModel.subCustomer` when those paths are listed
   - rebuild dimension strings such as `DefaultDimensionDisplayValue` and header dimension fields only when those paths are listed
3. Remove only the error entries related to that missing-data document.
4. If an enhanced record has no remaining errors:
   - remove its `data_batch_errors` document or update it with remaining errors
   - decrement batch `errorCount`
   - increment batch `successCount`
5. Keep an audit trail through the missing-data document's `createdData` and status.

Important caution:

- Do not update by loose message matching alone.
- Store enough metadata at creation time to know exactly which enhanced-record indexes and properties were affected.
- Store only the data needed to update that batch; do not persist the entire source row or a broad generic payload unless repair needs it.
- If a record has multiple errors, only remove the remediated customer error.

## Recommended Product Shape

Keep the existing batch error page as the operator's starting point, but add a remediation panel above the raw error table.

Recommended page structure:

1. Header: current batch error header, with a secondary action back to batch view.
2. Remediation tabs or segmented control:
   - `Customers`
   - `Main accounts` disabled or empty-state for now
   - `Cost centers` disabled or empty-state for now
3. Customer remediation table:
   - Missing value type: `CustomerAccount` or `TaxExemptNumber`
   - Missing value
   - Affected source IDs count
   - Status: `Needs action`, `Creating`, `Created`, `Already exists`, `Failed`
   - Action: `Create customer`
4. Existing raw error table remains below for audit/detail.

Why this shape:

- It preserves the current error-review workflow.
- It avoids hiding non-remediable errors.
- It gives the future dimensions/main-account work a clear home without forcing backend support now.

## Missing Customer Detection

Preferred approach after the new collection:

- Backend processors emit structured missing customer data.
- Backend stores unique missing customer documents during batch creation.
- Frontend reads those documents with `GET /DataMigration/DataBatch/:batchId/missing-master-data`.

Fallback approach if the collection is not ready:

- Frontend may temporarily derive candidates from `TDataBatchError[]`.
- This should be treated as temporary scaffolding, not the final design.

Create a frontend extractor first, backed by a backend endpoint later if needed for scale.

For the first implementation, derive unique customer candidates from `TDataBatchError[]` returned by `error-list`:

- Prefer structured `enhancedData.errors[]` where available.
- Match `property === "CustomerAccount"` and messages that indicate no customer was found.
- For AR Yard specifically, parse the normalized tax number from messages shaped like:
  `No customer found using normalized TaxExemptNumber "..." from source Tax No "...".`
- Fall back to `errorMessages[]` only when `enhancedData.errors` is absent.

Recommended internal frontend model:

```ts
type MissingMasterDataType = 'customer' | 'mainAccount' | 'costCenter';

type MissingCustomerCandidate = {
  type: 'customer';
  missingField: 'CustomerAccount' | 'TaxExemptNumber';
  missingValue: string;
  sourceRecordIds: string[];
  messages: string[];
  rawErrorIds: string[];
};
```

Superseded decision point:

- Previous recommendation was frontend-side extraction for speed.
- New recommendation is backend-side structured missing-data persistence because it supports repair, deduplication, audit, and future master-data types.

## Backend API

Add a customer creation endpoint under the master data controller:

`POST /Finance/MasterData/customers`

Request body:

```json
{
  "PartyType": "Organization",
  "dataAreaId": "Saco",
  "SalesTaxGroup": "Tax 14",
  "Name": "Testing From API2",
  "CustomerGroupId": "DomesticC",
  "SalesCurrencyCode": "EGP",
  "CustomerAccount": "10100788",
  "TaxExemptNumber": "",
  "OrganizationNumber": "",
  "PaymentTerms": "30 Days",
  "AddressCountryRegionId": "EGY",
  "IsSalesTaxIncludedInPrices": "Yes"
}
```

Recommended route behavior:

1. Validate allowed select values.
2. If `CustomerAccount` is present, check local customer cache by `dataAreaId` + `CustomerAccount`.
3. If `CustomerAccount` is present and absent locally, optionally check D365FO directly by `CustomerAccount` with `useCache: false`.
4. POST to `/data/Customers`.
5. Upsert the returned or submitted customer into local Mongo immediately.
6. Try to queue background `customers/sync`; if a sync is already pending or processing, do not fail customer creation.
7. Return both the created customer and sync status:

```ts
type CreateCustomerResponse = {
  customer: ICustomer;
  dfoCreated: boolean;
  localCacheUpdated: boolean;
  sync: {
    queued: boolean;
    skippedReason?: 'already-running';
    jobId?: string;
  };
};
```

Map the D365FO response into the local customer cache from these fields:

- `dataAreaId` -> `company`
- `CustomerAccount` -> `customerAccount`
- `Name` -> `name`
- `NameAlias` -> `nameAlias`
- `CustomerGroupId` -> `customerGroupId`
- `SalesCurrencyCode` -> `salesCurrencyCode`
- `InvoiceAccount` -> `invoiceAccount`
- `PartyNumber` -> `partyNumber`
- `OrganizationNumber` -> `organizationNumber`
- `TaxExemptNumber` -> `taxExemptNumber`
- `DefaultDimensionDisplayValue` -> `defaultDimensionDisplayValue`

Use the D365FO response as the source for `createdData`, not the request body, because D365FO may populate generated fields like `PartyNumber`, normalized address fields, and `DefaultDimensionDisplayValue`.

Why not rely only on full sync:

- Customer sync can take a long time.
- The operator may create multiple customers back-to-back.
- Immediate local upsert makes the newest customer available to validation without waiting for the full customer table sync.
- The existing sync job remains useful for eventual consistency.

## Backend Implementation Steps

1. Add DTOs:
   - `CreateCustomerDto`
   - optional `CreateCustomerResponseDto`
2. Add `CustomerService.createCustomer(company, dto)` using `D365FOClientService.post('/data/Customers', dto)`.
3. Add a mapper from D365FO payload/response to `ICreateCustomer`.
4. Add `CustomerRepository.upsertOne` or reuse `upsertMany(company, [customer])`.
5. Add `CreateCustomerCommand` and handler in `master-data/commands`.
6. In the handler:
   - validate duplicate rules
   - post to D365FO
   - upsert local customer cache immediately
   - call existing `CreateSyncCustomersJobCommand` in a best-effort block
   - swallow only the known 409 "already running" sync conflict
7. Register the command handler in `MasterDataModule`.
8. Add controller method:
   - `@Post('customers')`
   - `@HttpCode(HttpStatus.CREATED)`
9. Add focused tests around:
   - successful D365FO post and local upsert
   - duplicate local customer
   - D365FO post failure
   - sync already running does not fail creation

## Frontend Implementation Steps

1. Add API route:
   - `API_ROUTES.FINANCE.MASTER_DATA.CUSTOMERS.CREATE`
2. Add `masterData.createCustomer(payload)`.
3. Add customer creation interfaces:
   - `CreateCustomerPayload`
   - `CreateCustomerResponse`
4. Add a reusable missing-master-data page section:
   - `MissingMasterDataPanel`
   - `MissingCustomerTable`
   - `CreateCustomerModal`
5. Extend the existing batch error pages by rendering the panel above `BatchErrorTable`.
6. Modal fields:
   - `CustomerAccount`
   - `Name`
   - `TaxExemptNumber`
   - `OrganizationNumber`
   - `CustomerGroupId`
   - `SalesTaxGroup`
   - `PartyType`
   - `PaymentTerms`
   - `IsSalesTaxIncludedInPrices`
   - `AddressCountryRegionId` readonly `EGY`
   - `SalesCurrencyCode` default `EGP`
   - `dataAreaId` default from batch company if compatible with D365FO values
   - if the missing-data document has `missingField: "CustomerAccount"`, prefill `CustomerAccount` as readonly
   - if the missing-data document has `missingField: "TaxExemptNumber"`, prefill `TaxExemptNumber` as readonly
7. On successful create:
   - invalidate the current batch error query
   - invalidate current batch query
   - invalidate master-data sync status query
   - mark the row as created while the batch still refreshes

## Select Field Values

The provided select values need one normalization decision before implementation:

- Customer groups in the user notes: `Domestic`, `Foreign`, `RelatParty`
- Example body: `CustomerGroupId: "DomesticC"`
- Sales tax groups in the user notes: `Taxable`, `Non-Taxabl`
- Example body: `SalesTaxGroup: "Tax 14"`

Recommended answer:

- Use exactly the D365FO values as API payload values, and show friendly labels separately.
- Confirm the real D365FO value list before coding the enum.

Proposed UI labels if the example is authoritative:

```ts
const customerGroupOptions = [
  { label: 'Domestic', value: 'DomesticC' },
  { label: 'Foreign', value: 'Foreign' },
  { label: 'Related party', value: 'RelatParty' },
];

const salesTaxGroupOptions = [
  { label: 'Taxable', value: 'Tax 14' },
  { label: 'Non-taxable', value: 'Non-Taxabl' },
];
```

## Batch Fixing After Customer Creation

The phrase "fix the batch by adding the new created customer data" has two possible meanings:

1. Minimal fix: create customer in D365FO and local cache, then let the operator re-upload/reprocess or use existing refresh behavior.
2. Active remediation: re-run validation/enrichment for affected batch records, update enhanced records, delete resolved batch errors, and update batch counts.

Recommended answer:

- For this feature, implement active remediation only through a dedicated backend command, not from the frontend.
- Add `POST /DataMigration/DataBatch/:batchId/remediate/customer-created` after customer creation if the current processors can be safely re-run for selected source IDs.
- If that is too risky for v1, make the UI honest: "Customer created. Reprocess the batch to clear the error."

Reason:

- Current batch errors are snapshots created during `DataBatchService.createAsync`.
- Updating only the UI would leave Mongo batch counts and error documents inconsistent.
- Proper active remediation needs processor-aware revalidation of affected records.

## Recommended V1 Scope

Ship V1 in three slices:

1. Persist missing master-data documents during batch creation.
2. Display missing customer candidates from the new collection on the batch error page and let users create them from a modal.
3. Create customer in D365FO, immediately upsert local customer cache, and mark the missing-data document as `created`.

Do not update enhanced records and batch error documents automatically in V1 unless the repair command is implemented and tested.

This keeps the first release useful while avoiding silent data inconsistencies.

## Future Extension Model

Use a remediation registry so future types do not become one-off UI branches:

```ts
type RemediationDefinition = {
  type: MissingMasterDataType;
  label: string;
  extractCandidates(errors: TDataBatchError[]): MissingMasterDataCandidate[];
  renderCreateModal(candidate: MissingMasterDataCandidate): React.ReactNode;
};
```

Future backend commands can mirror the same shape:

- `CreateCustomerCommand`
- `CreateMainAccountCommand`
- `CreateFinancialDimensionValueCommand`

## Open Questions

1. Should missing-data persistence be added to the base `DynDataModel`, or should processors return a side-channel result object that contains `dynData` and `missingMasterData`?
   - Recommended: add it to `DynDataModel` for the smallest change, but keep the public type generic enough to move later.
2. Which legal entity should the create form use: the batch `company`, fixed `Saco`, or a mapped value from middleware company code to D365FO `dataAreaId`?
   - Recommended: use the batch company after confirming it matches D365FO `dataAreaId`; otherwise add a small mapping helper.
3. Are the select values in the notes labels or exact D365FO values?
   - Recommended: exact values must be confirmed before implementation.
4. Should v1 actively clear batch errors after creating the customer?
   - Recommended: no for the first slice; yes only through a dedicated apply/remediation command using stored affected metadata.
5. For a tax-number-based missing customer, should the modal prefill `TaxExemptNumber` from the missing value?
   - Recommended: yes.
6. For a customer-account-based missing customer, should the modal prefill `CustomerAccount` from the missing value?
   - Recommended: yes.
7. Should the operator be allowed to override `dataAreaId`?
   - Recommended: show it read-only once we derive it confidently from the batch.

## Suggested First Grill Question

Should the missing-master-data record be the source of truth for the remediation lifecycle?

Recommended answer: yes. The record should start as `missing`, move to `created` after D365FO creation succeeds, store the created customer payload, and later drive the optional apply/repair command for enhanced records and errors.
