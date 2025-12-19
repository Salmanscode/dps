import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { MapPin, Plus, Trash2 } from "lucide-react";

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    driver_id: "",
    route_id: "",
    vehicle_number: "",
    trip_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tripsRes, driversRes, routesRes] = await Promise.all([
        supabase
          .from("trips")
          .select(
            `
          *,
          driver:drivers(name, payment_preference),
          route:routes(route_name, from_location, to_location, batta_per_trip, salary_per_trip)
        `
          )
          .order("trip_date", { ascending: false }),
        supabase.from("drivers").select("*").order("name"),
        supabase.from("routes").select("*").order("route_name"),
      ]);

      if (tripsRes.error) throw tripsRes.error;
      if (driversRes.error) throw driversRes.error;
      if (routesRes.error) throw routesRes.error;

      setTrips(tripsRes.data || []);
      setDrivers(driversRes.data || []);
      setRoutes(routesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from("trips").insert([formData]);

      if (error) throw error;

      alert("Trip recorded successfully!");
      setFormData({
        driver_id: "",
        route_id: "",
        vehicle_number: "",
        trip_date: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error("Error recording trip:", error);
      alert("Error recording trip");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    try {
      const { error } = await supabase.from("trips").delete().eq("id", id);

      if (error) throw error;
      alert("Trip deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Error deleting trip");
    }
  };

  const calculatePayment = (trip) => {
    if (!trip.driver || !trip.route) return { batta: 0, salary: 0 };

    const { batta_per_trip, salary_per_trip } = trip.route;
    const total = parseFloat(batta_per_trip) + parseFloat(salary_per_trip);

    if (trip.driver.payment_preference === "batta_only") {
      return { batta: total, salary: 0 };
    } else if (trip.driver.payment_preference === "salary_only") {
      return { batta: 0, salary: total };
    } else {
      return {
        batta: parseFloat(batta_per_trip),
        salary: parseFloat(salary_per_trip),
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Trips Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>{showForm ? "Cancel" : "Record Trip"}</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Record New Trip</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Driver *</label>
              <select
                required
                value={formData.driver_id}
                onChange={(e) =>
                  setFormData({ ...formData, driver_id: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Driver</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} (
                    {driver.payment_preference === "both"
                      ? "Batta+Salary"
                      : driver.payment_preference === "batta_only"
                      ? "Batta Only"
                      : "Salary Only"}
                    )
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Route *</label>
              <select
                required
                value={formData.route_id}
                onChange={(e) =>
                  setFormData({ ...formData, route_id: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Route</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.route_name} (Batta: ₹{route.batta_per_trip}, Salary:
                    ₹{route.salary_per_trip})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Vehicle Number *
              </label>
              <input
                type="text"
                required
                value={formData.vehicle_number}
                onChange={(e) =>
                  setFormData({ ...formData, vehicle_number: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., AP39VD6284"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Trip Date *
              </label>
              <input
                type="date"
                required
                value={formData.trip_date}
                onChange={(e) =>
                  setFormData({ ...formData, trip_date: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Record Trip
            </button>
          </form>
        </div>
      )}

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
                Route
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Batta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Salary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trips.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No trips found. Record your first trip to get started!
                </td>
              </tr>
            ) : (
              trips.map((trip) => {
                const payment = calculatePayment(trip);
                return (
                  <tr key={trip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(trip.trip_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {trip.driver?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {trip.route?.route_name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {trip.vehicle_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-yellow-600">
                      ₹{payment.batta.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      ₹{payment.salary.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(trip.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Trips;
