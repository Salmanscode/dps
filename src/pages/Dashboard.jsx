import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, TrendingUp, DollarSign, Activity, ArrowRight, ChevronRight, Zap, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [stats, setStats] = useState({
        drivers: 0,
        trips: 0,
        pending: 0,
        battaTotal: 0,
        salaryTotal: 0,
        recentTrips: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    async function fetchDashboardData() {
        try {
            setLoading(true);

            // 1. Get counts
            const { count: driverCount } = await supabase.from('drivers').select('*', { count: 'exact', head: true });
            const { count: tripCount } = await supabase.from('trips').select('*', { count: 'exact', head: true });

            // 2. Data for Calculations
            const { data: trips } = await supabase
                .from('trips')
                .select('*, drivers(name, payment_mode), routes(name, batta_amount, salary_amount)')
                .order('trip_date', { ascending: false });

            // 3. Settlements
            const { data: settlements } = await supabase.from('settlements').select('*');
            const totalPaid = settlements?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;

            let pendingBatta = 0;
            let pendingSalary = 0;

            trips?.forEach(t => {
                const driver = Array.isArray(t.drivers) ? t.drivers[0] : t.drivers;
                const route = Array.isArray(t.routes) ? t.routes[0] : t.routes;

                if (!driver || !route) return;

                const b = Number(route.batta_amount || 0);
                const s = Number(route.salary_amount || 0);
                const mode = driver.payment_mode || 'BATTA';

                // Check if trip is covered by a WEEKLY settlement
                const isWeeklySettled = settlements?.some(sett =>
                    sett.type === 'WEEKLY' &&
                    sett.driver_id === driver.id &&
                    t.trip_date >= sett.start_date &&
                    t.trip_date <= sett.end_date
                );

                // Check if trip is covered by a MONTHLY settlement
                const isMonthlySettled = settlements?.some(sett =>
                    sett.type === 'MONTHLY' &&
                    sett.driver_id === driver.id &&
                    t.trip_date >= sett.start_date &&
                    t.trip_date <= sett.end_date
                );

                if (mode === 'BATTA') {
                    if (!isWeeklySettled) pendingBatta += (b + s);
                } else if (mode === 'SALARY') {
                    if (!isMonthlySettled) pendingSalary += (b + s);
                } else if (mode === 'SPLIT') {
                    if (!isWeeklySettled) pendingBatta += b;
                    if (!isMonthlySettled) pendingSalary += s;
                }
            });

            const pending = pendingBatta + pendingSalary;

            let totalBatta = 0;
            let totalSalary = 0;

            trips?.forEach(t => {
                const route = Array.isArray(t.routes) ? t.routes[0] : t.routes;
                const b = Number(route?.batta_amount || 0);
                const s = Number(route?.salary_amount || 0);
                totalBatta += b;
                totalSalary += s;
            });

            setStats({
                drivers: driverCount || 0,
                trips: tripCount || 0,
                pending: pending,
                battaTotal: totalBatta,
                salaryTotal: totalSalary,
                totalPaid: totalPaid,
                recentTrips: trips?.slice(0, 5) || []
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h1>
                    <p className="text-gray-500 mt-1 text-base">Welcome back to your command center.</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/trips" className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-subtle flex items-center gap-2">
                        View Reports
                    </Link>
                    <Link to="/trips" className="bg-gray-900 text-white border border-gray-900 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition-all shadow-subtle flex items-center gap-2">
                        <Activity size={16} /> Log Trip
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SimpleCard
                    title="Total Drivers"
                    value={loading ? "..." : stats.drivers}
                    icon={<Users size={20} />}
                    trend="Active Fleet"
                    trendUp={true}
                />
                <SimpleCard
                    title="Total Trips"
                    value={loading ? "..." : stats.trips}
                    icon={<TrendingUp size={20} />}
                    trend="All Time"
                    trendUp={true}
                />
                <SimpleCard
                    title="Pending Settlements"
                    value={loading ? "..." : `₹ ${stats.pending.toLocaleString()}`}
                    icon={<DollarSign size={20} />}
                    trend="Estimated Dues"
                    trendUp={stats.pending === 0}
                />
            </div>

            {/* Bento Grid Layout for Activity & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Visual Report Area */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-card flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            Recent Activity
                        </h3>
                        <Link to="/trips" className="text-xs font-medium text-gray-500 hover:text-gray-900">View All</Link>
                    </div>

                    <div className="flex-1 space-y-3">
                        {loading ? (
                            <div className="text-center text-gray-400 py-10">Loading activity...</div>
                        ) : stats.recentTrips.length > 0 ? (
                            stats.recentTrips.map((trip) => (
                                <div key={trip.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100 group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                            {trip.drivers?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{trip.drivers?.name}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <MapPin size={10} /> {trip.routes?.name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-medium text-gray-400">
                                            {new Date(trip.trip_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400 font-medium text-sm">
                                No recent activity
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
                        <div className="px-2">
                            <div className="text-xs text-gray-500 uppercase font-medium mb-1">Total Batta</div>
                            <div className="text-sm md:text-lg text-gray-900 font-bold">{loading ? "..." : `₹ ${stats.battaTotal.toLocaleString()}`}</div>
                        </div>
                        <div className="px-2 border-l border-gray-100 border-r">
                            <div className="text-xs text-gray-500 uppercase font-medium mb-1">Total Salary</div>
                            <div className="text-sm md:text-lg text-gray-900 font-bold">{loading ? "..." : `₹ ${stats.salaryTotal.toLocaleString()}`}</div>
                        </div>
                        <div className="px-2">
                            <div className="text-xs text-gray-500 uppercase font-medium mb-1">Total Paid</div>
                            <div className="text-sm md:text-lg text-green-600 font-bold">{loading ? "..." : `₹ ${stats.totalPaid.toLocaleString()}`}</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Column */}
                <div className="space-y-6">
                    <Link to="/settlements" className="block bg-gray-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden group cursor-pointer border border-gray-800">
                        <div className="absolute top-0 right-0 p-16 bg-white opacity-5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700"></div>
                        <div className="relative z-10">
                            <div className="p-2 bg-white/10 w-fit rounded-lg mb-4">
                                <Zap size={20} />
                            </div>
                            <h3 className="text-lg font-bold mb-1">Process Settlements</h3>
                            <p className="text-gray-300 text-sm mb-4">Calculate and clear pending dues.</p>
                            <div className="text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                                Go to Settlements <ArrowRight size={14} />
                            </div>
                        </div>
                    </Link>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-card">
                        <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Links</h3>
                        <div className="space-y-1">
                            <QuickLink to="/drivers" label="Add New Driver" />
                            <QuickLink to="/trips" label="Review Trip Logs" />
                            <QuickLink to="/settlements" label="Download Reports" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const SimpleCard = ({ title, value, icon, trend, trendUp }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-card flex flex-col justify-between h-32 hover:border-gray-300 transition-colors">
        <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <div className="text-gray-400">{icon}</div>
        </div>
        <div>
            <div className="text-2xl font-bold text-gray-900 tracking-tight">{value}</div>
            <div className={`text-xs font-medium mt-1 ${trendUp ? 'text-green-600' : 'text-gray-500'}`}>
                {trend}
            </div>
        </div>
    </div>
);

const QuickLink = ({ to, label }) => (
    <Link to={to} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{label}</span>
        <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
    </Link>
);
