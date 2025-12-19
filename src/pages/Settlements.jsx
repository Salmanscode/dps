import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, Info, DollarSign, Calendar } from 'lucide-react';

export default function Settlements() {
    const [activeTab, setActiveTab] = useState('WEEKLY');
    const [dues, setDues] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadAll();
    }, [activeTab]);

    async function loadAll() {
        setLoading(true);
        try {
            await Promise.all([calculate(), fetchHistory()]);
        } catch (error) {
            console.error("Load all error:", error);
        } finally {
            setLoading(false);
        }
    }

    async function calculate() {
        try {
            // Fetch all trips and all settlements of this type to determine status
            const [{ data: trips, error: tError }, { data: settlements, error: sError }] = await Promise.all([
                supabase.from('trips').select('*, drivers(*), routes(*)'),
                supabase.from('settlements').select('*').eq('type', activeTab)
            ]);

            if (tError) throw tError;
            if (sError) throw sError;

            if (!trips) {
                setDues([]);
                return;
            }

            const map = {};
            trips.forEach(t => {
                // Defensive extraction of joined data
                const driver = Array.isArray(t.drivers) ? t.drivers[0] : t.drivers;
                const route = Array.isArray(t.routes) ? t.routes[0] : t.routes;

                if (!driver || !route) return;

                // Check if trip is settled in THIS category
                const isSettled = settlements?.some(s =>
                    s.driver_id === driver.id &&
                    t.trip_date >= s.start_date &&
                    t.trip_date <= s.end_date
                );

                if (isSettled) return;

                const did = driver.id;
                if (!map[did]) {
                    map[did] = {
                        driver: driver,
                        amount: 0,
                        trips: 0,
                        tripDates: [],
                        breakdown: []
                    };
                }

                const batta = Number(route.batta_amount || 0);
                const salary = Number(route.salary_amount || 0);
                const mode = driver.payment_mode || 'BATTA';
                let pay = 0;
                let reason = '';

                if (activeTab === 'WEEKLY') {
                    if (mode === 'BATTA') {
                        pay = batta + salary;
                        reason = `Total (Trip ${t.trip_date})`;
                    } else if (mode === 'SPLIT') {
                        pay = batta;
                        reason = `Batta (Trip ${t.trip_date})`;
                    }
                } else {
                    if (mode === 'SALARY') {
                        pay = batta + salary;
                        reason = `Total (Trip ${t.trip_date})`;
                    } else if (mode === 'SPLIT') {
                        pay = salary;
                        reason = `Salary (Trip ${t.trip_date})`;
                    }
                }

                if (pay > 0) {
                    map[did].amount += pay;
                    map[did].trips += 1;
                    map[did].tripDates.push(t.trip_date);
                    map[did].breakdown.push({ amount: pay, reason });
                }
            });

            setDues(Object.values(map));
        } catch (error) {
            console.error("Calculate error:", error);
            alert("Failed to calculate dues. Please check your connection.");
        }
    }

    async function fetchHistory() {
        try {
            const { data, error } = await supabase.from('settlements').select('*, drivers(name)').eq('type', activeTab).order('created_at', { ascending: false });
            if (error) throw error;
            setHistory(data || []);
        } catch (error) {
            console.error("Fetch history error:", error);
        }
    }

    async function settle(id, amount, tripDates) {
        if (amount <= 0 || !confirm("Confirm settlement?")) return;

        setProcessing(true);
        try {
            // Calculate date range for the settlement
            const sortedDates = [...tripDates].sort();
            const startDate = sortedDates[0];
            const endDate = sortedDates[sortedDates.length - 1];

            // Create the settlement record
            const { error: sError } = await supabase
                .from('settlements')
                .insert([{
                    driver_id: id,
                    amount: Number(amount),
                    type: activeTab,
                    start_date: startDate,
                    end_date: endDate
                }]);

            if (sError) throw sError;

            alert("Settlement processed successfully!");
            await loadAll();
        } catch (error) {
            console.error("Settlement error:", error);
            alert("Settlement failed: " + (error.message || "Unknown error"));
        } finally {
            setProcessing(false);
        }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settlements</h1>
                    <p className="text-gray-500 mt-1">Calculate payouts and view payment history.</p>
                </div>

                <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                    {['WEEKLY', 'MONTHLY'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {tab === 'WEEKLY' ? 'Weekly Batta' : 'Monthly Salary'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Calculated Dues Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <DollarSign size={20} className="text-gray-900" />
                        <h2 className="text-lg font-bold text-gray-900">Pending Dues</h2>
                    </div>

                    <div className="space-y-4">
                        {dues.map((d, i) => (
                            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-subtle hover:border-gray-300 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-3">
                                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                                            {d.driver.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900">{d.driver.name}</h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs font-medium text-gray-500 border border-gray-200 px-1.5 rounded">{d.driver.payment_mode}</span>
                                                <span className="text-xs text-gray-400">{d.trips} Trips</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xl font-bold text-gray-900">₹ {d.amount.toLocaleString()}</span>
                                        <div className="text-xs text-gray-400 mt-0.5">Total Payable</div>
                                    </div>
                                </div>

                                {d.amount > 0 ? (
                                    <button
                                        onClick={() => settle(d.driver.id, d.amount, d.tripDates)}
                                        disabled={processing}
                                        className={`w-full py-3 ${processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black'} text-white text-sm font-bold rounded-lg transition-all shadow-subtle border border-gray-900 active:scale-95`}
                                    >
                                        {processing ? 'Processing...' : 'Settle Payment'}
                                    </button>
                                ) : (
                                    <div className="w-full py-2 bg-gray-50 text-gray-400 text-sm font-medium rounded-lg text-center cursor-not-allowed">
                                        No Dues Pending
                                    </div>
                                )}

                                {d.breakdown.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Breakdown</div>
                                        <div className="space-y-1.5">
                                            {d.breakdown.map((b, idx) => (
                                                <div key={idx} className="flex justify-between text-xs text-gray-600">
                                                    <span>{b.reason}</span>
                                                    <span className="font-medium">+₹{b.amount}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading ? (
                            <div className="p-12 text-center text-gray-400">Loading dues...</div>
                        ) : dues.length === 0 && (
                            <div className="p-12 text-center text-gray-400 bg-white border border-dashed border-gray-200 rounded-xl">
                                No calculations available.
                            </div>
                        )}
                    </div>
                </div>

                {/* History Section */}
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar size={20} className="text-gray-900" />
                        <h2 className="text-lg font-bold text-gray-900">Payment History</h2>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Driver</th>
                                    <th className="px-6 py-3 text-right">Date</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.map(h => (
                                    <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {h.drivers?.name}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-500">
                                            {new Date(h.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                ₹ {h.amount.toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {history.length === 0 && (
                                    <tr><td colSpan="3" className="p-8 text-center text-gray-400">No payment history found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
