
function triggerTalk() {
  const event = new KeyboardEvent("keydown", { key: "e" });
  window.dispatchEvent(event);
}


function MobileControls({ onPress, onRelease, show = true }) {
  if (!show) return null;

  const press = (k) => (e) => {
    e.preventDefault();
    onPress(k);
    try {
      navigator.vibrate?.(10);
    } catch {
    }
  };

  const release = (k) => (e) => {
    e.preventDefault();
    onRelease(k);
  };

  const bind = (k) => ({
    onPointerDown: press(k),
    onPointerUp: release(k),
    onPointerCancel: release(k),
    onPointerLeave: release(k),
  });

  const btn =
    "min-w-12 h-12 rounded-xl bg-[rgba(28,21,7,0.7)] ring-1 ring-white/15 backdrop-blur text-[rgba(200,168,74)] text-lg flex items-center justify-center select-none";

  return (
    <div className="absolute inset-0 pointer-events-none lg:hidden">
      {/* D-Pad */}
      <div className="absolute left-3 bottom-3 pointer-events-auto select-none touch-none">
        <div className="grid grid-cols-3 gap-2">
          <div />
          <button aria-label="Up" className={btn} {...bind("w")}>
            ▲
          </button>
          <div />
          <button aria-label="Left" className={btn} {...bind("a")}>
            ◀
          </button>
          <button aria-label="Down" className={btn} {...bind("s")}>
            ▼
          </button>
          <button aria-label="Right" className={btn} {...bind("d")}>
            ▶
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="absolute right-3 bottom-3 flex gap-2 pointer-events-auto select-none touch-none">
        <button
          aria-label="Talk (E)"
          className={btn + " px-4"}
          onPointerDown={(e) => {
            e.preventDefault();
            triggerTalk();
          }}
        >
          Talk
        </button>
      </div>
    </div>
  );
}

export default MobileControls;