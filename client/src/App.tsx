import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Products } from './pages/Products';
import { Assets } from './pages/Assets';
import { Rentals } from './pages/Rentals';
import { RentalDetail } from './pages/RentalDetail';
import { Fulfillment } from './pages/Fulfillment';
import { Returns } from './pages/Returns';
import { Inspections } from './pages/Inspections';
import { Adjustments } from './pages/Adjustments';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="products" element={<Products />} />
            <Route path="assets" element={<Assets />} />
            <Route path="rentals" element={<Rentals />} />
            <Route path="rentals/:id" element={<RentalDetail />} />
            <Route path="fulfillment" element={<Fulfillment />} />
            <Route path="returns" element={<Returns />} />
            <Route path="inspections" element={<Inspections />} />
            <Route path="adjustments" element={<Adjustments />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
