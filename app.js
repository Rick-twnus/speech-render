import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

let stream;
let recorder;
let audioChunks = [];
let transcriber;
let isRunning = false;
let textBuffer = "";

const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const status = document.getElementById("status");
const textDiv = document.getElementById("text");

// 🔥 載入 AI（第一次會慢）
status.innerText = "載入AI模型中...";

transcriber = await pipeline(
  "automatic-speech-recognition",
  "Xenova/whisper-tiny"
);

status.innerText = "AI已準備好";

startBtn.onclick = async () => {
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  recorder = new MediaRecorder(stream, {
    mimeType: "audio/webm"
  });

  isRunning = true;
  textBuffer = "";
  textDiv.innerText = "";

  status.innerText = "即時字幕中...";

  recorder.ondataavailable = async (e) => {
    if (!isRunning) return;

    const blob = e.data;
    const arrayBuffer = await blob.arrayBuffer();

    // 🔥 每 2 秒就丟 AI
    const result = await transcriber(arrayBuffer);

    if (result.text) {
      textBuffer += result.text + " ";
      textDiv.innerText = textBuffer;
    }
  };

  recorder.start(2000); // 🔥 每 2 秒切片

  startBtn.disabled = true;
  stopBtn.disabled = false;
};

stopBtn.onclick = () => {
  isRunning = false;

  recorder.stop();
  stream.getTracks().forEach(t => t.stop());

  startBtn.disabled = false;
  stopBtn.disabled = true;

  status.innerText = "已停止";
};
