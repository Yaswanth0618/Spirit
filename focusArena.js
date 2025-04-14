let model, video, canvas, ctx;
let timerInterval, breakTimer;
let focusDuration = 0;
let secondsLeft = 0;
let breakActive = false;

async function setupCamera() {
  video = document.getElementById("video");
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => resolve(video);
  });
}

async function loadModel() {
  model = await blazeface.load();
}

async function detectFace() {
  const predictions = await model.estimateFaces(video, false);
  return predictions.length > 0;
}

function updateTimerDisplay() {
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  document.getElementById("timerDisplay").innerText = `${minutes}:${seconds}`;
}

function endSession(message = "You left the zone! Session ended.") {
  clearInterval(timerInterval);
  clearInterval(breakTimer);
  document.getElementById("status").innerText = message;
}

async function monitorFocus() {
  if (!(await detectFace())) {
    endSession("No face detected! Focus broken ❌");
  }
}

function startBreakCycle() {
  breakActive = true;
  clearInterval(timerInterval);
  document.getElementById("status").innerText = "Break time! ⏳ (2m 30s)";
  secondsLeft = 150;
  updateTimerDisplay();

  breakTimer = setInterval(() => {
    secondsLeft--;
    updateTimerDisplay();
    if (secondsLeft <= 0) {
      breakActive = false;
      clearInterval(breakTimer);
      document.getElementById("status").innerText = "Break over. Back to focus!";
      startFocusSession(); // resume
    }
  }, 1000);
}

function startFocusSession() {
  secondsLeft = focusDuration * 60;
  updateTimerDisplay();
  timerInterval = setInterval(async () => {
    secondsLeft--;
    updateTimerDisplay();

    await monitorFocus();

    if (secondsLeft % 1800 === 0 && secondsLeft !== 0) {
      startBreakCycle();
    }

    if (secondsLeft <= 0 && !breakActive) {
      clearInterval(timerInterval);
      document.getElementById("status").innerText = "Focus session complete! ✅";
    }
  }, 1000);
}

async function startFocus() {
  focusDuration = parseInt(document.getElementById("minutes").value);
  document.getElementById("status").innerText = "Loading camera and AI...";
  await setupCamera();
  await loadModel();
  document.getElementById("status").innerText = "Focus started. Stay in zone 🧠";
  startFocusSession();
}