'use client';

import { useEffect, useState } from 'react';
import { ChoiceScore } from '@/lib/score';
import NodeEditor from '../scoring/NodeEditor'; // We will move this component later or keep it there
import ProbabilityDashboard from '@/components/admin/ProbabilityDashboard';

interface Question {
    id: number;
    text: string;
    category: string;
    choices: string[];
    choiceScores: ChoiceScore[];
}

export default function QuestionManager() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'content' | 'scoring'>('content');
    const [saving, setSaving] = useState(false);

    // Fetch all questions with scores
    useEffect(() => {
        fetch('/api/admin/scoring') // Reusing the scoring API as it returns everything we need
            .then((res) => res.json())
            .then((data) => {
                // The scoring API returns { questions: [], choiceScores: [] } or just questions array depending on implementation
                // Let's check the actual response structure from previous steps.
                // Ah, the scoring API returns just 'questions' array with included choiceScores.
                // Wait, let's verify.
                // The GET in /api/admin/scoring/route.ts returns `questions` array.
                setQuestions(data);
                setLoading(false);
                if (data.length > 0) {
                    setSelectedQuestionId(data[0].id);
                }
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

    const handleQuestionUpdate = (updatedQ: Question) => {
        setQuestions(questions.map(q => q.id === updatedQ.id ? updatedQ : q));
    };

    const handleScoreUpdate = (newScores: ChoiceScore[]) => {
        if (!selectedQuestion) return;
        // Update the selected question's scores locally
        const updatedQuestion = { ...selectedQuestion, choiceScores: newScores };
        handleQuestionUpdate(updatedQuestion);
    };

    const handleSave = async () => {
        if (!selectedQuestion) return;
        setSaving(true);

        try {
            const res = await fetch(`/api/admin/questions/${selectedQuestion.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedQuestion),
            });

            if (res.ok) {
                alert('SYSTEM UPDATE: SUCCESS');
            } else {
                alert('SYSTEM UPDATE: FAILED');
            }
        } catch (err) {
            alert('SYSTEM ERROR: CONNECTION LOST');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-green-500 font-mono p-8">INITIALIZING DATABASE...</div>;

    return (
        <div className="min-h-screen flex flex-col lg:flex-row gap-4 lg:gap-6 font-mono text-green-500 p-4 sm:p-6">
            {/* Left Panel: Question List */}
            <div className="w-full lg:w-1/3 bg-black border border-green-800 flex flex-col max-h-[400px] lg:max-h-[calc(100vh-100px)]">
                <div className="p-3 sm:p-4 border-b border-green-800 bg-green-900/10">
                    <h2 className="text-lg sm:text-xl font-bold uppercase tracking-widest">Questions</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {questions.map((q) => (
                        <button
                            key={q.id}
                            onClick={() => setSelectedQuestionId(q.id)}
                            className={`w-full text-left p-3 sm:p-4 border-b border-green-900 hover:bg-green-900/20 transition-colors ${selectedQuestionId === q.id ? 'bg-green-900/30 text-white border-l-4 border-l-green-500' : 'text-green-700'
                                }`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold">#{q.id}</span>
                                <span className="text-xs border border-green-800 px-1 rounded text-green-600">{q.category || 'UNCATEGORIZED'}</span>
                            </div>
                            <div className="truncate text-sm">{q.text}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Panel: Detail View */}
            <div className="flex-1 bg-black border border-green-800 flex flex-col min-h-[600px] lg:min-h-[calc(100vh-100px)]">
                {selectedQuestion ? (
                    <>
                        {/* Header */}
                        <div className="p-3 sm:p-4 border-b border-green-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-green-900/10">
                            <div className="flex gap-2 sm:gap-4 overflow-x-auto w-full sm:w-auto">
                                <button
                                    onClick={() => setActiveTab('content')}
                                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold uppercase transition-colors whitespace-nowrap ${activeTab === 'content' ? 'bg-green-600 text-black' : 'text-green-700 hover:text-green-500'}`}
                                >
                                    Content
                                </button>
                                <button
                                    onClick={() => setActiveTab('scoring')}
                                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold uppercase transition-colors whitespace-nowrap ${activeTab === 'scoring' ? 'bg-green-600 text-black' : 'text-green-700 hover:text-green-500'}`}
                                >
                                    Scoring Logic
                                </button>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full sm:w-auto px-4 sm:px-6 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-bold uppercase transition-colors disabled:opacity-50 text-xs sm:text-sm"
                            >
                                {saving ? 'SAVING...' : 'SAVE CHANGES'}
                            </button>
                        </div>

                        {/* Content Tab */}
                        {activeTab === 'content' && (
                            <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 overflow-y-auto">
                                <div>
                                    <label className="block text-xs font-bold text-green-700 uppercase mb-2">Category</label>
                                    <input
                                        type="text"
                                        value={selectedQuestion.category || ''}
                                        onChange={(e) => handleQuestionUpdate({ ...selectedQuestion, category: e.target.value })}
                                        className="w-full p-2 sm:p-3 bg-black border border-green-800 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-green-700 uppercase mb-2">Question Text</label>
                                    <textarea
                                        value={selectedQuestion.text}
                                        onChange={(e) => handleQuestionUpdate({ ...selectedQuestion, text: e.target.value })}
                                        rows={3}
                                        className="w-full p-2 sm:p-3 bg-black border border-green-800 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-green-700 uppercase mb-2">Choices</label>
                                    <div className="space-y-2 sm:space-y-3">
                                        {selectedQuestion.choices.map((choice, index) => (
                                            <div key={index} className="flex items-center space-x-2 sm:space-x-3">
                                                <span className="text-green-600 w-6 font-bold text-sm">{String.fromCharCode(65 + index)}</span>
                                                <input
                                                    type="text"
                                                    value={choice}
                                                    onChange={(e) => {
                                                        const newChoices = [...selectedQuestion.choices];
                                                        newChoices[index] = e.target.value;
                                                        handleQuestionUpdate({ ...selectedQuestion, choices: newChoices });
                                                    }}
                                                    className="flex-1 p-2 sm:p-3 bg-black border border-green-800 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Scoring Tab */}
                        {activeTab === 'scoring' && (
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                                {/* Probability Dashboard */}
                                <ProbabilityDashboard
                                    choiceScores={questions.flatMap(q => q.choiceScores)}
                                />

                                {/* Node Editor */}
                                <div className="bg-black border border-green-800 overflow-hidden" style={{ height: '400px', maxHeight: '600px' }}>
                                    <NodeEditor
                                        questions={questions}
                                        initialScores={questions.flatMap(q => q.choiceScores)}
                                        onUpdate={(newScores) => {
                                            const updatedQuestions = questions.map(q => ({
                                                ...q,
                                                choiceScores: newScores.filter(s => s.questionId === q.id)
                                            }));
                                            setQuestions(updatedQuestions);
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-green-900">
                        SELECT A MODULE TO EDIT
                    </div>
                )}
            </div>
        </div>
    );
}
