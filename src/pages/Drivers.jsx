import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, User, CreditCard, MoreHorizontal, X } from 'lucide-react';

export default function Drivers() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newDriver, setNewDriver] = useState({ name: '', payment_mode: 'BATTA' });

    useEffect(() => { fetchDrivers(); }, []);

    async function fetchDrivers() {
        setLoading(true);
        const { data } = await supabase.from('drivers').select('*').order('name');
        setDrivers(data || []);
        setLoading(false);
    }

    async function addDriver(e) {
        e.preventDefault();
        await supabase.from('drivers').insert([newDriver]);
        setShowModal(false);
        setNewDriver({ name: '', payment_mode: 'BATTA' });
        fetchDrivers();
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Fleet Drivers</h1>
                    <p className="text-gray-500 text-sm">Manage your driver profiles and settings.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-black transition-all shadow-subtle border border-gray-900 active:scale-95"
                >
                    <Plus size={18} />
                    Add Driver
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drivers.map(driver => (
                    <div key={driver.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-subtle hover:border-gray-300 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium">
                                {driver.name.charAt(0)}
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>

                        <h3 className="text-base font-bold text-gray-900">{driver.name}</h3>
                        <p className="text-xs text-gray-500 font-mono mb-4">ID: {driver.id.slice(0, 8)}</p>

                        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                                <CreditCard size={12} /> Mode
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${driver.payment_mode === 'BATTA' ? 'bg-green-50 text-green-700' :
                                driver.payment_mode === 'SALARY' ? 'bg-purple-50 text-purple-700' :
                                    'bg-orange-50 text-orange-700'
                                }`}>
                                {driver.payment_mode}
                            </span>
                        </div>
                    </div>
                ))}

                <button
                    onClick={() => setShowModal(true)}
                    className="border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all gap-2"
                >
                    <Plus size={24} />
                    <span className="text-sm font-medium">Add New Driver</span>
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-popover animate-slide-in relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-lg font-bold text-gray-900 mb-4">New Driver</h2>
                        <form onSubmit={addDriver} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. John Doe"
                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                                    value={newDriver.name}
                                    onChange={e => setNewDriver({ ...newDriver, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                                <select
                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                                    value={newDriver.payment_mode}
                                    onChange={e => setNewDriver({ ...newDriver, payment_mode: e.target.value })}
                                >
                                    <option value="BATTA">Weekly Batta</option>
                                    <option value="SALARY">Monthly Salary</option>
                                    <option value="SPLIT">Split (Both)</option>
                                </select>
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-all shadow-subtle text-sm active:scale-95 border border-gray-900">
                                    Create Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
