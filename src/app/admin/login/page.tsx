'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.push('/admin');
            } else {
                setError('ACCESS DENIED: INVALID CREDENTIALS');
            }
        } catch (err) {
            setError('SYSTEM ERROR: CONNECTION FAILED');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-green-500 font-mono">
            <div className="w-full max-w-md p-8 space-y-6 bg-black border-2 border-green-800 shadow-[0_0_20px_rgba(0,255,0,0.2)]">
                <div className="text-center space-y-2">
                    <div className="text-4xl font-bold tracking-tighter">
                        <span className="mr-2 animate-pulse">█</span>
                        ADMIN_CONSOLE
                    </div>
                    <div className="text-xs text-green-700 uppercase tracking-widest">
                        AUTHENTICATION REQUIRED
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-green-700 uppercase mb-2 tracking-wider">
                            [ PASSWORD ]
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-black border border-green-800 text-green-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all placeholder:text-green-900"
                            placeholder="Enter access code..."
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="p-3 border border-red-800 bg-red-900/10 text-red-500 text-xs text-center font-bold animate-pulse">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 bg-green-600 text-black font-bold uppercase tracking-wider hover:bg-green-500 transition-colors border-2 border-green-600 hover:border-green-500"
                    >
                        [ AUTHENTICATE ]
                    </button>
                </form>

                <div className="text-center text-xs text-green-900 pt-4 border-t border-green-900">
                    SYSTEM v1.0.0 | SECURE ACCESS ONLY
                </div>
            </div>
        </div>
    );
}
