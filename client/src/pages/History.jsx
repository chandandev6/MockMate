import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BsClockHistory, BsPlayFill } from "react-icons/bs";
import Navbar from "../components/Navbar";
import Analytics from "../components/history/Analytics.jsx";
import { getHistory } from "../api/interview.api.js";
import { resetInterview } from "../redux/interviewSlice.js";
import { saveActiveInterview } from "../utils/activeInterview.js";
import getErrorMessage from "../utils/getErrorMessage.js";
import { MODE_LABEL, MODES } from "../constants/interview.js";

const PAGE_SIZE = 9; // 3 column grid — har "Load more" par ek poori line set

const FILTERS = [{ key: "", title: "All" }, ...MODES];

const scoreColor = (score) => (score >= 70 ? "text-good" : score >= 40 ? "text-warn" : "text-bad");

const STATUS_BADGE = {
    in_progress: { text: "In progress", className: "bg-signal-wash text-ink" },
    finishing: { text: "Preparing report", className: "bg-signal-wash text-ink" },
    abandoned: { text: "Abandoned", className: "bg-ground text-muted" },
};

// ek interview = ek line (logbook jaisa) — date | role + mode | score / status | action
function HistoryRow({ item, onOpen }) {
    const completed = item.status === "completed";
    const badge = STATUS_BADGE[item.status];
    const clickable = completed || item.status === "in_progress";
    return (
        <li className="border-b border-line">
            <button
                type="button"
                onClick={() => onOpen(item)}
                disabled={!clickable}
                className="w-full grid grid-cols-[1fr_auto] sm:grid-cols-[7rem_1fr_7rem_8rem] items-center gap-x-4 gap-y-1 py-5 text-left group disabled:cursor-default"
            >
                <span className="font-mono text-xs text-muted order-3 sm:order-none">
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })}
                </span>
                <span className="min-w-0">
                    <span className="block font-bold text-lg tracking-[-0.01em] truncate group-hover:underline underline-offset-4 group-disabled:no-underline">
                        {item.role}
                    </span>
                    <span className="block text-sm text-muted">
                        {MODE_LABEL[item.mode]} · {item.experience}
                    </span>
                </span>
                <span className="sm:text-right row-span-2 sm:row-span-1">
                    {completed ? (
                        <span
                            className={`text-3xl font-extrabold tabular-nums tracking-[-0.03em] ${scoreColor(item.report?.overallScore ?? 0)}`}
                        >
                            {item.report?.overallScore ?? 0}
                            <span className="text-xs text-muted font-medium">/100</span>
                        </span>
                    ) : (
                        <span className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${badge?.className}`}>
                            {badge?.text ?? item.status}
                        </span>
                    )}
                </span>
                <span className="hidden sm:flex justify-end text-sm font-semibold items-center gap-1">
                    {completed ? (
                        "View report →"
                    ) : item.status === "in_progress" ? (
                        <>
                            <BsPlayFill /> Continue
                        </>
                    ) : (
                        ""
                    )}
                </span>
            </button>
        </li>
    );
}

// /history — apne interviews, newest first, mode filter + "Load more" (server pagination)
function History() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [mode, setMode] = useState("");
    const [page, setPage] = useState(1);
    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0); // "Try again" ke liye

    useEffect(() => {
        let cancelled = false;
        getHistory({ page, limit: PAGE_SIZE, mode: mode || undefined })
            .then((res) => {
                if (cancelled) return;
                // page 1 = naya list (filter badla), aage ke pages = purane ke neeche jodo
                setItems((prev) => (page === 1 ? res.data.items : [...prev, ...res.data.items]));
                setPagination(res.data.pagination);
                setError("");
            })
            .catch((err) => !cancelled && setError(getErrorMessage(err)))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [mode, page, reloadKey]);

    const changeFilter = (key) => {
        if (key === mode) return;
        setMode(key);
        setPage(1);
        setItems([]);
        setLoading(true);
    };

    const loadMore = () => {
        setLoading(true);
        setPage((p) => p + 1);
    };

    const retry = () => {
        setError("");
        setLoading(true);
        setReloadKey((k) => k + 1);
    };

    const openItem = (item) => {
        if (item.status === "completed") return navigate(`/report/${item._id}`);
        if (item.status === "in_progress") {
            // Interviewpage refresh wala restore yahi id uthayega aur wahi se continue karega
            saveActiveInterview({ interviewId: item._id, avatar: "female" });
            dispatch(resetInterview());
            navigate("/interview");
        }
    };

    const hasMore = pagination && page < pagination.totalPages;
    const firstLoad = loading && items.length === 0;

    return (
        <div className="min-h-screen bg-ground">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 animate-rise">
                    <div>
                        <p className="eyebrow mb-3">
                            {pagination
                                ? `${pagination.total} interview${pagination.total === 1 ? "" : "s"}`
                                : "Your record"}
                        </p>
                        <h1 className="text-[clamp(2.75rem,1rem+5vw,5.5rem)] font-black tracking-[-0.055em] leading-[0.9]">
                            Interview history<span className="text-signal">.</span>
                        </h1>
                    </div>
                    <button onClick={() => navigate("/interview")} className="btn btn-signal self-start sm:self-auto">
                        New interview
                    </button>
                </div>

                <Analytics />

                {/* mode filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink pb-3">
                    <h2 className="text-2xl font-extrabold tracking-[-0.03em]">Sessions</h2>
                    <div className="flex gap-1 overflow-x-auto" role="tablist">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter.key}
                                role="tab"
                                aria-selected={mode === filter.key}
                                onClick={() => changeFilter(filter.key)}
                                className={`px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                                    mode === filter.key ? "bg-ink text-paper" : "text-muted hover:text-ink"
                                }`}
                            >
                                {filter.title}
                            </button>
                        ))}
                    </div>
                </div>

                {error && items.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-bad mb-4">{error}</p>
                        <button onClick={retry} className="btn btn-ink">
                            Try again
                        </button>
                    </div>
                ) : firstLoad ? (
                    <div className="animate-pulse">
                        {Array.from({ length: 5 }, (_, n) => (
                            <div key={n} className="h-20 border-b border-line flex items-center gap-6">
                                <div className="h-3 w-20 bg-line rounded" />
                                <div className="h-5 flex-1 max-w-xs bg-line rounded" />
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="py-16">
                        <BsClockHistory size={32} className="text-muted mb-4" />
                        <p className="text-2xl font-bold tracking-[-0.02em]">
                            {mode ? `No ${MODE_LABEL[mode]} interviews yet` : "No interviews yet"}
                        </p>
                        <p className="text-muted mt-1 mb-6">Your finished interviews and reports show up here.</p>
                        <button onClick={() => navigate("/interview")} className="btn btn-signal">
                            Start your first interview
                        </button>
                    </div>
                ) : (
                    <>
                        <ul>
                            {items.map((item) => (
                                <HistoryRow key={item._id} item={item} onOpen={openItem} />
                            ))}
                        </ul>
                        {error && <p className="text-sm text-bad text-center mt-4">{error}</p>}
                        {(hasMore || error) && (
                            <div className="text-center mt-8">
                                <button onClick={error ? retry : loadMore} disabled={loading} className="btn btn-line">
                                    {loading ? "Loading…" : error ? "Try again" : "Load more"}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default History;
