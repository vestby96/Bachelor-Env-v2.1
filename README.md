To start the application
- Start the docker compose through the commandline.
    - $docker-compose up --build -d
- After startup the databases need to be initialized
- In the container called python-server, run the following commands
    - $python /code/init_db/init_db_sens.py
    - $python /code/init_db/init_db_filt.py
- Now the databases are initialized, but the db_filt does not contain any data
- To add data to db_filt, the analyzer has to be ran
    - $python /code/update_db.py

Now the app is running with the example XML-files, we created during development
Frontend on port 8080, and backend on port 8000
