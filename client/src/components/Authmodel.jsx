import { useEffect } from "react";
import { useSelector } from "react-redux";
import Auth from "../pages/Auth";

function Authmodel({ onClose }) {
    const userData = useSelector((state) => state.user.userData);

    useEffect(() => {
        if (userData) {
            onClose(); // Auto-close once login succeeds
        }
    }, [userData, onClose]);

    return (
        <div className="fixed inset-0 bg-ink/40 flex justify-center items-center z-[999] backdrop-blur-sm px-4 py-10 overflow-y-auto">
            {/* onClose is now passed straight through to Auth, which owns
                its own close button positioned against its own card —
                no more separate wrapper trying to guess the card's edges */}
            <Auth isModel={true} onClose={onClose} />
        </div>
    );
}

export default Authmodel;
