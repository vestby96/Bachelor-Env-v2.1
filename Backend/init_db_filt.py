import mysql.connector

def init_db_filt():
    # mysql connection
    mydb = mysql.connector.connect(
        host="mysqldb-filt",
        user="root",
        password="Password-123"
    )
    
    # rebuild the database
    cursor = mydb.cursor()
    cursor.execute("DROP DATABASE IF EXISTS files")
    cursor.execute("CREATE DATABASE files")
    cursor.close()
    
    # database connection
    mydb = mysql.connector.connect(
        host="mysqldb-filt",
        user="root",
        password="Password-123",
        database="files"
    )
    
    # rebuild the table and instert the test process
    cursor = mydb.cursor()
    cursor.execute("DROP TABLE IF EXISTS xml")
    cursor.execute("CREATE TABLE xml (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, content LONGTEXT NOT NULL)")
    cursor.close()
    
    print('db-filt initalized')
    
init_db_filt()