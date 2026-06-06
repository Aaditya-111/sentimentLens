import { useState, useEffect, useRef } from "react";

const API_BASE = "http://localhost:8000";

const EXAMPLES = [
  { label: "Positive", emoji: "⭐", text: "This product completely exceeded my expectations. The build quality is outstanding and it arrived two days early!" },
  { label: "Negative", emoji: "💀", text: "Absolute garbage. Broke after one week of use. Customer service was useless and ignored my emails." },
  { label: "Mixed", emoji: "😐", text: "Decent product for the price. Nothing special but gets the job done. Shipping was average." },
  { label: "Rave", emoji: "🔥", text: "I am obsessed with this! Best purchase I've made all year. My whole family loves it." },
  { label: "Rant", emoji: "😤", text: "Very disappointing. The description was misleading and the item looks nothing like the photos." },
];

const STATS = [
  { value: "50K", label: "Training Samples" },
  { value: "89.35%", label: "TF-IDF Accuracy" },
  { value: "91.70%", label: "BERT Accuracy" },
  { value: "4", label: "Failure Categories" },
];

function ConfidenceBar({ value, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value * 100), 100);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 99, height: 6, overflow: "hidden", border: "1px solid rgba(255,255,255,0.02)" }}>
      <div style={{
        height: "100%", width: `${width}%`, background: color,
        borderRadius: 99, transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
        boxShadow: `0 0 12px ${color}`
      }} />
    </div>
  );
}

function ModelCard({ title, subtitle, badge, badgeColor, result, loading, accent, icon }) {
  const isPos = result?.label === "POSITIVE";
  const sentColor = result ? (isPos ? "#34D399" : "#F87171") : accent;
  
  return (
    <div className="model-card" style={{
      background: "rgba(15, 10, 25, 0.4)", backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24,
      padding: 32, flex: 1, minWidth: 0, position: "relative", overflow: "hidden",
      boxShadow: "0 20px 40px rgba(0,0,0,0.4)", 
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: loading ? "rgba(255,255,255,0.1)" : result ? sentColor : accent, transition: "background 0.5s", boxShadow: `0 0 20px ${result ? sentColor : accent}` }} />
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>{subtitle}</div>
          <div style={{ fontSize: 24, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#FFFFFF", display: "flex", alignItems: "center", gap: 10 }}>
             <span style={{ fontSize: 24, filter: "drop-shadow(0 0 10px rgba(255,255,255,0.2))" }}>{icon}</span> {title}
          </div>
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
          padding: "6px 12px", borderRadius: 99,
          background: badgeColor + "15", color: badgeColor, border: `1px solid ${badgeColor}40`,
        }}>{badge}</div>
      </div>

      {loading ? (
        <div className="fade-in" style={{ display: "flex", gap: 12, alignItems: "center", color: "rgba(255,255,255,0.5)", fontSize: 13, height: 90, fontFamily: "monospace" }}>
          <div style={{ width: 16, height: 16, border: `2px solid ${accent}30`, borderTop: `2px solid ${accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          > processing_tensors...
        </div>
      ) : result ? (
        <div className="fade-up">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: sentColor + "15", border: `1px solid ${sentColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: `inset 0 0 20px ${sentColor}10, 0 0 20px ${sentColor}20` }}>
              {isPos ? "😊" : "😞"}
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: sentColor, fontFamily: "'DM Sans', sans-serif", lineHeight: 1, letterSpacing: "-0.02em", textShadow: `0 0 20px ${sentColor}60` }}>{result.label}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 8, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, fontFamily: "monospace" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: sentColor, boxShadow: `0 0 10px ${sentColor}` }} />
                {result.latency_ms}ms inference
              </div>
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "baseline" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>Confidence</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: sentColor, fontFamily: "monospace" }}>{(result.confidence * 100).toFixed(1)}%</span>
            </div>
            <ConfidenceBar value={result.confidence} color={sentColor} />
          </div>
        </div>
      ) : (
        <div style={{ height: 90, display: "flex", alignItems: "center", color: "rgba(255,255,255,0.3)", fontSize: 13, fontFamily: "monospace" }}>
          > awaiting_input...
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const analyzeRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const analyze = async (inputText) => {
    const t = inputText ?? text;
    if (!t.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExample = (ex) => {
    setText(ex.text);
    analyze(ex.text);
    analyzeRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const agree = result && result.tfidf.label === result.bert.label;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#030008", color: "#FFFFFF", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;0,800;1,400&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(168, 85, 247, 0.3); color: #fff; }
        body { background: #030008; }
        
        /* Animations */
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blob { 0%,100% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        
        .fade-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .fade-up-2 { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
        .fade-up-3 { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
        .fade-in { animation: fadeIn 0.5s ease both; }
        
        /* Components */
        .model-card:hover { transform: translateY(-4px); box-shadow: 0 30px 60px rgba(0,0,0,0.6); border-color: rgba(255,255,255,0.15) !important; background: rgba(20, 15, 35, 0.6) !important; }
        
        .example-btn { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .example-btn:hover { background: rgba(255,255,255,0.1) !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important; border-color: rgba(255,255,255,0.2) !important; color: #fff !important; }
        
        .nav-link { position: relative; }
        .nav-link::after { content: ''; position: absolute; width: 0; height: 1px; bottom: -4px; left: 0; background: #A855F7; transition: width 0.3s ease; box-shadow: 0 0 10px #A855F7; }
        .nav-link:hover::after { width: 100%; }
        .nav-link:hover { color: #FFFFFF !important; }
        
        textarea { resize: none; outline: none; font-family: 'DM Sans', sans-serif; transition: all 0.3s ease; }
        textarea::placeholder { color: rgba(255,255,255,0.2); }
        .textarea-container:focus-within { box-shadow: 0 0 0 1px rgba(168, 85, 247, 0.5), 0 0 30px rgba(168, 85, 247, 0.1) !important; border-color: rgba(168, 85, 247, 0.5) !important; background: rgba(15, 10, 25, 0.8) !important; }
        
        .analyze-btn { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); position: relative; overflow: hidden; }
        .analyze-btn::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(rgba(255,255,255,0.2), rgba(255,255,255,0)); opacity: 0; transition: opacity 0.3s; }
        .analyze-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(168,85,247,0.4), inset 0 0 0 1px rgba(255,255,255,0.2) !important; }
        .analyze-btn:hover:not(:disabled)::after { opacity: 1; }
        .analyze-btn:active:not(:disabled) { transform: translateY(0); }
        
        .glass-nav { background: rgba(3, 0, 8, 0.6) !important; backdrop-filter: blur(20px) saturate(180%) !important; border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important; }
        
        @media (max-width: 680px) {
          .cards-row { flex-direction: column !important; }
          .stats-row { grid-template-columns: repeat(2,1fr) !important; gap: 1px !important; }
          nav { padding: 0 20px !important; }
          .hero-content { padding-top: 100px !important; }
        }
      `}</style>

      {/* Global Background Blobs */}
      <div style={{ position: "absolute", top: "0%", left: "0%", width: "100%", height: "100%", overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", left: "5%", width: 800, height: 800, background: "radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, rgba(46, 16, 101, 0) 70%)", filter: "blur(80px)", animation: "blob 20s ease-in-out infinite alternate" }} />
        <div style={{ position: "absolute", top: "40%", right: "-10%", width: 1000, height: 1000, background: "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(17, 24, 39, 0) 70%)", filter: "blur(100px)", animation: "blob 25s 5s ease-in-out infinite alternate-reverse" }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "20%", width: 900, height: 900, background: "radial-gradient(circle, rgba(236, 72, 153, 0.05) 0%, rgba(17, 24, 39, 0) 70%)", filter: "blur(100px)", animation: "blob 22s 2s ease-in-out infinite alternate" }} />
      </div>

      {/* Navbar */}
      <nav className={scrolled ? "glass-nav" : ""} style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "transparent",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)", padding: "0 48px", height: 80,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 0 20px rgba(168,85,247,0.2)" }}>✨</div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 900, color: "#FFFFFF", letterSpacing: "2px" }}>SENTIMENT LENS</span>
        </div>
        <div style={{ display: "flex", gap: 40, '@media (max-width: 680px)': { display: 'none' } }}>
          {["Architecture", "Models", "Documentation"].map(link => (
            <a key={link} href="#" className="nav-link" style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", textDecoration: "none", transition: "color 0.2s", letterSpacing: "1px", textTransform: "uppercase" }}>{link}</a>
          ))}
        </div>
        <div onClick={() => analyzeRef.current?.scrollIntoView({ behavior: "smooth" })} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: 99, padding: "10px 24px", fontSize: 13, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", transition: "all 0.3s", backdropFilter: "blur(10px)" }}
             onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.1)"; }}
             onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.boxShadow = "none"; }}>
          Initialize
        </div>
      </nav>

      {/* Hero Section (Krysta Wing Style) */}
      <div className="hero-content" style={{ position: "relative", zIndex: 1, paddingTop: 160, paddingBottom: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "90vh" }}>
        <div style={{ width: "100%", maxWidth: 1200, display: "flex", flexDirection: "column", gap: 40, padding: "0 24px" }}>
          
          <div className="fade-up" style={{ display: "flex", justifyContent: "flex-start", paddingLeft: "5%" }}>
            {/* Terminal Window Mockup */}
            <div style={{ background: "rgba(10, 10, 15, 0.5)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, width: 420, boxShadow: "0 30px 60px rgba(0,0,0,0.8)", overflow: "hidden", fontFamily: "monospace", fontSize: 12 }}>
              <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F56" }} />
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FFBD2E" }} />
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27C93F" }} />
                </div>
                <div style={{ marginLeft: "auto", marginRight: "auto", color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: 1.5 }}>BASH — LENS</div>
              </div>
              <div style={{ padding: "20px", color: "rgba(255,255,255,0.7)", lineHeight: 1.9 }}>
                <div style={{ color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>~ sentiment %</div>
                <div style={{ marginBottom: 12 }}><span style={{ color: "#A855F7" }}>$</span> init_engine --models=tfidf,distilbert</div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ background: "rgba(168,85,247,0.2)", color: "#C084FC", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>INFO</span>
                  <span>Fetching weights from registry...</span>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ background: "rgba(16,185,129,0.2)", color: "#34D399", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>OK</span>
                  <span>Verified cryptographic manifest</span>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ background: "rgba(16,185,129,0.2)", color: "#34D399", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>OK</span>
                  <span>Models initialized correctly</span>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
                  <span style={{ background: "rgba(245,158,11,0.2)", color: "#FBBF24", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>NOTE</span>
                  <span>System ready for inference</span>
                </div>
              </div>
            </div>
          </div>

          {/* Giant Typography */}
          <div className="fade-up-2" style={{ textAlign: "center", marginTop: 20 }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(60px, 12vw, 180px)", fontWeight: 900, lineHeight: 0.85, margin: 0, letterSpacing: "-0.04em", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "clamp(10px, 2vw, 30px)" }}>
              <span style={{ color: "#FFFFFF", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }}>SENTIMENT</span>
              <span style={{ color: "transparent", WebkitTextStroke: "2px #A855F7", textStroke: "2px #A855F7", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 20px rgba(168,85,247,0.3))" }}>LENS</span>
            </h2>
          </div>

          {/* Bottom Subheading */}
          <div className="fade-up-3" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 40, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 40, color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", fontWeight: 600 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, backdropFilter: "blur(4px)" }}>N</div>
            <div style={{ textAlign: "right" }}></div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="fade-up-3" style={{ maxWidth: 1000, margin: "0 auto 120px", padding: "0 24px", position: "relative", zIndex: 10 }}>
        <div className="stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(255,255,255,0.05)", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
          {STATS.map(({ value, label }) => (
            <div key={label} style={{ background: "rgba(10, 5, 20, 0.6)", backdropFilter: "blur(20px)", padding: "40px 24px", textAlign: "center", transition: "background 0.3s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(20, 15, 35, 0.8)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(10, 5, 20, 0.6)"}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 36, fontWeight: 800, color: "#FFFFFF", marginBottom: 8, letterSpacing: "-1px" }}>{value}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Analyze Section */}
      <div ref={analyzeRef} style={{ maxWidth: 1000, margin: "0 auto 100px", padding: "0 24px", position: "relative", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ display: "inline-block", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", padding: "6px 16px", borderRadius: 99, color: "#C084FC", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 24 }}>
            System Console
          </div>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 48, letterSpacing: "-1.5px", color: "#FFFFFF", margin: 0, fontWeight: 800 }}>Execute Inference</h2>
        </div>

        <div className="textarea-container" style={{ background: "rgba(15, 10, 25, 0.4)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 32, marginBottom: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.5)", transition: "all 0.3s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
             <div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 600 }}>Input Payload</div>
             {text.length > 0 && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500, fontFamily: "monospace" }}>[{text.length}_bytes]</div>}
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) analyze(); }}
            placeholder="Enter text payload for sentiment pipeline..."
            rows={5} style={{ width: "100%", background: "transparent", border: "none", color: "#FFFFFF", fontSize: 18, lineHeight: 1.6, fontWeight: 400 }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, flexWrap: "wrap", gap: 16, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 8, fontFamily: "monospace" }}>
               <kbd style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>Ctrl</kbd> + <kbd style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>Enter</kbd> execute()
            </span>
            <button className="analyze-btn" onClick={() => analyze()} disabled={loading || !text.trim()}
              style={{ background: text.trim() ? "linear-gradient(135deg, #7C3AED, #4F46E5)" : "rgba(255,255,255,0.05)", color: text.trim() ? "#fff" : "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 99, padding: "14px 32px", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", cursor: text.trim() ? "pointer" : "not-allowed", boxShadow: text.trim() ? "0 10px 20px rgba(124,58,237,0.3)" : "none" }}>
              {loading ? "Processing..." : "Run Analysis"}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 60 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", marginRight: 8, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Test Vectors:</div>
          {EXAMPLES.map((ex) => (
            <button key={ex.label} className="example-btn" onClick={() => handleExample(ex)}
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 99, padding: "8px 16px", fontSize: 13, color: "rgba(255,255,255,0.6)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
              {ex.emoji} {ex.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="fade-in" style={{ background: "rgba(220, 38, 38, 0.1)", border: "1px solid rgba(220, 38, 38, 0.3)", borderRadius: 16, padding: "16px 24px", marginBottom: 32, fontSize: 14, color: "#FCA5A5", display: "flex", alignItems: "center", gap: 16, backdropFilter: "blur(10px)" }}>
            <span style={{ fontSize: 24, filter: "drop-shadow(0 0 10px rgba(220,38,38,0.5))" }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4, letterSpacing: 1 }}>CONNECTION_REFUSED</div>
              <div style={{ opacity: 0.8, fontSize: 13, fontFamily: "monospace" }}>> ensure FastAPI backend is running on :8000</div>
            </div>
          </div>
        )}

        <div className="cards-row" style={{ display: "flex", gap: 24, marginBottom: 24 }}>
          <ModelCard title="TF-IDF + LR" subtitle="Classical Engine" badge="V1.0" badgeColor="#F59E0B" icon="📊" accent="#F59E0B" result={result?.tfidf} loading={loading} />
          <ModelCard title="DistilBERT" subtitle="Transformer Core" badge="SOTA" badgeColor="#A855F7" icon="🧠" accent="#A855F7" result={result?.bert} loading={loading} />
        </div>

        {result && (
          <div className="fade-up" style={{ background: agree ? "rgba(16, 185, 129, 0.05)" : "rgba(245, 158, 11, 0.05)", border: `1px solid ${agree ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`, borderRadius: 24, padding: "24px 32px", display: "flex", alignItems: "center", gap: 20, backdropFilter: "blur(10px)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: agree ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${agree ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: `inset 0 0 20px ${agree ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)"}` }}>
              {agree ? "✅" : "⚠️"}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: agree ? "#34D399" : "#FBBF24", marginBottom: 6, letterSpacing: 1 }}>
                {agree ? "SYSTEM CONSENSUS VERIFIED" : "SYSTEM DISAGREEMENT DETECTED"}
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                {agree ? `Both engines predict [${result.tfidf.label}] with high certainty.` : `Engine divergence: TF-IDF returned [${result.tfidf.label}] while BERT returned [${result.bert.label}]. Flagged for review.`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "40px 48px", background: "rgba(3,0,8,0.8)", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "white" }}>✨</div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "#FFFFFF", letterSpacing: 2 }}>SENTIMENT LENS</span>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>— Infrastructure</span>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
          <span>DistilBERT</span>
          <span>FastAPI</span>
          <span>React 18</span>
        </div>
      </div>
    </div>
  );
}