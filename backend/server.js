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

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "text/plain",
  "application/pdf",
];

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      cb(
        new Error(
          "Invalid file type. Only images, text, or PDF allowed to Upload"
        ),
        false
      );
    } else {
      cb(null, true);
    }
  },
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send("Please upload a file");
    }

    const metadata = {
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeKB: (file.size / 1024).toFixed(2),
      uploadedAt: new Date().toISOString(),
    };

    console.log("File metadata:", metadata);

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
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      console.log(`File uploaded successfully: ${publicUrl}`);
      res.json({
        message: "File uploaded successfully!",
        fileUrl: publicUrl,
        metadata,
      });
    });

    blobStream.end(file.buffer);
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send("Something went wrong");
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "File too large. Max 5MB allowed." });
    }
  } else if (err.message.includes("Invalid file type")) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App is Listening at the  ${PORT}`);
});
