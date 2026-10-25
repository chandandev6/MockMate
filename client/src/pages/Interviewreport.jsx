import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Step3report from "../components/Step3report";
import { getInterview } from "../api/interview.api.js";
import getErrorMessage from "../utils/getErrorMessage.js";

// /report/:id — finish ke baad yaha aate hai (interview state me saath aata hai, dobara fetch nahi).
// Refresh / history se aaye to server se lao
function Interviewreport() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const passed = location.state?.interview;

    const [interview, setInterview] = useState(passed?._id === id ? passed : null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (interview?._id === id) return;
        let cancelled = false;
        getInterview(id)
            .then((res) => !cancelled && setInterview(res.data.interview))
            .catch((err) => !cancelled && setError(getErrorMessage(err)));
        return () => {
            cancelled = true;
        };
    }, [id, interview]);

    let content;
    if (error) {
        content = (
            <div className="max-w-md mx-auto text-center py-24 px-4">
                <p className="text-bad mb-4">{error}</p>
                <button onClick={() => navigate("/interview")} className="btn btn-ink">
                    Start an interview
                </button>
            </div>
        );
    } else if (!interview) {
        // skeleton — layout jaisa hi, taaki data aane par page "kude" nahi
        content = (
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 space-y-6 animate-pulse">
                <div className="h-4 w-64 bg-line rounded" />
                <div className="h-20 w-2/3 bg-line rounded-xl" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
                    {[0, 1, 2, 3].map((n) => (
                        <div key={n} className="h-28 bg-surface rounded-xl border border-line" />
                    ))}
                </div>
            </div>
        );
    } else if (interview.status !== "completed" || !interview.report) {
        content = (
            <div className="max-w-md mx-auto text-center py-24 px-4">
                <p className="text-muted mb-4">This interview is not finished yet, so there is no report.</p>
                <button onClick={() => navigate("/interview")} className="btn btn-ink">
                    Go to interview
                </button>
            </div>
        );
    } else {
        content = <Step3report interview={interview} />;
    }

    return (
        <div className="min-h-screen bg-ground">
            <Navbar />
            {content}
        </div>
    );
}

export default Interviewreport;
