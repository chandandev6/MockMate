import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageLoader from "../components/PageLoader";
import Step1setup from "../components/Step1setup";
import Step2interview from "../components/Step2interview";
import { getInterview } from "../api/interview.api.js";
import { interviewRestored } from "../redux/interviewSlice.js";
import { clearActiveInterview, getActiveInterview } from "../utils/activeInterview.js";

// /interview — status "setup" → form, "in_progress" → live interview. Report /report/:id par
function Interviewpage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const status = useSelector((state) => state.interview.status);

    // refresh hua aur sessionStorage me chalu interview hai → server se wapas lao (credit kat chuka hai, chhodna nahi)
    const [restoring, setRestoring] = useState(() => status === "setup" && Boolean(getActiveInterview()));

    useEffect(() => {
        if (!restoring) return;
        const saved = getActiveInterview();
        getInterview(saved.interviewId)
            .then((res) => {
                const { interview } = res.data;
                if (interview.status === "completed") {
                    clearActiveInterview();
                    navigate(`/report/${interview._id}`, { replace: true, state: { interview } });
                } else if (interview.status === "in_progress" || interview.status === "finishing") {
                    dispatch(interviewRestored({ interview, avatar: saved.avatar }));
                } else {
                    clearActiveInterview();
                }
            })
            .catch(() => clearActiveInterview()) // nahi mila / kisi aur ka — naya setup dikhao
            .finally(() => setRestoring(false));
    }, [restoring, dispatch, navigate]);

    if (restoring) return <PageLoader />;

    return (
        <div className="min-h-screen bg-ground">
            <Navbar />
            {status === "in_progress" ? <Step2interview /> : <Step1setup />}
        </div>
    );
}

export default Interviewpage;
