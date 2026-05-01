let currentStream = null;

export async function startCamera(videoElement) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user',
      },
      audio: false,
    });

    currentStream = stream;
    videoElement.srcObject = stream;

    await new Promise((resolve, reject) => {
      videoElement.onloadedmetadata = resolve;
      videoElement.onerror = reject;
    });

    await videoElement.play();
    return { success: true };
  } catch (err) {
    let message = 'Camera access failed.';
    if (err.name === 'NotAllowedError') {
      message = 'Camera permission denied. Please allow camera access in your browser settings and try again.';
    } else if (err.name === 'NotFoundError') {
      message = 'No camera detected. Please connect a camera and try again.';
    } else if (err.name === 'NotReadableError') {
      message = 'Camera is in use by another application. Close other apps using the camera and try again.';
    } else if (err.name === 'OverconstrainedError') {
      message = 'Camera does not support the requested resolution.';
    }
    return { success: false, error: message };
  }
}

export function stopCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
}

export function getStream() {
  return currentStream;
}
