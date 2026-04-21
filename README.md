# Notes Manager

A production-style full-stack web application for managing notes built with Node.js, Express, PostgreSQL, and vanilla JavaScript.

## Features

- Create, read, and delete notes
- Pagination for notes list
- RESTful API
- Input validation
- Error handling
- Health check endpoint
- Docker containerization

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Frontend**: HTML, CSS, JavaScript
- **Containerization**: Docker

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Docker (optional)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd notes-manager
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Create a PostgreSQL database and run the setup script:

```bash
psql -U postgres -f database_setup.sql
```

### 4. Environment Configuration

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=notes_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
PORT=3000
NODE_ENV=development
```

### 5. Run the Application

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Docker Deployment

### Build and Run with Docker

```bash
# Build the image
docker build -t notes-manager .

# Run the container
docker run -p 3000:3000 --env-file .env notes-manager
```

### Using Docker Compose (Optional)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - db
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: notes_db
      POSTGRES_USER: notes_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Then run:

```bash
docker-compose up --build
```

## API Documentation

### Base URL
`http://localhost:3000/api`

### Endpoints

#### Create a Note
- **POST** `/notes`
- **Body**: `{ "title": "string", "content": "string" }`
- **Response**: Note object with id and timestamps

#### Get All Notes
- **GET** `/notes?page=1&limit=10`
- **Response**: Paginated list of notes

#### Get a Single Note
- **GET** `/notes/:id`
- **Response**: Single note object

#### Delete a Note
- **DELETE** `/notes/:id`
- **Response**: 204 No Content

#### Health Check
- **GET** `/health`
- **Response**: `{ "status": "OK", "message": "Notes Manager is running" }`

### Example API Usage

```bash
# Create a note
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"My Note","content":"This is my note content"}'

# Get all notes
curl http://localhost:3000/api/notes

# Get a specific note
curl http://localhost:3000/api/notes/1

# Delete a note
curl -X DELETE http://localhost:3000/api/notes/1
```

## Project Structure

```
notes-manager/
├── config/
│   └── database.js          # Database connection configuration
├── controllers/
│   └── noteController.js    # Note business logic
├── models/
│   └── Note.js              # Note data model
├── routes/
│   └── notes.js             # API routes
├── public/
│   ├── index.html           # Frontend HTML
│   ├── style.css            # Frontend styles
│   └── app.js               # Frontend JavaScript
├── server.js                # Main application file
├── package.json             # Dependencies and scripts
├── Dockerfile               # Docker configuration
├── .env.example             # Environment variables template
├── database_setup.sql       # Database schema
└── README.md                # This file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | notes_db |
| `DB_USER` | Database user | - |
| `DB_PASSWORD` | Database password | - |
| `PORT` | Application port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |

## Production Deployment

### Using PM2

Install PM2 globally:

```bash
npm install -g pm2
```

Start the application:

```bash
pm2 start server.js --name notes-manager
```

### Cloud Deployment (AWS EC2)

1. Launch an EC2 instance with Ubuntu
2. Install Node.js and PostgreSQL
3. Clone the repository
4. Set up environment variables
5. Run database setup
6. Start the application with PM2
7. Configure security groups for port 3000

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
