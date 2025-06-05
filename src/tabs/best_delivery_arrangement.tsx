// best_delivery_arrangement.tsx
import React, { useState } from "react";

type OptimizeResult = {
  summary: any;
  bestScore: number;
  scoreHistory: number[];
  table: any[];
};

export default function BestDeliveryArrangement() {
  const [method, setMethod] = useState<"tabu" | "ga">("tabu");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizeResult | null>(null);

  const handleRun = async () => {
    setLoading(true);
    try {
      const endpoint = method === "tabu"
        ? "http://localhost:5001/tabu_optimize"
        : "http://localhost:5001/ga_optimize";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).then((r) => r.json());
      setResult(res);
      console.log("Response result:", result);
    } catch (error) {
      console.error("Failed to optimize", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-gray-100 flex items-center justify-center p-6">
      <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg max-w-xl w-full p-8 text-gray-900">
        <h1 className="text-3xl font-bold text-center mb-2">Best Delivery Arrangement</h1>
        <p className="text-center text-gray-700 mb-6">Select a method and run optimization.</p>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setMethod("tabu")}
            className={`px-4 py-2 rounded-lg border shadow-md transition ${
              method === "tabu"
                ? "bg-gray-200 text-black"
                : "bg-white/60 text-gray-800 hover:bg-white/80"
            }`}
          >
            Tabu Search
          </button>
          <button
            onClick={() => setMethod("ga")}
            className={`px-4 py-2 rounded-lg border shadow-md transition ${
              method === "ga"
                ? "bg-gray-200 text-black"
                : "bg-white/60 text-gray-800 hover:bg-white/80"
            }`}
          >
            Genetic Algorithm
          </button>
        </div>

        <div className="text-center mb-4">
          <button
            onClick={handleRun}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-indigo-400 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Running..." : "Run Optimization"}
          </button>
        </div>

        {result && (
          <div className="mt-6 text-sm text-gray-800">
            <h3 className="font-semibold mb-2">Optimization Result</h3>
            <p><strong>Best Score:</strong> {result.bestScore}</p>
            <p><strong>Best Order:</strong> {Array.isArray(result.summary?.best_order) ? result.summary.best_order.join(", ") : "N/A"}</p>
          </div>
        )}
      </div>
    </div>
  );
}