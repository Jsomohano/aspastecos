# ⚡ Instrucciones Rápidas - Fútbol 7 Stats

## 🏃 Para Empezar Rápido (Local)

### 1. Backend
```bash
cd futbol7-backend
npm install
# Crear archivo .env con: MONGODB_URI=mongodb://localhost:27017/futbol7
npm run dev
```

### 2. Frontend
```bash
cd futbol7-frontend
npm install
# Crear archivo .env.local con: VITE_API_URL=http://localhost:5000/api
npm run dev
```

### 3. Abre tu navegador
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 🌐 Para Desplegar en Internet

Lee el archivo `DESPLIEGUE.md` para instrucciones completas.

### Resumen:
1. Sube tu código a GitHub
2. Despliega backend en Render.com
3. Despliega frontend en Vercel.com
4. Usa MongoDB Atlas para la base de datos

## 📝 Notas Importantes

- Los datos se guardan en MongoDB (en la nube cuando despliegues)
- El frontend se comunica con el backend mediante API REST
- Puedes usar la app en local sin desplegar
- Para que tus amigos la vean, debes desplegarla en la nube

## 🆘 Problemas Comunes

**Error: Cannot connect to backend**
- Verifica que el backend esté corriendo
- Verifica que la URL en .env.local sea correcta

**Error: MongoDB connection failed**
- Si usas local: instala MongoDB localmente
- Si despliegas: usa MongoDB Atlas

**Error en el build**
- Ejecuta `npm install` de nuevo
- Verifica que todas las dependencias estén instaladas

