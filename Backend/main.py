# imports
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import mysql.connector
import json

# fastapi app
app = FastAPI()
process_list = []

# allow comms from localhost port 8080
@app.middleware("http")
async def add_cors_header(request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:8080"
    return response

@app.get('/')
def get_list_from_db():
    # mysql connection
    mydb = mysql.connector.connect(
        host="mysqldb-filt",
        user="root",
        password="Password-123",
        database="files"
    )
    cursor = mydb.cursor()
    cursor.execute(f"SELECT content FROM xml")

    xml_list = cursor.fetchall()
    cursor.close()

    return xml_list

@app.get('/api/data/{process_name}/')
def main(process_name: str):
    xml_list = get_list_from_db()
    for item in xml_list:
        process_list.append(json.loads(item[0]))
    for item in process_list:
        if item[0]['name'] == process_name:
            return JSONResponse(item)

