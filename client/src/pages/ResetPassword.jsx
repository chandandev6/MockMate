// email ke "reset password" link se yaha aate hai: /reset-password?token=... → naya password → login
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { setUserData } from "../redux/userSlice.js";
import { resetPassword } from "../api/auth.api.js";
import getErrorMessage from "../utils/getErrorMessage.js";
import Wordmark from "../components/ui/Wordmark.jsx";

function ResetPassword() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(token ? "" : "This reset link is invalid. Please request a new one.");
    const [done, setDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        // dono same hai ye check browser me hi — server ko sirf ek password chahiye
        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }
        setLoading(true);
        try {
            const res = await resetPassword({ token, password });
            dispatch(setUserData(res.data.user)); // server ne cookie de di — ab logged in
            setDone(true);
            setTimeout(() => navigate("/"), 2000);
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-ground px-4">
            <Link to="/" aria-label="MockMate home">
                <Wordmark size="lg" />
            </Link>
            <div className="bg-paper rounded-2xl border border-line p-8 max-w-md w-full">
                {done ? (
                    <div className="text-center">
                        <FaCheckCircle className="mx-auto text-good mb-4" size={52} />
                        <h1 className="text-2xl font-extrabold tracking-[-0.03em] mb-2">Password updated!</h1>
                        <p className="text-muted text-sm">You're logged in. Taking you home...</p>
                    </div>
                ) : (
                    <>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-center mb-2">
                            Set a new password
                        </h1>
                        <p className="text-muted text-sm text-center mb-6">
                            Choose a password with at least 8 characters.
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="New password"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    maxLength={72}
                                    disabled={!token}
                                    className="field pr-11"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm new password"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={!token}
                                className="field"
                            />

                            {error && <p className="text-sm text-bad bg-bad-wash rounded-lg px-3 py-2">{error}</p>}

                            <button type="submit" disabled={loading || !token} className="btn btn-ink w-full">
                                {loading ? "Saving..." : "Update password"}
                            </button>
                        </form>
                        <button
                            onClick={() => navigate("/auth")}
                            className="mt-4 w-full text-sm text-muted hover:text-ink"
                        >
                            ← Back to login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;
