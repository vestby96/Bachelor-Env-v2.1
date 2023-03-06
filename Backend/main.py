# imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import mysql.connector
import json

# fastapi app
app = FastAPI()

# control access origin http
origins = [
    'http://192.168.0.40:8080',
    'http://localhost:8080',
    'http://127.0.0.1:5500'
]
# origins can access these methods
methods = [
    'return_customer()',
    'return_customer_process()'
]
# adding the control parameters to the api app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=methods,
    allow_headers=["*"],
)

# returns a list of processes to the given customer
def get_list_from_db_customer(customer_name: str):
    # mysql connection
    mydb = mysql.connector.connect(
        host="mysqldb-filt",
        user="root",
        password="Password-123",
        database=customer_name
    )
    cursor = mydb.cursor()
    # selecting all content from the xml table
    cursor.execute(f"SELECT content FROM xml")
    # storing the result from db in variable
    xml_list = cursor.fetchall()
    cursor.close()
    # returning the variable
    return xml_list

# api for getting all processes for given customer
@app.get('/{customer_name}/')
def return_customer(customer_name: str):
    try:
        json_list = get_list_from_db_customer(customer_name)
        process_list = []
        for item in json_list:
            # converting each item in 
            process_list.append(json.loads(item[0]))
        return JSONResponse(process_list)
    except:
        return JSONResponse({'error' : 'No customer found'})

@app.get('/{customer_name}/{process_name}/')
def return_customer_process(customer_name, process_name):
    try:
        json_list = get_list_from_db_customer(customer_name)
        return_process = []
        for item in json_list:
            process = json.loads(item[0])
            if process[0]['name'] == process_name:
                return_process = process
                return JSONResponse(return_process)
        return JSONResponse({'error' : 'No process found'})
    except:
        return JSONResponse({'error' : 'No customer found'})
