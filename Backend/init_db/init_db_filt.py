import mysql.connector
import hashlib

def hash_passwd(passwd: str) -> str:
    return hashlib.sha256(passwd.encode('UTF-8')).hexdigest()

hashed_passwd = hash_passwd('gruppe-64')

def init_db_filt():
    # mysql connection
    mydb = mysql.connector.connect(
        host="mysqldb-filt",
        user="root",
        password=hashed_passwd,
    )
    
    # rebuild the database
    cursor = mydb.cursor()
    cursor.execute("DROP DATABASE IF EXISTS customer")
    cursor.execute("CREATE DATABASE customer")
    cursor.close()
    
    # database connection
    mydb = mysql.connector.connect(
        host="mysqldb-filt",
        user="root",
        password=hashed_passwd,
        database="customer"
    )
    
    # rebuild the table and instert the test process
    cursor = mydb.cursor()
    cursor.execute("DROP TABLE IF EXISTS xml")
    cursor.execute("CREATE TABLE xml (id INT AUTO_INCREMENT PRIMARY KEY, processId VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, content LONGTEXT NOT NULL)")
    cursor.close()
    
    print('db-filt initalized')
    
if __name__ == '__main__':
    init_db_filt()