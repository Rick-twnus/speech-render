import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60_000, // 🔥 避免 Render timeout
});

app.post("/transcribe", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

const result = await openai.audio.transcriptions.create({
  file: fs.createReadStream(filePath),
  model: "whisper-1"
});

    fs.unlinkSync(filePath);

    res.json({ text: result.text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "fail" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running"));

console.log("API KEY exists:", !!process.env.OPENAI_API_KEY);
