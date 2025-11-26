'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Question {
    id: number;
    text: string;
    category: string;
}

export default function QuestionList() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/questions')
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

    if (loading) return <div className="text-white">질문 로딩 중...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">질문 관리</h2>
                {/* Add 'Create New' button here if needed later */}
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left text-gray-400">
                    <thead className="bg-gray-800 text-gray-200 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3 w-16">ID</th>
                            <th className="px-6 py-3 w-24">분류</th>
                            <th className="px-6 py-3">질문 내용</th>
                            <th className="px-6 py-3 w-24">작업</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {questions.map((q) => (
                            <tr key={q.id} className="hover:bg-gray-800/50">
                                <td className="px-6 py-4">{q.id}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
                                        {q.category || '-'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-white">{q.text}</td>
                                <td className="px-6 py-4">
                                    <Link
                                        href={`/admin/questions/${q.id}`}
                                        className="text-blue-400 hover:text-blue-300 font-medium"
                                    >
                                        수정
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
