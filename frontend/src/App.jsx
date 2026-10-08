import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./Component/Layout";
import ProtectedRoute from "./Component/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Agent from "./pages/Agent";
import Orders from "./pages/Orders";
import Product from "./pages/Product";
import Customer from "./pages/Customer";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected App */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/agent" element={<Agent />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/products" element={<Product />} />
            <Route path="/customers" element={<Customer />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;