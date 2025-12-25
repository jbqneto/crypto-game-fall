import { useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: { roomName: string; isOpen: boolean }) => Promise<void> | void;
};

export default function CreateRoomModal({ open, onClose, onCreate }: Props) {
  const [roomName, setRoomName] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => roomName.trim().length >= 3 && !isSubmitting, [roomName, isSubmitting]);

  if (!open) return null;

  async function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await onCreate({ roomName: roomName.trim(), isOpen });
      onClose();
      setRoomName("");
      setIsOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: "min(560px, 96vw)",
          borderRadius: 18,
          background: "rgba(20, 26, 40, 0.92)",
          border: "1px solid rgba(110, 140, 255, 0.18)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "14px 14px 10px", display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Create room</div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>Local storage now • server later</div>
          </div>

          <button
            onClick={onClose}
            style={{
              cursor: "pointer",
              padding: "8px 10px",
              borderRadius: 12,
              border: "1px solid rgba(140,170,255,0.16)",
              background: "rgba(10,12,22,0.45)",
              color: "white",
              fontWeight: 900,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ fontSize: 12, opacity: 0.75 }}>Room name</label>
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            maxLength={24}
            placeholder="e.g. CryptoFall Squad"
            style={{
              padding: "12px 12px",
              borderRadius: 12,
              border: "1px solid rgba(140,170,255,0.18)",
              outline: "none",
              background: "rgba(10,12,22,0.55)",
              color: "white",
            }}
          />

          <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 13 }}>Room visibility</div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>
                Open rooms can be joined by anyone with the link.
              </div>
            </div>

            <button
              onClick={() => setIsOpen((v) => !v)}
              style={{
                cursor: "pointer",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(140,170,255,0.18)",
                background: isOpen ? "rgba(45, 60, 110, 0.85)" : "rgba(10,12,22,0.55)",
                color: "white",
                fontWeight: 900,
                minWidth: 110,
              }}
            >
              {isOpen ? "Open" : "Closed"}
            </button>
          </div>
        </div>

        <div style={{ padding: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              cursor: "pointer",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(140,170,255,0.16)",
              background: "rgba(10,12,22,0.45)",
              color: "white",
              fontWeight: 900,
            }}
          >
            Cancel
          </button>

          <button
            disabled={!canSubmit}
            onClick={handleSubmit}
            style={{
              cursor: canSubmit ? "pointer" : "not-allowed",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(140,170,255,0.20)",
              background: canSubmit ? "rgba(70, 95, 190, 0.9)" : "rgba(70, 95, 190, 0.35)",
              color: "white",
              fontWeight: 900,
            }}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
