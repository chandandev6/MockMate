// MockMate ka logo — teen meter bars + laal batti (mic on). Text logo, image nahi (har size par sharp)
function Wordmark({ size = "md", inverted = false }) {
    const text = size === "lg" ? "text-2xl" : "text-lg";
    return (
        <span className={`inline-flex items-center gap-2 font-extrabold tracking-[-0.04em] ${text}`}>
            <span aria-hidden="true" className="flex items-end gap-[3px] h-4">
                <span className={`w-[3px] h-2.5 rounded-full ${inverted ? "bg-ground" : "bg-ink"}`} />
                <span className={`w-[3px] h-4 rounded-full ${inverted ? "bg-ground" : "bg-ink"}`} />
                <span className={`w-[3px] h-3 rounded-full ${inverted ? "bg-ground" : "bg-ink"}`} />
                <span className="w-2 h-2 rounded-full bg-signal self-center ml-0.5" />
            </span>
            <span className={inverted ? "text-ground" : "text-ink"}>MockMate</span>
        </span>
    );
}

export default Wordmark;
