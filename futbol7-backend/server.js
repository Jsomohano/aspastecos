const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let db;
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/futbol7';
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        db = client.db('futbol7');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
    }
}

connectDB();

// --- API Routes - Players ---

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const newUser = await db.collection('users').insertOne({ username, password: hashedPassword });
      res.status(201).json({ message: 'User created', userId: newUser.insertedId });
    } catch (error) {
      res.status(500).json({ error: 'Error creating user' });
    }
  });

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body || {};
        console.log('LOGIN REQ:', { usernameProvided: username });

        if (!db) {
            console.error('LOGIN ERROR: No DB connection');
            return res.status(500).json({ error: 'Database not connected' });
        }

        if (!username || !password) {
            console.log('LOGIN MISSING FIELDS', { usernameProvided: username });
            return res.status(400).json({ error: 'Username and password required' });
        }

        const user = await db.collection('users').findOne({ username });
        // Log only non-sensitive identifiers
        console.log('LOGIN DB USER:', user ? { usernameStored: user.username, userId: user._id } : null);

        const isMatch = user ? await bcrypt.compare(password, user.password) : false;
        console.log('LOGIN compare result:', isMatch);

        if (user && isMatch) {
            const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '8h' });
            return res.json({ token });
        }

        return res.status(401).json({ error: 'Invalid credentials' });
    } catch (error) {
        console.error('LOGIN ERROR:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

  const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({ error: 'Token is not valid' });
        }
        req.user = decoded; // Puedes usar req.user en tus rutas si lo necesitas
        next();
      });
    } else {
      res.status(401).json({ error: 'No token, authorization denied' });
    }
  };

app.get('/api/players', async (req, res) => {
    try {
        const { league } = req.query;
        if (!league) {
            return res.status(400).json({ error: 'League query parameter is required' });
        }

        const aggregationPipeline = [
            { $match: { leagues: league } },
            {
                $lookup: {
                    from: 'matches',
                    let: { playerId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [ { $eq: ['$league', league] }, { $in: ['$$playerId', { '$ifNull': ['$playersPlayed', []] }] } ] } } },
                    ],
                    as: 'playedMatches'
                }
            },
            {
                $addFields: {
                    matchesPlayed: { $size: '$playedMatches' },
                    goals: {
                        $reduce: {
                            input: '$playedMatches',
                            initialValue: 0,
                            in: {
                                $add: [
                                    '$$value',
                                    { $ifNull: [ { $getField: { field: { $toString: '$_id' }, input: '$$this.goalsByPlayer' } }, 0 ] }
                                ]
                            }
                        }
                    }
                }
            },
            { $project: { playedMatches: 0 } }
        ];

        const players = await db.collection('players').aggregate(aggregationPipeline).toArray();
        res.json(players);
    } catch (error) {
        console.error('GET /api/players ERROR:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/players', async (req, res) => {
    try {
        const player = {
            name: req.body.name,
            position: req.body.position,
            number: req.body.number,
            leagues: req.body.leagues || [],
            createdAt: new Date()
        };
        const result = await db.collection('players').insertOne(player);
        res.status(201).json({ ...player, _id: result.insertedId });
    } catch (error) {
        console.error('POST /api/players ERROR:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/players/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            name: req.body.name,
            position: req.body.position,
            number: req.body.number,
            leagues: req.body.leagues
        };
        const result = await db.collection('players').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        res.json(result);
    } catch (error) {
        console.error('PUT /api/players/:id ERROR:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/players/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('players').deleteOne({ _id: new ObjectId(id) });
        res.json({ message: 'Player deleted successfully' });
    } catch (error) {
        console.error('DELETE /api/players/:id ERROR:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// --- API Routes - Matches ---

app.get('/api/matches', async (req, res) => {
    try {
        const { league } = req.query;
        if (!league) {
            return res.status(400).json({ error: 'League query parameter is required' });
        }
        const matches = await db.collection('matches').find({ league }).toArray();
        res.json(matches);
    } catch (error) {
        console.error('GET /api/matches ERROR:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ** CORRECCIÓN AQUÍ **
app.post('/api/matches', async (req, res) => {
    try {
        const { playersPlayed, ...rest } = req.body;
        const matchData = {
            ...rest,
            playersPlayed: (playersPlayed || []).map(id => new ObjectId(id)), // Convierte strings a ObjectId
            createdAt: new Date()
        };
        const result = await db.collection('matches').insertOne(matchData);
        res.status(201).json({ ...matchData, _id: result.insertedId });
    } catch (error) {
        console.error('POST /api/matches ERROR:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ** CORRECCIÓN AQUÍ **
app.put('/api/matches/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { playersPlayed, ...rest } = req.body;
        const updateData = {
            ...rest,
            playersPlayed: (playersPlayed || []).map(id => new ObjectId(id)), // Convierte strings a ObjectId
        };
        await db.collection('matches').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        res.json({ message: 'Match updated successfully' });
    } catch (error) {
        console.error('PUT /api/matches/:id ERROR:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/matches/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('matches').deleteOne({ _id: new ObjectId(id) });
        res.json({ message: 'Match deleted successfully' });
    } catch (error) {
        console.error('DELETE /api/matches/:id ERROR:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

process.on('SIGINT', async () => {
    await client.close();
    console.log('👋 MongoDB connection closed');
    process.exit(0);
});