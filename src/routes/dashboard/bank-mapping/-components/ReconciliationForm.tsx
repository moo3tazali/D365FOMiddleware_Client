import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  downloadReconciledWorkbook,
  extractApiError,
  reconcileFiles,
} from "../-api/reconciliationApi";
import type { ReconciliationResult } from "../-api/reconciliationApi";

function FileField({
  id,
  label,
  hint,
  file,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.files?.[0] ?? null);
  };
  return (
    <label className="file-field" htmlFor={id}>
      <span className="file-icon" aria-hidden="true">UP</span>
      <span>
        <strong>{label}</strong>
        <small>{file ? file.name : hint}</small>
      </span>
      <input id={id} type="file" accept=".xlsx" onChange={handleChange} />
    </label>
  );
}

export default function ReconciliationForm() {
  const [istFile, setIstFile] = useState<File | null>(null);
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [toleranceDays, setToleranceDays] = useState(3);
  const [amountTolerance, setAmountTolerance] = useState(0.01);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.75);
  const [audit, setAudit] = useState(true);
  const [allowManyToOne, setAllowManyToOne] = useState(false);
  const [forceAll, setForceAll] = useState(true);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [recordFilter, setRecordFilter] =
    useState<"all" | "Needs Review" | "Unmatched">("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"ist" | "bank">("ist");

  useEffect(() => {
    if (result) {
      setTimeout(() => {
        const element = document.querySelector(".results-card");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [result]);

  const visibleBankRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (result?.report.unmatchedBankRecords ?? []).filter((record) => {
      const textMatches =
        !query ||
        [
          record.excelRowNumber,
          record.bankRef,
          record.description,
          record.clientName,
          record.supplierBeneficiary,
          record.cashFlow,
          record.customerReference,
          record.dynCode,
          record.currency,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return textMatches;
    });
  }, [result, search]);

  const visibleRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (result?.report.reviewRecords ?? []).filter((record) => {
      const statusMatches = recordFilter === "all" || record.status === recordFilter;
      const textMatches =
        !query ||
        [
          record.istRowNumber,
          record.description,
          record.clientName,
          record.operationNo,
          record.document,
          record.accountCode,
          record.suggestedBankRef,
          record.reason,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return statusMatches && textMatches;
    });
  }, [recordFilter, result, search]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setResult(null);
    setViewMode("ist");
    if (!istFile || !bankFile) {
      setError("Choose both the IST report and bank report.");
      return;
    }

    setLoading(true);
    try {
      const processed = await reconcileFiles({
        istFile,
        bankFile,
        toleranceDays,
        amountTolerance,
        confidenceThreshold,
        audit,
        allowManyToOne,
        forceAll,
      });
      setResult(processed);
      setSuccess(
        `Reconciliation complete. ${processed.report.summary.paymentReferencesFilled.toLocaleString()} PAYMENTREFERENCE cells were filled.`,
      );
    } catch (requestError) {
      setError(await extractApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  const downloadWorkbook = async () => {
    if (!result) return;
    setError("");
    setDownloading(true);
    try {
      await downloadReconciledWorkbook(result.downloadId, result.filename);
    } catch (downloadError) {
      setError(await extractApiError(downloadError));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <form className="card" onSubmit={submit}>
        <div className="section-heading">
          <span>1</span>
          <div>
            <h2>Upload reports</h2>
            <p>Excel workbooks up to 100 MB each.</p>
          </div>
        </div>
        <div className="file-grid">
          <FileField
            id="ist-file"
            label="IST report"
            hint="Choose the IST .xlsx file"
            file={istFile}
            onChange={setIstFile}
          />
          <FileField
            id="bank-file"
            label="Bank report"
            hint="Choose the bank .xlsx file"
            file={bankFile}
            onChange={setBankFile}
          />
        </div>

        <div className="divider" />
        <div className="section-heading">
          <span>2</span>
          <div>
            <h2>Matching controls</h2>
            <p>Account, currency, and debit/deposit direction are always checked.</p>
          </div>
        </div>
        <div className="settings-grid">
          <label>
            <span>Tolerance days</span>
            <input
              type="number"
              min="0"
              max="31"
              value={toleranceDays}
              onChange={(event) => setToleranceDays(Number(event.target.value))}
            />
          </label>
          <label>
            <span>Amount tolerance</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amountTolerance}
              onChange={(event) => setAmountTolerance(Number(event.target.value))}
            />
          </label>
          <label>
            <span>Confidence threshold</span>
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={confidenceThreshold}
              onChange={(event) => setConfidenceThreshold(Number(event.target.value))}
            />
          </label>
        </div>
        <div className="toggle-grid">
          <label className="toggle">
            <input
              type="checkbox"
              checked={audit}
              onChange={(event) => setAudit(event.target.checked)}
            />
            <span>
              <strong>Append audit columns</strong>
              <small>Include status, score, reason, and bank-row evidence.</small>
            </span>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={allowManyToOne}
              onChange={(event) => setAllowManyToOne(event.target.checked)}
            />
            <span>
              <strong>Allow many-to-one</strong>
              <small>Permit the same bank row to match separate IST transactions.</small>
            </span>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={forceAll}
              onChange={(event) => setForceAll(event.target.checked)}
            />
            <span>
              <strong>Try every real bank match</strong>
              <small>
                Use only references from the bank sheet. Leave PAYMENTREFERENCE
                blank when no safe real bank match is found.
              </small>
            </span>
          </label>
        </div>

        {error && <div className="message error" role="alert">{error}</div>}
        {success && <div className="message success" role="status">{success}</div>}
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" /> Reconciling large workbooks...
            </>
          ) : (
            "Reconcile files"
          )}
        </button>
      </form>

      {result && (
        <section className="results-card" aria-label="Reconciliation results">
          <div className="results-header">
            <div>
              <div className="eyebrow">Reconciliation results</div>
              <h2>Review suggested and unmatched references</h2>
            </div>
            <button
              type="button"
              className="download-button"
              onClick={downloadWorkbook}
              disabled={downloading}
            >
              {downloading ? "Downloading..." : "Download Excel"}
            </button>
          </div>

          <div className="summary-grid summary-grid-5">
            <div>
              <strong>{result.report.summary.paymentReferencesFilled.toLocaleString()}</strong>
              <span>References filled</span>
            </div>
            <div>
              <strong>{result.report.summary.preserved.toLocaleString()}</strong>
              <span>Existing preserved</span>
            </div>
            <div>
              <strong>{result.report.summary.needsReview.toLocaleString()}</strong>
              <span>Needs review</span>
            </div>
            <div>
              <strong>{result.report.summary.unmatched.toLocaleString()}</strong>
              <span>Unmatched IST rows</span>
            </div>
            <div>
              <strong>{result.report.summary.forcedBankMatches.toLocaleString()}</strong>
              <span>Forced bank matches</span>
            </div>
            <div>
              <strong>{result.report.summary.remainingBlankPaymentReferences.toLocaleString()}</strong>
              <span>Remaining blanks</span>
            </div>
            <div>
              <strong>{(result.report.unmatchedBankRecords ?? []).length.toLocaleString()}</strong>
              <span>Unmatched bank rows</span>
            </div>
          </div>

          <details className="rules-panel">
            <summary>Matching rules used in priority order</summary>
            <ol>
              <li>Preserve every valid existing PAYMENTREFERENCE.</li>
              <li>Match exact bank references, bank Dynamics entries, or IST shipment tokens found in the opposite file.</li>
              <li>Match exact amount with account, currency, direction, date, client, description, and shipment-token evidence.</li>
              <li>Match grouped IST settlements when their total equals one bank transaction.</li>
              <li>For CashIn/CashOut, match one unique real bank cash deposit or withdrawal using exact debit/credit amount, same direction, and date tolerance.</li>
              <li>For remaining rows, select the best unused real bank row using exact amount, direction, date, account, client, description, and shipment-token evidence.</li>
              <li>When amount is close but not exact, use a real bank reference only if account, date, direction, and client/reference evidence are strong.</li>
              <li>If account mapping is missing, use exact amount plus date, direction, client, description, or shipment-token evidence; otherwise leave PAYMENTREFERENCE blank.</li>
            </ol>
            <p>The downloaded workbook also contains a <strong>Matching Rules</strong> sheet.</p>
          </details>

          <section className="results-guide" aria-label="How to read the results">
            <h3>How to read this output</h3>
            <div className="guide-grid">
              <div>
                <strong>1. Download Excel is the final file</strong>
                <p>
                  Open it first. The filled <code>PAYMENTREFERENCE</code> is the
                  selected reference, and the new <code>notes</code> column explains
                  which rule was used for every row.
                </p>
              </div>
              <div>
                <strong>2. IST Review Records need checking</strong>
                <p>
                  These are IST rows where the system suggested a reference but wants
                  a person to confirm it, or where no safe bank match was found.
                </p>
              </div>
              <div>
                <strong>3. Unmatched Bank Rows are unused bank lines</strong>
                <p>
                  These bank transactions were not assigned to any IST row. They may
                  be bank charges, interest, transfers, duplicate data, or missing IST
                  entries.
                </p>
              </div>
            </div>
          </section>

          <div className="tab-bar">
            <button
              type="button"
              className={`tab-button ${viewMode === "ist" ? "active" : ""}`}
              onClick={() => setViewMode("ist")}
            >
              IST Review Records ({(result.report.reviewRecords ?? []).length.toLocaleString()})
            </button>
            <button
              type="button"
              className={`tab-button ${viewMode === "bank" ? "active" : ""}`}
              onClick={() => setViewMode("bank")}
            >
              Unmatched Bank Rows ({(result.report.unmatchedBankRecords ?? []).length.toLocaleString()})
            </button>
          </div>

          {viewMode === "ist" ? (
            <>
              <div className="tab-explainer">
                <strong>IST Review Records</strong>
                <span>
                  Use this tab to check rows marked <b>Needs Review</b> or{" "}
                  <b>Unmatched</b>. The downloaded Excel contains the full reason in
                  the <code>notes</code> column for each IST row.
                </span>
              </div>
              <div className="review-toolbar">
                <div className="filter-buttons" aria-label="Record status filter">
                  {(["all", "Needs Review", "Unmatched"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      className={recordFilter === filter ? "active" : ""}
                      onClick={() => setRecordFilter(filter)}
                    >
                      {filter === "all" ? "All review records" : filter}
                    </button>
                  ))}
                </div>
                <input
                  type="search"
                  placeholder="Search row, client, account, or reason"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              {result.report.summary.reviewRecordsTruncated && (
                <p className="result-note">
                  Showing the first{" "}
                  {result.report.summary.reviewRecordsReturned.toLocaleString()} review records.
                  The Excel audit columns contain every record.
                </p>
              )}

              <div className="table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>IST row</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Account</th>
                      <th>Description / client</th>
                      <th>Amount</th>
                      <th>Suggested bank ref</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRecords.slice(0, 500).map((record) => (
                      <tr key={record.istRowNumber}>
                        <td>{record.istRowNumber}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              record.status === "Unmatched" ? "unmatched" : "review"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td>{record.transactionDate || "-"}</td>
                        <td>{record.accountCode || "-"}</td>
                        <td>
                          <strong>{record.description || "-"}</strong>
                          <small>{record.clientName || record.operationNo}</small>
                        </td>
                        <td className="number">
                          {record.amount?.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          }) ?? "-"}
                        </td>
                        <td>{record.suggestedBankRef || "-"}</td>
                        <td className="reason-cell">{record.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="result-note">
                Showing {Math.min(visibleRecords.length, 500).toLocaleString()} of{" "}
                {visibleRecords.length.toLocaleString()} filtered records.
              </p>
            </>
          ) : (
            <>
              <div className="tab-explainer">
                <strong>Unmatched Bank Rows</strong>
                <span>
                  This is not the corrected IST table. It is a control list of bank
                  rows that remained unused after matching, so you can decide whether
                  they are expected bank-only transactions or missing IST entries.
                </span>
              </div>
              <div className="review-toolbar">
                <div className="toolbar-label">
                  <span>
                    Bank transactions that did not match any IST records
                  </span>
                </div>
                <input
                  type="search"
                  placeholder="Search reference, description, code..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>Bank Row</th>
                      <th>Ref</th>
                      <th>Date</th>
                      <th>Dyn Code</th>
                      <th>Description</th>
                      <th>Party / client</th>
                      <th>Cash Flow</th>
                      <th>Currency</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleBankRecords.slice(0, 500).map((record) => (
                      <tr key={record.index}>
                        <td>{record.excelRowNumber}</td>
                        <td>
                          <strong>{record.bankRef || "-"}</strong>
                          <small>{record.customerReference}</small>
                        </td>
                        <td>{record.transactionDate ? record.transactionDate.slice(0, 10) : "-"}</td>
                        <td>{record.dynCode || "-"}</td>
                        <td>{record.description || "-"}</td>
                        <td>
                          {record.clientName || record.supplierBeneficiary ? (
                            <>
                              <strong>{record.clientName || "-"}</strong>
                              <small>{record.supplierBeneficiary}</small>
                            </>
                          ) : "-"}
                        </td>
                        <td>{record.cashFlow || "-"}</td>
                        <td>{record.currency || "-"}</td>
                        <td className="number">
                          <span className={record.direction === "deposit" ? "deposit-amt" : "withdraw-amt"}>
                            {record.direction === "deposit" ? "+" : "-"}
                            {record.amount?.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            }) ?? "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {visibleBankRecords.length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "#718078" }}>
                          No unmatched bank records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="result-note">
                Showing {Math.min(visibleBankRecords.length, 500).toLocaleString()} of{" "}
                {visibleBankRecords.length.toLocaleString()} filtered records.
              </p>
            </>
          )}
        </section>
      )}
    </>
  );
}
