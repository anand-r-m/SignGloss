# SignGloss — Real-Time ISL to Gloss Translation

A client-side web application that translates Indian Sign Language (ISL) into gloss tokens in real-time using webcam input. Everything runs in the browser — no server, no backend, no data leaves your machine.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | Bootstrap 5 (dark theme) |
| Camera | WebRTC `getUserMedia` |
| Landmark Detection | MediaPipe Tasks Vision |
| Inference | ONNX Runtime Web (Web Worker) |
| Decoding | CTC Greedy Decode |
| Language | Vanilla JavaScript (ES Modules) |
| Styling | CSS + Bootstrap 5.3 |

## Pipeline

```
Camera (30fps) → MediaPipe → 26 landmarks × 3 coords = 78 features
       ↓
Web Worker: compute velocity → 156 features per frame
       ↓
Sliding window buffer (64 frames)
       ↓
ONNX inference → [1, 64, 601] output
       ↓
CTC greedy decode → gloss tokens → UI
```

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Landing page with hero and feature cards |
| About | `about.html` | Project overview, pipeline diagram, tech stack |
| Demo | `demo.html` | Pre-recorded screen recording of the system |
| Operations | `operations.html` | Live camera → inference → gloss output |
| Learn | `learn.html` | ISL video tutorials and learning resources |
| Team | `team.html` | Team members and contact form |

## Setup

No build step required. Serve the files with any static server:

```bash
# Option 1: VS Code Live Server extension
# Right-click index.html → Open with Live Server

# Option 2: Python
python3 -m http.server 8000

# Option 3: Node
npx serve .
```

Then open `http://localhost:8000` in Chrome (recommended).

> **Note:** Camera access requires HTTPS or localhost. The Operations page needs camera permission to function.

## Project Structure

```
CSLR-website/
├── index.html              Landing page
├── about.html              Project info
├── demo.html               Demo video
├── operations.html         Live inference
├── learn.html              ISL tutorials
├── team.html               Team + contact
├── css/
│   └── style.css           Custom styles
├── js/
│   ├── contract.js         Shared constants + Pipeline
│   ├── common.js           Navbar/footer injection
│   ├── warp-transition.js  Page transition animation
│   ├── capture.js          WebRTC camera
│   ├── landmarks.js        MediaPipe extraction
│   ├── operations-capture.js   Camera wiring
│   ├── inference-worker.js Web Worker (ONNX + CTC)
│   ├── bridge.js           Worker wrapper
│   ├── decoder.js          CTC greedy decode
│   ├── operations-inference.js Inference UI wiring
│   ├── demo.js             Demo page logic
│   └── team.js             Contact form validation
├── models/
│   └── signgloss_stub.onnx ONNX model
├── assets/
│   ├── images/
│   └── videos/
└── scripts/
    └── generate_stub_model.py
```

## Team

| Name | Role |
|------|------|
| Anand R M | Dev A — Capture & Frontend |
| Team Member | Dev B — Inference Pipeline |

## License

This project is for educational purposes.