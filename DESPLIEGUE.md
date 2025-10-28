# 🚀 Guía de Despliegue - Fútbol 7 Stats

Esta guía te ayudará a desplegar tu aplicación en la nube para que tus amigos puedan verla.

## 📋 Pre-requisitos

1. Cuenta en GitHub
2. Cuenta en Vercel (gratuita)
3. Cuenta en Render (gratuita)
4. Cuenta en MongoDB Atlas (gratuita)

## 🗄️ Paso 1: Configurar MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo cluster (elige la opción gratuita M0)
4. Espera a que el cluster se cree (2-3 minutos)
5. Ve a "Database Access" y crea un usuario de base de datos
6. Ve a "Network Access" y agrega tu IP (0.0.0.0/0 para permitir todo)
7. Ve a "Database" → "Connect" → "Connect your application"
8. Copia la URI de conexión (algo como: `mongodb+srv://...`)

## 💾 Paso 2: Subir Código a GitHub

1. Abre Git Bash o Terminal en la carpeta del proyecto
2. Ejecuta estos comandos:

```bash
git init
git add .
git commit -m "Initial commit - Fútbol 7 Stats"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/futbol7-stats.git
git push -u origin main
```

Nota: Crea el repositorio en GitHub primero.

## 🔧 Paso 3: Desplegar Backend en Render

1. Ve a [Render](https://render.com) y crea una cuenta
2. Haz clic en "New" → "Web Service"
3. Conecta con tu repositorio de GitHub
4. Configura el servicio:
   - **Name**: `futbol7-backend`
   - **Region**: Elige el más cercano
   - **Branch**: `main`
   - **Root Directory**: `futbol7-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Agrega las variables de entorno:
   - **PORT**: `10000` (o el que Render asigne)
   - **MONGODB_URI**: La URI que copiaste de MongoDB Atlas

6. Haz clic en "Create Web Service"
7. Espera a que se despliegue (2-3 minutos)
8. Copia la URL del servicio (ej: `https://futbol7-backend.onrender.com`)

## 🎨 Paso 4: Desplegar Frontend en Vercel

1. Ve a [Vercel](https://vercel.com) y crea una cuenta
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub
4. Configura el proyecto:
   - **Framework Preset**: Vite
   - **Root Directory**: `futbol7-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Agrega la variable de entorno:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://TU-BACKEND.onrender.com/api`
     (reemplaza con la URL de tu backend de Render)

6. Haz clic en "Deploy"
7. Espera a que se despliegue (1-2 minutos)
8. ¡Listo! Tu aplicación está en línea

## ✅ Paso 5: Verificar

1. Abre la URL que te dio Vercel
2. Prueba agregar un jugador
3. Prueba agregar un partido
4. Verifica que los datos se guarden correctamente

## 🔄 Actualizar la Aplicación

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

Render y Vercel se actualizarán automáticamente.

## 🐛 Solución de Problemas

### El frontend no puede conectar con el backend
- Verifica que la variable `VITE_API_URL` esté configurada en Vercel
- Asegúrate de que el backend esté funcionando en Render
- Verifica los logs en Render para ver si hay errores

### Error de MongoDB
- Verifica que la URI de MongoDB sea correcta
- Asegúrate de que tu IP esté permitida en Network Access
- Verifica que el usuario de la base de datos tenga permisos

### Build falla en Vercel
- Revisa los logs en Vercel
- Asegúrate de que todas las dependencias estén en package.json
- Verifica que no haya errores de TypeScript

## 💡 Tips

- Render puede tardar 1-2 minutos en "levantar" el backend si no se usa (free tier)
- MongoDB Atlas tiene un límite de 512MB en el plan gratuito
- Vercel tiene generosas funcionalidades en el plan gratuito
- Puedes agregar un dominio personalizado en ambos servicios

## 📞 Ayuda

Si tienes problemas, revisa:
- Los logs en Render y Vercel
- La consola del navegador (F12)
- La documentación de cada servicio

