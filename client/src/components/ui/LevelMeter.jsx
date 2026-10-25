// awaaz ka level meter (studio jaisa) — active = bars hilte hai. Sirf dikhawa: asli mic level nahi padhta
// kis background par hai uske hisaab se rang (signal button ke andar = gehra navy)
const TONES = { ink: "bg-ink", signal: "bg-signal", ground: "bg-ground", "signal-ink": "bg-signal-ink" };

const HEIGHTS = [0.45, 0.8, 0.6, 1, 0.7, 0.9, 0.5, 0.75, 0.55, 0.95, 0.65, 0.4];

function LevelMeter({ active = true, tone = "ink", bars = 12, className = "h-8" }) {
    const color = TONES[tone] ?? TONES.ink;
    return (
        <span aria-hidden="true" className={`flex items-center gap-[3px] ${className}`}>
            {Array.from({ length: bars }, (_, i) => (
                <span
                    key={i}
                    className={`w-[3px] h-full rounded-full origin-center ${color} ${active ? "animate-meter" : ""}`}
                    style={{
                        // har bar alag speed/delay — ek saath upar-neeche na ho (asli awaaz jaisa)
                        animationDelay: `${(i * 137) % 900}ms`,
                        animationDuration: `${900 + ((i * 211) % 500)}ms`,
                        transform: active ? undefined : `scaleY(${HEIGHTS[i % HEIGHTS.length] * 0.35})`,
                    }}
                />
            ))}
        </span>
    );
}

export default LevelMeter;
