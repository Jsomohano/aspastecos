# Futbol7 Backend

Backend API para el sistema de estadísticas de fútbol 7.

## Características

- REST API con Express.js
- MongoDB para almacenamiento de datos
- Gestión de jugadores y partidos
- Actualización automática de estadísticas

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Crear archivo `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/futbol7
```

3. Iniciar servidor:
```bash
npm run dev
```

## API Endpoints

### Jugadores
- GET `/api/players` - Obtener todos los jugadores
- POST `/api/players` - Crear jugador
- PUT `/api/players/:id` - Actualizar jugador
- DELETE `/api/players/:id` - Borrar jugador

### Partidos
- GET `/api/matches` - Obtener todos los partidos
- POST `/api/matches` - Crear partido
- PUT `/api/matches/:id` - Actualizar partido
- DELETE `/api/matches/:id` - Borrar partido

