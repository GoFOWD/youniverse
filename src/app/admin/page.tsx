'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface Stats {
    totalUsers: number;
    recentAnswers: any[];
    totalRecords: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    // Filter states
    const [ratingFilter, setRatingFilter] = useState<string>('');

    // Debounce timer
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Debounced fetch function
    const fetchStats = useCallback((page: number, rating: string) => {
        // Clear existing timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set debounce timer (100ms for faster response)
        debounceTimer.current = setTimeout(() => {
            setFetching(true);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: recordsPerPage.toString(),
            });

            if (rating) params.append('rating', rating);

            fetch(`/api/admin/stats?${params.toString()}`)
                .then((res) => res.json())
                .then((data) => {
                    setStats(data);
                    setLoading(false);
                    setFetching(false);
                })
                .catch((err) => {
                    console.error(err);
                    setError(err.message || 'Failed to load data');
                    setLoading(false);
                    setFetching(false);
                });
        }, 100);
    }, []);

    useEffect(() => {
        fetchStats(currentPage, ratingFilter);
    }, [currentPage, ratingFilter, fetchStats]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [ratingFilter]);

    const clearFilters = useCallback(() => {
        setRatingFilter('');
    }, []);

    // Pagination helper
    const totalPages = stats ? Math.ceil(stats.totalRecords / recordsPerPage) : 0;

    const pageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 6;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust start if we're near the end
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-1 border text-xs transition-colors ${currentPage === i
                        ? 'bg-green-900 border-green-500 text-white'
                        : 'border-green-700 text-green-500 hover:bg-green-800 hover:text-white'
                        }`}
                >
                    {i}
                </button>
            );
        }

        return pages;
    };

    if (loading) return <div className="text-white p-8 font-mono">INITIALIZING SYSTEM...</div>;
    if (error) return <div className="text-red-500 p-8 font-mono">SYSTEM ERROR: {error}</div>;
    if (!stats) return <div className="text-red-500 p-8 font-mono">NO DATA AVAILABLE</div>;


    return (
        <div className="space-y-4 sm:space-y-8 font-mono text-green-500 p-4 sm:p-6 lg:p-8 relative">
            {/* Loading Overlay */}
            {fetching && (
                <div className="fixed top-4 right-4 z-50 bg-green-900 border border-green-500 px-4 py-2 text-white text-sm animate-pulse">
                    LOADING DATA...
                </div>
            )}

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold border-b-2 border-green-800 pb-2 sm:pb-4 tracking-tighter">
                <span className="mr-2 animate-pulse">█</span>
                SYSTEM_DASHBOARD
            </h1>

            {/* Total Users */}
            <section className="bg-black border border-green-800 p-4 sm:p-6 rounded-none flex flex-col justify-center items-center">
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-widest mb-3 sm:mb-4">Total Subjects</h2>
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white animate-pulse">
                    {stats.totalUsers}
                </div>
                <div className="text-xs sm:text-sm text-green-700 mt-2">ACTIVE RECORDS</div>
            </section>

            {/* Feedback & Ratings */}
            <section className="bg-black border border-green-800 p-4 sm:p-6 rounded-none">
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-widest mb-4 sm:mb-6">User Feedback Log</h2>

                {/* Filter Controls */}
                <div className="mb-6 p-4 bg-green-900/10 border border-green-800">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="text-xs text-green-700 uppercase font-bold">Filters:</span>

                        {/* Rating Filter */}
                        <select
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value)}
                            className="px-3 py-1 bg-black border border-green-700 text-green-500 text-xs focus:border-green-500 focus:outline-none"
                        >
                            <option value="">All Ratings</option>
                            <option value="5">★★★★★ (5)</option>
                            <option value="4">★★★★ (4)</option>
                            <option value="3">★★★ (3)</option>
                            <option value="2">★★ (2)</option>
                            <option value="1">★ (1)</option>
                        </select>

                        {/* Clear Filters Button */}
                        {ratingFilter && (
                            <button
                                onClick={clearFilters}
                                className="px-3 py-1 border border-red-600 text-red-500 hover:bg-red-600 hover:text-black text-xs uppercase transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-green-800 text-green-700 uppercase">
                            <tr>
                                <th className="px-4 py-2">Timestamp</th>
                                <th className="px-4 py-2">Rating</th>
                                <th className="px-4 py-2">Comment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-green-900">
                            {stats.recentAnswers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-green-900">NO FEEDBACK DETECTED</td>
                                </tr>
                            ) : (
                                stats.recentAnswers.map((ans) => (
                                    <tr key={ans.id} className="hover:bg-green-900/20 transition-colors">
                                        <td className="px-4 py-3 font-mono text-green-600 whitespace-nowrap">
                                            {new Date(ans.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-yellow-500 whitespace-nowrap">
                                            {ans.rating ? '★'.repeat(ans.rating) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-white italic">
                                            {ans.comment ? `"${ans.comment}"` : <span className="text-gray-600">-</span>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {stats.recentAnswers.length > 0 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-green-800 pt-4 gap-4">
                        <div className="text-xs sm:text-sm text-green-700">
                            Showing {((currentPage - 1) * recordsPerPage) + 1} to {Math.min(currentPage * recordsPerPage, stats.totalRecords)} of {stats.totalRecords} records
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Previous Button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 border text-xs uppercase transition-colors ${currentPage === 1
                                    ? 'border-green-900 text-green-900 cursor-not-allowed'
                                    : 'border-green-600 text-green-500 hover:bg-green-600 hover:text-black'
                                    }`}
                            >
                                ← Prev
                            </button>

                            {/* Page Numbers */}
                            {pageNumbers()}

                            {/* Next Button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage >= totalPages}
                                className={`px-3 py-1 border text-xs uppercase transition-colors ${currentPage >= totalPages
                                    ? 'border-green-900 text-green-900 cursor-not-allowed'
                                    : 'border-green-600 text-green-500 hover:bg-green-600 hover:text-black'
                                    }`}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
