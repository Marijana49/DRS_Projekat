import { Link } from "react-router-dom";

export default function NotFoundStranica() {
  return (
    <main className="flex items-center justify-center bg-gradient-to-tr from-orange-500 to-indigo-500 min-h-screen">
      <div className="bg-indigo-100/50  border-3 border-indigo-700 shadow-lg rounded-xl px-10 py-14 text-center">
        <h1 className="text-6xl font-extrabold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          Page you are looking for is missing or moved
        </p>
        <Link
          to="/"
          className="inline-block bg-indigo-700 text-white px-6 py-2 rounded hover:bg-indigo-900 transition duration-500"
        >
          Back
        </Link>
      </div>
    </main>
  );
}