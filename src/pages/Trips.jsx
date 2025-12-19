import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, MapPin, Truck, ChevronRight, ArrowRight } from 'lucide-react';

export default function Trips() {
    const [trips, setTrips] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [routes, setRoutes] = useState([]);

    const [newTrip, setNewTrip] = useState({
        driver_id: '',
        route_id: '',
        trip_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        const { data: d } = await supabase.from('drivers').select('*');
        const { data: r } = await supabase.from('routes').select('*');
        const { data: t } = await supabase.from('trips').select('*, drivers(name), routes(name, origin, destination)').order('trip_date', { ascending: false });
        setDrivers(d || []);
        setRoutes(r || []);
        setTrips(t || []);
    }

    async function logTrip(e) {
        e.preventDefault();
        await supabase.from('trips').insert([newTrip]);
        setNewTrip({ ...newTrip, driver_id: '', route_id: '' });
        loadData();
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Trip Logging Form */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-card sticky top-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Log New Trip</h2>
                    <form onSubmit={logTrip} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                required
                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                                value={newTrip.trip_date}
                                onChange={e => setNewTrip({ ...newTrip, trip_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                            <select
                                required
                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                                value={newTrip.driver_id}
                                onChange={e => setNewTrip({ ...newTrip, driver_id: e.target.value })}
                            >
                                <option value="">Select Driver...</option>
                                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                            <select
                                required
                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                                value={newTrip.route_id}
                                onChange={e => setNewTrip({ ...newTrip, route_id: e.target.value })}
                            >
                                <option value="">Select Route...</option>
                                {routes.map(r => <option key={r.id} value={r.id}>{r.name} ({r.origin}-{r.destination})</option>)}
                            </select>
                        </div>
                        <div className="pt-2">
                            <button className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black shadow-subtle transition-all text-sm flex items-center justify-center gap-2 border border-gray-900 active:scale-95">
                                Record Trip <ArrowRight size={14} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Trip History List */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Last 50 entries</span>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-card">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 w-1/4">Date</th>
                                <th className="px-6 py-3 w-1/4">Driver</th>
                                <th className="px-6 py-3 w-1/3">Route</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {trips.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 text-gray-900 font-medium">
                                        {new Date(t.trip_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold">
                                                {t.drivers?.name?.charAt(0)}
                                            </div>
                                            <span className="text-gray-900">{t.drivers?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={12} className="text-gray-400" />
                                            {t.routes?.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-gray-900 transition-colors">
                                            <ChevronRight size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {trips.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                        No trips logged yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
