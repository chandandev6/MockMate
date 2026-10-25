import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { HiOutlineLogout } from "react-icons/hi";
import { BsChevronDown } from "react-icons/bs";
import { logout } from "../redux/userSlice.js";
import { logoutUser } from "../api/auth.api.js";
import Wordmark from "./ui/Wordmark.jsx";
import Avatar from "./ui/Avatar.jsx";

// login popup (aur uske saath Firebase ka bada code) tabhi download ho jab user popup khole
const Authmodel = lazy(() => import("./Authmodel"));

// sirf 3 jagah — sab dikhao (hamburger ke peeche chhupane ki zarurat nahi). Number = studio ke channel jaisa index
const LINKS = [
    { to: "/interview", n: "01", label: "Practice" },
    { to: "/history", n: "02", label: "History" },
    { to: "/pricing", n: "03", label: "Pricing" },
];

const menuItem = "w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-ground transition-colors";

function Navbar() {
    const { userData, loading } = useSelector((state) => state.user);

    const [showCreditPopup, setShowCreditPopup] = useState(false);
    const [showUserPopup, setShowUserPopup] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showAuth, setShowAuth] = useState(false);
    const menusRef = useRef(null); // credits + profile buttons aur unke popups — iske bahar tap = band

    // popup khula hai to: bahar kahin bhi tap/click ya Escape → band. Band ho to listener hi nahi (faltu kaam nahi)
    const anyPopupOpen = showCreditPopup || showUserPopup;
    useEffect(() => {
        if (!anyPopupOpen) return;
        const closeAll = () => {
            setShowCreditPopup(false);
            setShowUserPopup(false);
        };
        // pointerdown = mouse + touch dono. Andar ka tap ignore — warna button ka apna toggle ulta chal jaata
        const onPointerDown = (e) => {
            if (!menusRef.current?.contains(e.target)) closeAll();
        };
        const onKeyDown = (e) => {
            if (e.key === "Escape") closeAll();
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [anyPopupOpen]);

    const handleLogout = async () => {
        try {
            await logoutUser();
            dispatch(logout()); // private page par ho to ProtectedRoute home bhejega (login nahi)
            setShowUserPopup(false);
            setShowCreditPopup(false);
            navigate("/");
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    const go = (path) => {
        setShowUserPopup(false);
        setShowCreditPopup(false);
        navigate(path);
    };

    return (
        <>
            <header className="sticky top-0 z-40 bg-ground/90 backdrop-blur border-b border-line">
                <div className="max-w-7xl mx-auto h-16 px-4 sm:px-8 flex items-center justify-between gap-4">
                    <Link to="/" aria-label="MockMate home" className="shrink-0">
                        <Wordmark />
                    </Link>

                    <nav aria-label="Main" className="hidden md:flex items-center gap-8">
                        {LINKS.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    `group flex items-baseline gap-2 text-sm font-medium transition-colors ${
                                        isActive ? "text-ink" : "text-muted hover:text-ink"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <span className="font-mono text-[10px] tracking-wider">
                                            {isActive ? <span className="lamp align-middle" /> : link.n}
                                        </span>
                                        {link.label}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    <div ref={menusRef} className="flex items-center gap-2 sm:gap-3 relative shrink-0">
                        <button
                            onClick={() => {
                                if (!userData) {
                                    setShowAuth(true);
                                    return;
                                }
                                setShowCreditPopup(!showCreditPopup);
                                setShowUserPopup(false);
                            }}
                            aria-label="Credits"
                            className="h-9 flex items-center gap-2 border border-line-strong rounded-full px-3 font-mono text-xs hover:border-ink transition-colors"
                        >
                            {/* login check chal raha hai to "0" mat dikhao (flash) — placeholder */}
                            {loading ? (
                                <span className="inline-block w-6 h-3 bg-line rounded animate-pulse" />
                            ) : (
                                <span className="tabular-nums font-medium">{userData ? userData.credit : 0}</span>
                            )}
                            <span className="text-muted">CR</span>
                        </button>

                        {showCreditPopup && (
                            <div className="absolute top-12 right-0 w-64 bg-paper border border-line rounded-xl p-4 z-50 shadow-[0_12px_40px_-12px_rgb(15_37_64/0.35)]">
                                <p className="eyebrow mb-1">Balance</p>
                                <p className="text-2xl font-bold tabular-nums">
                                    {userData?.credit}
                                    <span className="text-sm font-medium text-muted"> credits</span>
                                </p>
                                <p className="text-sm text-muted mt-1 mb-4">One interview uses 50.</p>
                                <button onClick={() => go("/pricing")} className="btn btn-ink w-full">
                                    Buy more credits
                                </button>
                            </div>
                        )}

                        <div className="relative">
                            <button
                                onClick={() => {
                                    if (!userData) {
                                        setShowAuth(true);
                                        return;
                                    }
                                    setShowUserPopup(!showUserPopup);
                                    setShowCreditPopup(false);
                                }}
                                aria-label={userData ? "Account menu" : "Sign in"}
                                aria-expanded={userData ? showUserPopup : undefined}
                                className={
                                    userData || loading
                                        ? `h-10 flex items-center gap-2.5 pl-1 pr-2.5 sm:pr-3 rounded-xl border transition-colors ${
                                              showUserPopup
                                                  ? "border-ink bg-paper"
                                                  : "border-line-strong hover:border-ink hover:bg-paper"
                                          }`
                                        : "btn btn-ink !min-h-9 !px-4 text-sm"
                                }
                            >
                                {loading ? (
                                    <span className="w-8 h-8 bg-line rounded-lg animate-pulse" />
                                ) : userData ? (
                                    <>
                                        <Avatar name={userData.name} />
                                        <span className="hidden sm:block text-sm font-semibold max-w-28 truncate">
                                            {userData.name?.split(" ")[0]}
                                        </span>
                                        <BsChevronDown
                                            size={12}
                                            className={`text-muted transition-transform ${showUserPopup ? "rotate-180" : ""}`}
                                        />
                                    </>
                                ) : (
                                    "Sign in"
                                )}
                            </button>

                            {showUserPopup && (
                                <div className="absolute top-13 right-0 w-72 bg-paper border border-line rounded-xl p-2 z-50 shadow-[0_12px_40px_-12px_rgb(15_37_64/0.35)]">
                                    <div className="flex items-center gap-3 px-3 pt-2 pb-3 border-b border-line mb-1">
                                        <Avatar name={userData?.name} size="md" />
                                        <div className="min-w-0">
                                            <p className="font-semibold truncate">{userData?.name}</p>
                                            <p className="text-xs text-muted truncate">{userData?.email}</p>
                                        </div>
                                    </div>
                                    {/* mobile par upar wala nav nahi dikhta — yaha se pahunch jaaye */}
                                    <button onClick={() => go("/interview")} className={`${menuItem} md:hidden`}>
                                        Practice
                                    </button>
                                    <button onClick={() => go("/account")} className={menuItem}>
                                        Account & credits
                                    </button>
                                    <button onClick={() => go("/history")} className={menuItem}>
                                        Interview History
                                    </button>
                                    <button onClick={() => go("/pricing")} className={`${menuItem} md:hidden`}>
                                        Pricing
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className={`${menuItem} text-bad flex items-center gap-2 border-t border-line mt-1 rounded-t-none`}
                                    >
                                        <HiOutlineLogout />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* header ke BAHAR — header ka backdrop-blur andar ke "fixed" modal ko header me hi band kar deta */}
            {showAuth && (
                <Suspense fallback={null}>
                    <Authmodel onClose={() => setShowAuth(false)} />
                </Suspense>
            )}
        </>
    );
}

export default Navbar;
