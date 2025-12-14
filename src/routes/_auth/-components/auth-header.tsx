import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/theme-toggle';

export const AuthHeader = () => {
  return (
    <header className='p-4 flex items-center justify-between gap-5'>
      <Logo />

      <ThemeToggle />
    </header>
  );
};
