import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { LoginPage } from '@/pages/LoginPage';
import { UsersPage } from '@/pages/UsersPage';

function AdminLayout({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const handleLogin = () => setIsAuthenticated(true);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />}
        />
        <Route
          element={isAuthenticated ? <AdminLayout onLogout={handleLogout} /> : <Navigate to="/login" />}
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
