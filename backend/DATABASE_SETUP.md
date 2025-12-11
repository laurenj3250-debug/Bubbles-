# 🗄️ Database Configuration Guide

The Bubbles backend supports **two database options**:
- **SQLite** for local development (no installation required)
- **PostgreSQL** for Railway/production deployment

The app **automatically detects** which database to use based on your `.env` configuration.

---

## 📦 SQLite (Local Development - Default)

### When to use:
- ✅ Local development on your machine
- ✅ No PostgreSQL installation needed
- ✅ Quick setup and testing
- ✅ Works offline

### How to use:
1. Make sure `DATABASE_URL` is **NOT set** in your `.env` file (or comment it out)
2. Run migrations: `npm run migrate`
3. Start the server: `npm run dev`

The database file will be created at `backend/bubbles.db`

### Example `.env`:
```env
# DATABASE_URL not set = SQLite will be used
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
```

---

## 🚂 PostgreSQL (Railway/Production)

### When to use:
- ✅ Deploying to Railway
- ✅ Production environment
- ✅ Sharing database between team members
- ✅ Need advanced PostgreSQL features

### How to use:

#### Option A: Railway (Recommended for Production)
1. Create a Railway account at https://railway.app
2. Create a new project
3. Add a PostgreSQL database:
   - Click "New" → "Database" → "PostgreSQL"
4. Copy the connection string from Railway dashboard
5. Add it to your `.env` file:
   ```env
   DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
   ```
6. Run migrations: `npm run migrate`
7. Start the server: `npm run dev`

#### Option B: Local PostgreSQL
1. Install PostgreSQL on your machine
2. Create a database named `bubbles`
3. Set `DATABASE_URL` in your `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/bubbles
   ```
4. Run migrations: `npm run migrate`
5. Start the server: `npm run dev`

---

## 🔄 Switching Between Databases

The app automatically detects which database to use:

```javascript
// If DATABASE_URL starts with 'postgres' → Use PostgreSQL
// Otherwise → Use SQLite
```

To switch:
1. **To SQLite**: Comment out or remove `DATABASE_URL` from `.env`
2. **To PostgreSQL**: Set `DATABASE_URL` to your PostgreSQL connection string

---

## 🧪 Testing Your Database Connection

After setting up, test the connection:

1. **Start the server**: `npm run dev`
2. **Check the console output**:
   - SQLite: `🗄️ Using SQLite database (local development)`
   - PostgreSQL: `🐘 Using PostgreSQL database`
3. **Visit**: http://localhost:3000/health
   - Should show: `{"status":"healthy","database":"connected"}`

---

## 📊 Admin Panel

Access the database admin panel at:
**http://localhost:3000/admin.html**

Default password: `admin123`

The admin panel works with both SQLite and PostgreSQL.

---

## 🚀 Deployment to Railway

When deploying to Railway:
1. Railway automatically provides `DATABASE_URL` environment variable
2. No changes needed - the app will automatically use PostgreSQL
3. Run migrations after first deploy: `railway run npm run migrate`

---

## 💡 Recommendations

- **Use SQLite** for local development and testing
- **Use Railway PostgreSQL** for production deployment
- Keep `.env` file out of version control (it's in `.gitignore`)
- Share the Railway connection string with your team for collaboration

---

## 📝 Notes

- SQLite and PostgreSQL have slightly different SQL syntax
- The migration script handles both automatically
- Data formats are compatible for most operations
- For production, always use PostgreSQL for better performance and scalability
