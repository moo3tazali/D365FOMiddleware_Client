import { createFileRoute } from '@tanstack/react-router';

import { ForgetPwForm } from './-components/forget-pw-form';

export const Route = createFileRoute(
  '/_auth/forget-password'
)({
  component: ForgetPasswordPage,
});

function ForgetPasswordPage() {
  return <ForgetPwForm />;
}
