import mysql.connector
import xml.etree.ElementTree as ET

def db_init(name, content):
    # mysql connection
    mydb = mysql.connector.connect(
        host="mysqldb",
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
        host="mysqldb",
        user="root",
        password="Password-123",
        database="files"
    )
    
    # rebuild the table and instert the test process
    cursor = mydb.cursor()
    cursor.execute("DROP TABLE IF EXISTS xml")
    cursor.execute("CREATE TABLE xml (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, content LONGTEXT NOT NULL)")
    sql = "INSERT INTO xml (name, content) VALUES (%s, %s)"
    args = (name, content)
    cursor.execute(sql, args)
    mydb.commit()
    
    print(cursor.rowcount, "was inserted.")
    cursor.close()

    return f"{cursor.rowcount}, was inserted."

# reading the xml file and commiting it to the database
f = open("/code/Test-Process-Release2815.xml", "r")
xml_string = f.read()
db_init('test_process', xml_string)


