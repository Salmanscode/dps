import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { History as HistoryIcon, Calendar, Filter } from "lucide-react";

const History = () => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, weekly, monthly

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    try {
      const { data, error } = await supabase
        .from("settlements")
        .select(
          `
          *,
          driver:drivers(name, phone)
        `
        )
        .order("settlement_date", { ascending: false });

      if (error) throw error;
      setSettlements(data || []);
    } catch (error) {
      console.error("Error fetching settlements:", error);
      alert("Error loading settlement history");
    } finally {
      setLoading(false);
    }
  };

  const filteredSettlements = settlements.filter((settlement) => {
    if (filter === "all") return true;
    return settlement.settlement_type === filter;
  });

  const totalSettled = settlements.reduce(
    (sum, s) => sum + parseFloat(s.amount),
    0
  );
  const weeklyTotal = settlements
    .filter((s) => s.settlement_type === "weekly")
    .reduce((sum, s) => sum + parseFloat(s.amount), 0);
  const monthlyTotal = settlements
    .filter((s) => s.settlement_type === "monthly")
    .reduce((sum, s) => sum + parseFloat(s.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settlement History</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Settled</p>
              <p className="text-3xl font-bold mt-2">
                ₹{totalSettled.toFixed(2)}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {settlements.length} settlements
              </p>
            </div>
            <HistoryIcon size={48} className="text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                Weekly (Batta)
              </p>
              <p className="text-3xl font-bold mt-2">
                ₹{weeklyTotal.toFixed(2)}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {
                  settlements.filter((s) => s.settlement_type === "weekly")
                    .length
                }{" "}
                settlements
              </p>
            </div>
            <Calendar size={48} className="text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                Monthly (Salary)
              </p>
              <p className="text-3xl font-bold mt-2">
                ₹{monthlyTotal.toFixed(2)}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {
                  settlements.filter((s) => s.settlement_type === "monthly")
                    .length
                }{" "}
                settlements
              </p>
            </div>
            <Calendar size={48} className="text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-purple-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("weekly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "weekly"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Weekly (Batta)
            </button>
            <button
              onClick={() => setFilter("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "monthly"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Monthly (Salary)
            </button>
          </div>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Driver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Trips
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Settled By
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSettlements.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  {filter === "all"
                    ? "No settlement history found."
                    : `No ${filter} settlements found.`}
                </td>
              </tr>
            ) : (
              filteredSettlements.map((settlement) => (
                <tr key={settlement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(settlement.settlement_date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {settlement.driver?.name || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {settlement.driver?.phone || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        settlement.settlement_type === "weekly"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {settlement.settlement_type === "weekly"
                        ? "Weekly (Batta)"
                        : "Monthly (Salary)"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    ₹{parseFloat(settlement.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {settlement.trip_ids?.length || 0} trips
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {settlement.settled_by || "Admin"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
