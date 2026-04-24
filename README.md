# DigitalContentStreamer
A project prototype for our database class final

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

## Backend Environment Variables

- From root directory, enter `/backend` directory: `cd backend`
- Create a `.env` file with the following variables:

```
DB_HOST=localhost
DB_USER=<your_user>
DB_PASSWORD=<your_password>
DB_NAME=erfinder
DB_CONN_LIMIT=5
```

- Adjust the values to match your local MySQL setup
- File is required for backend to connect to the local database

## Database Setup

- In terminal, open MySQL command-line interface (CLI): `mysql -u <username> -p` (username is probably `root`), and enter password
- Create the database: `CREATE DATABASE IF NOT EXISTS erfinder;`
- Exit the MySQL CLI: `exit;`
- From root directory, enter `/backend` directory: `cd backend`
- Populate the database with seed DDL and dummy data: `python ./database/seed.py`
- Ensures your MySQL server is running and accessible with `.env` credentials
- Note: Any VSCode SQL extension is recommended to visualize tables

## Local Hosting

### Backend

- From root directory, enter `/backend` directory: `cd backend`
- Run local server: `uvicorn main:app --reload`

### Frontend

- From root directory, enter `/frontend` directory: `cd frontend`
- Run local instance: `npm run dev`
- Navigate to local instance at `http://localhost:3000`

### Git

- Push/Pull from root directory, not inside `/frontend` or `/backend`
- Pull before every session to receive the most recent changes (avoids merge conflicts)
- Push frequently and notify team when pushing (avoids merge conflicts)
