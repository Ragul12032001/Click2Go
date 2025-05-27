// toastUtils.ts
import { toast } from 'src/Components/ui/use-toast';

export const showSessionExpiredToast = () => {
  toast({
    title: 'Session Expired',
    description: 'Redirecting to Sign In...',
    duration: 3000,
  });

  setTimeout(() => {
    sessionStorage.clear();
    window.location.href = '/'; 
  }, 3000);
};
