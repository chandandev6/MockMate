import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BsArrowUpRight, BsArrowDownRight } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import Navbar from "../components/Navbar";
import Avatar from "../components/ui/Avatar.jsx";
import { getTransactions } from "../api/credit.api.js";
import { getCurrentUser } from "../api/user.api.js";
import { logoutUser } from "../api/auth.api.js";
import { logout, setUserData } from "../redux/userSlice.js";
import getErrorMessage from "../utils/getErrorMessage.js";
import { INTERVIEW_COST } from "../constants/interview.js";

const PAGE_SIZE = 10;

const TYPE_LABEL = {
    signup_bonus: "Welcome bonus",
    interview: "Interview",
    refund: "Refund",
    purchase: "Credits purchased",
};

// /account — balance, credits ki passbook, logout
function Account() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user.userData);

    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // balance taaza karo — webhook ne abhi credits diye ho (verify fail hua tha) to yaha dikh jaaye
    useEffect(() => {
        getCurrentUser()
            .then((res) => dispatch(setUserData(res.data.user)))
            .catch(() => {});
    }, [dispatch]);

    useEffect(() => {
        let cancelled = false;
        getTransactions({ page, limit: PAGE_SIZE })
            .then((res) => {
                if (cancelled) return;
                setItems((prev) => (page === 1 ? res.data.items : [...prev, ...res.data.items]));
                setPagination(res.data.pagination);
                setError("");
            })
            .catch((err) => !cancelled && setError(getErrorMessage(err)))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [page]);

    const handleLogout = async () => {
        try {
            await logoutUser();
        } finally {
            dispatch(logout()); // ProtectedRoute "loggedOut" dekh ke home par bhej deta hai
        }
    };

    const hasMore = pagination && page < pagination.totalPages;

    return (
        <div className="min-h-screen bg-ground">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 animate-rise">
                    <div>
                        <p className="eyebrow mb-3">{user?.email}</p>
                        <h1 className="text-[clamp(2.75rem,1rem+5vw,5.5rem)] font-black tracking-[-0.055em] leading-[0.9]">
                            Account<span className="text-signal">.</span>
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="btn btn-line self-start sm:self-auto text-bad"
                    >
                        <HiOutlineLogout /> Logout
                    </button>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* profile + balance */}
                    <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
                        <div className="bg-paper border border-line rounded-2xl p-6 flex items-center gap-4">
                            <Avatar name={user?.name} size="lg" />
                            <div className="min-w-0">
                                <p className="font-bold text-lg truncate">{user?.name}</p>
                                <p className="text-sm text-muted truncate">{user?.email}</p>
                            </div>
                        </div>
                        <div className="bg-ink text-ground rounded-2xl p-6">
                            <p className="eyebrow !text-ground/60">Credit balance</p>
                            <p className="text-6xl font-black tracking-[-0.05em] tabular-nums mt-2">
                                {user?.credit ?? "–"}
                            </p>
                            <p className="text-sm text-ground/75 mt-2">
                                Enough for {Math.floor((user?.credit ?? 0) / INTERVIEW_COST)} interviews
                            </p>
                            <button
                                type="button"
                                onClick={() => navigate("/pricing")}
                                className="btn btn-signal w-full mt-6"
                            >
                                Buy credits
                            </button>
                        </div>
                    </div>

                    {/* passbook */}
                    <div className="lg:col-span-8">
                        <h2 className="text-2xl font-extrabold tracking-[-0.03em] pb-3 border-b border-ink">
                            Credit history
                        </h2>
                        {loading && items.length === 0 ? (
                            <div className="animate-pulse">
                                {[0, 1, 2].map((n) => (
                                    <div key={n} className="h-16 border-b border-line flex items-center">
                                        <div className="h-4 w-48 bg-line rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : error && items.length === 0 ? (
                            <p className="py-5 text-sm text-bad">{error}</p>
                        ) : items.length === 0 ? (
                            <p className="py-5 text-sm text-muted">No credit activity yet.</p>
                        ) : (
                            <ul>
                                {items.map((item) => {
                                    const positive = item.amount > 0;
                                    return (
                                        <li
                                            key={item._id}
                                            className="grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 py-4 border-b border-line"
                                        >
                                            <span
                                                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                                                    positive ? "bg-good-wash text-good" : "bg-surface text-muted"
                                                }`}
                                            >
                                                {positive ? <BsArrowDownRight /> : <BsArrowUpRight />}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold">
                                                    {TYPE_LABEL[item.type] ?? item.type}
                                                </p>
                                                <p className="text-xs text-muted truncate">
                                                    {new Date(item.createdAt).toLocaleString(undefined, {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                        hour: "numeric",
                                                        minute: "2-digit",
                                                    })}
                                                    {item.note ? ` · ${item.note}` : ""}
                                                </p>
                                            </div>
                                            <div className="text-right font-mono tabular-nums">
                                                <p
                                                    className={`text-sm font-medium ${positive ? "text-good" : "text-ink"}`}
                                                >
                                                    {positive ? "+" : ""}
                                                    {item.amount}
                                                </p>
                                                <p className="text-[11px] text-muted">bal {item.balanceAfter}</p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        {hasMore && (
                            <div className="pt-6 text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLoading(true);
                                        setPage((p) => p + 1);
                                    }}
                                    disabled={loading}
                                    className="btn btn-line"
                                >
                                    {loading ? "Loading…" : "Load more"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Account;
