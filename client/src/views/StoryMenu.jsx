import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { duckBgm, playBgm } from "../storymode/environment/audioManager.js";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Special+Elite&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap";

function injectFonts() {
  if (document.getElementById("story-menu-fonts")) return;
  const link = document.createElement("link");
  link.id = "story-menu-fonts";
  link.rel = "stylesheet";
  link.href = FONT_URL;
  document.head.appendChild(link);
}

const CREDITS = {
  title: "CREDITS",
  sections: [
    { heading: "Developer", lines: ["Keshawn Bryant"] },
    {
      heading: "Voice Cast",
      lines: [
        "Ace — Keshawn", "Alex — Henry", "Bartender — Keshawn",
        "Bobby — Michael", "Delivery Girl — Saisindhu", "Donna — Riana",
        "Florist — Anonymous", "Flower Promoter — Anonymous", "Gambler — Jaime",
        "Hayes — Garnett", "Jack — Keshawn", "Jane — Kiona", "Jim — Keshawn",
        "John — Henry", "Lieutenant — Robbie", "Lucas — Marcus", "Marcus — Eli",
        "Maya — Michaela", "Sam — Jewelean", "Tim — Daniel",
      ],
    },
    {
      heading: "Tilesets",
      lines: [
        "35 Character Pixel Art / yigitkinis",
        "Farm RPG 16x16 Tileset / Emanuelle",
        "Pixel Cyberpunk Interior / DyLESTorm",
        "City Pack / NYKNCK",
        "Village Building Interior Tileset / ay boy",
        "Pixel Lands Village / Trislin",
      ],
    },
  ],
  footerLines: ["Thanks for playing."],
};

function MenuButton({ children, onClick, disabled = false, variant = "primary" }) {
  const base = {
    width: "100%",
    background: disabled
      ? "transparent"
      : variant === "primary"
        ? "rgba(160,40,40,0.06)"
        : "rgba(160,118,40,0.06)",
    border: "none",
    borderLeft: disabled
      ? "2px solid rgba(100,80,40,0.2)"
      : variant === "primary"
        ? "2px solid rgba(180,40,40,0.7)"
        : "2px solid rgba(160,118,40,0.7)",
    padding: "14px 20px",
    textAlign: "left",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'Special Elite', 'Courier New', monospace",
    fontSize: "clamp(14px, 2.5vw, 17px)",
    letterSpacing: "0.06em",
    color: disabled
      ? "rgba(120,100,60,0.35)"
      : variant === "primary" ? "#e8c8c0" : "#e8d5a0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    transition: "opacity 0.15s ease",
  };

  return (
    <button
      style={base}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "0.75"; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = "1"; }}
      disabled={disabled}
    >
      <span>{children}</span>
      {!disabled && (
        <span style={{
          fontSize: "12px",
          opacity: 0.7,
          fontFamily: "'Courier Prime', monospace",
        }}>
          ▶
        </span>
      )}
    </button>
  );
}

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(2,1,0,0.75)",
      backdropFilter: "blur(3px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
    }}>
      <div style={{
        background: "linear-gradient(175deg, #141008 0%, #0e0b06 100%)",
        border: "1px solid rgba(120,95,50,0.35)",
        boxShadow: "0 0 60px rgba(0,0,0,0.9)",
        padding: "2rem",
        maxWidth: "380px",
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}>


        {/* Red top bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, transparent, rgba(160,35,35,0.65), transparent)",
        }} />

        <div style={{
          fontFamily: "'Courier Prime', monospace",
          fontSize: "9px", letterSpacing: "0.25em",
          color: "rgba(180,60,60,0.6)",
          marginBottom: "1rem",
          textTransform: "uppercase",
        }}>
          Warning
        </div>

        <p style={{
          fontFamily: "'Special Elite', monospace",
          fontSize: "15px",
          color: "rgba(210,185,140,0.9)",
          lineHeight: 1.6,
          marginBottom: "1.75rem",
        }}>
          Are you sure? Your current save will be overwritten.
        </p>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              background: "rgba(160,40,40,0.12)",
              border: "1px solid rgba(160,40,40,0.4)",
              color: "rgba(210,150,140,0.9)",
              padding: "10px",
              fontFamily: "'Courier Prime', monospace",
              fontSize: "11px", letterSpacing: "0.15em",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(160,40,40,0.22)";
              e.currentTarget.style.borderColor = "rgba(180,60,60,0.6)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(160,40,40,0.12)";
              e.currentTarget.style.borderColor = "rgba(160,40,40,0.4)";
            }}
          >
            CONFIRM
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              background: "transparent",
              border: "1px solid rgba(120,95,50,0.3)",
              color: "rgba(160,130,70,0.6)",
              padding: "10px",
              fontFamily: "'Courier Prime', monospace",
              fontSize: "11px", letterSpacing: "0.15em",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(160,118,40,0.06)";
              e.currentTarget.style.borderColor = "rgba(160,118,40,0.45)";
              e.currentTarget.style.color = "rgba(200,168,74,0.8)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(120,95,50,0.3)";
              e.currentTarget.style.color = "rgba(160,130,70,0.6)";
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

function CreditsModal({ onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(2,1,0,0.85)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
    }}>
      <div style={{
        background: "linear-gradient(175deg, #141008 0%, #0e0b06 50%, #0a0806 100%)",
        border: "1px solid rgba(120,95,50,0.32)",
        boxShadow: "0 0 80px rgba(0,0,0,0.9)",
        width: "100%", maxWidth: "480px",
        maxHeight: "80vh",
        display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden",
      }}>


        {/* Top bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, transparent, rgba(160,35,35,0.65) 25%, rgba(160,35,35,0.65) 75%, transparent)",
        }} />

        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(120,95,50,0.22)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0, position: "relative", zIndex: 3,
        }}>
          <div>
            <div style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: "8px", letterSpacing: "0.25em",
              color: "rgba(140,108,48,0.55)", marginBottom: "3px",
            }}>
              — CASE CLOSED —
            </div>
            <div style={{
              fontFamily: "'Special Elite', monospace",
              fontSize: "18px", color: "#c8a84a",
              letterSpacing: "0.06em",
            }}>
              {CREDITS.title}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid rgba(120,95,50,0.3)",
              color: "rgba(160,130,70,0.6)",
              width: 30, height: 30,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: "14px",
              fontFamily: "'Courier Prime', monospace",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(200,168,74,0.5)";
              e.currentTarget.style.color = "#c8a84a";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(120,95,50,0.3)";
              e.currentTarget.style.color = "rgba(160,130,70,0.6)";
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{
          overflowY: "auto", flex: 1,
          padding: "20px",
          position: "relative", zIndex: 3,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {CREDITS.sections.map((sec, i) => (
              <div key={i}>
                <div style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: "9px", letterSpacing: "0.22em",
                  color: "rgba(140,108,48,0.55)",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                  paddingBottom: "6px",
                  borderBottom: "1px solid rgba(120,95,50,0.15)",
                }}>
                  {sec.heading}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  {sec.lines.map((line, j) => (
                    <div key={j} style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: "12px",
                      color: "rgba(185,155,90,0.75)",
                      lineHeight: 1.5,
                    }}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{
              marginTop: "8px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(120,95,50,0.15)",
              textAlign: "center",
            }}>
              {CREDITS.footerLines.map((l, i) => (
                <div key={i} style={{
                  fontFamily: "'Special Elite', monospace",
                  fontSize: "13px",
                  color: "rgba(160,130,70,0.5)",
                  fontStyle: "italic",
                }}>
                  {l}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoryMenu() {
  const navigate = useNavigate();
  const [hasSave, setHasSave] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  useEffect(() => {
    playBgm("main_menu");
  }, []);

  useEffect(() => {
    injectFonts();
    try {
      const raw = localStorage.getItem("detective_save");
      if (raw) {
        const save = JSON.parse(raw);
        setHasSave(!!save?.map);
      }
    } catch { }
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleNewGame = () => {
    if (hasSave) {
      setShowConfirm(true);
    } else {
      navigate("/single");
    }
  };

  const handleConfirmNewGame = () => {
    try { localStorage.removeItem("detective_save"); } catch { }
    navigate("/single");
  };

  const handleContinue = () => {
    if (hasSave) navigate("/single");
  };

  const handleCredits = () => {
    try { duckBgm(); } catch { }
    setShowCredits(true);
  };

  const handleCloseCredits = () => {
    setShowCredits(false);
  };

  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(175deg, #141008 0%, #0e0b06 50%, #0a0806 100%)",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Courier Prime', monospace",
    }}>


      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
      }} />

      {/* Ruled lines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
        backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, rgba(120,95,50,0.04) 31px, rgba(120,95,50,0.04) 32px)",
      }} />

      {/* Red margin line */}
      <div style={{
        position: "absolute", top: 0, bottom: 0,
        left: "clamp(40px, 8vw, 80px)",
        width: 1,
        background: "rgba(160,40,40,0.1)",
        pointerEvents: "none", zIndex: 1,
      }} />

      {/* Top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, transparent, rgba(160,35,35,0.65) 25%, rgba(160,35,35,0.65) 75%, transparent)",
        zIndex: 3,
      }} />

      {/* Main layout */}
      <div style={{
        position: "relative", zIndex: 2,
        minHeight: "100dvh",
        display: "flex", flexDirection: "column",
        padding: "clamp(2rem, 5vw, 4rem) clamp(1.5rem, 8vw, 5rem)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>

        <button
          onClick={() => navigate("/")}
          style={{
            background: "transparent", border: "none",
            color: "rgba(140,108,48,0.45)",
            fontFamily: "'Courier Prime', monospace",
            fontSize: "11px", letterSpacing: "0.18em",
            cursor: "pointer", padding: "0",
            display: "inline-flex", alignItems: "center", gap: "6px",
            marginBottom: "3rem",
            transition: "color 0.15s ease",
            alignSelf: "flex-start",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(200,168,74,0.7)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(140,108,48,0.45)"}
        >
          ← BACK
        </button>

        {/* Header */}
        <div style={{ marginBottom: "clamp(2.5rem, 6vw, 4.5rem)" }}>
          <h1 style={{
            fontFamily: "'Special Elite', 'Courier New', monospace",
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            color: "#c8a84a",
            letterSpacing: "0.06em",
            lineHeight: 1.1,
            margin: 0,
            textShadow: "0 0 40px rgba(200,168,74,0.12)",
          }}>
            Story Mode
          </h1>
          <div style={{
            width: "clamp(40px, 8vw, 60px)", height: 1,
            background: "rgba(160,40,40,0.5)",
            marginTop: "14px",
          }} />
        </div>

        {/* Menu items */}
        <div style={{
          display: "flex", flexDirection: "column",
          gap: "6px",
          maxWidth: "420px",
        }}>
          <MenuButton onClick={handleContinue} disabled={!hasSave} variant="amber">
            Continue
          </MenuButton>

          <MenuButton onClick={handleNewGame} variant="primary">
            New Game
          </MenuButton>

          <MenuButton onClick={handleCredits} variant="amber">
            Credits
          </MenuButton>
        </div>

        {/* Save status */}
        {!hasSave && (
          <div style={{
            marginTop: "1.5rem",
            fontSize: "10px", letterSpacing: "0.14em",
            color: "rgba(120,95,50,0.4)",
            fontStyle: "italic",
            maxWidth: "420px",
          }}>
            — No save file found. Start a new game to begin.
          </div>
        )}

        {hasSave && (
          <div style={{
            marginTop: "1.5rem",
            fontSize: "10px", letterSpacing: "0.14em",
            color: "rgba(89, 62, 10, 0.8)",
          }}>
            — Save file detected.
          </div>
        )}
      </div>

      {showConfirm && (
        <ConfirmModal
          onConfirm={handleConfirmNewGame}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {showCredits && (
        <CreditsModal onClose={handleCloseCredits} />
      )}
    </div>
  );
}