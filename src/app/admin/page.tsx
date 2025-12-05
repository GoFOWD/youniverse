'use client';

import { useEffect, useState } from 'react';
import AdManager from '../../components/admin/AdManager';

interface Stats {
    totalUsers: number;
    averageRating: number;
    recentComments: Array<{
        id: number;
        created_at: string;
        rating: number | null;
        comment: string | null;
    }>;
    dailyData: { [key: string]: number };
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then((data) => {
                setStats(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message || 'Failed to load data');
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-white p-8 font-mono">INITIALIZING SYSTEM...</div>;
    if (error) return <div className="text-red-500 p-8 font-mono">SYSTEM ERROR: {error}</div>;
    if (!stats) return <div className="text-red-500 p-8 font-mono">NO DATA AVAILABLE</div>;

    // Calculate max value for graph scaling
    const maxDaily = Math.max(...Object.values(stats.dailyData), 1);

    return (
        <div className="space-y-4 sm:space-y-8 font-mono text-green-500 p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold border-b-2 border-green-800 pb-2 sm:pb-4 tracking-tighter">
                <span className="mr-2 animate-pulse">█</span>
                SYSTEM_DASHBOARD
            </h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total Users */}
                <section className="bg-black border border-green-800 p-4 sm:p-6 rounded-none flex flex-col justify-center items-center">
                    <h2 className="text-sm sm:text-base font-bold uppercase tracking-widest mb-2">Total Users</h2>
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white animate-pulse">
                        {stats.totalUsers}
                    </div>
                    <div className="text-xs text-green-700 mt-1">ACTIVE RECORDS</div>
                </section>

                {/* Average Rating */}
                <section className="bg-black border border-green-800 p-4 sm:p-6 rounded-none flex flex-col justify-center items-center">
                    <h2 className="text-sm sm:text-base font-bold uppercase tracking-widest mb-2">Average Rating</h2>
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-yellow-500">
                        {stats.averageRating.toFixed(2)}
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                        {'★'.repeat(Math.round(stats.averageRating))}
                    </div>
                </section>
            </div>

            {/* Daily Activity Graph (Last 7 Days) */}
            <section className="bg-black border border-green-800 p-4 sm:p-6 rounded-none">
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-widest mb-4">Daily Activity (Last 7 Days)</h2>
                <div className="flex items-end justify-between gap-2 h-48">
                    {Object.entries(stats.dailyData).map(([date, count]) => {
                        const height = maxDaily > 0 ? (count / maxDaily) * 100 : 0;
                        const dateObj = new Date(date);
                        const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

                        return (
                            <div key={date} className="flex-1 flex flex-col items-center gap-2">
                                <div className="text-xs text-green-700 font-bold">{count}</div>
                                <div
                                    className="w-full bg-green-600 transition-all duration-500 hover:bg-green-500"
                                    style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                                />
                                <div className="text-xs text-green-700 whitespace-nowrap">{label}</div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Ad Manager */}
            <AdManager />

            {/* Recent Comments */}
            <section className="bg-black border border-green-800 p-4 sm:p-6 rounded-none">
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-widest mb-4 sm:mb-6">Recent Comments</h2>

                <div className="space-y-3">
                    {stats.recentComments.length === 0 ? (
                        <div className="px-4 py-8 text-center text-green-900">NO COMMENTS DETECTED</div>
                    ) : (
                        stats.recentComments.map((comment) => (
                            <div key={comment.id} className="border border-green-900 p-4 hover:bg-green-900/20 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="text-xs text-green-600 font-mono">
                                        {new Date(comment.created_at).toLocaleString()}
                                    </div>
                                    <div className="text-yellow-500 text-sm">
                                        {comment.rating ? '★'.repeat(comment.rating) : '-'}
                                    </div>
                                </div>
                                <div className="text-white italic text-sm">
                                    "{comment.comment}"
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
