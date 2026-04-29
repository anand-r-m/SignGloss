import { useRef, useCallback } from "react";

export function useFpsCounter() {
  const frames = useRef(0);
  const lastTime = useRef(performance.now());
  const currentFps = useRef(0);

  const tick = useCallback(() => {
    frames.current++;
    const now = performance.now();
    if (now - lastTime.current >= 1000) {
      currentFps.current = frames.current;
      frames.current = 0;
      lastTime.current = now;
    }
    return currentFps.current;
  }, []);

  return { tick, getFps: () => currentFps.current };
}
