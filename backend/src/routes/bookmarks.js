import express from "express";
import { pool } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/* =============================
   GET /bookmarks
   Returns array of resource_ids saved by the logged-in user
============================= */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT resource_id FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json({ ok: true, data: rows.map(r => r.resource_id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =============================
   POST /bookmarks
   Body: { resource_id }
   INSERT IGNORE makes this idempotent
============================= */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { resource_id } = req.body;
    if (!resource_id) {
      return res.status(400).json({ error: "resource_id is required" });
    }

    await pool.query(
      "INSERT IGNORE INTO bookmarks (user_id, resource_id) VALUES (?, ?)",
      [req.user.id, resource_id]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =============================
   DELETE /bookmarks/:resourceId
   Removes a single bookmark for the logged-in user
============================= */
router.delete("/:resourceId", authMiddleware, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM bookmarks WHERE user_id = ? AND resource_id = ?",
      [req.user.id, req.params.resourceId]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
