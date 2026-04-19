import express from "express";
import { pool } from "../db.js";
import { authMiddleware, optionalAuth, staffOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/", optionalAuth, async (req, res) => {
  try {
    const { subject, message, category, is_anonymous } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: "subject and message are required" });
    }

    const safeCategory = category || "general";

    const anon =
      is_anonymous === true ||
      is_anonymous === 1 ||
      is_anonymous === "1" ||
      is_anonymous === "true"
        ? 1
        : 0;

    if (anon === 0 && !req.user) {
      return res
        .status(401)
        .json({ error: "Login required when is_anonymous is false" });
    }

    const userId = anon === 1 ? null : req.user.id;

    const [result] = await pool.query(
      `INSERT INTO support_requests
       (user_id, is_anonymous, category, subject, message)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, anon, safeCategory, subject, message]
    );

    res.status(201).json({ ok: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;

    let sql = `SELECT * FROM support_requests WHERE 1=1`;
    const params = [];

    if (req.user.role === "student") {
      sql += ` AND user_id = ?`;
      params.push(req.user.id);
    } else {

      // staff/admin can filter by status
      if (status) {
        sql += ` AND status = ?`;
        params.push(status);
      }
    }

    sql += ` ORDER BY created_at DESC`;

    const [rows] = await pool.query(sql, params);
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM support_requests WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Support request not found" });
    }

    const request = rows[0];

    if (req.user.role === "student") {
      if (!request.user_id || request.user_id !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    res.json({ ok: true, data: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Staff respond
router.patch("/:id/respond", authMiddleware, staffOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { staff_response, status } = req.body;

    if (!staff_response) {
      return res.status(400).json({ error: "staff_response is required" });
    }

    const newStatus = status || "responded";
    const staffId = req.user.id;

    const [result] = await pool.query(
      `UPDATE support_requests
       SET staff_response = ?,
           responded_by = ?,
           responded_at = NOW(),
           status = ?
       WHERE id = ?`,
      [staff_response, staffId, newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Support request not found" });
    }

    res.json({ ok: true, message: "Support request updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Staff close
router.patch("/:id/close", authMiddleware, staffOnly, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE support_requests
       SET status = 'closed'
       WHERE id = ?`,
      [id]
    );

    res.json({ ok: true, message: "Support request closed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;