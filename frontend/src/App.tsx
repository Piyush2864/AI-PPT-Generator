import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './routes/AppRouter';
import { RealtimeProvider } from './components/RealtimeProvider';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RealtimeProvider>
          <AppRouter />
          <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        </RealtimeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
