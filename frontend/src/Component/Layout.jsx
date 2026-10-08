import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen p-6 md:p-8">
        <Outlet />
      </main>
      
    </div>
  );
}

export default Layout;