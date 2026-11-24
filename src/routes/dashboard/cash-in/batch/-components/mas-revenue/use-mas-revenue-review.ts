import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { useServices } from '@/hooks/use-services';
import type { TDataBatch } from '@/interfaces/data-batch';
import { API_ROUTES } from '@/services/core/api-routes';
import { sync } from '@/services/core/sync';
import {
  masRevenueApi,
  type MasRevenueLinesPage,
  type MasRevenueReview,
} from '@/services/api/mas-revenue';
import { ROUTES } from '@/router';

import { useBatchQueryData } from '../../-hooks/use-batch-query-data';
import {
  issuesToCsv,
  messageOfError as messageOf,
  newIdempotencyKey,
} from './mas-revenue-view-model';

export const MAS_LINES_PAGE_SIZE = 50;

export type MasRevenueBusy =
  | 'validate'
  | 'submit'
  | 'template'
  | 'guide'
  | 'lines'
  | null;

/**
 * State and actions of the MAS Revenue upload. The standard Cash In form drives it:
 * the form's file goes to validate(), which reviews the workbook and then creates the
 * batch, exactly as the other Cash In uploads do, and opens the standard batch page.
 * Posting is a separate step on that page, and the MAS configuration gates apply there.
 *
 * The review is shown only when the upload cannot create a batch (row issues, no
 * receipts, or a server refusal such as a duplicate receipt).
 */
export interface MasRevenueReviewState {
  review: MasRevenueReview | null;
  lines: MasRevenueLinesPage | null;
  linesPageNumber: number;
  busy: MasRevenueBusy;
  error: string | null;
  validate: (file: File) => Promise<void>;
  reset: () => void;
  loadLinesPage: (pageNumber: number) => Promise<void>;
  download: (kind: 'template' | 'guide') => Promise<void>;
  exportErrors: () => void;
}

export function useMasRevenueReview(): MasRevenueReviewState {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { dataBatch } = useServices();
  const [, setBatch] = useBatchQueryData();

  const [review, setReview] = useState<MasRevenueReview | null>(null);
  const [lines, setLines] = useState<MasRevenueLinesPage | null>(null);
  const [linesPageNumber, setLinesPageNumber] = useState(1);
  const [busy, setBusy] = useState<MasRevenueBusy>(null);
  const [error, setError] = useState<string | null>(null);

  /** A new file replaces any earlier result. */
  const reset = () => {
    setReview(null);
    setLines(null);
    setLinesPageNumber(1);
    setError(null);
  };

  const createBatchFrom = async (reviewed: MasRevenueReview) => {
    const submitted = await masRevenueApi.submit(reviewed.reviewId, {
      reviewVersion: reviewed.reviewVersion,
      payloadHash: reviewed.payloadHash,
      idempotencyKey: newIdempotencyKey(),
    });
    if (!submitted.batchId) {
      throw new Error('The batch was not created. Please try again.');
    }
    const batch = await sync.fetch<TDataBatch>(
      API_ROUTES.DATA_MIGRATION.DATA_BATCH.ONE,
      { params: { batchId: submitted.batchId } },
    );
    setBatch(batch);
    await queryClient.invalidateQueries({ queryKey: dataBatch.queryKey });
    navigate({
      to: ROUTES.DASHBOARD.CASH_IN.BATCH.VIEW,
      params: { batchId: submitted.batchId },
    });
  };

  const validate = async (file: File) => {
    setBusy('validate');
    reset();
    try {
      const result = await masRevenueApi.preview(file);
      setReview(result);
      if (!result.uploadValid) {
        // Row issues or no receipts: no batch can be created. Show the issues.
        setLines(
          await masRevenueApi.getLines(result.reviewId, 1, MAS_LINES_PAGE_SIZE),
        );
        return;
      }
      setBusy('submit');
      await createBatchFrom(result);
    } catch (caught) {
      setError(messageOf(caught, 'The workbook could not be uploaded.'));
    } finally {
      setBusy(null);
    }
  };

  const loadLinesPage = async (pageNumber: number) => {
    if (!review) return;
    setBusy('lines');
    try {
      setLines(
        await masRevenueApi.getLines(
          review.reviewId,
          pageNumber,
          MAS_LINES_PAGE_SIZE,
        ),
      );
      setLinesPageNumber(pageNumber);
    } catch (caught) {
      setError(messageOf(caught, 'The receipts could not be loaded.'));
    } finally {
      setBusy(null);
    }
  };

  const download = async (kind: 'template' | 'guide') => {
    setBusy(kind);
    try {
      const { blob, fileName } =
        kind === 'template'
          ? await masRevenueApi.downloadTemplate()
          : await masRevenueApi.downloadGuide();
      saveBlob(blob, fileName);
    } catch (caught) {
      toast.error(messageOf(caught, 'The download failed.'));
    } finally {
      setBusy(null);
    }
  };

  const exportErrors = () => {
    if (!review?.summary) return;
    const text = issuesToCsv(review.summary.issues);
    saveBlob(
      new Blob([text], { type: 'text/csv;charset=utf-8' }),
      `MAS-Revenue-upload-errors-${review.fileName.replace(/\.xlsx$/i, '')}.csv`,
    );
  };

  return {
    review,
    lines,
    linesPageNumber,
    busy,
    error,
    validate,
    reset,
    loadLinesPage,
    download,
    exportErrors,
  };
}

function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
