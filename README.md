# WorkHub v2.0

Dashboard profesional para centralizar enlaces y herramientas de trabajo de tu equipo.

## 🚀 Características

- ✅ Login seguro con sesiones
- ✅ Dashboard moderno con tarjetas
- ✅ Categorías organizadas
- ✅ Favoritos destacados
- ✅ Panel de administración completo (CRUD)
- ✅ Búsqueda en tiempo real
- ✅ Diseño responsive (móvil + escritorio)
- ✅ Despliegue fácil en Render

## 🛠️ Tecnologías

- Node.js + Express
- EJS (plantillas)
- better-sqlite3 (base de datos local)
- CSS moderno + Font Awesome

## 📦 Despliegue en Render

1. Sube esta carpeta a un repositorio de GitHub
2. En Render crea un **Web Service**
3. Conecta el repositorio
4. Render detectará automáticamente `render.yaml`
5. ¡Listo!

**Usuario por defecto:**
- Usuario: `admin`
- Contraseña: `admin123`

**Importante:** Cambia la contraseña después del primer login.

## 📁 Estructura

```
workhub-v2/
├── server.js
├── routes/
│   ├── auth.js
│   ├── dashboard.js
│   └── admin.js
├── views/
│   ├── login.ejs
│   ├── dashboard.ejs
│   ├── layout.ejs
│   └── admin/
│       └── index.ejs
├── public/
│   ├── css/style.css
│   └── js/main.js
├── data/          (se crea automáticamente)
└── render.yaml
```

## 🔧 Desarrollo local

```bash
npm install
npm start
```

Abre http://localhost:3000

---

Creado para tu equipo de trabajo. ¡Personalízalo a tu gusto!