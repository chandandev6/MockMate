// email ke link se yaha aate hai: /verify-email?token=... → server ko token bhejo → verified + login
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { setUserData } from "../redux/userSlice.js";
import { verifyEmail } from "../api/auth.api.js";
import getErrorMessage from "../utils/getErrorMessage.js";
import Wordmark from "../components/ui/Wordmark.jsx";
import LevelMeter from "../components/ui/LevelMeter.jsx";

function VerifyEmail() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    // "verifying" | "success" | "error"
    const [status, setStatus] = useState(token ? "verifying" : "error");
    const [message, setMessage] = useState(token ? "" : "This verification link is invalid.");
    const alreadyCalled = useRef(false);

    useEffect(() => {
        // dev me StrictMode effect 2 baar chalata hai — link ek hi baar kaam karta hai, isliye sirf pehli baar bhejo
        if (!token || alreadyCalled.current) return;
        alreadyCalled.current = true;

        const verify = async () => {
            try {
                const res = await verifyEmail(token);
                dispatch(setUserData(res.data.user)); // server ne cookie bhi de di — ab logged in
                setStatus("success");
                setTimeout(() => navigate("/"), 2000);
            } catch (error) {
                setStatus("error");
                setMessage(getErrorMessage(error));
            }
        };
        verify();
    }, [token, dispatch, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-ground px-4">
            <Link to="/" aria-label="MockMate home">
                <Wordmark size="lg" />
            </Link>
            <div className="bg-paper rounded-2xl border border-line p-8 max-w-md w-full text-center">
                {status === "verifying" && (
                    <>
                        <LevelMeter className="h-10 mx-auto mb-5 justify-center" bars={9} />
                        <h1 className="text-2xl font-extrabold tracking-[-0.03em]">Verifying your email...</h1>
                    </>
                )}
                {status === "success" && (
                    <>
                        <FaCheckCircle className="mx-auto text-good mb-4" size={52} />
                        <h1 className="text-2xl font-extrabold tracking-[-0.03em] mb-2">Email verified!</h1>
                        <p className="text-muted text-sm">You're logged in. Taking you home...</p>
                    </>
                )}
                {status === "error" && (
                    <>
                        <FaTimesCircle className="mx-auto text-bad mb-4" size={52} />
                        <h1 className="text-2xl font-extrabold tracking-[-0.03em] mb-2">Verification failed</h1>
                        <p className="text-muted text-sm mb-6">{message}</p>
                        <button onClick={() => navigate("/auth")} className="btn btn-ink w-full">
                            Go to login
                        </button>
                        <p className="text-xs text-muted mt-3">
                            Try logging in — if your email isn't verified yet, you can request a new link there.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
