
import React, { useMemo, useState } from 'react';
import { Match } from '../store/historyStore';
import { resolveTheme, getHexFromColor } from '@lib/utils/colors';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@contexts/LanguageContext';

interface MomentumGraphProps {
    match: Match;
}

// Simple Catmull-Rom to Cubic Bezier conversion for smooth SVG paths
const svgPath = (points: [number, number][], command: (point: [number, number], i: number, a: [number, number][]) => string) => {
    return points.reduce((acc, point, i, a) => i === 0 ? `M ${point[0]},${point[1]}` : `${acc} ${command(point, i, a)}`, '');
};

const lineCommand = (point: [number, number]) => `L ${point[0]},${point[1]}`;

const bezierCommand = (point: [number, number], i: number, a: [number, number][]) => {
    const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
    const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
};

const controlPoint = (current: [number, number], previous: [number, number], next: [number, number], reverse?: boolean) => {
    const p = previous || current;
    const n = next || current;
    const smoothing = 0.15; // 0 to 1
    const o = line(p, n);
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;
    const x = current[0] + Math.cos(angle) * length;
    const y = current[1] + Math.sin(angle) * length;
    return [x, y];
};

const line = (pointA: [number, number], pointB: [number, number]) => {
    const lengthX = pointB[0] - pointA[0];
    const lengthY = pointB[1] - pointA[1];
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX)
    };
};

export const MomentumGraph: React.FC<MomentumGraphProps> = ({ match }) => {
    const { t } = useTranslation();
    const [hoverPoint, setHoverPoint] = useState<{ x: number, y: number, diff: number, index: number, score: string } | null>(null);

    // Generate unique ID for gradient to avoid collisions between Landscape (Hidden) and Portrait (Portal) views
    const gradientId = useMemo(() => `momentum-grad-${match.id}-${Math.random().toString(36).slice(2, 9)}`, [match.id]);

    const themeA = resolveTheme(match.teamARoster?.color || 'indigo');
    const themeB = resolveTheme(match.teamBRoster?.color || 'rose');
    const hexA = getHexFromColor(match.teamARoster?.color || 'indigo');
    const hexB = getHexFromColor(match.teamBRoster?.color || 'rose');

    // DATA PROCESSING
    const graphData = useMemo(() => {
        const dataPoints: { diff: number; label: string; isSetEnd?: boolean; setLabel?: string }[] = [{ diff: 0, label: "0-0" }];

        let scoreA = 0;
        let scoreB = 0;
        let currentSet = 1;

        // Filter and sort relevant logs
        const logs = (match.actionLog || [])
            .filter(l => l.type === 'POINT')
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

        logs.forEach((log, idx) => {
            if (log.team === 'A') scoreA++;
            else scoreB++;

            const diff = scoreA - scoreB;
            dataPoints.push({
                diff,
                label: `${scoreA}-${scoreB}`
            });

            const setRecord = match.sets.find(s => s.setNumber === currentSet);
            if (setRecord && scoreA === setRecord.scoreA && scoreB === setRecord.scoreB) {
                dataPoints[dataPoints.length - 1].isSetEnd = true;
                dataPoints[dataPoints.length - 1].setLabel = `S${currentSet}`;
                currentSet++;
                scoreA = 0;
                scoreB = 0;
                // Add a zero point to signify new set start visually
                dataPoints.push({ diff: 0, label: "0-0" });
            }
        });

        return dataPoints;
    }, [match]);

    if (graphData.length < 2) return null;

    // --- DYNAMIC DIMENSIONS ---
    // Calculates width based on data length to prevent squashing/stretching
    const PIXELS_PER_POINT = 60; // How much horizontal space per point
    const MIN_WIDTH = 900; // Minimum width to maintain legibility

    const width = Math.max(MIN_WIDTH, graphData.length * PIXELS_PER_POINT);
    const height = 400; // Fixed internal coordinate height
    const padding = 40;
    const graphH = height - (padding * 2);
    const graphW = width - (padding * 2);

    // SCALING
    const maxDiff = Math.max(...graphData.map(d => Math.abs(d.diff)), 3);
    const yScale = (graphH / 2) / (maxDiff + 1); // Add +1 buffer
    const xScale = graphW / (graphData.length - 1);
    const zeroY = height / 2;

    // GENERATE POINTS TUPLES
    const coordinates: [number, number][] = graphData.map((d, i) => [
        padding + (i * xScale),
        zeroY - (d.diff * yScale)
    ]);

    // GENERATE CURVED PATH
    const curvedPath = svgPath(coordinates, bezierCommand);

    // For the area fill, we close the path back to the zero line
    const lastPoint = coordinates[coordinates.length - 1];
    const firstPoint = coordinates[0];
    const areaPathStr = `${curvedPath} L ${lastPoint[0]},${zeroY} L ${firstPoint[0]},${zeroY} Z`;

    const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
        const svgRect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - svgRect.left;

        const viewBoxX = (x / svgRect.width) * width;
        const index = Math.round((viewBoxX - padding) / xScale);

        if (index >= 0 && index < graphData.length) {
            const d = graphData[index];
            setHoverPoint({
                x: padding + (index * xScale),
                y: zeroY - (d.diff * yScale),
                diff: d.diff,
                index,
                score: d.label
            });
        }
    };

    return (
        <div className="w-full bg-white dark:bg-white/5 rounded-3xl p-4 border border-black/5 dark:border-white/5 shadow-sm mt-4">
            <div className="flex items-center justify-between mb-2 px-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('stats.momentum')}</h3>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: hexA }} /> {match.teamAName}</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: hexB }} /> {match.teamBName}</div>
                </div>
            </div>

            {/* 
            SCROLL WRAPPER LOGIC:
            1. overflow-x-auto + touch-pan-x: Enables smooth horizontal scroll
            2. min-w-full: Ensures container fills space
            3. SVG width controlled by calculated 'width' prop
        */}
            <div className="w-full overflow-x-auto custom-scrollbar pb-2 touch-pan-y">
                <div
                    className="relative h-64 sm:h-72 lg:h-80 shrink-0 select-none mx-auto"
                    style={{ width: `${Math.max(width, 300)}px`, minWidth: '100%' }}
                >
                    <svg
                        width={width}
                        height="100%"
                        viewBox={`0 0 ${width} ${height}`}
                        preserveAspectRatio="none"
                        className="w-full h-full overflow-visible"
                        onPointerMove={handlePointerMove}
                        onPointerLeave={() => setHoverPoint(null)}
                        style={{ minWidth: '100%' }}
                    >
                        <defs>
                            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor={hexA} stopOpacity="0.6" />
                                <stop offset="45%" stopColor={hexA} stopOpacity="0.1" />
                                <stop offset="55%" stopColor={hexB} stopOpacity="0.1" />
                                <stop offset="100%" stopColor={hexB} stopOpacity="0.6" />
                            </linearGradient>
                        </defs>

                        {/* Zero Line */}
                        <line x1={padding} y1={zeroY} x2={width - padding} y2={zeroY} stroke="currentColor" className="text-slate-300 dark:text-white/20" strokeWidth="2" strokeDasharray="6 6" />

                        {/* Set Dividers */}
                        {graphData.map((d, i) => d.isSetEnd && (
                            <g key={i}>
                                <line
                                    x1={padding + (i * xScale)} y1={padding}
                                    x2={padding + (i * xScale)} y2={height - padding}
                                    stroke="currentColor" className="text-slate-200 dark:text-white/10" strokeWidth="2"
                                />
                                <text
                                    x={padding + (i * xScale)} y={height - 2}
                                    textAnchor="middle"
                                    className="text-2xl font-bold fill-slate-300 dark:fill-slate-600 uppercase"
                                >
                                    {d.setLabel}
                                </text>
                            </g>
                        ))}

                        {/* The Graph Area */}
                        <motion.path
                            d={areaPathStr}
                            fill={`url(#${gradientId})`}
                            stroke="none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        />

                        {/* The Graph Line - Thicker and Curved */}
                        <motion.path
                            d={curvedPath}
                            fill="none"
                            stroke={`url(#${gradientId})`}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />

                        {/* Interactive Tooltip */}
                        <AnimatePresence>
                            {hoverPoint && (
                                <g>
                                    <motion.line
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        x1={hoverPoint.x} y1={padding} x2={hoverPoint.x} y2={height - padding}
                                        stroke="currentColor" className="text-slate-400 dark:text-white/40" strokeWidth="2"
                                    />
                                    <motion.circle
                                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                        cx={hoverPoint.x} cy={hoverPoint.y} r="8"
                                        className="fill-white dark:fill-slate-900 stroke-indigo-500" strokeWidth="3"
                                    />
                                    {/* Floating Label */}
                                    <foreignObject x={Math.min(hoverPoint.x - 30, width - 80)} y={hoverPoint.diff > 0 ? hoverPoint.y + 15 : hoverPoint.y - 60} width="80" height="40">
                                        <div className={`
                                            px-3 py-1.5 rounded-xl text-xs font-black text-center shadow-lg border border-white/10
                                            ${hoverPoint.diff > 0 ? `${themeA.bg} ${themeA.text}` : (hoverPoint.diff < 0 ? `${themeB.bg} ${themeB.text}` : 'bg-slate-800 text-white')}
                                            backdrop-blur-md
                                        `}>
                                            {hoverPoint.score}
                                        </div>
                                    </foreignObject>
                                </g>
                            )}
                        </AnimatePresence>
                    </svg>
                </div>
            </div>
        </div>

    );
};
