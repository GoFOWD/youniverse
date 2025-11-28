'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';

interface Stats {
    totalUsers: number;
    recentAnswers: any[];
    totalRecords: number;
    dailyTraffic: { date: string; count: string }[];
    hourlyTraffic: { date: string; count: string }[];
    oceanDistribution: { name: string; value: number }[];
    seasonDistribution: { name: string; value: number }[];
    analytics?: {
        dropoutRate: string;
        dropoutCount: string;
        completedUsers: string;
        averageRating: string;
        commentResponseRate: string;
        validCommentRate: string;
        totalComments: string;
        validComments: string;
    };
    dropoutAnalysis?: {
        questionNumber: number;
        count: number;
        percentage: string;
    }[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [trafficMode, setTrafficMode] = useState<'daily' | 'hourly'>('daily');
    const [distributionMode, setDistributionMode] = useState<'ocean' | 'season'>('ocean');
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [showResultContent, setShowResultContent] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    // Filter states
    const [oceanFilter, setOceanFilter] = useState<string>('');
    const [seasonFilter, setSeasonFilter] = useState<string>('');
    const [ratingFilter, setRatingFilter] = useState<string>('');
    const [timeFilter, setTimeFilter] = useState<string>('');

    // Debounce timer
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Debounced fetch function
    const fetchStats = useCallback((page: number, ocean: string, season: string, rating: string, time: string) => {
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

            if (ocean) params.append('ocean', ocean);
            if (season) params.append('season', season);
            if (rating) params.append('rating', rating);
            if (time) params.append('timeRange', time);

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
        fetchStats(currentPage, oceanFilter, seasonFilter, ratingFilter, timeFilter);
    }, [currentPage, oceanFilter, seasonFilter, ratingFilter, timeFilter, fetchStats]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [oceanFilter, seasonFilter, ratingFilter, timeFilter]);

    const clearFilters = useCallback(() => {
        setOceanFilter('');
        setSeasonFilter('');
        setRatingFilter('');
        setTimeFilter('');
    }, []);

    // --- Chart Helpers (Optimized with useMemo) - Must be before early returns ---
    const trafficData = useMemo(() => {
        if (!stats) return [];
        return trafficMode === 'daily' ? stats.dailyTraffic : stats.hourlyTraffic;
    }, [trafficMode, stats]);

    const maxTraffic = useMemo(() => {
        if (trafficData.length === 0) return 1;
        return Math.max(...trafficData.map(d => parseInt(d.count)), 1);
    }, [trafficData]);

    // Pie Chart Calculations
    const distributionData = useMemo(() => {
        if (!stats) return [];
        return distributionMode === 'ocean' ? stats.oceanDistribution : stats.seasonDistribution;
    }, [distributionMode, stats]);

    const totalResults = useMemo(() => {
        return distributionData.reduce((acc, curr) => acc + curr.value, 0);
    }, [distributionData]);

    const pieSlices = useMemo(() => {
        let currentAngle = 0;
        return distributionData.map((item, index) => {
            const percentage = totalResults > 0 ? item.value / totalResults : 0;
            const angle = percentage * 360;

            // Avoid drawing if angle is 0
            if (angle === 0) return null;

            const x1 = 50 + 50 * Math.cos((Math.PI * currentAngle) / 180);
            const y1 = 50 + 50 * Math.sin((Math.PI * currentAngle) / 180);
            const x2 = 50 + 50 * Math.cos((Math.PI * (currentAngle + angle)) / 180);
            const y2 = 50 + 50 * Math.sin((Math.PI * (currentAngle + angle)) / 180);

            // Large arc flag
            const largeArc = angle > 180 ? 1 : 0;

            // If it's a full circle (100%), draw a circle instead of a path
            if (percentage === 1) {
                return { isCircle: true, color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`, name: item.name, value: item.value, percentage };
            }

            const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;
            const color = `hsl(${(index * 137.5) % 360}, 70%, 50%)`;

            currentAngle += angle;
            return { path: pathData, color, name: item.name, value: item.value, percentage };
        }).filter(Boolean); // Remove nulls
    }, [distributionData, totalResults]);

    // Pagination helper
    const totalPages = useMemo(() => {
        if (!stats) return 0;
        return Math.ceil(stats.totalRecords / recordsPerPage);
    }, [stats, recordsPerPage]);

    const pageNumbers = useMemo(() => {
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
    }, [totalPages, currentPage]);

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

            {/* Analytics Overview Section (Korean) */}
            {stats.analytics && (
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Dropout Rate Card */}
                    <div className="bg-black border border-green-800 p-6 hover:border-green-600 transition-colors">
                        <div className="text-xs text-green-700 uppercase tracking-wider mb-2">중도 이탈률</div>
                        <div className="text-3xl font-bold text-green-500 mb-1">{stats.analytics.dropoutRate}%</div>
                        <div className="text-xs text-green-900">
                            총 {stats.analytics.dropoutCount}명 이탈
                        </div>
                    </div>

                    {/* Average Rating Card */}
                    <div className="bg-black border border-green-800 p-6 hover:border-green-600 transition-colors">
                        <div className="text-xs text-green-700 uppercase tracking-wider mb-2">평균 별점</div>
                        <div className="text-3xl font-bold text-green-500 mb-1">{stats.analytics.averageRating}</div>
                        <div className="text-xs text-green-900 flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < Math.round(parseFloat(stats.analytics!.averageRating)) ? 'text-green-500' : 'text-green-900'}>
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Comment Response Rate Card */}
                    <div className="bg-black border border-green-800 p-6 hover:border-green-600 transition-colors">
                        <div className="text-xs text-green-700 uppercase tracking-wider mb-2">코멘트 응답률</div>
                        <div className="text-3xl font-bold text-green-500 mb-1">{stats.analytics.commentResponseRate}%</div>
                        <div className="text-xs text-green-900">
                            {stats.analytics.totalComments}개 응답
                        </div>
                    </div>

                    {/* Valid Comment Rate Card */}
                    <div className="bg-black border border-green-800 p-6 hover:border-green-600 transition-colors">
                        <div className="text-xs text-green-700 uppercase tracking-wider mb-2">유효 코멘트율</div>
                        <div className="text-3xl font-bold text-green-500 mb-1">{stats.analytics.validCommentRate}%</div>
                        <div className="text-xs text-green-900">
                            {stats.analytics.validComments}/{stats.analytics.totalComments} 유효
                        </div>
                    </div>
                </section>
            )}

            {/* Traffic Section (English) */}
            <section className="bg-black border border-green-800 p-4 sm:p-6 rounded-none shadow-[0_0_10px_rgba(0,255,0,0.1)]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
                    <h2 className="text-lg sm:text-xl font-bold uppercase tracking-widest">Network Traffic</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTrafficMode('daily')}
                            className={`px-3 sm:px-4 py-1 text-xs sm:text-sm border ${trafficMode === 'daily' ? 'bg-green-900 border-green-500 text-white' : 'border-green-900 text-green-700 hover:text-green-500'}`}
                        >
                            DAILY
                        </button>
                        <button
                            onClick={() => setTrafficMode('hourly')}
                            className={`px-3 sm:px-4 py-1 text-xs sm:text-sm border ${trafficMode === 'hourly' ? 'bg-green-900 border-green-500 text-white' : 'border-green-900 text-green-700 hover:text-green-500'}`}
                        >
                            HOURLY
                        </button>
                    </div>
                </div>
                <div className="h-48 sm:h-64 w-full">
                    {/* Simple SVG Line Chart for Traffic */}
                    {(() => {
                        const data = trafficMode === 'daily' ? stats.dailyTraffic : stats.hourlyTraffic;
                        if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-green-900">NO DATA STREAM</div>;

                        const maxCount = Math.max(...data.map(d => parseInt(d.count))) || 1;
                        const points = data.map((d, i) => {
                            const x = (i / (data.length - 1)) * 100;
                            const y = 100 - (parseInt(d.count) / maxCount) * 100;
                            return `${x},${y}`;
                        }).join(' ');

                        return (
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                                {/* Grid Lines */}
                                <line x1="0" y1="25" x2="100" y2="25" stroke="#064e3b" strokeWidth="0.2" strokeDasharray="2" />
                                <line x1="0" y1="50" x2="100" y2="50" stroke="#064e3b" strokeWidth="0.2" strokeDasharray="2" />
                                <line x1="0" y1="75" x2="100" y2="75" stroke="#064e3b" strokeWidth="0.2" strokeDasharray="2" />

                                {/* Data Line */}
                                <polyline
                                    fill="none"
                                    stroke="#22c55e"
                                    strokeWidth="1"
                                    points={points}
                                    vectorEffect="non-scaling-stroke"
                                    className="drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]"
                                />

                                {/* X-Axis Labels (More detailed) */}
                                {data.map((d, i) => {
                                    // Show labels at start, middle, and end
                                    if (i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1) {
                                        const x = (i / (data.length - 1 || 1)) * 100;
                                        const date = new Date(d.date);
                                        const label = trafficMode === 'hourly'
                                            ? date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                                            : date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
                                        return (
                                            <text
                                                key={i}
                                                x={x}
                                                y="105"
                                                fontSize="2.5"
                                                fill="#15803d"
                                                textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}
                                            >
                                                {label}
                                            </text>
                                        );
                                    }
                                    return null;
                                })}
                            </svg>
                        );
                    })()}
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Result Distribution */}
                <section className="bg-black border border-green-800 p-4 sm:p-6 rounded-none">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
                        <h2 className="text-lg sm:text-xl font-bold uppercase tracking-widest">Result Distribution</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setDistributionMode('ocean')}
                                className={`px-2 sm:px-3 py-1 text-xs border ${distributionMode === 'ocean' ? 'bg-green-900 border-green-500 text-white' : 'border-green-900 text-green-700'}`}
                            >
                                OCEAN
                            </button>
                            <button
                                onClick={() => setDistributionMode('season')}
                                className={`px-2 sm:px-3 py-1 text-xs border ${distributionMode === 'season' ? 'bg-green-900 border-green-500 text-white' : 'border-green-900 text-green-700'}`}
                            >
                                SEASON
                            </button>
                        </div>
                    </div>
                    <div className="h-48 sm:h-64 flex flex-col items-center justify-center">
                        {/* Reusing existing Pie Chart logic but with Hacker colors */}
                        {(() => {
                            const data = distributionMode === 'ocean' ? stats.oceanDistribution : stats.seasonDistribution;
                            if (!data || data.length === 0) return <div className="text-green-900">NO DATA</div>;

                            const total = data.reduce((acc, curr) => acc + curr.value, 0);
                            let currentAngle = 0;

                            // Distinct vibrant colors for better visibility
                            const colors = distributionMode === 'ocean'
                                ? ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'] // Ocean: Red, Orange, Green, Blue, Purple
                                : ['#60a5fa', '#34d399', '#fbbf24', '#f87171']; // Season: Blue, Green, Yellow, Red

                            return (
                                <div className="flex flex-col items-center gap-4 w-full">
                                    <div className="w-32 h-32 sm:w-48 sm:h-48">
                                        <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full">
                                            {data.map((item, index) => {
                                                const count = item.value;
                                                const percentage = count / total;
                                                const angle = percentage * Math.PI * 2;

                                                // Handle 100% case
                                                if (percentage === 1) {
                                                    return (
                                                        <circle key={index} cx="0" cy="0" r="1" fill={colors[index % colors.length]} />
                                                    );
                                                }

                                                const x1 = Math.cos(currentAngle);
                                                const y1 = Math.sin(currentAngle);
                                                const x2 = Math.cos(currentAngle + angle);
                                                const y2 = Math.sin(currentAngle + angle);

                                                const largeArcFlag = percentage > 0.5 ? 1 : 0;

                                                const pathData = [
                                                    `M 0 0`,
                                                    `L ${x1} ${y1}`,
                                                    `A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                                    `Z`
                                                ].join(' ');

                                                const slice = (
                                                    <path
                                                        key={index}
                                                        d={pathData}
                                                        fill={colors[index % colors.length]}
                                                        stroke="#000"
                                                        strokeWidth="0.02"
                                                    />
                                                );
                                                currentAngle += angle;
                                                return slice;
                                            })}
                                        </svg>
                                    </div>
                                    {/* Legend - Below chart on mobile, beside on desktop */}
                                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-1 text-xs w-full sm:w-auto">
                                        {data.map((item, index) => (
                                            <div key={index} className="flex items-center">
                                                <span className="w-2 h-2 mr-2 flex-shrink-0" style={{ backgroundColor: colors[index % colors.length] }}></span>
                                                <span className="text-green-500 truncate">
                                                    {item.name}
                                                    <span className="text-green-700 ml-1">({Math.round((item.value / total) * 100)}%)</span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </section>

                {/* Total Users */}
                <section className="bg-black border border-green-800 p-4 sm:p-6 rounded-none flex flex-col justify-center items-center">
                    <h2 className="text-lg sm:text-xl font-bold uppercase tracking-widest mb-3 sm:mb-4">Total Subjects</h2>
                    <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white animate-pulse">
                        {stats.totalUsers}
                    </div>
                    <div className="text-xs sm:text-sm text-green-700 mt-2">ACTIVE RECORDS</div>
                </section>
            </div>

            {/* Recent Answers */}
            <section className="bg-black border border-green-800 p-4 sm:p-6 rounded-none">
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-widest mb-4 sm:mb-6">Recent Transmissions</h2>

                {/* Filter Controls */}
                <div className="mb-6 p-4 bg-green-900/10 border border-green-800">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="text-xs text-green-700 uppercase font-bold">Filters:</span>

                        {/* Ocean Filter */}
                        <select
                            value={oceanFilter}
                            onChange={(e) => setOceanFilter(e.target.value)}
                            className="px-3 py-1 bg-black border border-green-700 text-green-500 text-xs focus:border-green-500 focus:outline-none"
                        >
                            <option value="">All Oceans</option>
                            <option value="남극해">남극해 (Southern Ocean)</option>
                            <option value="인도양">인도양 (Indian Ocean)</option>
                            <option value="대서양">대서양 (Atlantic Ocean)</option>
                            <option value="북극해">북극해 (Arctic Ocean)</option>
                            <option value="태평양">태평양 (Pacific Ocean)</option>
                        </select>

                        {/* Season Filter */}
                        <select
                            value={seasonFilter}
                            onChange={(e) => setSeasonFilter(e.target.value)}
                            className="px-3 py-1 bg-black border border-green-700 text-green-500 text-xs focus:border-green-500 focus:outline-none"
                        >
                            <option value="">All Seasons</option>
                            <option value="봄">봄 (Spring)</option>
                            <option value="여름">여름 (Summer)</option>
                            <option value="가을">가을 (Fall)</option>
                            <option value="겨울">겨울 (Winter)</option>
                        </select>

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

                        {/* Time Filter */}
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="px-3 py-1 bg-black border border-green-700 text-green-500 text-xs focus:border-green-500 focus:outline-none"
                        >
                            <option value="">All Time</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>

                        {/* Clear Filters Button */}
                        {(oceanFilter || seasonFilter || ratingFilter || timeFilter) && (
                            <button
                                onClick={clearFilters}
                                className="px-3 py-1 border border-red-600 text-red-500 hover:bg-red-600 hover:text-black text-xs uppercase transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>

                    {/* Active Filters Display */}
                    {(oceanFilter || seasonFilter || ratingFilter || timeFilter) && (
                        <div className="text-xs text-green-600">
                            Active filters:
                            {oceanFilter && <span className="ml-2 px-2 py-0.5 bg-green-900 border border-green-700">Ocean: {oceanFilter}</span>}
                            {seasonFilter && <span className="ml-2 px-2 py-0.5 bg-green-900 border border-green-700">Season: {seasonFilter}</span>}
                            {ratingFilter && <span className="ml-2 px-2 py-0.5 bg-green-900 border border-green-700">Rating: {ratingFilter}★</span>}
                            {timeFilter && <span className="ml-2 px-2 py-0.5 bg-green-900 border border-green-700">Time: {timeFilter}</span>}
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-green-800 text-green-700 uppercase">
                            <tr>
                                <th className="px-4 py-2">Timestamp</th>
                                <th className="px-4 py-2">Result Code</th>
                                <th className="px-4 py-2">Score (E/P/C)</th>
                                <th className="px-4 py-2">Rating</th>
                                <th className="px-4 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-green-900">
                            {stats.recentAnswers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-green-900">NO TRANSMISSIONS DETECTED</td>
                                </tr>
                            ) : (
                                stats.recentAnswers.map((ans) => (
                                    <tr key={ans.id} className="hover:bg-green-900/20 transition-colors">
                                        <td className="px-4 py-3 font-mono text-green-600">
                                            {new Date(ans.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-white">
                                            {ans.final_code}
                                        </td>
                                        <td className="px-4 py-3 text-green-400">
                                            {ans.score.energy}/{ans.score.positivity}/{ans.score.curiosity}
                                        </td>
                                        <td className="px-4 py-3 text-yellow-500">
                                            {ans.rating ? '★'.repeat(ans.rating) : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => { setSelectedUser(ans); setShowResultContent(false); }}
                                                className="px-3 py-1 border border-green-600 text-green-500 hover:bg-green-600 hover:text-black text-xs uppercase transition-colors"
                                            >
                                                Inspect
                                            </button>
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
                            {pageNumbers}

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

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-black border-2 border-green-500 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-none shadow-[0_0_20px_rgba(0,255,0,0.2)] font-mono">
                        <div className="p-6 border-b border-green-800 flex justify-between items-center bg-green-900/20">
                            <h3 className="text-xl font-bold text-green-400 uppercase">Subject Details #{selectedUser.id}</h3>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-green-600 hover:text-white text-2xl leading-none"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-green-700 uppercase">Result Code</div>
                                    <div className="text-lg text-white font-bold">{selectedUser.final_code}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-green-700 uppercase">Score Profile</div>
                                    <div className="text-lg text-white">
                                        E:{selectedUser.score.energy} / P:{selectedUser.score.positivity} / C:{selectedUser.score.curiosity}
                                    </div>
                                </div>
                            </div>

                            {/* Feedback Section */}
                            <div className="border border-green-800 p-4 bg-green-900/10">
                                <h4 className="text-sm font-bold text-green-500 uppercase mb-2">User Feedback</h4>
                                <div className="flex items-center mb-2">
                                    <span className="text-xs text-green-700 w-16">RATING:</span>
                                    <span className="text-yellow-500">{selectedUser.rating ? '★'.repeat(selectedUser.rating) : 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-green-700 block mb-1">COMMENT:</span>
                                    <p className="text-white text-sm italic">
                                        {selectedUser.comment ? `"${selectedUser.comment}"` : "No comment provided."}
                                    </p>
                                </div>
                            </div>

                            {/* Result Content Section */}
                            <div className="border border-green-800 p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-bold text-green-500 uppercase">Result Content</h4>
                                    <button
                                        onClick={() => setShowResultContent(!showResultContent)}
                                        className="text-xs border border-green-700 px-2 py-1 text-green-600 hover:text-white hover:border-white transition-colors"
                                    >
                                        {showResultContent ? 'COLLAPSE [-]' : 'EXPAND [+]'}
                                    </button>
                                </div>

                                {showResultContent && (
                                    <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div>
                                            <div className="text-xs text-green-700 uppercase">2026뜨거운 여름을 위한 너에게</div>
                                            <div className="text-white font-bold">{selectedUser.resultTitle}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-green-700 uppercase">이번겨울이 보내는 마지막 편지</div>
                                            <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                                                {selectedUser.resultDescription}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-green-700 uppercase">이겨울 온도를 높여줄 한가지</div>
                                            <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                                                {selectedUser.resultAdvice}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Answer History */}
                            <div>
                                <h4 className="text-sm font-bold text-green-500 uppercase mb-2">Transmission Log</h4>
                                <div className="bg-black border border-green-900 rounded-none overflow-hidden">
                                    <table className="w-full text-xs">
                                        <thead className="bg-green-900/30 text-green-300">
                                            <tr>
                                                <th className="px-3 py-2 text-left">QID</th>
                                                <th className="px-3 py-2 text-left">Choice</th>
                                                <th className="px-3 py-2 text-right">Time (ms)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-green-900">
                                            {selectedUser.user_answers && Array.isArray(selectedUser.user_answers) ? (
                                                selectedUser.user_answers.map((ans: any, idx: number) => {
                                                    const responseTime = ans.endTime - ans.startTime;

                                                    return (
                                                        <tr key={idx}>
                                                            <td className="px-3 py-2 text-green-600">#{ans.questionId}</td>
                                                            <td className="px-3 py-2 text-white font-bold">{ans.choice}</td>
                                                            <td className="px-3 py-2 text-right text-green-400">
                                                                {responseTime}ms
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="px-3 py-2 text-center text-gray-500">Log corrupted or missing.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-green-800 bg-green-900/10 flex justify-end">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="px-6 py-2 bg-green-700 hover:bg-green-600 text-black font-bold uppercase transition-colors"
                            >
                                Close Terminal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
