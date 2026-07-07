import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CreatePresentationPage } from '../pages/CreatePresentationPage';
import { PresentationDetailPage } from '../pages/PresentationDetailPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/create" element={<CreatePresentationPage />} />
            <Route path="/presentations/:id" element={<PresentationDetailPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
