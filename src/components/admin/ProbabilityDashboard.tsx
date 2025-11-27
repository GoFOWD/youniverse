"use client";

import { useMemo } from "react";
import { ChoiceScore } from "@/lib/score";
import { calculateProbabilities } from "@/utils/probabilityCalculator";

interface ProbabilityDashboardProps {
  choiceScores: ChoiceScore[];
}

export default function ProbabilityDashboard({
  choiceScores,
}: ProbabilityDashboardProps) {
  // Calculate probabilities (memoized to avoid recalculation on every render)
  const probabilities = useMemo(() => {
    return calculateProbabilities(choiceScores);
  }, [choiceScores]);

  // Ocean colors (matching admin page)
  const oceanColors = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

  // Season colors (matching admin page)
  const seasonColors = ["#60a5fa", "#34d399", "#fbbf24", "#f87171"];

  const renderPieChart = (
    data: { name: string; value: number; percentage: number }[],
    colors: string[],
    title: string
  ) => {
    if (!data || data.length === 0) {
      return <div className="text-green-900">NO DATA</div>;
    }

    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    let currentAngle = 0;
    ``;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-green-400 uppercase tracking-wider">
          {title}
        </h3>
        <div className="flex items-center gap-6">
          {/* Pie Chart */}
          <div className="relative w-40 h-40">
            <svg
              viewBox="-1 -1 2 2"
              className="transform -rotate-90 w-full h-full"
            >
              {data.map((item, index) => {
                const count = item.value;
                const percentage = count / total;
                const angle = percentage * Math.PI * 2;

                // Handle 100% case
                if (percentage === 1) {
                  return (
                    <circle
                      key={index}
                      cx="0"
                      cy="0"
                      r="1"
                      fill={colors[index % colors.length]}
                    />
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
                  `Z`,
                ].join(" ");

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

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-green-300">{item.name}</span>
                </div>
                <span className="text-white font-bold font-mono">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black border border-green-800 p-6 space-y-8">
      <div className="border-b border-green-800 pb-2">
        <h2 className="text-xl font-bold text-green-400 uppercase tracking-widest">
          Probability Distribution
        </h2>
        <p className="text-xs text-green-700 mt-1">
          Based on 10,000 simulations with current scoring configuration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderPieChart(
          probabilities.oceanDistribution,
          oceanColors,
          "Ocean Distribution"
        )}
        {renderPieChart(
          probabilities.seasonDistribution,
          seasonColors,
          "Season Distribution"
        )}
      </div>
    </div>
  );
}
