import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const customer = localStorage.getItem("customer");

  if (!customer) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;