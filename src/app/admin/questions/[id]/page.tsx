'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Question {
    id: number;
    text: string;
    category: string;
    choices: string[];
}

export default function QuestionEdit({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        fetch(`/api/admin/questions/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setQuestion(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handleSave = async () => {
        if (!question) return;
        setSaving(true);
        setShowWarning(false);

        try {
            const res = await fetch(`/api/admin/questions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(question),
            });

            if (res.ok) {
                alert('저장되었습니다!');
                router.push('/admin/questions');
            } else {
                alert('저장 실패');
            }
        } catch (err) {
            alert('저장 중 오류 발생');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-white">로딩 중...</div>;
    if (!question) return <div className="text-red-500">질문을 찾을 수 없습니다</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">질문 수정 #{id}</h2>
                <Link href="/admin/questions" className="text-gray-400 hover:text-white">
                    목록으로 돌아가기
                </Link>
            </div>

            <div className="space-y-6 bg-gray-900 p-8 rounded-xl border border-gray-800">
                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">분류 (Category)</label>
                    <input
                        type="text"
                        value={question.category || ''}
                        onChange={(e) => setQuestion({ ...question, category: e.target.value })}
                        className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                </div>

                {/* Question Text */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">질문 내용</label>
                    <textarea
                        value={question.text}
                        onChange={(e) => setQuestion({ ...question, text: e.target.value })}
                        rows={3}
                        className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                </div>

                {/* Choices */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">선택지</label>
                    <div className="space-y-3">
                        {question.choices.map((choice, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                <span className="text-gray-500 w-6 font-mono">{String.fromCharCode(65 + index)}</span>
                                <input
                                    type="text"
                                    value={choice}
                                    onChange={(e) => {
                                        const newChoices = [...question.choices];
                                        newChoices[index] = e.target.value;
                                        setQuestion({ ...question, choices: newChoices });
                                    }}
                                    className="flex-1 p-3 bg-black border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                    <button
                        onClick={() => setShowWarning(true)}
                        disabled={saving}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                        {saving ? '저장 중...' : '변경사항 저장'}
                    </button>
                </div>
            </div>

            {/* Warning Modal */}
            {showWarning && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 p-8 rounded-xl border border-red-500/50 max-w-md w-full space-y-6">
                        <h3 className="text-xl font-bold text-red-500">⚠️ 경고</h3>
                        <p className="text-gray-300">
                            질문 내용이나 선택지를 변경하면 기존 사용자 데이터 및 점수 로직의 일관성에 영향을 줄 수 있습니다.
                            <br /><br />
                            계속 진행하시겠습니까?
                        </p>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowWarning(false)}
                                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors"
                            >
                                예, 저장합니다
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
