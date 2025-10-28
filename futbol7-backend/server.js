const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');

dotenv.config();

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

app.get('/api/players', async (req, res) => {
    try {
        const { league } = req.query;
        if (!league) {
            return res.status(400).json({ error: 'League query parameter is required' });
        }

        const aggregationPipeline = [
            // 1. Encontrar jugadores que estén en la liga solicitada
            { $match: { leagues: league } },
            
            // 2. Buscar todos los partidos de esa liga para obtener estadísticas
            {
                $lookup: {
                    from: 'matches',
                    let: { playerId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [ { $eq: ['$league', league] }, { $in: ['$$playerId', '$playersPlayed'] } ] } } },
                    ],
                    as: 'playedMatches'
                }
            },

            // 3. Calcular goles y partidos jugados a partir de los partidos encontrados
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
            
            // 4. Limpiar los campos que no necesitamos enviar al frontend
            { $project: { playedMatches: 0 } }
        ];

        const players = await db.collection('players').aggregate(aggregationPipeline).toArray();
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/players', async (req, res) => {
    try {
        // Las estadísticas ya no se guardan aquí
        const player = {
            name: req.body.name,
            position: req.body.position,
            number: req.body.number,
            leagues: req.body.leagues || [], // Ahora es un array de ligas
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
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/players/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('players').deleteOne({ _id: new ObjectId(id) });
        // Opcional: También podrías querer eliminar al jugador de los partidos en los que participó.
        res.json({ message: 'Player deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// --- API Routes - Matches ---
// (Las rutas de partidos ya no necesitan actualizar las estadísticas de los jugadores)

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
            ...req.body,
            createdAt: new Date()
        };
        const result = await db.collection('matches').insertOne(match);
        res.status(201).json({ ...match, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// La ruta PUT de partidos ya no necesita actualizar estadísticas
app.put('/api/matches/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('matches').updateOne(
            { _id: new ObjectId(id) },
            { $set: req.body }
        );
        res.json({ message: 'Match updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// La ruta DELETE de partidos ya no necesita revertir estadísticas
app.delete('/api/matches/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('matches').deleteOne({ _id: new ObjectId(id) });
        res.json({ message: 'Match deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
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