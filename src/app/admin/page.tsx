'use client';

import { useEffect, useState } from 'react';

interface Stats {
    totalUsers: number;
    recentAnswers: any[];
    dailyTraffic: { date: string; count: string }[];
    hourlyTraffic: { date: string; count: string }[];
    oceanDistribution: { name: string; value: number }[];
    seasonDistribution: { name: string; value: number }[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [trafficMode, setTrafficMode] = useState<'daily' | 'hourly'>('daily');
    const [distributionMode, setDistributionMode] = useState<'ocean' | 'season'>('ocean');
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then((res) => res.json())
            .then((data) => {
                setStats(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-white">로딩 중...</div>;
    if (!stats) return <div className="text-red-500">통계 로드 실패</div>;

    // --- Chart Helpers ---
    const getTrafficData = () => {
        return trafficMode === 'daily' ? stats.dailyTraffic : stats.hourlyTraffic;
    };

    const trafficData = getTrafficData();
    const maxTraffic = Math.max(...trafficData.map(d => parseInt(d.count)), 1);

    // Line Chart Points
    const getLinePoints = (width: number, height: number) => {
        if (trafficData.length === 0) return '';
        const stepX = width / (trafficData.length - 1 || 1);
        return trafficData.map((d, i) => {
            const x = i * stepX;
            const y = height - (parseInt(d.count) / maxTraffic) * height;
            return `${x},${y}`;
        }).join(' ');
    };

    // Pie Chart Calculations
    const getDistributionData = () => {
        return distributionMode === 'ocean' ? stats.oceanDistribution : stats.seasonDistribution;
    };

    const distributionData = getDistributionData();
    const totalResults = distributionData.reduce((acc, curr) => acc + curr.value, 0);
    let currentAngle = 0;

    const pieSlices = distributionData.map((item, index) => {
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

    return (
        <div className="space-y-8 pb-20">
            <h2 className="text-3xl font-bold text-white">대시보드</h2>

            {/* Top Row: Traffic & Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Traffic Chart */}
                <div className="lg:col-span-2 bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white text-lg font-bold">트래픽</h3>
                        <div className="flex bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setTrafficMode('daily')}
                                className={`px-3 py-1 rounded-md text-sm transition-colors ${trafficMode === 'daily' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                일별
                            </button>
                            <button
                                onClick={() => setTrafficMode('hourly')}
                                className={`px-3 py-1 rounded-md text-sm transition-colors ${trafficMode === 'hourly' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                시간별
                            </button>
                        </div>
                    </div>

                    <div className="h-64 w-full relative">
                        {trafficData.length > 0 ? (
                            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                                {/* Grid Lines */}
                                <line x1="0" y1="0" x2="500" y2="0" stroke="#333" strokeWidth="1" />
                                <line x1="0" y1="100" x2="500" y2="100" stroke="#333" strokeWidth="1" />
                                <line x1="0" y1="200" x2="500" y2="200" stroke="#333" strokeWidth="1" />

                                {/* Line */}
                                <polyline
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="3"
                                    points={getLinePoints(500, 200)}
                                />

                                {/* Points */}
                                {trafficData.map((d, i) => {
                                    const stepX = 500 / (trafficData.length - 1 || 1);
                                    const x = i * stepX;
                                    const y = 200 - (parseInt(d.count) / maxTraffic) * 200;
                                    return (
                                        <g key={i} className="group">
                                            <circle cx={x} cy={y} r="4" fill="#3b82f6" className="cursor-pointer" />
                                            {/* Tooltip */}
                                            <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <rect x={x - 40} y={y - 35} width="80" height="25" rx="4" fill="#1f2937" />
                                                <text x={x} y={y - 18} textAnchor="middle" fill="white" fontSize="10">
                                                    {new Date(d.date).toLocaleDateString('ko-KR', trafficMode === 'hourly' ? { hour: '2-digit', minute: '2-digit' } : { month: 'short', day: 'numeric' })}: {d.count}
                                                </text>
                                            </g>
                                        </g>
                                    );
                                })}
                            </svg>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">데이터 없음</div>
                        )}
                    </div>
                </div>

                {/* Result Distribution Pie Chart */}
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white text-lg font-bold">결과 분포</h3>
                        <div className="flex bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setDistributionMode('ocean')}
                                className={`px-3 py-1 rounded-md text-xs transition-colors ${distributionMode === 'ocean' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                대양
                            </button>
                            <button
                                onClick={() => setDistributionMode('season')}
                                className={`px-3 py-1 rounded-md text-xs transition-colors ${distributionMode === 'season' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                계절
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center relative">
                        {pieSlices.length > 0 ? (
                            <svg viewBox="0 0 100 100" className="w-48 h-48 transform -rotate-90">
                                {pieSlices.map((slice: any, i) => (
                                    slice.isCircle ?
                                        <circle key={i} cx="50" cy="50" r="50" fill={slice.color} /> :
                                        <path key={i} d={slice.path} fill={slice.color} stroke="#111827" strokeWidth="1" />
                                ))}
                                {/* Center Hole for Donut Chart effect */}
                                <circle cx="50" cy="50" r="25" fill="#111827" />
                            </svg>
                        ) : (
                            <div className="text-gray-500">결과 없음</div>
                        )}
                    </div>
                    {/* Legend */}
                    <div className="mt-6 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {pieSlices.map((slice: any, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: slice.color }}></div>
                                    <span className="text-gray-300">{slice.name}</span>
                                </div>
                                <span className="text-gray-500">{Math.round(slice.percentage * 100)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Answers */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-800">
                    <h3 className="text-white text-lg font-bold">최근 응답</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-400">
                        <thead className="bg-gray-800 text-gray-200 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">날짜</th>
                                <th className="px-6 py-3">결과</th>
                                <th className="px-6 py-3">점수</th>
                                <th className="px-6 py-3 w-20">작업</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {stats.recentAnswers.map((answer) => (
                                <tr key={answer.id} className="hover:bg-gray-800/50 cursor-pointer" onClick={() => setSelectedUser(answer)}>
                                    <td className="px-6 py-4">
                                        {new Date(answer.created_at).toLocaleString('ko-KR')}
                                    </td>
                                    <td className="px-6 py-4 text-white font-medium">
                                        {answer.final_code}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono">
                                        {JSON.stringify(answer.score)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-400 hover:text-blue-300 text-sm">보기</button>
                                    </td>
                                </tr>
                            ))}
                            {stats.recentAnswers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center">응답 없음</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
                    <div className="bg-gray-900 p-8 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white">사용자 상세 정보</h3>
                                <p className="text-gray-400 text-sm mt-1">{new Date(selectedUser.created_at).toLocaleString('ko-KR')}</p>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-white">✕</button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-800 p-4 rounded-lg">
                                    <span className="text-gray-400 text-xs uppercase">결과</span>
                                    <p className="text-xl font-bold text-white mt-1">{selectedUser.final_code}</p>
                                </div>
                                <div className="bg-gray-800 p-4 rounded-lg">
                                    <span className="text-gray-400 text-xs uppercase">점수</span>
                                    <p className="text-sm font-mono text-white mt-1">{JSON.stringify(selectedUser.score)}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-white font-bold mb-4">응답 기록</h4>
                                <div className="space-y-3">
                                    {Array.isArray(selectedUser.user_answers) ? selectedUser.user_answers.map((ans: any, idx: number) => (
                                        <div key={idx} className="bg-gray-800/50 p-3 rounded border border-gray-800 flex justify-between items-center">
                                            <span className="text-gray-400">Q{ans.questionId}</span>
                                            <span className="text-white font-bold">{ans.choice}</span>
                                        </div>
                                    )) : (
                                        <p className="text-gray-500">상세 응답 기록이 없습니다.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
