import { NavLink } from "react-router-dom";

function Sidebar() {
  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "AI Agent", path: "/agent" },
    { name: "Orders", path: "/orders" },
    { name: "Products", path: "/products" },
    { name: "Customers", path: "/customers" },
    { name: "Analytics", path: "/analytics" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-800 bg-gray-950 px-4 py-6 text-white">
      
      {/* Logo */}
      <div className="mb-8 border-b border-gray-800 px-3 pb-6">
        <h2 className="text-xl font-bold tracking-tight">
          AI Commerce
        </h2>

        <span className="mt-1 block text-xs text-gray-500">
          Agent Platform
        </span>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
}

export default Sidebar;