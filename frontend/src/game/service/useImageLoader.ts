import { useEffect, useMemo, useState } from "react";

type LoadedImages = {
  btc: HTMLImageElement | null;
  bomb: HTMLImageElement | null;
  ready: boolean;
};

function loadOne(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function useImageLoader(): LoadedImages {
  const [btc, setBtc] = useState<HTMLImageElement | null>(null);
  const [bomb, setBomb] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let alive = true;

    Promise.all([loadOne("/btc.png"), loadOne("/bomb.png")])
      .then(([btcImg, bombImg]) => {
        if (!alive) return;
        setBtc(btcImg);
        setBomb(bombImg);
      })
      .catch((err) => {
        console.error("Failed to load images", err);
      });

    return () => {
      alive = false;
    };
  }, []);

  return useMemo(
    () => ({
      btc,
      bomb,
      ready: !!btc && !!bomb,
    }),
    [btc, bomb]
  );
}
