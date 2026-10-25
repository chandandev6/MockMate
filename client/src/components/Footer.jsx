import { Link } from "react-router-dom";

// colophon footer — bada wordmark + chhoti mono jaankari (kaun, kya, privacy ka sach)
function Footer() {
    return (
        <footer className="bg-ink text-ground overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-16 pb-8">
                <div className="grid gap-10 md:grid-cols-12">
                    <div className="md:col-span-5">
                        <p className="eyebrow !text-ground/60 mb-3">Colophon</p>
                        <p className="text-lg leading-relaxed max-w-md">
                            MockMate is a rehearsal room for job interviews. An AI interviewer asks, you answer out
                            loud, and every answer gets a score you can act on.
                        </p>
                    </div>
                    <nav aria-label="Footer" className="md:col-span-3 md:col-start-7 flex flex-col gap-2 text-sm">
                        <p className="eyebrow !text-ground/60 mb-1">Go to</p>
                        <Link to="/interview" className="hover:text-signal transition-colors w-fit">
                            Practice an interview
                        </Link>
                        <Link to="/history" className="hover:text-signal transition-colors w-fit">
                            History & analytics
                        </Link>
                        <Link to="/pricing" className="hover:text-signal transition-colors w-fit">
                            Pricing
                        </Link>
                        <Link to="/account" className="hover:text-signal transition-colors w-fit">
                            Account
                        </Link>
                    </nav>
                    <div className="md:col-span-3 text-sm flex flex-col gap-2">
                        <p className="eyebrow !text-ground/60 mb-1">Privacy</p>
                        <p className="text-ground/80 leading-relaxed">
                            Voice is turned into text in your browser, or in server memory when your browser can't.
                            Audio is never stored.
                        </p>
                    </div>
                </div>

                {/* signature: poori width ka wordmark — page ka "end card" */}
                <p
                    aria-hidden="true"
                    className="mt-16 font-black tracking-[-0.07em] leading-[0.8] text-[clamp(4rem,0.5rem+15.5vw,16rem)] text-ground/95 select-none"
                >
                    MockMate<span className="text-signal">.</span>
                </p>

                <div className="mt-6 pt-5 border-t border-ground/15 flex flex-wrap justify-between gap-3 font-mono text-[11px] tracking-wider uppercase text-ground/60">
                    <span>Built by Chandan Kumar</span>
                    <span>React · Express · MongoDB · Groq</span>
                    <span>© {new Date().getFullYear()} MockMate</span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
