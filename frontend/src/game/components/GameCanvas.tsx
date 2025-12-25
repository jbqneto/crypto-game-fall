import { useEffect, useMemo, useRef } from "react";
import type { FallingItem, FloatingText, GameStatus, ItemType, RuntimeState } from "../model/types";
import { easeInOutCubic, lerp } from "../util/easing";

import '../css/hud.css';

type Props = {
  status: GameStatus;
  durationSec: number;
  timeLeftSec: number;
  nickname: string;

  score: number;
  onScoreDelta: (delta: number) => void;

  onEnd: () => void;

  btcImg: HTMLImageElement | null;
  bombImg: HTMLImageElement | null;
};

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function pickType(): ItemType {
  // ajuste fácil: mais BTC do que bomba
  return Math.random() < 0.78 ? "BTC" : "BOMB";
}

function hitTestCircle(px: number, py: number, cx: number, cy: number, r: number): boolean {
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= r * r;
}

const FALLING_LEVELS = {
  EASY: randomBetween(2600, 4200),
  MEDIUM: randomBetween(1600, 2400),
  HARD: randomBetween(1200, 2000),
};

export function GameCanvas(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  
  const stateRef = useRef<RuntimeState>({
    items: [],
    texts: [],
    overlayRedAlpha: 0,
    lastFrameAt: 0,
    spawnTickerMs: 0,
  });

  const arena = useMemo(() => {
    return {
      width: 980,
      height: 540,
      floorPad: 46, // “chão” visual
    };
  }, []);

  // reset quando muda pra RUNNING
  useEffect(() => {
    if (props.status !== "RUNNING") return;
    stateRef.current.lastFrameAt = performance.now();
    stateRef.current.overlayRedAlpha = 0;
    stateRef.current.spawnTickerMs = 0;
    stateRef.current.items = [];
    stateRef.current.texts = [];
  }, [props.status]);

  // resize + DPR (canvas nítido)
  useEffect(() => {
    const canvas = canvasRef.current;
    
    if (!canvas) return;

    function resize() {
      const maxW = Math.min(arena.width, Math.floor(window.innerWidth * 0.96));
      const maxH = Math.floor(window.innerHeight * 0.62); // segura HUD + espaço
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

      if (!canvas) return;

      let cssW = maxW;
      let cssH = Math.floor(cssW * (arena.height / arena.width));


      if (cssH > maxH) {
        cssH = maxH;
        cssW = Math.floor(cssH * (arena.width / arena.height));
      }

      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
    }

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [arena.width, arena.height]);

  // loop principal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = (now: number) => {
      const st = stateRef.current;
      const dt = st.lastFrameAt ? now - st.lastFrameAt : 16;
      st.lastFrameAt = now;

      // update overlay vermelho (decai suave)
      st.overlayRedAlpha = Math.max(0, st.overlayRedAlpha - dt / 520);

      // spawns (somente quando rodando e tempo > 0)
      if (props.status === "RUNNING" && props.timeLeftSec > 0) {
        st.spawnTickerMs += dt;

        // rythim: spawn on every ~520ms com jitter
        const spawnEvery = 520 + randomBetween(-120, 160);

        if (st.spawnTickerMs >= spawnEvery) {
          st.spawnTickerMs = 0;

          const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
          const cssW = canvas.width / dpr;

          const size = randomBetween(54, 88);
          const x = randomBetween(size / 2 + 12, cssW - size / 2 - 12);

          const item: FallingItem = {
            id: crypto.randomUUID(),
            type: pickType(),
            x,
            size,
            spawnAt: now,
            fallDurationMs: FALLING_LEVELS.EASY + randomBetween(-100, 300),
            clicked: false,
          };

          st.items.push(item);
        }
      }

      // desenhar
      drawFrame(ctx, canvas, now);

      // fim do jogo: quando timer chega a 0, para de spawn e "congela" itens
      if (props.status === "RUNNING" && props.timeLeftSec <= 0) {
        // limpa itens “vivos” (opcional: pode congelar em vez de limpar)
        stateRef.current.items = [];
        props.onEnd();
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.status, props.timeLeftSec]);

  function drawFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, now: number) {
    const st = stateRef.current;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    // fundo (dark / clean)
    ctx.clearRect(0, 0, w, h);

    // background gradient sutil
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "rgba(8, 10, 18, 1)");
    bg.addColorStop(1, "rgba(14, 18, 32, 1)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // estrelas simples (UX barato e bonito)
    drawStars(ctx, w, h);

    // “arena frame”
    ctx.save();
    ctx.globalAlpha = 0.9;
    roundRect(ctx, 10, 10, w - 20, h - 20, 18);
    ctx.strokeStyle = "rgba(120, 150, 255, 0.22)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    const floorY = h - arena.floorPad;

    // chão
    ctx.save();
    const floorGrad = ctx.createLinearGradient(0, floorY - 16, 0, floorY + 26);
    floorGrad.addColorStop(0, "rgba(140, 170, 255, 0.0)");
    floorGrad.addColorStop(1, "rgba(140, 170, 255, 0.14)");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(18, floorY - 18, w - 36, 40);

    ctx.strokeStyle = "rgba(140, 170, 255, 0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(18, floorY);
    ctx.lineTo(w - 18, floorY);
    ctx.stroke();
    ctx.restore();

    // itens: atualiza posição via easing por tempo
    const nextItems: FallingItem[] = [];
    for (const item of st.items) {
      if (item.clicked) continue;

      const t = (now - item.spawnAt) / item.fallDurationMs;
      const p = easeInOutCubic(t);

      const yStart = -item.size;
      const yEnd = floorY - item.size / 2 - 4;
      const y = lerp(yStart, yEnd, p);

      // se chegou ao chão sem clique, some
      if (t >= 1) continue;

      drawItem(ctx, item, y);

      // mantém item
      nextItems.push(item);
    }
    st.items = nextItems;

    // overlay vermelho (bomba)
    if (st.overlayRedAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = st.overlayRedAlpha * 0.42;
      ctx.fillStyle = "rgba(255, 40, 40, 1)";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    // se ended, desenha layer final
    if (props.status === "ENDED") {
      ctx.save();
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = "700 28px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", w / 2, h / 2 - 18);

      ctx.font = "600 16px system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fillText(`Final score: ${props.score}`, w / 2, h / 2 + 12);
      ctx.restore();
    }

    const nextTexts: FloatingText[] = [];

    for (const ft of st.texts) {
      const t = (now - ft.spawnAt) / ft.durationMs;
      if (t >= 1) continue;

      const alpha = 1 - t;
      const rise = 28 * t; // sobe 28px
      const scale = 1 + 0.08 * (1 - t);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = "center";
      ctx.font = `800 ${Math.floor(18 * scale)}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;

      ctx.fillStyle = ft.color === "GOOD" ? "rgba(255, 215, 80, 1)" : "rgba(255, 110, 110, 1)";
      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      ctx.lineWidth = 4;

      const yy = ft.y - rise;

      ctx.strokeText(ft.text, ft.x, yy);
      ctx.fillText(ft.text, ft.x, yy);
      ctx.restore();

      nextTexts.push(ft);
    }
    st.texts = nextTexts;

  }

  function addFloatingText(x: number, y: number, text: string, color: "GOOD" | "BAD") {
    stateRef.current.texts.push({
      id: crypto.randomUUID(),
      text,
      x,
      y,
      color,
      spawnAt: performance.now(),
      durationMs: 650,
    });
  }


  function drawItem(ctx: CanvasRenderingContext2D, item: FallingItem, y: number) {
    const img = item.type === "BTC" ? props.btcImg : props.bombImg;
    const x = item.x;

    // glow sutil
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(x, y, item.size * 0.52, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = item.type === "BTC" ? "rgba(255, 204, 60, 0.09)" : "rgba(255, 70, 70, 0.08)";
    ctx.fill();
    ctx.restore();

    if (img) {
      ctx.drawImage(img, x - item.size / 2, y - item.size / 2, item.size, item.size);
      return;
    }

    // fallback: placeholder se imagem não carregar
    ctx.save();
    ctx.fillStyle = item.type === "BTC" ? "rgba(255, 204, 60, 0.85)" : "rgba(255, 70, 70, 0.85)";
    ctx.beginPath();
    ctx.arc(x, y, item.size * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawStars(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // estrelas estáticas “baratas”: seeded por tamanho
    const count = Math.floor((w * h) / 22000);
    for (let i = 0; i < count; i++) {
      const sx = (i * 97) % w;
      const sy = (i * 193) % h;
      const r = 1 + ((i * 13) % 2);
      ctx.save();
      ctx.globalAlpha = 0.18 + ((i * 11) % 40) / 200;
      ctx.fillStyle = "rgba(160, 190, 255, 1)";
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  // clique no canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function onClick(ev: MouseEvent) {
      if (props.status !== "RUNNING") return;

      if (!canvas || props.timeLeftSec <= 0) return;

      const rect = canvas.getBoundingClientRect();
      const px = ev.clientX - rect.left;
      const py = ev.clientY - rect.top;

      // hit test do topo (item mais “na frente”)
      const st = stateRef.current;
      for (let i = st.items.length - 1; i >= 0; i--) {
        const item = st.items[i];
        if (item.clicked) continue;

        const now = performance.now();
        const t = (now - item.spawnAt) / item.fallDurationMs;
        if (t < 0 || t >= 1) continue;

        const p = easeInOutCubic(t);

        // precisa bater com o desenho
        const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        const cssH = canvas.height / dpr;
        const floorY = cssH - arena.floorPad;

        const yStart = -item.size;
        const yEnd = floorY - item.size / 2 - 4;
        const y = lerp(yStart, yEnd, p);

        const r = item.size * 0.45; // hitbox circular precisa o suficiente p/ ícones redondos

        if (hitTestCircle(px, py, item.x, y, r)) {
          item.clicked = true;

          if (item.type === "BTC") {
            props.onScoreDelta(+10);
            addFloatingText(item.x, y, "+10", "GOOD");
          } else {
            props.onScoreDelta(-15);
            addFloatingText(item.x, y, "-15", "BAD");
            st.overlayRedAlpha = 1; // liga overlay vermelho
          }
          break;
        }
      }
    }

    canvas.addEventListener("click", onClick);
    return () => canvas.removeEventListener("click", onClick);
  }, [props.status, props.timeLeftSec, props.onScoreDelta, arena.floorPad]);

  return (
    <div
      style={{
        width: "min(980px, 96vw)",
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(110, 140, 255, 0.18)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
