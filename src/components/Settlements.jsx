import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { DollarSign, Calendar, CheckCircle } from "lucide-react";

const Settlements = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      // Get all trips with driver and route info
      const { data: trips, error: tripsError } = await supabase.from("trips")
        .select(`
          *,
          driver:drivers(*),
          route:routes(*)
        `);

      if (tripsError) throw tripsError;

      // Get all settlements to know which trips are settled
      const { data: settlements, error: settlementsError } = await supabase
        .from("settlements")
        .select("trip_ids");

      if (settlementsError) throw settlementsError;

      const settledTripIds = new Set();
      settlements?.forEach((settlement) => {
        settlement.trip_ids?.forEach((id) => settledTripIds.add(id));
      });

      // Group unsettled trips by driver
      const driverPayments = {};

      trips?.forEach((trip) => {
        if (!settledTripIds.has(trip.id) && trip.driver && trip.route) {
          const driverId = trip.driver.id;

          if (!driverPayments[driverId]) {
            driverPayments[driverId] = {
              driver: trip.driver,
              batta: 0,
              salary: 0,
              tripIds: [],
              tripCount: 0,
            };
          }

          const { batta_per_trip, salary_per_trip } = trip.route;
          const total =
            parseFloat(batta_per_trip) + parseFloat(salary_per_trip);

          if (trip.driver.payment_preference === "batta_only") {
            driverPayments[driverId].batta += total;
          } else if (trip.driver.payment_preference === "salary_only") {
            driverPayments[driverId].salary += total;
          } else {
            driverPayments[driverId].batta += parseFloat(batta_per_trip);
            driverPayments[driverId].salary += parseFloat(salary_per_trip);
          }

          driverPayments[driverId].tripIds.push(trip.id);
          driverPayments[driverId].tripCount++;
        }
      });

      setPendingPayments(Object.values(driverPayments));
    } catch (error) {
      console.error("Error fetching pending payments:", error);
      alert("Error loading pending payments");
    } finally {
      setLoading(false);
    }
  };

  const settlePayments = async (type) => {
    if (!confirm(`Are you sure you want to settle all ${type} payments?`))
      return;

    setSettling(true);

    try {
      const settlements = [];

      for (const payment of pendingPayments) {
        const amount = type === "weekly" ? payment.batta : payment.salary;

        if (amount > 0) {
          settlements.push({
            driver_id: payment.driver.id,
            settlement_type: type,
            amount: amount,
            trip_ids: payment.tripIds,
            settled_by: "Admin",
          });
        }
      }

      if (settlements.length === 0) {
        alert(`No ${type} payments to settle!`);
        setSettling(false);
        return;
      }

      const { error } = await supabase.from("settlements").insert(settlements);

      if (error) throw error;

      alert(
        `${
          type === "weekly" ? "Weekly (Batta)" : "Monthly (Salary)"
        } payments settled successfully!`
      );
      fetchPendingPayments();
    } catch (error) {
      console.error("Error settling payments:", error);
      alert("Error settling payments");
    } finally {
      setSettling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const totalBatta = pendingPayments.reduce((sum, p) => sum + p.batta, 0);
  const totalSalary = pendingPayments.reduce((sum, p) => sum + p.salary, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settlements</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">
                Total Pending Batta (Weekly)
              </p>
              <p className="text-4xl font-bold mt-2">
                ₹{totalBatta.toFixed(2)}
              </p>
              <p className="text-yellow-100 text-sm mt-2">
                {pendingPayments.filter((p) => p.batta > 0).length} drivers
              </p>
            </div>
            <Calendar size={48} className="text-yellow-200" />
          </div>
          <button
            onClick={() => settlePayments("weekly")}
            disabled={settling || totalBatta === 0}
            className="mt-4 w-full bg-white text-yellow-600 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <CheckCircle size={20} />
            <span>Settle Weekly Payments</span>
          </button>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">
                Total Pending Salary (Monthly)
              </p>
              <p className="text-4xl font-bold mt-2">
                ₹{totalSalary.toFixed(2)}
              </p>
              <p className="text-blue-100 text-sm mt-2">
                {pendingPayments.filter((p) => p.salary > 0).length} drivers
              </p>
            </div>
            <DollarSign size={48} className="text-blue-200" />
          </div>
          <button
            onClick={() => settlePayments("monthly")}
            disabled={settling || totalSalary === 0}
            className="mt-4 w-full bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <CheckCircle size={20} />
            <span>Settle Monthly Payments</span>
          </button>
        </div>
      </div>

      {/* Pending Payments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-bold">Pending Payments by Driver</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Driver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Payment Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Trips
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Pending Batta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Pending Salary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pendingPayments.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No pending payments. All settled! 🎉
                </td>
              </tr>
            ) : (
              pendingPayments.map((payment, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.driver.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payment.driver.phone || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.driver.payment_preference === "batta_only"
                          ? "bg-yellow-100 text-yellow-800"
                          : payment.driver.payment_preference === "salary_only"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {payment.driver.payment_preference === "both"
                        ? "Batta + Salary"
                        : payment.driver.payment_preference === "batta_only"
                        ? "Batta Only"
                        : "Salary Only"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.tripCount} trips
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-yellow-600">
                    ₹{payment.batta.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    ₹{payment.salary.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    ₹{(payment.batta + payment.salary).toFixed(2)}
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

export default Settlements;
