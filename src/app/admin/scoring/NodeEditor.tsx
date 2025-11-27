
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Background,
    Controls,
    Connection,
    addEdge,
    useNodesState,
    useEdgesState,
    Position,
    Handle,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ChoiceScore } from '@/lib/score';
import { checkReachability } from '@/utils/scoringAnalysis';

// --- Custom Nodes ---

// 1. Question Node (Source)
const QuestionNode = ({ data }: { data: { label: string } }) => {
    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200 w-64">
            <div className="font-bold text-sm text-gray-700">{data.label}</div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
        </div>
    );
};

// 2. Choice Node (Intermediate)
const ChoiceNode = ({ data }: { data: { label: string; score: any; onChange: (type: string, val: number) => void } }) => {
    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-gray-50 border-2 border-blue-200 w-48">
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />
            <div className="font-bold text-sm text-center mb-2">{data.label}</div>

            <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                    <span>Energy</span>
                    <input
                        type="number"
                        value={data.score.energy}
                        onChange={(e) => data.onChange('energy', parseInt(e.target.value))}
                        className="w-12 p-1 border rounded text-right"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <span>Positivity</span>
                    <input
                        type="number"
                        value={data.score.positivity}
                        onChange={(e) => data.onChange('positivity', parseInt(e.target.value))}
                        className="w-12 p-1 border rounded text-right"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <span>Curiosity</span>
                    <input
                        type="number"
                        value={data.score.curiosity}
                        onChange={(e) => data.onChange('curiosity', parseInt(e.target.value))}
                        className="w-12 p-1 border rounded text-right"
                    />
                </div>
            </div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-500" />
        </div>
    );
};

// 3. Attribute Node (Sink)
const AttributeNode = ({ data }: { data: { label: string } }) => {
    return (
        <div className="px-4 py-2 shadow-md rounded-full bg-green-100 border-2 border-green-500 w-32 text-center">
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-green-500" />
            <div className="font-bold text-sm text-green-900">{data.label}</div>
        </div>
    );
};

const nodeTypes = {
    question: QuestionNode,
    choice: ChoiceNode,
    attribute: AttributeNode,
};

interface NodeEditorProps {
    questions: any[];
    initialScores: ChoiceScore[];
    onUpdate: (scores: ChoiceScore[]) => void;
}

export default function NodeEditor({ questions, initialScores, onUpdate }: NodeEditorProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedQuestionId, setSelectedQuestionId] = useState<number>(questions[0]?.id || 1);
    const [localScores, setLocalScores] = useState<ChoiceScore[]>(initialScores);

    // Analysis State
    const analysis = useMemo(() => checkReachability(localScores), [localScores]);

    // Handle Score Change
    const handleScoreChange = useCallback((qId: number, choice: string, type: string, val: number) => {
        setLocalScores(prev => {
            const newScores = prev.map(s => {
                if (s.questionId === qId && s.choice === choice) {
                    return { ...s, [type]: val };
                }
                return s;
            });
            onUpdate(newScores); // Propagate up
            return newScores;
        });
    }, [onUpdate]);

    // Build Graph for Selected Question
    useEffect(() => {
        if (!selectedQuestionId) return;

        const q = questions.find(q => q.id === selectedQuestionId);
        if (!q) return;

        const qScores = localScores.filter(s => s.questionId === selectedQuestionId);

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        // 1. Question Node
        newNodes.push({
            id: `q-${q.id}`,
            type: 'question',
            position: { x: 50, y: 150 },
            data: { label: `Q${q.id}. ${q.text.substring(0, 20)}...` },
        });

        // 2. Choice Nodes
        q.choices.forEach((choiceText: string, idx: number) => {
            const choiceChar = ['A', 'B', 'C'][idx];
            const score = qScores.find(s => s.choice === choiceChar) || { energy: 0, positivity: 0, curiosity: 0 };

            const nodeId = `c-${q.id}-${choiceChar}`;
            newNodes.push({
                id: nodeId,
                type: 'choice',
                position: { x: 400, y: 50 + idx * 150 },
                data: {
                    label: `${choiceChar}. ${choiceText}`,
                    score,
                    onChange: (type: string, val: number) => handleScoreChange(q.id, choiceChar, type, val)
                },
            });

            // Edge Q -> Choice
            newEdges.push({
                id: `e-${q.id}-${choiceChar}`,
                source: `q-${q.id}`,
                target: nodeId,
                animated: true,
                style: { stroke: '#9ca3af' },
            });

            // Edges Choice -> Attributes (Visual only, logic is in the node input)
            // Actually, let's just show the inputs in the node for simplicity as planned.
            // Connecting to Attribute nodes visually might be too cluttered if we have 3 attributes x 3 choices.
            // Instead, let's just have "Attribute Nodes" on the right to represent the "Pool".
        });

        // 3. Attribute Nodes (Visual Targets)
        ['Energy', 'Positivity', 'Curiosity'].forEach((attr, idx) => {
            newNodes.push({
                id: `attr-${attr}`,
                type: 'attribute',
                position: { x: 750, y: 50 + idx * 120 },
                data: { label: attr },
            });

            // Connect all choices to these attributes? 
            // That's 3 choices * 3 attributes = 9 edges. A bit messy.
            // Let's just connect Choice to the "Concept" of Attributes.
            // Or maybe just leave them as floating sinks for visual reference.

            // Let's add edges from choices to attributes if the score is non-zero?
            q.choices.forEach((_: any, cIdx: number) => {
                const choiceChar = ['A', 'B', 'C'][cIdx];
                const score = qScores.find(s => s.choice === choiceChar);
                const nodeId = `c-${q.id}-${choiceChar}`;

                if (score) {
                    if (score.energy !== 0) newEdges.push({ id: `e-${nodeId}-energy`, source: nodeId, target: 'attr-Energy', style: { stroke: score.energy > 0 ? '#ef4444' : '#3b82f6', strokeWidth: Math.abs(score.energy) }, label: score.energy.toString() });
                    if (score.positivity !== 0) newEdges.push({ id: `e-${nodeId}-positivity`, source: nodeId, target: 'attr-Positivity', style: { stroke: score.positivity > 0 ? '#eab308' : '#a855f7', strokeWidth: Math.abs(score.positivity) }, label: score.positivity.toString() });
                    if (score.curiosity !== 0) newEdges.push({ id: `e-${nodeId}-curiosity`, source: nodeId, target: 'attr-Curiosity', style: { stroke: '#22c55e', strokeWidth: Math.abs(score.curiosity) }, label: score.curiosity.toString() });
                }
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);
    }, [selectedQuestionId, localScores, questions, handleScoreChange, setNodes, setEdges]);


    return (
        <div className="flex h-[600px] border border-gray-800 rounded-xl overflow-hidden bg-gray-900">
            {/* Sidebar: Question List */}
            <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
                <div className="p-4 font-bold text-white border-b border-gray-700">Questions</div>
                <ul>
                    {questions.map(q => (
                        <li
                            key={q.id}
                            onClick={() => setSelectedQuestionId(q.id)}
                            className={`p-3 cursor-pointer hover:bg-gray-700 text-sm ${selectedQuestionId === q.id ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
                        >
                            Q{q.id}. {q.text.substring(0, 15)}...
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main: Node Editor */}
            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    attributionPosition="bottom-right"
                    className="bg-gray-900"
                >
                    <Background color="#333" gap={16} />
                    <Controls />
                </ReactFlow>

                {/* Simulation / Validation Overlay */}
                <div className="absolute bottom-4 right-4 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-xl max-w-sm">
                    <h4 className="text-white font-bold mb-2">Simulation & Validation</h4>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-gray-300">
                            <span>Reachable Outcomes:</span>
                            <span className={analysis.reachableCombinations === 20 ? 'text-green-400' : 'text-red-400 font-bold'}>
                                {analysis.reachableCombinations} / 20
                            </span>
                        </div>

                        {analysis.unreachable.length > 0 && (
                            <div className="max-h-24 overflow-y-auto bg-black/50 p-2 rounded text-red-300">
                                <div className="font-bold mb-1">Unreachable:</div>
                                {analysis.unreachable.map(u => <div key={u}>{u}</div>)}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-gray-700 p-2 rounded">
                                <div className="text-gray-400">Oceans</div>
                                <div className="text-white font-mono">
                                    {Object.values(analysis.oceanReachability).filter(Boolean).length} / 5
                                </div>
                            </div>
                            <div className="bg-gray-700 p-2 rounded">
                                <div className="text-gray-400">Seasons</div>
                                <div className="text-white font-mono">
                                    {Object.values(analysis.seasonReachability).filter(Boolean).length} / 4
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
