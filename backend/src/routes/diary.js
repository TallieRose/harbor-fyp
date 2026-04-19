import express from "express";
import { pool } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();


router.get("/", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM diary_entries
       WHERE user_id = ?
       ORDER BY entry_date DESC`,
      [req.user.id]
    );

    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { entry_date, title, mood, entry_text } = req.body;

    if (!entry_date || !entry_text) {
      return res.status(400).json({ error: "Date and text required" });
    }

    const [result] = await pool.query(
      `INSERT INTO diary_entries
       (user_id, entry_date, title, mood, entry_text)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, entry_date, title || null, mood || null, entry_text]
    );

    res.status(201).json({ ok: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { entry_date, title, mood, entry_text } = req.body;

    if (!entry_date || !entry_text) {
      return res.status(400).json({ error: "Date and text required" });
    }

    const [result] = await pool.query(
      `UPDATE diary_entries
       SET entry_date = ?, title = ?, mood = ?, entry_text = ?
       WHERE id = ? AND user_id = ?`,
      [entry_date, title || null, mood || null, entry_text, id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: "Not allowed" });
    }

    res.json({ ok: true, message: "Entry updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `DELETE FROM diary_entries
       WHERE id = ? AND user_id = ?`,
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: "Not allowed" });
    }

    res.json({ ok: true, message: "Entry deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;