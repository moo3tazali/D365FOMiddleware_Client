import { createFileRoute } from '@tanstack/react-router';

import ReconciliationForm from './-components/ReconciliationForm';
import './styles.css';

export const Route = createFileRoute('/dashboard/bank-mapping/')({
  component: BankMappingPage,
});

function BankMappingPage() {
  return (
    <div className='h-full overflow-y-auto bg-background text-foreground'>
      <div className='bank-mapping-page'>
        <section className='bank-mapping-hero'>
          <div className='eyebrow'>Finance operations</div>
          <h1>Bank to IST reconciliation</h1>
          <p>
            Match bank transactions to the IST report, fill{' '}
            <code>PAYMENTREFERENCE</code>, and download a review-ready Excel
            workbook.
          </p>
        </section>
        <ReconciliationForm />
        <p className='privacy-note'>
          Files are processed by your reconciliation server and are not retained.
        </p>
      </div>
    </div>
  );
}
