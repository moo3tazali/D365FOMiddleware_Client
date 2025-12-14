'use client';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/modal';
import { useAuth } from '@/hooks/use-auth';
import { LoginForm } from './login-form';

export const LoginModal = () => {
  const open = useAuth((s) => s.isLoginModalOpen);

  return (
    <ResponsiveModal open={open}>
      <ResponsiveModalContent closeBtn={false}>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>You've been logged out</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Your session has expired. Please log in again to continue your work.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <LoginForm className='py-10' />
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
};
