import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import { Storage } from "@google-cloud/storage";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.options("*", cors());

app.use(express.json());

const storage = new Storage();
const bucket = storage.bucket(process.env.GOOGLE_BUCKET_NAME);

app.get("/", (req, res) => {
  res.send("Simple File Uploader Backend is running!");
});

const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send("Please upload a file");
    }

    const fileName = `${Date.now()}_${file.originalname}`;
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream.on("error", (err) => {
      console.error("Upload error:", err);
      res.status(500).send("Error uploading file");
    });

    blobStream.on("finish", async () => {
      await blob.makePublic();
      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      res.json({ fileUrl });
    });

    blobStream.end(file.buffer);
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send("Something went wrong");
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
