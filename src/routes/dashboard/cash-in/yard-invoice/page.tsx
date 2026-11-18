import { createFileRoute } from '@tanstack/react-router';

import { YardInvoiceWorkbench } from './-components/yard-invoice-workbench';

export const Route = createFileRoute('/dashboard/cash-in/yard-invoice/')({
  component: YardInvoicePage,
});

function YardInvoicePage() {
  return (
    <div className='h-full space-y-5'>
      <div className='space-y-1'>
        <h1 className='text-xl font-semibold'>Yard Cash In: invoice upload</h1>
        <p className='text-sm text-muted-foreground'>
          Review the template, confirm the consolidated invoices, then submit.
          Submitting queues an unmarked journal posting; it does not settle
          invoices.
        </p>
      </div>
      <YardInvoiceWorkbench />
    </div>
  );
}
