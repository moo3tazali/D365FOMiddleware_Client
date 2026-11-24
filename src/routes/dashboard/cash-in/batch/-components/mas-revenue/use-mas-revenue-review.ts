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
  createBatchGate,
  issuesToCsv,
  newIdempotencyKey,
  type CreateBatchGate,
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
 * State and actions of the MAS Revenue review. The standard Cash In form and footer
 * drive it: the form's file goes to validate(), and the footer's Create batch calls
 * createBatch(). The review is shown in the results area of the same page.
 */
export interface MasRevenueReviewState {
  review: MasRevenueReview | null;
  lines: MasRevenueLinesPage | null;
  linesPageNumber: number;
  busy: MasRevenueBusy;
  error: string | null;
  gate: CreateBatchGate;
  validate: (file: File) => Promise<void>;
  reset: () => void;
  createBatch: () => Promise<void>;
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
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
  const [lines, setLines] = useState<MasRevenueLinesPage | null>(null);
  const [linesPageNumber, setLinesPageNumber] = useState(1);
  const [busy, setBusy] = useState<MasRevenueBusy>(null);
  const [error, setError] = useState<string | null>(null);

  /** A new file invalidates the review, so a stale preview cannot be submitted. */
  const reset = () => {
    setReview(null);
    setIdempotencyKey(null);
    setLines(null);
    setLinesPageNumber(1);
    setError(null);
  };

  const validate = async (file: File) => {
    setBusy('validate');
    reset();
    try {
      const result = await masRevenueApi.preview(file);
      setReview(result);
      setIdempotencyKey(newIdempotencyKey());
      setLines(
        await masRevenueApi.getLines(result.reviewId, 1, MAS_LINES_PAGE_SIZE),
      );
    } catch (caught) {
      setError(messageOf(caught, 'The workbook could not be reviewed.'));
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

  const gate = createBatchGate(review);

  const createBatch = async () => {
    if (!review || !idempotencyKey || !gate.allowed) return;
    setBusy('submit');
    setError(null);
    try {
      const submitted = await masRevenueApi.submit(review.reviewId, {
        reviewVersion: review.reviewVersion,
        payloadHash: review.payloadHash,
        idempotencyKey,
      });
      if (!submitted.batchId) {
        throw new Error(
          'The batch was not created. Review the messages and try again.',
        );
      }
      const batch = await sync.fetch<TDataBatch>(
        API_ROUTES.DATA_MIGRATION.DATA_BATCH.ONE,
        { params: { batchId: submitted.batchId } },
      );
      setBatch(batch);
      await queryClient.invalidateQueries({ queryKey: dataBatch.queryKey });
      toast.success(
        'MAS Revenue batch created. Send it to D365FO from the batch page.',
      );
      navigate({
        to: ROUTES.DASHBOARD.CASH_IN.BATCH.VIEW,
        params: { batchId: submitted.batchId },
      });
    } catch (caught) {
      setError(messageOf(caught, 'The batch could not be created.'));
      // Refresh the review so the current blockers are shown, not a stale list.
      try {
        setReview(await masRevenueApi.getReview(review.reviewId));
      } catch {
        // The original error is already shown.
      }
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
    gate,
    validate,
    reset,
    createBatch,
    loadLinesPage,
    download,
    exportErrors,
  };
}

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
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
