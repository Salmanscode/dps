import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Users, MapPin, DollarSign, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    totalTrips: 0,
    pendingBatta: 0,
    pendingSalary: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total drivers
      const { count: driversCount } = await supabase
        .from("drivers")
        .select("*", { count: "exact", head: true });

      // Get total trips
      const { count: tripsCount } = await supabase
        .from("trips")
        .select("*", { count: "exact", head: true });

      // Calculate pending payments
      const { data: trips } = await supabase.from("trips").select(`
          *,
          driver:drivers(*),
          route:routes(*)
        `);

      // Get all settlements to know which trips are already settled
      const { data: settlements } = await supabase
        .from("settlements")
        .select("trip_ids");

      const settledTripIds = new Set();
      settlements?.forEach((settlement) => {
        settlement.trip_ids?.forEach((id) => settledTripIds.add(id));
      });

      let pendingBatta = 0;
      let pendingSalary = 0;

      trips?.forEach((trip) => {
        if (!settledTripIds.has(trip.id)) {
          const { driver, route } = trip;
          if (driver && route) {
            if (driver.payment_preference === "batta_only") {
              pendingBatta +=
                parseFloat(route.batta_per_trip) +
                parseFloat(route.salary_per_trip);
            } else if (driver.payment_preference === "salary_only") {
              pendingSalary +=
                parseFloat(route.batta_per_trip) +
                parseFloat(route.salary_per_trip);
            } else {
              pendingBatta += parseFloat(route.batta_per_trip);
              pendingSalary += parseFloat(route.salary_per_trip);
            }
          }
        }
      });

      setStats({
        totalDrivers: driversCount || 0,
        totalTrips: tripsCount || 0,
        pendingBatta: pendingBatta.toFixed(2),
        pendingSalary: pendingSalary.toFixed(2),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-opacity-10 ${color}`}>
          <Icon size={32} className="text-current" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Drivers"
          value={stats.totalDrivers}
          color="border-blue-500 text-blue-500"
        />
        <StatCard
          icon={MapPin}
          label="Total Trips"
          value={stats.totalTrips}
          color="border-green-500 text-green-500"
        />
        <StatCard
          icon={DollarSign}
          label="Pending Batta (Weekly)"
          value={`₹${stats.pendingBatta}`}
          color="border-yellow-500 text-yellow-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Pending Salary (Monthly)"
          value={`₹${stats.pendingSalary}`}
          color="border-purple-500 text-purple-500"
        />
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => (window.location.href = "/drivers")}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add New Driver
          </button>
          <button
            onClick={() => (window.location.href = "/trips")}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            Record New Trip
          </button>
          <button
            onClick={() => (window.location.href = "/settlements")}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Settle Payments
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
