# DigitalContentStreamer

Database class project prototype for a content-streaming platform.

## Stack

- Frontend: Next.js App Router, React 19, TypeScript, Tailwind CSS 4
- Backend: FastAPI, Uvicorn, `mysql-connector-python`
- Database: MySQL with seed SQL and stored procedures

## Project Layout

- `frontend/`: Next.js client app
- `backend/`: FastAPI app, MySQL connection helpers, and database seed scripts
- `backend/database/mysql/seed/`: schema, sample data, and stored procedure SQL

## Package Installation

### Frontend

- From root directory, enter `/frontend` directory: `cd frontend`
- Install frontend packages: `npm install`

### Backend

- From root directory, enter `/backend` directory: `cd backend`
- Create a virtual environment: `python -m venv .venv`
- Activate the virtual environment:
  - Windows terminal: `venv/Scripts/activate` (`deactivate` to deactivate)
  - Bash: `source venv/Scripts/activate` (`deactivate` to deactivate)
- Install backend packages: `pip install -r requirements.txt`

## Run Locally

### Database

1. Make sure your local MySQL server is running and your login works in MySQL Workbench or `mysql -u root -p` in a shell.
2. From `backend/`, run `python .\database\seed.py`.
3. That script drops and recreates the database, loads the schema, inserts sample data, and creates stored procedures.

The seed SQL already includes `DROP DATABASE IF EXISTS`, `CREATE DATABASE`, and `USE`, so you do not need to create the database manually first.

### Backend

1. Start the API with `uvicorn main:app --reload`.
2. The app listens on `http://localhost:8000` by default.

The backend expects a `backend/.env` file with your local MySQL instance settings:

```env
DB_HOST=localhost
DB_USER=<your_user> -- likely 'root'
DB_PASSWORD=<your_password>
DB_NAME=digitalcontentstreamer
DB_CONN_LIMIT=5
```

### Frontend

1. From `frontend/`, run `npm run dev`.
2. Open `http://localhost:3000`.
3. The login page lives at `http://localhost:3000/login` and uses the mock accounts `user / userpw`, `creator / creatorpw`, and `admin / adminpw`.

### Git

- Push/Pull from root directory, not inside `/frontend` or `/backend`
- Pull before every session to receive the most recent changes (avoids merge conflicts)
- Push frequently and notify team when pushing (avoids merge conflicts)