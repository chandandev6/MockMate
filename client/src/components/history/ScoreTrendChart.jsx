// overall score over time — ek hi series (line + halka area). Recharts bhaari hai, isliye ye file lazy load hoti hai
import { Area, AreaChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MODE_LABEL } from "../../constants/interview.js";

// chart ke rang ek jagah — line/dots ka ek hi accent, grid/axis halke (data hi "loud" ho)
// design tokens jaise hi (index.css) — line navy, sirf aakhri (latest) point laal
const ACCENT = "#0f2540";
const LATEST = "#f75c2f";
const GRID = "#c3ccd7";
const MUTED = "#4a5a6e";
const SURFACE = "#fbfcfd";

const shortDate = (value) => new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short" });

// hover par: value pehle (bold), phir role · mode · date
function TrendTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload;
    return (
        <div className="bg-paper border border-line shadow-lg rounded-lg px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: ACCENT }} />
                <strong className="text-sm text-ink">{point.overallScore}</strong>
                <span className="text-muted">/ 100</span>
            </div>
            <p className="text-ink mt-1">{point.role}</p>
            <p className="text-muted">
                {MODE_LABEL[point.mode]} · {shortDate(point.completedAt)}
            </p>
        </div>
    );
}

// sirf aakhri point par value likho — har dot par number = shor
function LastPointLabel({ x, y, index, value, count }) {
    if (index !== count - 1) return null;
    return (
        <text x={x} y={y - 12} textAnchor="middle" fontSize={12} fontWeight={600} fill={ACCENT}>
            {value}
        </text>
    );
}

function ScoreTrendChart({ trend }) {
    // same din do interview → x-axis par alag rahe, isliye index key; label me date
    const data = trend.map((point, index) => ({ ...point, key: index }));
    return (
        <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 24, right: 16, bottom: 0, left: -16 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis
                    dataKey="key"
                    tickFormatter={(index) => shortDate(data[index]?.completedAt)}
                    tick={{ fontSize: 11, fill: MUTED }}
                    tickLine={false}
                    axisLine={{ stroke: GRID }}
                    interval="preserveStartEnd"
                    minTickGap={24}
                />
                <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tick={{ fontSize: 11, fill: MUTED }}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip content={<TrendTooltip />} cursor={{ stroke: "#9ca3af", strokeWidth: 1 }} />
                <Area
                    type="linear"
                    dataKey="overallScore"
                    stroke={ACCENT}
                    strokeWidth={2}
                    fill={ACCENT}
                    fillOpacity={0.06}
                    // fillOpacity: 1 zaroori — warna dots ko area ka 0.1 (halka wash) mil jaata, dikhte hi nahi
                    // latest interview ka dot laal (accent) — "abhi tum yaha ho"; baaki navy
                    dot={({ cx, cy, index }) => (
                        <circle
                            key={index}
                            cx={cx}
                            cy={cy}
                            r={index === data.length - 1 ? 5 : 4}
                            fill={index === data.length - 1 ? LATEST : ACCENT}
                            stroke={SURFACE}
                            strokeWidth={2}
                        />
                    )}
                    activeDot={{ r: 6, fill: ACCENT, fillOpacity: 1, stroke: SURFACE, strokeWidth: 2 }}
                    isAnimationActive={false}
                >
                    <LabelList dataKey="overallScore" content={<LastPointLabel count={data.length} />} />
                </Area>
            </AreaChart>
        </ResponsiveContainer>
    );
}

export default ScoreTrendChart;
