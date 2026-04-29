# SignGloss — Real-Time ISL Recognition

> Browser-based Indian Sign Language to gloss translation using MediaPipe + ONNX Runtime + CTC decoding.

## Features

- Real-time webcam sign language recognition
- 600+ ISL gloss vocabulary
- 100% client-side — no server, no data uploads
- Dark macOS-inspired glassmorphism UI

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Vision | MediaPipe Tasks Vision |
| Inference | ONNX Runtime Web (WASM) |
| Threading | Web Workers |
| Routing | React Router v6 (HashRouter) |

## Getting Started

```bash
git clone https://github.com/anand-rm-dev/CSLR-website.git
cd CSLR-website
npm install
npm run dev
```

## Project Structure

```
src/
├── types/pipeline.ts        — Shared contract (Dev A ↔ Dev B)
├── pipeline/
│   ├── capture.ts           — Dev A: camera/video source
│   ├── mediapipe.ts         — Dev A: landmark extraction
│   ├── landmarkProcessor.ts — Dev A: raw → Float32Array[78]
│   ├── inference.worker.ts  — Dev B: buffer + ONNX + CTC
│   ├── glossDecoder.ts      — Dev B: CTC greedy collapse
│   ├── modelLoader.ts       — Dev B: ONNX session + warmup
│   └── workerBridge.ts      — Shared: main ↔ worker wrapper
├── components/
│   ├── ui/                  — shadcn components
│   ├── layout/              — Navbar, Footer
│   ├── video/               — CameraFeed, DemoVideoFeed, LandmarkOverlay
│   ├── gloss/               — CurrentGloss, GlossHistory
│   └── metrics/             — MetricsBar
├── pages/                   — All 6 pages
├── context/                 — PipelineContext
└── hooks/                   — useCamera, usePipeline, useFps
```

## Pipeline

```
Camera → MediaPipe (26 landmarks) → Web Worker → ONNX Model → CTC Decode → UI
```

## Team

| Name | Role |
|------|------|
| Dev A | Capture & Feature Pipeline |
| Dev B | Inference & Model Pipeline |

## License

MIT