import express from "express";
import { pool } from "../db.js";
import { authMiddleware, optionalAuth, staffOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", optionalAuth, async (req, res) => {
  try {
    const { category } = req.query;

    let sql = `
      SELECT *
      FROM resources
      WHERE is_published = 1
    `;
    const params = [];

    if (category) {
      sql += ` AND category = ?`;
      params.push(category);
    }

   sql += ` ORDER BY display_order ASC, created_at DESC`;

    const [rows] = await pool.query(sql, params);

    if (rows.length === 0) {
      return res.json({ ok: true, data: [] });
    }

    const resourceIds = rows.map((row) => row.id);

    const placeholders = resourceIds.map(() => "?").join(",");
    const [linkRows] = await pool.query(
      `
      SELECT id, resource_id, label, url, sort_order
      FROM resource_links
      WHERE resource_id IN (${placeholders})
      ORDER BY sort_order ASC, id ASC
      `,
      resourceIds
    );

    const linksByResourceId = {};
    for (const link of linkRows) {
      if (!linksByResourceId[link.resource_id]) {
        linksByResourceId[link.resource_id] = [];
      }
      linksByResourceId[link.resource_id].push({
        id: link.id,
        label: link.label,
        url: link.url,
        sort_order: link.sort_order
      });
    }

    const data = rows.map((row) => ({
      ...row,
      links: linksByResourceId[row.id] || []
    }));

    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authMiddleware, staffOnly, async (req, res) => {
  try {
    const { title, summary, content, external_url, category } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const [result] = await pool.query(
      `INSERT INTO resources
       (title, summary, content, external_url, category, is_published, created_by)
       VALUES (?, ?, ?, ?, ?, 1, ?)`,
      [
        title,
        summary || null,
        content || null,
        external_url || null,
        category || "general",
        req.user.id
      ]
    );

    res.status(201).json({ ok: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", authMiddleware, staffOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, content, external_url, category } = req.body;

    await pool.query(
      `UPDATE resources
       SET title = ?, summary = ?, content = ?, external_url = ?, category = ?
       WHERE id = ?`,
      [title, summary, content, external_url, category, id]
    );

    res.json({ ok: true, message: "Resource updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authMiddleware, staffOnly, async (req, res) => {
  try {
    await pool.query("DELETE FROM resources WHERE id = ?", [req.params.id]);
    res.json({ ok: true, message: "Resource deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;