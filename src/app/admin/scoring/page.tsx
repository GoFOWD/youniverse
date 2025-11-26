'use client';

import { useEffect, useState } from 'react';

interface ChoiceScore {
    id: number;
    choice: string;
    energy: number;
    positivity: number;
    curiosity: number;
}

interface Question {
    id: number;
    text: string;
    choiceScores: ChoiceScore[];
}

export default function ScoringPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [updates, setUpdates] = useState<Record<number, Partial<ChoiceScore>>>({});

    useEffect(() => {
        fetch('/api/admin/scoring')
            .then((res) => res.json())
            .then((data) => {
                setQuestions(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleChange = (id: number, field: keyof ChoiceScore, value: string) => {
        const numValue = parseInt(value) || 0;
        setUpdates((prev) => ({
            ...prev,
            [id]: { ...prev[id], id, [field]: numValue },
        }));

        // Optimistic UI update
        setQuestions((prev) =>
            prev.map((q) => ({
                ...q,
                choiceScores: q.choiceScores.map((cs) =>
                    cs.id === id ? { ...cs, [field]: numValue } : cs
                ),
            }))
        );
    };

    const handleSave = async () => {
        if (Object.keys(updates).length === 0) return;
        setSaving(true);

        try {
            const res = await fetch('/api/admin/scoring', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates: Object.values(updates) }),
            });

            if (res.ok) {
                alert('점수 로직이 업데이트되었습니다!');
                setUpdates({});
            } else {
                alert('업데이트 실패');
            }
        } catch (err) {
            alert('저장 중 오류 발생');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-white">점수 로직 로딩 중...</div>;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center sticky top-0 bg-black/90 backdrop-blur py-4 z-10 border-b border-gray-800">
                <h2 className="text-3xl font-bold text-white">점수 산정 로직</h2>
                <button
                    onClick={handleSave}
                    disabled={saving || Object.keys(updates).length === 0}
                    className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? '저장 중...' : `변경사항 저장 (${Object.keys(updates).length})`}
                </button>
            </div>

            <div className="space-y-8">
                {questions.map((q) => (
                    <div key={q.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <div className="p-4 bg-gray-800 border-b border-gray-700">
                            <h3 className="text-white font-medium">
                                <span className="text-gray-400 mr-2">Q{q.id}.</span>
                                {q.text}
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-gray-400">
                                <thead className="bg-gray-900/50 text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-3 w-20">선택지</th>
                                        <th className="px-6 py-3">에너지 (Energy)</th>
                                        <th className="px-6 py-3">긍정 (Positivity)</th>
                                        <th className="px-6 py-3">호기심 (Curiosity)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {q.choiceScores.map((cs) => (
                                        <tr key={cs.id} className="hover:bg-gray-800/30">
                                            <td className="px-6 py-4 font-bold text-white">{cs.choice}</td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={cs.energy}
                                                    onChange={(e) => handleChange(cs.id, 'energy', e.target.value)}
                                                    className="w-20 p-2 bg-black border border-gray-700 rounded text-center text-white focus:border-blue-500 focus:outline-none"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={cs.positivity}
                                                    onChange={(e) => handleChange(cs.id, 'positivity', e.target.value)}
                                                    className="w-20 p-2 bg-black border border-gray-700 rounded text-center text-white focus:border-blue-500 focus:outline-none"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={cs.curiosity}
                                                    onChange={(e) => handleChange(cs.id, 'curiosity', e.target.value)}
                                                    className="w-20 p-2 bg-black border border-gray-700 rounded text-center text-white focus:border-blue-500 focus:outline-none"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
