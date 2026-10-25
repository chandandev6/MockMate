import LevelMeter from "./ui/LevelMeter.jsx";

// poori screen ka loader — lazy page load ho raha ho ya login check chal raha ho tab
function PageLoader() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-ground" aria-label="Loading">
            <LevelMeter className="h-10" bars={9} />
            <span className="eyebrow">Setting up the room</span>
        </div>
    );
}

export default PageLoader;
