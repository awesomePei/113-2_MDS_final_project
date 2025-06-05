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
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setMethod("tabu")} style={{ marginRight: 8, background: method === "tabu" ? "#ddd" : "#fff" }}>Tabu Search</button>
        <button onClick={() => setMethod("ga")} style={{ background: method === "ga" ? "#ddd" : "#fff" }}>Genetic Algorithm</button>
      </div>

      <div style={{ marginBottom: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <button
          onClick={handleRun}
          disabled={loading}
          style={{
            padding: "8px 16px",
            border: "1px solid #888",
            borderRadius: 4,
            background: loading ? "#eee" : "#f5f5f5",
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            minWidth: 130
          }}
        >
          {loading ? "Running..." : "Run Optimization"}
        </button>
      </div>
      {result && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontWeight: 600 }}>Optimization Result</h3>
          <p><strong>Best Score:</strong> {result.bestScore}</p>
          <p><strong>Best Order:</strong> {Array.isArray(result.summary?.best_order) ? result.summary.best_order.join(", ") : "N/A"}</p>
        </div>
      )}
    </div>
  );
}