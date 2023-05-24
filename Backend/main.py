# imports
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import mysql.connector
import json
import re
import hashlib

def hash_passwd(passwd: str) -> str:
    return hashlib.sha256(passwd.encode('UTF-8')).hexdigest()

hashed_passwd = hash_passwd('gruppe-64')

# fastapi app
app = FastAPI()

# control access origin http
origins = [
    'http://localhost:8080', # frontend
    'http://localhost:5500', # VSC
    'http://127.0.0.1:5500', # VSC
]
# origins can access these methods
methods = [
    'GET',
]
# adding the control parameters to the api app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=methods,
    allow_headers=["*"],
)

# api for getting all processes for given customer
@app.get('/{customer_name}/')
def return_process_names(customer_name: str):
    # customer name pattern
    pat = re.compile('^[a-zæøåA-ZÆØÅ0-9-_]{1,50}$')
    # input validation
    if re.fullmatch(pat, customer_name) is None:
        raise HTTPException(status_code=403, detail='customer input invalid')
    else:
        try:
            process_short_list = []
            # mysql connection
            mydb = mysql.connector.connect(
                host="mysqldb-filt",
                user="root",
                password=hashed_passwd,
                database=customer_name,
            )
            cursor = mydb.cursor()
            # selecting all content from the xml table
            cursor.execute('SELECT processId, name FROM xml')
            # storing the result from db in variable
            db_list = cursor.fetchall()
            cursor.close()
            for item in db_list:
                process_obj = {
                    'id' : item[0],
                    'name' : item[1],
                }
                process_short_list.append(process_obj)
            # returning the variable
            return JSONResponse(process_short_list)
        except:
            # customer not found
            raise HTTPException(status_code=404, detail='customer not found')

#api for getting the full analyzed customer
@app.get('/{customer_name}/{process_id}')
def return_process(customer_name: str, process_id: str):
    # customer name pattern
    patCustomer = re.compile('^[a-zæøåA-ZÆØÅ0-9-_]{1,50}$')
    # process id pattern
    patProcess = re.compile('^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$')
    # input validation
    if re.fullmatch(patCustomer, customer_name) is None:
        raise HTTPException(status_code=403, detail='customer input invalid')
    elif re.fullmatch(patProcess, process_id) is None:
        raise HTTPException(status_code=403, detail='process input invalid')
    else:
        try:
        # mysql connection
            mydb = mysql.connector.connect(
                host='mysqldb-filt',
                user='root',
                password=hashed_passwd,
                database=customer_name,
            )
            cursor = mydb.cursor()
            # selecting all content from the xml table
            cursor.execute(f'SELECT content FROM xml WHERE processId = "{process_id}"')
            # storing the result from db in variable
            content = cursor.fetchone()
            cursor.close()
            # parsing the response
            content = json.loads(content[0])
            # returning the process list
            return JSONResponse(content)
        except:
            # process not found
            raise HTTPException(status_code=404, detail='process not found')
