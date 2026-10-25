// History page ke upar: progress ek nazar me — KPI tiles, score trend, skill averages, mode wise
import { lazy, Suspense, useEffect, useState } from "react";
import { BsArrowDownRight, BsArrowUpRight } from "react-icons/bs";
import { getStats } from "../../api/interview.api.js";
import { CRITERIA, MODE_LABEL } from "../../constants/interview.js";

const ScoreTrendChart = lazy(() => import("./ScoreTrendChart.jsx"));

const card = "bg-paper rounded-2xl border border-line p-6";

function StatTile({ label, value, suffix, delta }) {
    return (
        <div className="bg-ground py-6 px-4 sm:px-6">
            <p className="eyebrow">{label}</p>
            <p className="text-4xl sm:text-5xl font-black tracking-[-0.05em] mt-2 tabular-nums">
                {value ?? "–"}
                {value !== null && value !== undefined && suffix && (
                    <span className="text-sm text-muted font-medium tracking-normal">{suffix}</span>
                )}
            </p>
            {delta !== undefined && delta !== null && (
                // badhna achha hai → upar hara, neeche laal; icon + sign bhi (sirf rang par depend nahi)
                <p
                    className={`font-mono text-xs mt-2 flex items-center gap-1 ${
                        delta > 0 ? "text-good" : delta < 0 ? "text-bad" : "text-muted"
                    }`}
                >
                    {delta > 0 ? <BsArrowUpRight /> : delta < 0 ? <BsArrowDownRight /> : null}
                    {delta > 0 ? "+" : ""}
                    {delta} vs previous
                </p>
            )}
        </div>
    );
}

function Analytics() {
    const [stats, setStats] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        getStats()
            .then((res) => !cancelled && setStats(res.data))
            .catch(() => !cancelled && setFailed(true)); // analytics extra hai — fail ho to list to chalti rahe
        return () => {
            cancelled = true;
        };
    }, []);

    if (failed) return null;

    if (!stats) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 animate-pulse">
                {[0, 1, 2, 3].map((n) => (
                    <div key={n} className="h-28 bg-surface rounded-xl border border-line" />
                ))}
            </div>
        );
    }

    const { summary, byMode, trend } = stats;
    if (summary.total === 0) return null; // abhi koi completed interview nahi — neeche wala empty state kaafi hai

    const weakest = CRITERIA.reduce((low, item) =>
        (summary.skills[item.key] ?? 0) < (summary.skills[low.key] ?? 0) ? item : low,
    );
    const weakestKey = weakest.key;

    return (
        <section aria-label="Your progress" className="mb-14 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border-y border-ink">
                <StatTile label="Interviews completed" value={summary.total} />
                <StatTile label="Average score" value={summary.averageScore} suffix="/100" />
                <StatTile label="Best score" value={summary.bestScore} suffix="/100" />
                <StatTile label="Latest score" value={summary.latestScore} suffix="/100" delta={summary.change} />
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
                {/* trend */}
                <div className={`${card} lg:col-span-2`}>
                    <h2 className="text-xl font-bold tracking-[-0.02em]">Overall score over time</h2>
                    <p className="text-xs text-muted mb-2">
                        Your last {trend.length} completed interview{trend.length === 1 ? "" : "s"}
                    </p>
                    {trend.length < 2 ? (
                        <p className="text-sm text-muted py-16 text-center">
                            Complete one more interview to see your trend.
                        </p>
                    ) : (
                        <Suspense fallback={<div className="h-60 bg-surface rounded-xl animate-pulse" />}>
                            <ScoreTrendChart trend={trend} />
                        </Suspense>
                    )}
                    {/* chart ka data table me bhi — screen reader / exact numbers ke liye */}
                    <details className="mt-3 text-sm">
                        <summary className="cursor-pointer text-muted hover:text-ink">View as table</summary>
                        <div className="overflow-x-auto mt-2">
                            <table className="w-full text-left text-xs">
                                <thead className="text-muted">
                                    <tr>
                                        <th className="py-1.5 pr-3 font-medium">Date</th>
                                        <th className="py-1.5 pr-3 font-medium">Role</th>
                                        <th className="py-1.5 pr-3 font-medium">Mode</th>
                                        <th className="py-1.5 font-medium text-right">Score</th>
                                    </tr>
                                </thead>
                                <tbody className="tabular-nums">
                                    {[...trend].reverse().map((point) => (
                                        <tr key={point._id} className="border-t border-line">
                                            <td className="py-1.5 pr-3 whitespace-nowrap">
                                                {new Date(point.completedAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-1.5 pr-3">{point.role}</td>
                                            <td className="py-1.5 pr-3">{MODE_LABEL[point.mode]}</td>
                                            <td className="py-1.5 text-right">{point.overallScore}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </details>
                </div>

                {/* skills */}
                <div className={card}>
                    <h2 className="text-xl font-bold tracking-[-0.02em]">Average skill scores</h2>
                    <p className="text-xs text-muted mb-5">Across all completed interviews, out of 10</p>
                    <div className="space-y-4">
                        {CRITERIA.map(({ key, label }) => {
                            const value = summary.skills[key] ?? 0;
                            return (
                                <div key={key} title={`${label}: ${value} / 10`}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span>{label}</span>
                                        <span className="font-mono text-xs tabular-nums">{value}</span>
                                    </div>
                                    <div className="h-2 bg-line rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${key === weakestKey ? "bg-signal" : "bg-ink"}`}
                                            style={{ width: `${value * 10}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* sabse kamzor skill — "kya practice karun" ka seedha jawab (bar bhi laal) */}
                    <p className="text-sm text-muted mt-6 pt-4 border-t border-line">
                        Focus area: <span className="font-semibold text-ink">{weakest.label}</span>
                    </p>
                </div>
            </div>

            {/* mode wise */}
            {byMode.length > 0 && (
                <div className={card}>
                    <h2 className="text-xl font-bold tracking-[-0.02em] mb-4">By interview mode</h2>
                    <div className="grid sm:grid-cols-3 gap-3">
                        {byMode.map((item) => (
                            <div key={item.mode} className="border-t border-line pt-4">
                                <p className="eyebrow">{MODE_LABEL[item.mode]}</p>
                                <p className="text-3xl font-extrabold tracking-[-0.03em] mt-1 tabular-nums">
                                    {item.averageScore}
                                    <span className="text-xs text-muted font-medium tracking-normal"> avg</span>
                                </p>
                                <p className="text-xs text-muted mt-1">
                                    {item.count} interview{item.count === 1 ? "" : "s"} · best {item.bestScore}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

export default Analytics;
