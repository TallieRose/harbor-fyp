import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import supportRoutes from "./routes/support.js";
import resourceRoutes from "./routes/resources.js";
import diaryRoutes from "./routes/diary.js";
import bookmarkRoutes from "./routes/bookmarks.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());


app.use(express.static(path.join(__dirname, "../../frontend")));


app.use("/auth", authRoutes);
app.use("/support-requests", supportRoutes);
app.use("/resources", resourceRoutes);
app.use("/diary-entries", diaryRoutes);
app.use("/bookmarks", bookmarkRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);