"use client"

import InstituteLayout from "@/components/institute/page-layout";
import { useEffect, useState } from "react";

const PRICE_PER_CARD = 50;

const Page = () => {
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    async function fetchBatchData() {
      try {
        const res = await fetch("/api/institute/student-batches");
        if (!res.ok) throw new Error("Failed to fetch batch data");
        const data = await res.json();
        setBatches(data);
        console.log(data)
      } catch (err) {
        console.error("Error loading batch data:", err);
      }
    }
    fetchBatchData();
  }, []);

  return (
    <InstituteLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-sky-800">
          ID Card Billing Estimate by Batch
        </h1>

        <div className="overflow-x-auto max-w-full">
          <table className="min-w-[700px] w-full bg-white shadow-md rounded-lg overflow-hidden text-sm">
            <thead className="bg-sky-200 text-gray-700 text-left">
              <tr>
                <th className="px-6 py-3">Batch</th>
                <th className="px-6 py-3">Number of Students</th>
                <th className="px-6 py-3">Estimated Cost (₹50/card)</th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-3 text-center"
                    colSpan={3}
                  >
                    Loading...
                  </td>
                </tr>
              ) : (
                batches.map(({ start_year, end_year, count }, i) => (
                  <tr
                    key={i}
                    className="border-t even:bg-orange-50 odd:bg-white"
                  >
                    <td className="px-6 py-3 font-medium text-gray-700">{start_year} - {end_year}</td>
                    <td className="px-6 py-3">{count}</td>
                    <td className="px-6 py-3 font-semibold text-sky-700">₹{count * PRICE_PER_CARD}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </InstituteLayout>
  );
};

export default Page;
