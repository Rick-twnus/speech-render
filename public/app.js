let recorder;
let stream;
let text = "";

const start = document.getElementById("start");
const stop = document.getElementById("stop");
const status = document.getElementById("status");
const textDiv = document.getElementById("text");

start.onclick = async () => {
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  recorder = new MediaRecorder(stream, {
    mimeType: "audio/webm"
  });

  text = "";
  textDiv.innerText = "";

  recorder.ondataavailable = async (e) => {
    const formData = new FormData();
    formData.append("file", e.data, "audio.webm");

    const res = await fetch("/transcribe", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.text) {
      text += data.text + " ";
      textDiv.innerText = text;
    }
  };

  recorder.start(3000);

  status.innerText = "錄音中...";
  start.disabled = true;
  stop.disabled = false;
};

stop.onclick = () => {
  recorder.stop();
  stream.getTracks().forEach(t => t.stop());

  status.innerText = "已停止";
  start.disabled = false;
  stop.disabled = true;
};