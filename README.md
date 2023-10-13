# VectorMapExercise
A map application where a user can draw Points on the map, label said points and move them around. Users can see points drawn by other users but cannot interact with them.

This exercise was used to learn about various technologies. A small write-up about the learnings can be found [HERE](docs/LearningGoals.md).

# Running the project

## Build and deploying

#### Requirements
- Node.js  
- Docker  

### Backend
Make a copy of the .env.Example file in the root of the project and name it ".env".
If you're using a different Postgres instance to run the application that isn't defined in the docker-compose.yml, make sure the following variables are correct: 
- POSTGRES_USER
- POSTGRES_PASSWORD
- DB_NAME
- DB_HOST
- DB_PORT  

Note: If you are running both the Postgres and Django in docker, set DB_HOST to 'db'.

POSTGRES_USER and POSTGRES_PASSWORD also set the primary login credentials to the postgres instance defined in the docker-compose.

Variables DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_PASSWORD, DJANGO_SUPERUSER_EMAIL should be named as desired and these will serve as the login details for the initial superuser with access to the admin page.

Launching the backend can then be done with a few commands:
```bash
#Run this if you haven't configured a separate database
docker-compose up -d db

docker-compose up -d backend
```

The Django application will automatically run database migrations to the database and create the superuser on start up.
The Admin page will be available at http://localhost:8000/admin.

### Frontend
Navigate to the frontend folder and create a copy of the .env.Example file and name it ".env". If you are running both backend and nginx from the docker-compose, set VITE_use_reverse_proxy_backend to true. If you have deployed the backend to a separate server, change the VITE_api_host and VITE_api_port to match the host. VITE_api_port can be deleted if there's no need for it. If you want to use a Vector Tile Server for the background map, set VITE_use_vector to true and set the VITE_vector_api_key to the api key you get from https://developers.nextzen.org/. After the .env file has been set up, you can run
```bash
npm install
npm run build
```
After vite has finished building the frontend bundle, you can return to the root folder to run 
```bash
docker-container up -d web
```
to launch the Nginx container. The application will be available at http://localhost:8080.

## Running with hot reload

#### Requirements
- Node.js    
- Python

### 

You can run the Django and Frontend applications with hot reload without Docker. The frontend can be started on http://localhost:5173 by running the following command inside frontend/
```bash
npm install
npm run start
```
For the Django application you will need Python installed on your machine. Navigate to backend/ and run 
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser [optionally add --noinput to use values from .env]
python manage.py runserver
```
