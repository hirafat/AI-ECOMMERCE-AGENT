import { useEffect, useState } from "react";

function Product() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });

  // GET PRODUCTS
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // FORM INPUT
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ADD PRODUCT
  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to add product");
        return;
      }

      alert("Product added successfully!");

      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
      });

      setShowForm(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  // OPEN EDIT FORM
  const handleEdit = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      category: product.category || "",
    });

    setShowForm(true);
  };

  // UPDATE PRODUCT
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/products/${editingProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to update product");
        return;
      }

      alert("Product updated successfully!");

      setEditingProduct(null);

      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
      });

      setShowForm(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  // DELETE PRODUCT
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/products/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        alert("Failed to delete product");
        return;
      }

      alert("Product deleted successfully!");

      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  // SEARCH
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.description || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (product.category || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl">

      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Products
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Manage your products and inventory.
          </p>
        </div>

        {/* ADD BUTTON */}
        <button
          onClick={() => {
            setEditingProduct(null);

            setForm({
              name: "",
              description: "",
              price: "",
              category: "",
            });

            setShowForm(true);
          }}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          + Add Product
        </button>
      </div>

      {/* SUMMARY */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">
            Total Products
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            {products.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">
            Categories
          </p>

          <h2 className="mt-2 text-2xl font-bold text-blue-400">
            {new Set(products.map((product) => product.category)).size}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">
            Average Price
          </p>

          <h2 className="mt-2 text-2xl font-bold text-green-400">
            $
            {products.length
              ? (
                  products.reduce(
                    (total, product) => total + Number(product.price),
                    0
                  ) / products.length
                ).toFixed(2)
              : "0.00"}
          </h2>
        </div>

      </div>

      {/* SEARCH */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
        />
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-gray-800 bg-gray-900 p-6">

          <h2 className="mb-5 text-xl font-semibold text-white">
            {editingProduct ? "Edit Product" : "Add Product"}
          </h2>

          <form
            onSubmit={editingProduct ? handleUpdate : handleAdd}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >

            {/* NAME */}
            <input
              type="text"
              name="name"
              placeholder="Product name"
              value={form.name}
              onChange={handleChange}
              required
              className="rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            />

            {/* PRICE */}
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            />

            {/* CATEGORY */}
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={handleChange}
              required
              className="rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            />

            {/* DESCRIPTION */}
            <input
              type="text"
              name="description"
              placeholder="Product description"
              value={form.description}
              onChange={handleChange}
              className="rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            />

            {/* BUTTONS */}
            <div className="flex gap-3 md:col-span-2">

              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
              >
                {editingProduct ? "Update Product" : "Add Product"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
                className="rounded-xl bg-gray-800 px-5 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>

            </div>
          </form>
        </div>
      )}

      {/* PRODUCT TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">

        <div className="border-b border-gray-800 px-6 py-5">
          <h2 className="text-lg font-semibold text-white">
            Product List
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            View and manage your products.
          </p>
        </div>

        {loading ? (
          <div className="p-6 text-gray-400">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-6 text-gray-400">
            No products found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="border-b border-gray-800 bg-gray-950/50">

                <tr>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Product
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Description
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Price
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Category
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-800">

                {filteredProducts.map((product) => (

                  <tr
                    key={product.id}
                    className="transition hover:bg-gray-800/40"
                  >

                    {/* PRODUCT */}
                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-sm font-semibold text-blue-400">
                          {product.name.charAt(0)}
                        </div>

                        <div>

                          <p className="text-sm font-semibold text-white">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-600">
                            PROD-{String(product.id).padStart(3, "0")}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* DESCRIPTION */}
                    <td className="max-w-xs px-6 py-4 text-sm text-gray-400">
                      {product.description || "No description"}
                    </td>

                    {/* PRICE */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-white">
                      ${Number(product.price).toFixed(2)}
                    </td>

                    {/* CATEGORY */}
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                        {product.category}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4">

                      <div className="flex gap-2">

                        <button
                          onClick={() => handleEdit(product)}
                          className="rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-400 hover:bg-blue-500/20"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(product.id)}
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

export default Product;