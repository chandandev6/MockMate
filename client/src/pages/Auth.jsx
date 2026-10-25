import { useState } from "react";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { MdMarkEmailRead } from "react-icons/md";
import { auth, provider } from "../utils/firebase";
import { signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { setUserData } from "../redux/userSlice.js";
import { googleLogin, registerUser, loginUser, resendVerification, forgotPassword } from "../api/auth.api.js";
import getErrorMessage from "../utils/getErrorMessage.js";
import Wordmark from "../components/ui/Wordmark.jsx";
import LevelMeter from "../components/ui/LevelMeter.jsx";

function Auth({ isModel = false, onClose }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // "login" | "register" | "check-email" (signup ke baad "inbox check karo") | "forgot" (reset link maango)
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [needsVerification, setNeedsVerification] = useState(false); // login par "verify pehle karo" aaya to resend button dikhao

    const isRegister = mode === "register";

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const switchMode = (nextMode) => {
        setMode(nextMode);
        setError("");
        setInfo("");
        setNeedsVerification(false);
    };

    const onLoggedIn = (user) => {
        dispatch(setUserData(user)); // Navbar update + modal khud band (Authmodel)
        // ProtectedRoute ne yaha bheja tha to wapas usi page par, warna home
        if (!isModel) navigate(location.state?.from || "/", { replace: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // form submit par page reload mat karo
        setError("");
        setInfo("");
        setNeedsVerification(false);
        setLoading(true);
        try {
            if (isRegister) {
                await registerUser(form);
                setMode("check-email"); // signup par login nahi — pehle email verify
            } else {
                const res = await loginUser(form);
                onLoggedIn(res.data.user);
            }
        } catch (error) {
            setError(getErrorMessage(error));
            // message ki jagah code check karo — message kabhi badle to bhi ye chalega
            if (error.response?.data?.code === "EMAIL_NOT_VERIFIED") setNeedsVerification(true);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError("");
        setInfo("");
        setLoading(true);
        try {
            const res = await resendVerification(form.email);
            setInfo(res.message);
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError("");
        setInfo("");
        setLoading(true);
        try {
            const res = await forgotPassword(form.email);
            setInfo(res.message);
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setError("");
        try {
            const response = await signInWithPopup(auth, provider);
            // server ko sirf Firebase ID token bhejo — server usse verify karke name/email nikalega
            const idToken = await response.user.getIdToken();

            const res = await googleLogin(idToken);
            onLoggedIn(res.data.user);
        } catch (error) {
            // user ne khud popup band kiya — error dikhane ki zarurat nahi
            if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") return;
            console.error("Error during Google authentication:", error);
            setError(getErrorMessage(error));
        }
    };

    const card = (
        <div
            // "relative" — close button isi card ke corner par lagta hai
            className={`animate-rise relative w-full max-w-md bg-paper border border-line rounded-2xl p-6 sm:p-8 ${
                isModel ? "shadow-[0_30px_80px_-30px_rgb(15_37_64/0.6)]" : ""
            }`}
        >
            {isModel && (
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-ground"
                >
                    <FaTimes size={16} />
                </button>
            )}

            {/* poore page par left panel me logo hai — card me dobara nahi */}
            <div className={`mb-6 ${isModel ? "" : "lg:hidden"}`}>
                <Wordmark />
            </div>

            {mode === "forgot" ? (
                // ---------- forgot password: email do, reset link aayega ----------
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] mb-2">
                        Forgot your password?
                    </h1>
                    <p className="text-muted text-sm mb-6">
                        Enter your email and we'll send you a link to set a new password.
                    </p>
                    <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                        <input
                            name="email"
                            type="email"
                            placeholder="Email"
                            aria-label="Email"
                            autoComplete="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="field"
                        />
                        {error && <p className="text-sm text-bad bg-bad-wash rounded-lg px-3 py-2">{error}</p>}
                        {info && (
                            <p className="text-sm text-good bg-good-wash rounded-lg px-3 py-2">
                                {info}
                                {import.meta.env.DEV && " (Dev: without SMTP the link is in the server terminal.)"}
                            </p>
                        )}
                        <button type="submit" disabled={loading} className="btn btn-ink w-full">
                            {loading ? "Sending..." : "Send reset link"}
                        </button>
                    </form>
                    <button
                        onClick={() => switchMode("login")}
                        className="mt-4 w-full text-sm text-muted hover:text-ink"
                    >
                        ← Back to login
                    </button>
                </div>
            ) : mode === "check-email" ? (
                // ---------- signup ke baad: inbox check karo ----------
                <div>
                    <MdMarkEmailRead className="text-ink mb-4" size={44} />
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] mb-2">Check your inbox</h1>
                    <p className="text-muted text-sm mb-6 leading-relaxed">
                        We sent a verification link to <span className="font-semibold text-ink">{form.email}</span>.
                        Click it to activate your account. The link expires in 24 hours.
                    </p>
                    {import.meta.env.DEV && (
                        <p className="text-xs text-warn bg-warn-wash rounded-lg px-3 py-2 mb-4">
                            Dev tip: if SMTP isn't set up, the link is printed in the server terminal.
                        </p>
                    )}
                    {info && <p className="text-sm text-good mb-3">{info}</p>}
                    {error && <p className="text-sm text-bad mb-3">{error}</p>}
                    <button onClick={handleResend} disabled={loading} className="btn btn-line w-full">
                        {loading ? "Sending..." : "Resend link"}
                    </button>
                    <button
                        onClick={() => switchMode("login")}
                        className="mt-4 w-full text-sm text-muted hover:text-ink"
                    >
                        ← Back to login
                    </button>
                </div>
            ) : (
                <>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em]">
                        {isRegister ? "Create your account" : "Welcome back"}
                    </h1>
                    <p className="text-muted text-sm leading-relaxed mt-2 mb-6">
                        {isRegister
                            ? "New accounts start with 500 credits — ten full interviews."
                            : "Sign in to practise, see your reports and track your progress."}
                    </p>

                    {/* Login / Sign up tabs */}
                    <div className="grid grid-cols-2 bg-ground rounded-full p-1 mb-6" role="tablist">
                        {["login", "register"].map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                role="tab"
                                aria-selected={mode === tab}
                                onClick={() => switchMode(tab)}
                                className={`py-2 text-sm rounded-full transition-colors ${
                                    mode === tab ? "bg-ink text-paper font-semibold" : "text-muted hover:text-ink"
                                }`}
                            >
                                {tab === "login" ? "Login" : "Sign up"}
                            </button>
                        ))}
                    </div>

                    <button type="button" onClick={handleGoogleAuth} className="btn btn-line w-full">
                        <FcGoogle size={18} />
                        Continue with Google
                    </button>

                    <div className="flex items-center gap-3 my-5 eyebrow">
                        <div className="flex-1 h-px bg-line" />
                        or with email
                        <div className="flex-1 h-px bg-line" />
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        {isRegister && (
                            <input
                                name="name"
                                placeholder="Full name"
                                aria-label="Full name"
                                autoComplete="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                minLength={2}
                                maxLength={50}
                                className="field"
                            />
                        )}
                        <input
                            name="email"
                            type="email"
                            placeholder="Email"
                            aria-label="Email"
                            autoComplete="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="field"
                        />
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder={isRegister ? "Password (min 8 characters)" : "Password"}
                                aria-label="Password"
                                // browser ka password manager sahi suggestion de: naya password vs saved password
                                autoComplete={isRegister ? "new-password" : "current-password"}
                                value={form.password}
                                onChange={handleChange}
                                required
                                minLength={isRegister ? 8 : undefined}
                                maxLength={72}
                                className="field pr-11"
                            />
                            <button
                                type="button" // type="button" warna ye bhi form submit kar deta
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {!isRegister && (
                            <button
                                type="button"
                                onClick={() => switchMode("forgot")}
                                className="self-end text-xs text-muted hover:text-ink underline underline-offset-2"
                            >
                                Forgot password?
                            </button>
                        )}

                        {error && (
                            <div className="text-sm text-bad bg-bad-wash rounded-lg px-3 py-2">
                                {error}
                                {needsVerification && (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={loading}
                                        className="block mt-1 font-semibold underline disabled:opacity-60"
                                    >
                                        Resend verification link
                                    </button>
                                )}
                            </div>
                        )}
                        {info && <p className="text-sm text-good bg-good-wash rounded-lg px-3 py-2">{info}</p>}

                        <button type="submit" disabled={loading} className="btn btn-ink w-full mt-1">
                            {loading ? "Please wait..." : isRegister ? "Create account" : "Login"}
                        </button>
                    </form>
                </>
            )}
        </div>
    );

    // popup (Navbar/Home se) — sirf card
    if (isModel) return <div className="w-full flex justify-center items-center py-4">{card}</div>;

    // poora page (/auth) — baayein navy "studio" panel, daayein form
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-ground">
            <aside className="hidden lg:flex flex-col justify-between bg-ink text-ground p-12 xl:p-16">
                <Link to="/" aria-label="MockMate home">
                    <Wordmark inverted />
                </Link>
                <div>
                    <LevelMeter tone="ground" bars={14} className="h-12 mb-10" />
                    <p className="text-[clamp(2.5rem,1rem+3vw,4.25rem)] font-black tracking-[-0.055em] leading-[0.92]">
                        Say it out loud here, so it comes out right there<span className="text-signal">.</span>
                    </p>
                </div>
                <ul className="grid grid-cols-3 gap-6 border-t border-ground/20 pt-6">
                    {[
                        ["5", "questions per session"],
                        ["4", "criteria per answer"],
                        ["500", "free credits"],
                    ].map(([value, label]) => (
                        <li key={label}>
                            <p className="text-3xl font-extrabold tabular-nums">{value}</p>
                            <p className="eyebrow !text-ground/60 mt-1">{label}</p>
                        </li>
                    ))}
                </ul>
            </aside>
            <main className="flex items-center justify-center px-4 py-12 sm:px-8">{card}</main>
        </div>
    );
}

export default Auth;
