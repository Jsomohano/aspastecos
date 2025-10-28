const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
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

// API Routes - Players
app.get('/api/players', async (req, res) => {
    try {
        const { league } = req.query;
        if (!league) {
            return res.status(400).json({ error: 'League query parameter is required' });
        }
        const players = await db.collection('players').find({ league }).toArray();
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/players', async (req, res) => {
    try {
        const player = {
            ...req.body, // name, position, number, and now league
            goals: 0,
            matchesPlayed: 0,
            createdAt: new Date()
        };
        const result = await db.collection('players').insertOne(player);
        res.status(201).json({ ...player, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/players/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.collection('players').updateOne(
            { _id: new ObjectId(id) },
            { $set: req.body }
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/players/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('players').deleteOne({ _id: new ObjectId(id) });
        res.json({ message: 'Player deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API Routes - Matches
app.get('/api/matches', async (req, res) => {
    try {
        const { league } = req.query;
        if (!league) {
            return res.status(400).json({ error: 'League query parameter is required' });
        }
        const matches = await db.collection('matches').find({ league }).toArray();
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/matches', async (req, res) => {
    try {
        const match = {
            ...req.body, // Should now include league
            createdAt: new Date()
        };
        
        const result = await db.collection('matches').insertOne(match);
        
        // Update player statistics
        for (const [playerId, goals] of Object.entries(match.goalsByPlayer || {})) {
            await db.collection('players').updateOne(
                { _id: new ObjectId(playerId) },
                { $inc: { goals: parseInt(goals) || 0 } }
            );
        }
        
        if (match.playersPlayed) {
            for (const playerId of match.playersPlayed) {
                await db.collection('players').updateOne(
                    { _id: new ObjectId(playerId) },
                    { $inc: { matchesPlayed: 1 } }
                );
            }
        }
        
        res.status(201).json({ ...match, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/matches/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const oldMatch = await db.collection('matches').findOne({ _id: new ObjectId(id) });
        
        // Revert old statistics
        if (oldMatch) {
            for (const [playerId, goals] of Object.entries(oldMatch.goalsByPlayer || {})) {
                await db.collection('players').updateOne(
                    { _id: new ObjectId(playerId) },
                    { $inc: { goals: -(parseInt(goals) || 0) } }
                );
            }
            
            if (oldMatch.playersPlayed) {
                for (const playerId of oldMatch.playersPlayed) {
                    await db.collection('players').updateOne(
                        { _id: new ObjectId(playerId) },
                        { $inc: { matchesPlayed: -1 } }
                    );
                }
            }
        }
        
        // Update match
        const match = req.body;
        await db.collection('matches').updateOne(
            { _id: new ObjectId(id) },
            { $set: match }
        );
        
        // Apply new statistics
        for (const [playerId, goals] of Object.entries(match.goalsByPlayer || {})) {
            await db.collection('players').updateOne(
                { _id: new ObjectId(playerId) },
                { $inc: { goals: parseInt(goals) || 0 } }
            );
        }
        
        if (match.playersPlayed) {
            for (const playerId of match.playersPlayed) {
                await db.collection('players').updateOne(
                    { _id: new ObjectId(playerId) },
                    { $inc: { matchesPlayed: 1 } }
                );
            }
        }
        
        res.json({ message: 'Match updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/matches/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const match = await db.collection('matches').findOne({ _id: new ObjectId(id) });
        
        // Revert statistics
        if (match) {
            for (const [playerId, goals] of Object.entries(match.goalsByPlayer || {})) {
                await db.collection('players').updateOne(
                    { _id: new ObjectId(playerId) },
                    { $inc: { goals: -(parseInt(goals) || 0) } }
                );
            }
            
            if (match.playersPlayed) {
                for (const playerId of match.playersPlayed) {
                    await db.collection('players').updateOne(
                        { _id: new ObjectId(playerId) },
                        { $inc: { matchesPlayed: -1 } }
                    );
                }
            }
        }
        
        await db.collection('matches').deleteOne({ _id: new ObjectId(id) });
        res.json({ message: 'Match deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await client.close();
    console.log('👋 MongoDB connection closed');
    process.exit(0);
});