const express = require('express');
const dotenv = require('dotenv');
const { db } = require('./db');

dotenv.config();


const app = express();
app.use(express.json());

app.post('/addSchool', async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;

    if (!name || !address || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'Invalid input' });
    }

    await db.query(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    );

    res.status(201).json({ message: 'School added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/listSchools', async (req, res) => {
  try {
    const userLat = parseFloat(req.query.latitude);
    const userLng = parseFloat(req.query.longitude);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const [schools] = await db.query('SELECT * FROM schools');

    const withDistance = schools.map(school => {
      const distance = Math.sqrt(
        Math.pow(userLat - school.latitude, 2) + Math.pow(userLng - school.longitude, 2)
      );
      return { ...school, distance };
    });

    withDistance.sort((a, b) => a.distance - b.distance);

    res.json(withDistance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
