export type ItemType = "BTC" | "BOMB";

export type GameStatus = "IDLE" | "RUNNING" | "ENDED";

export type FallingItem = {
  id: string;
  type: ItemType;

  x: number; // center X in canvas coords
  size: number;

  spawnAt: number; // performance.now() timestamp
  fallDurationMs: number;

  clicked: boolean;
};

export type FloatingText = {
  id: string;
  text: string;
  x: number;
  y: number;
  spawnAt: number;
  durationMs: number;
  color: "GOOD" | "BAD";
};

export type RuntimeState = {
  items: FallingItem[];
  texts: FloatingText[];
  overlayRedAlpha: number;
  lastFrameAt: number;
  spawnTickerMs: number;
};