// user ka "badge" — photo nahi hai to initials (Chandan Kumar → CK) + chhoti laal batti (logged in = on air)
const SIZES = {
    sm: "w-8 h-8 text-xs rounded-lg",
    md: "w-11 h-11 text-sm rounded-xl",
    lg: "w-16 h-16 text-xl rounded-2xl",
};

const initials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("") || "?";

function Avatar({ name, size = "sm", dot = true }) {
    return (
        <span
            aria-hidden="true"
            className={`relative inline-flex shrink-0 items-center justify-center bg-ink text-paper font-bold tracking-[-0.02em] ${SIZES[size]}`}
        >
            {initials(name)}
            {dot && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-signal ring-2 ring-ground" />
            )}
        </span>
    );
}

export default Avatar;
