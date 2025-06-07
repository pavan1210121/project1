const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const DB_FILE = path.join(__dirname, 'donors.db');

const db = new sqlite3.Database(DB_FILE);

// Create table if not exists
 db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS donors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    blood TEXT NOT NULL,
    contact TEXT NOT NULL
  )`);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.post('/register', (req, res) => {
  const { name, blood, contact } = req.body;
  if (!name || !blood || !contact) {
    return res.status(400).json({ error: 'All fields required' });
  }
  db.run('INSERT INTO donors(name, blood, contact) VALUES (?, ?, ?)', [name, blood, contact], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to register donor' });
    }
    res.json({ message: 'Donor registered', id: this.lastID });
  });
});

app.get('/api/donors', (req, res) => {
  db.all('SELECT name, blood, contact FROM donors', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch donors' });
    }
    res.json(rows);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
