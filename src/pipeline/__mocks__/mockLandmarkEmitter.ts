export function createMockEmitter(
  sendFrame: (f: Float32Array) => void,
  fps = 30
) {
  let frameId = 0;
  const interval = setInterval(() => {
    const fake = new Float32Array(78);
    for (let i = 0; i < 78; i++)
      fake[i] = Math.sin(frameId * 0.1 + i) * 0.5 + 0.5;
    sendFrame(fake);
    frameId++;
  }, 1000 / fps);
  return () => clearInterval(interval);
}
