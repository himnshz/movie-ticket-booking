<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b8f20d7b-311f-4f69-b64b-a4a6a868b311

## Run Locally

**Prerequisites:**  Node.js, MySQL

### 1. Install dependencies
```bash
npm install
```

### 2. Database Setup
1. Open your MySQL client (Workbench, CLI, etc.).
2. Create the database:
   ```sql
   CREATE DATABASE cinepass;
   ```
3. Run the schema file to create tables:
   - File: `database/cinepass_schema.sql`
4. Populate sample data:
   - File: `database/cinepass_seed.sql`

### 3. Environment Configuration
Check the `.env` file in the root directory and update your MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cinepass
API_PORT=3001
```

### 4. Run the Application

You can run both the frontend and backend simultaneously using:
```bash
npm run dev:full
```

Alternatively, run them in separate terminals:

**Run Backend Server:**
```bash
npm run server
```

**Run Frontend (Vite):**
```bash
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
