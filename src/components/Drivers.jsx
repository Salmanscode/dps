import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { UserPlus, Trash2, Edit2 } from "lucide-react";

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    payment_preference: "both",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      alert("Error loading drivers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Update existing driver
        const { error } = await supabase
          .from("drivers")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
        alert("Driver updated successfully!");
      } else {
        // Add new driver
        const { error } = await supabase.from("drivers").insert([formData]);

        if (error) throw error;
        alert("Driver added successfully!");
      }

      setFormData({ name: "", phone: "", payment_preference: "both" });
      setShowForm(false);
      setEditingId(null);
      fetchDrivers();
    } catch (error) {
      console.error("Error saving driver:", error);
      alert("Error saving driver");
    }
  };

  const handleEdit = (driver) => {
    setFormData({
      name: driver.name,
      phone: driver.phone,
      payment_preference: driver.payment_preference,
    });
    setEditingId(driver.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;

    try {
      const { error } = await supabase.from("drivers").delete().eq("id", id);

      if (error) throw error;
      alert("Driver deleted successfully!");
      fetchDrivers();
    } catch (error) {
      console.error("Error deleting driver:", error);
      alert("Error deleting driver. They may have associated trips.");
    }
  };

  const getPreferenceLabel = (pref) => {
    const labels = {
      batta_only: "Batta Only (Weekly)",
      salary_only: "Salary Only (Monthly)",
      both: "Both (Batta + Salary)",
    };
    return labels[pref] || pref;
  };

  const getPreferenceBadge = (pref) => {
    const colors = {
      batta_only: "bg-yellow-100 text-yellow-800",
      salary_only: "bg-blue-100 text-blue-800",
      both: "bg-green-100 text-green-800",
    };
    return colors[pref] || "bg-gray-100 text-gray-800";
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
        <h1 className="text-3xl font-bold">Drivers Management</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: "", phone: "", payment_preference: "both" });
          }}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <UserPlus size={20} />
          <span>{showForm ? "Cancel" : "Add Driver"}</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? "Edit Driver" : "Add New Driver"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Driver Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter driver name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Preference *
              </label>
              <select
                required
                value={formData.payment_preference}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payment_preference: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="both">Both (Batta + Salary)</option>
                <option value="batta_only">Batta Only (Weekly)</option>
                <option value="salary_only">Salary Only (Monthly)</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                • Batta Only: All payment as weekly Batta
                <br />
                • Salary Only: All payment as monthly Salary
                <br />• Both: Split between Batta (weekly) and Salary (monthly)
              </p>
            </div>

            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              {editingId ? "Update Driver" : "Add Driver"}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Preference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {drivers.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No drivers found. Add your first driver to get started!
                </td>
              </tr>
            ) : (
              drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {driver.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {driver.phone || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPreferenceBadge(
                        driver.payment_preference
                      )}`}
                    >
                      {getPreferenceLabel(driver.payment_preference)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(driver)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(driver.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
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

export default Drivers;
