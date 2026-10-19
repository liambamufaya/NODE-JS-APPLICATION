const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');
const app = express();
app.use(cors()); // allow front end to call the API
app.use(express.json()); // parse JSON request bodies
// Health check
app.get('/api/health', (req, res) => {
res.json({ status: 'ok', time: new Date().toISOString() });
});
// GET all items
app.get('/api/items', async (req, res) => {
try {
const [rows] = await pool.query('SELECT * FROM items ORDER BY id DESC');
res.json(rows);
} catch (err) {
console.error(err);
res.status(500).json({ error: 'DB error' });
}
});
//GET one
app.get('/api/items/:id', async (req, res) => {
const id = Number(req.params.id);
try {
const [rows] = await pool.query('SELECT * FROM items WHERE id = ?',
[id]);
if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
res.json(rows[0]);
} catch (err) {
res.status(500).json({ error: 'DB error' });
}
 });
// POST create
app.post('/api/items', async (req, res) => {
const { name, price } = req.body;
if (!name || price == null) return res.status(400).json({ error:
'name and price required' });
try {
const [result] = await pool.query(
'INSERT INTO items (name, price) VALUES (?, ?)',
[name, price]
);
res.status(201).json({ id: result.insertId, name, price });
} catch (err) {
res.status(500).json({ error: 'DB error' });
}
});// PUT update
app.put('/api/items/:id', async (req, res) => {
const id = Number(req.params.id);
const { name, price } = req.body;
if (!name || price == null) return res.status(400).json({ error:
'name and price required' });
try {
const [result] = await pool.query(
'UPDATE items SET name = ?, price = ? WHERE id = ?',
[name, price, id]
);
if (result.affectedRows === 0) return res.status(404).json({ error:
'Not found' });
res.json({ id, name, price });
} catch (err) {
res.status(500).json({ error: 'DB error' });
}
});
// DELETE
app.delete('/api/items/:id', async (req, res) => {
const id = Number(req.params.id);
try {
const [result] = await pool.query('DELETE FROM items WHERE id = ?',
[id]);
if (result.affectedRows === 0) return res.status(404).json({ error:
'Not found' });
res.status(204).send();
} catch (err) {res.status(500).json({ error: 'DB error' });
}
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on
http://127.0.0.1:${PORT}`));