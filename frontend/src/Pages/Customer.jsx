import { useEffect, useState } from "react";

function Customer() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    status: "Active",
  });

  // GET CUSTOMERS
  const fetchCustomers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/customers");
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // FORM INPUT
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ADD CUSTOMER
  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to add customer");
        return;
      }

      alert("Customer added successfully!");

      setForm({
        name: "",
        email: "",
        status: "Active",
      });

      setShowForm(false);
      fetchCustomers();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  // OPEN EDIT FORM
  const handleEdit = (customer) => {
    setEditingCustomer(customer);

    setForm({
      name: customer.name,
      email: customer.email,
      status: customer.status,
    });

    setShowForm(true);
  };

  // UPDATE CUSTOMER
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/customers/${editingCustomer.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to update customer");
        return;
      }

      alert("Customer updated successfully!");

      setEditingCustomer(null);

      setForm({
        name: "",
        email: "",
        status: "Active",
      });

      setShowForm(false);
      fetchCustomers();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  // DELETE CUSTOMER
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/customers/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        alert("Failed to delete customer");
        return;
      }

      alert("Customer deleted successfully!");

      fetchCustomers();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  // SEARCH
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase())
  );

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  return (
    <div className="mx-auto max-w-7xl">

      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Customers
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Manage your customers and track their activity.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCustomer(null);

            setForm({
              name: "",
              email: "",
              status: "Active",
            });

            setShowForm(true);
          }}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          + Add Customer
        </button>
      </div>

      {/* SUMMARY */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">
            Total Customers
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            {customers.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">
            Active Customers
          </p>

          <h2 className="mt-2 text-2xl font-bold text-green-400">
            {activeCustomers}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">
            Inactive Customers
          </p>

          <h2 className="mt-2 text-2xl font-bold text-gray-400">
            {customers.length - activeCustomers}
          </h2>
        </div>

      </div>

      {/* SEARCH */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
        />
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-gray-800 bg-gray-900 p-6">

          <h2 className="mb-5 text-xl font-semibold text-white">
            {editingCustomer ? "Edit Customer" : "Add Customer"}
          </h2>

          <form
            onSubmit={editingCustomer ? handleUpdate : handleAdd}
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
          >

            {/* NAME */}
            <input
              type="text"
              name="name"
              placeholder="Customer name"
              value={form.name}
              onChange={handleChange}
              required
              className="rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            />

            {/* EMAIL */}
            <input
              type="email"
              name="email"
              placeholder="Customer email"
              value={form.email}
              onChange={handleChange}
              required
              className="rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            />

            {/* STATUS */}
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* BUTTONS */}
            <div className="flex gap-3 md:col-span-3">

              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
              >
                {editingCustomer ? "Update Customer" : "Add Customer"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCustomer(null);
                }}
                className="rounded-xl bg-gray-800 px-5 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>

            </div>
          </form>
        </div>
      )}

      {/* CUSTOMER TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">

        <div className="border-b border-gray-800 px-6 py-5">
          <h2 className="text-lg font-semibold text-white">
            Customer List
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            View and manage your customers.
          </p>
        </div>

        {loading ? (
          <div className="p-6 text-gray-400">
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-6 text-gray-400">
            No customers found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="border-b border-gray-800 bg-gray-950/50">

                <tr>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-800">

                {filteredCustomers.map((customer) => (

                  <tr
                    key={customer.id}
                    className="transition hover:bg-gray-800/40"
                  >

                    {/* CUSTOMER */}
                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-sm font-semibold text-blue-400">
                          {customer.name.charAt(0)}
                        </div>

                        <div>

                          <p className="text-sm font-semibold text-white">
                            {customer.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-600">
                            CUS-{String(customer.id).padStart(3, "0")}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* EMAIL */}
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {customer.email}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          customer.status === "Active"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {customer.status}
                      </span>

                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4">

                      <div className="flex gap-2">

                        <button
                          onClick={() => handleEdit(customer)}
                          className="rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-400 hover:bg-blue-500/20"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default Customer;