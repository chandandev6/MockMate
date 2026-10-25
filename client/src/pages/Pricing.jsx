import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BsShieldCheck } from "react-icons/bs";
import Navbar from "../components/Navbar";
import { createOrder, getPlans, verifyPayment } from "../api/payment.api.js";
import { setCredit } from "../redux/userSlice.js";
import { loadRazorpay } from "../utils/loadRazorpay.js";
import getErrorMessage from "../utils/getErrorMessage.js";
import { INTERVIEW_COST } from "../constants/interview.js";

// /pricing — credit packs. Flow: Buy → server order → Razorpay popup → server verify → credits
function Pricing() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user.userData);

    const [plans, setPlans] = useState(null);
    const [enabled, setEnabled] = useState(true);
    const [error, setError] = useState("");
    const [buying, setBuying] = useState(null); // jis plan ka popup khula hai

    useEffect(() => {
        getPlans()
            .then((res) => {
                setPlans(res.data.plans);
                setEnabled(res.data.enabled);
            })
            .catch((err) => setError(getErrorMessage(err)));
    }, []);

    const buy = async (plan) => {
        setBuying(plan.id);
        try {
            const [{ data: order }, Razorpay] = await Promise.all([createOrder(plan.id), loadRazorpay()]);

            const checkout = new Razorpay({
                key: order.keyId,
                order_id: order.orderId,
                amount: order.amount,
                currency: order.currency,
                name: "MockMate",
                description: `${plan.name} pack · ${plan.credits} credits`,
                prefill: { name: user?.name, email: user?.email },
                theme: { color: "#0f2540" }, // brand navy
                // payment ho gaya → server se pakka karwao (client ka "success" bharosa layak nahi)
                handler: async (response) => {
                    try {
                        const res = await verifyPayment(response);
                        dispatch(setCredit(res.data.credit));
                        toast.success(`${res.data.creditsAdded} credits added!`);
                        navigate("/account");
                    } catch (err) {
                        // paisa kat gaya par verify nahi hua (network) — webhook thodi der me credit de dega
                        console.error("Verify failed:", err);
                        toast.error(
                            "Payment received. Your credits will appear in a minute — refresh your account page.",
                            {
                                duration: 8000,
                            },
                        );
                    } finally {
                        setBuying(null);
                    }
                },
                modal: { ondismiss: () => setBuying(null) }, // user ne popup band kiya
            });
            checkout.on("payment.failed", (response) => {
                toast.error(response.error?.description || "Payment failed. You were not charged.");
            });
            checkout.open();
        } catch (err) {
            toast.error(err.response ? getErrorMessage(err) : err.message);
            setBuying(null);
        }
    };

    return (
        <div className="min-h-screen bg-ground">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
                <div className="grid lg:grid-cols-12 gap-6 items-end mb-12 animate-rise">
                    <div className="lg:col-span-8">
                        <p className="eyebrow mb-4">Credit packs · one-time · never expire</p>
                        <h1 className="text-[clamp(2.75rem,1rem+5vw,5.5rem)] font-black tracking-[-0.055em] leading-[0.9]">
                            Buy credits<span className="text-signal">.</span>
                        </h1>
                    </div>
                    <div className="lg:col-span-4">
                        <p className="text-muted leading-relaxed">
                            One interview costs {INTERVIEW_COST} credits. Credits never expire.
                        </p>
                        {user && (
                            <p className="mt-3 font-mono text-sm">
                                Your balance: <strong className="tabular-nums">{user.credit}</strong> credits
                            </p>
                        )}
                    </div>
                </div>

                {!enabled && (
                    <p className="mb-8 text-sm text-warn bg-warn-wash rounded-xl p-4">
                        Payments are not available right now. Please check back later.
                    </p>
                )}
                {error && <p className="text-bad mb-6">{error}</p>}

                {/* rate card — columns hairline se alag, "popular" upar laal patti */}
                <div className="grid md:grid-cols-3 border-t border-ink">
                    {(plans ?? [null, null, null]).map((plan, index) =>
                        plan ? (
                            <div
                                key={plan.id}
                                className={`relative pt-8 pb-10 md:px-8 flex flex-col ${index > 0 ? "border-t md:border-t-0 md:border-l border-line" : "md:pl-0"} ${
                                    plan.popular ? "md:bg-paper md:rounded-b-2xl md:!px-8" : ""
                                }`}
                            >
                                {plan.popular && (
                                    <span
                                        className="absolute -top-px left-0 right-0 h-1 bg-signal"
                                        aria-hidden="true"
                                    />
                                )}
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-2xl font-extrabold tracking-[-0.03em]">{plan.name}</h2>
                                    {plan.popular && <span className="eyebrow !text-ink">Most popular</span>}
                                </div>
                                <p className="mt-6">
                                    <span className="text-6xl font-black tracking-[-0.05em] tabular-nums">
                                        ₹{plan.priceInr}
                                    </span>
                                    <span className="text-muted text-sm"> one-time</span>
                                </p>
                                <dl className="mt-8 text-sm divide-y divide-line border-y border-line flex-1">
                                    {[
                                        ["Credits", plan.credits.toLocaleString()],
                                        ["Interviews", Math.floor(plan.credits / INTERVIEW_COST)],
                                        [
                                            "Per interview",
                                            `₹${((plan.priceInr / plan.credits) * INTERVIEW_COST).toFixed(1)}`,
                                        ],
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex justify-between py-3">
                                            <dt className="text-muted">{label}</dt>
                                            <dd className="font-mono tabular-nums">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                                <button
                                    type="button"
                                    onClick={() => buy(plan)}
                                    disabled={!enabled || buying !== null}
                                    className={`btn mt-8 ${plan.popular ? "btn-signal" : "btn-line"}`}
                                >
                                    {buying === plan.id ? "Opening payment…" : `Buy ${plan.name}`}
                                </button>
                            </div>
                        ) : (
                            <div key={index} className="h-96 m-4 bg-surface rounded-2xl animate-pulse" />
                        ),
                    )}
                </div>

                <p className="text-sm text-muted mt-10 flex items-center gap-2">
                    <BsShieldCheck /> Secure payments by Razorpay — UPI, cards, netbanking and wallets.
                </p>
            </div>
        </div>
    );
}

export default Pricing;
