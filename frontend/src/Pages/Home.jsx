
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center shadow-2xl">

        <h1 className="text-4xl font-bold text-white">
          Welcome to Our Store
        </h1>

        <p className="mt-4 text-gray-400">
          Shop your favorite products with us.
        </p>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="flex-1 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/register")}
            className="flex-1 rounded-lg border border-blue-500 px-5 py-3 font-semibold text-blue-400 transition hover:bg-blue-500/10"
          >
            Register
          </button>
        </div>

      </div>
    </div>
  );
}

export default Home;

