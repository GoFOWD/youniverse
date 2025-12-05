'use client';

import { useState, useEffect } from 'react';

interface Ad {
    id: number;
    src: string;
    width: string;
    height: string;
    isActive: boolean;
    createdAt: string;
}

export default function AdManager() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [newAdSrc, setNewAdSrc] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            const res = await fetch('/api/admin/ads');
            if (res.ok) {
                const data = await res.json();
                setAds(data);
            }
        } catch (error) {
            console.error('Failed to fetch ads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdSrc.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/ads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ src: newAdSrc }),
            });

            if (res.ok) {
                setNewAdSrc('');
                fetchAds();
            }
        } catch (error) {
            console.error('Failed to add ad:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAd = async (id: number) => {
        if (!confirm('Are you sure you want to delete this ad?')) return;

        try {
            const res = await fetch(`/api/admin/ads/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchAds();
            }
        } catch (error) {
            console.error('Failed to delete ad:', error);
        }
    };

    if (loading) return <div className="text-green-500 font-mono">LOADING ADS...</div>;

    return (
        <section className="bg-black border border-green-800 p-4 sm:p-6 rounded-none">
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-widest mb-4 text-green-500">
                Ad Management
            </h2>

            {/* Add Ad Form */}
            <form onSubmit={handleAddAd} className="mb-8 flex gap-2">
                <input
                    type="text"
                    value={newAdSrc}
                    onChange={(e) => setNewAdSrc(e.target.value)}
                    placeholder="Enter Coupang Ad Link (https://...)"
                    className="flex-1 bg-black border border-green-800 text-green-500 p-2 font-mono focus:outline-none focus:border-green-500"
                />
                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-green-900 text-green-100 px-4 py-2 font-mono hover:bg-green-800 disabled:opacity-50"
                >
                    {submitting ? 'ADDING...' : 'ADD AD'}
                </button>
            </form>

            {/* Ad List */}
            <div className="space-y-4">
                {ads.length === 0 ? (
                    <div className="text-green-900 font-mono text-center py-4">NO ADS CONFIGURED</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ads.map((ad) => (
                            <div key={ad.id} className="border border-green-900 p-4 relative group">
                                <button
                                    onClick={() => handleDeleteAd(ad.id)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    [DELETE]
                                </button>
                                <div className="text-xs text-green-700 mb-2 font-mono">ID: {ad.id}</div>
                                <div className="w-full h-40 bg-white/5 flex items-center justify-center overflow-hidden mb-2">
                                    <iframe
                                        src={ad.src}
                                        width="150" // Scaled down for preview
                                        height="300"
                                        frameBorder="0"
                                        scrolling="no"
                                        className="transform scale-50 origin-center"
                                    />
                                </div>
                                <div className="text-xs text-green-600 truncate font-mono">{ad.src}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
