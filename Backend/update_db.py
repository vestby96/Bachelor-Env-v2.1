import mysql.connector
import xml.etree.ElementTree as ET
import json
from datetime import date

def pull_from_db_sens():
    # connect to sensitive db files
    mydb = mysql.connector.connect(
        host="mysqldb-sens",
        user="root",
        password="Password-123",
        database="customer"
    )
    cursor = mydb.cursor()
    # selecting all rows and columns from the xml-table
    cursor.execute(f"SELECT * FROM xml")
    # storing the rows as a python list
    xml_list = cursor.fetchall()
    cursor.close()
    
    # printing and return the list fetched from xml-table
    print(' Fetched items from db-sens:')
    for fetched in xml_list:
        print('     ' + fetched[1])
    return xml_list

def analyze_and_filter(xml_string: str):
    # parse xml file
    root = ET.fromstring(xml_string)
        
    # namespace
    ns = {'bpr': 'http://www.blueprism.co.uk/product/release',
        'proc': 'http://www.blueprism.co.uk/product/process'}
     
    # return list with all info
    parent_process_list = []
    
    # select the process elements
    for process in root.findall(".//proc:process", ns):
        # handeling the parent processes
        if process.get('id') is not None:
            process_dict = {
                'id' : process.get('id'),
                'name' : process.get('name'),
                'child_process' : {}
            }
            parent_process_list.append(process_dict)
        # handling the child processes
        else:
            process_dict = {
                'name' : process.get('name'),
                'subsheet_list' : list(),
                'stage_list' : list()
            }
               
            # select the subsheet elements
            for subsheet in process.findall('.//proc:subsheet', ns):
                subsheet_dict = {
                    'id' : str(subsheet.get('subsheetid')),
                    'type' : str(subsheet.get('type')),
                    'published' : subsheet.get('published')
                }
                name = subsheet.find('proc:name', ns)
                if name is not None:
                    subsheet_dict['name'] = str(name.text)
                
                process_dict['subsheet_list'].append(subsheet_dict)
                    
            # select the stage elements
            for stage in process.findall('.//proc:stage', ns):
                stage_dict = {
                    'id' : str(stage.get('stageid')),
                    'name' : str(stage.get('name')),
                    'type' : str(stage.get('type'))
                }
                    
                # x, y, w, h
                display_element = stage.find('proc:display', ns)
                if display_element is not None:
                    x = str(display_element.get('x'))
                    y = str(display_element.get('y'))
                    try:
                        w = str(display_element.get('w'))
                        h = str(display_element.get('h'))
                    except:
                        w = str(0)
                        h = str(0)
                    stage_dict['x'] = x
                    stage_dict['y'] = y
                    stage_dict['w'] = w
                    stage_dict['h'] = h
                   
                # font
                font_element = stage.find('proc:font', ns)
                if font_element is not None:
                    font_color = '#' + str(font_element.attrib['color'])
                    font_size = str(font_element.attrib['size'])
                    stage_dict['font_color'] = font_color
                    stage_dict['font_size'] = font_size
                   
                # onsuccess
                onsuccess_element = stage.find('proc:onsuccess', ns)
                if onsuccess_element is not None:
                    onsuccess = str(onsuccess_element.text)
                    stage_dict['onsuccess'] = onsuccess
                    
                # narrative
                narrative_element = stage.find('proc:narrative', ns)
                if narrative_element is not None:
                    narrative = str(narrative_element.text)
                    stage_dict['narrative'] = narrative
                    
                # subsheet id
                subsheet_id_element = stage.find('proc:subsheetid', ns)
                if subsheet_id_element is not None:
                    subsheet_id = str(subsheet_id_element.text)
                    stage_dict['subsheet_id'] = subsheet_id
                    
                # process id
                process_id_element = stage.find('proc:processid', ns)
                if process_id_element is not None:
                    process_id = str(process_id_element.text)
                    stage_dict['process_id'] = process_id
                
                # ontrue id
                ontrue_element = stage.find('proc:ontrue', ns)
                if ontrue_element is not None:
                    ontrue = str(ontrue_element.text)
                    stage_dict['ontrue'] = ontrue
                
                # onfalse id
                onfalse_element = stage.find('proc:onfalse', ns)
                if onfalse_element is not None:
                    onfalse = str(onfalse_element.text)
                    stage_dict['onfalse'] = onfalse
                        
                process_dict['stage_list'].append(stage_dict)
                
            # finding the parent process
            for parent in parent_process_list:
                if parent['name'] == process.get('name'):
                    # saving the child process as a dict in the parent process dict
                    parent['child_process'] = process_dict
    
    print('- Analyzed: ' + str(parent_process_list[0]['name']))
    return parent_process_list

def reset_db_filt():
    # mysql connection
    mydb = mysql.connector.connect(
        host="mysqldb-filt",
        user="root",
        password="Password-123"
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
        password="Password-123",
        database="customer"
    )
    
    # rebuild the table and instert the test process
    cursor = mydb.cursor()
    cursor.execute("DROP TABLE IF EXISTS xml")
    cursor.execute("CREATE TABLE xml (id INT AUTO_INCREMENT PRIMARY KEY, processId VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, content LONGTEXT NOT NULL)")
    cursor.close()
    print('DB filt is reset')

def push_to_db_filt(id: str, name: str, content: str):
    # connect to filtered db files
    mydb = mysql.connector.connect(
        host="mysqldb-filt",
        user="root",
        password="Password-123",
        database="customer"
    )
    cursor = mydb.cursor()
    # sql string with arguments
    sql = "INSERT INTO xml (processId, name, content) VALUES (%s, %s, %s)"
    name = name.lower()
    args = (id, name, content)
    cursor.execute(sql, args)
    # commit the commands
    mydb.commit()
    cursor.close()
    print('- Inserted into db-filt: ' + name)

def main():
    # printing the time and date
    today = date.today()
    print("Today's date:", today)
    reset_db_filt()
    xml_list = pull_from_db_sens()
    for item in xml_list:
        name = item[1]
        content = item[2]
        analyzed_list = analyze_and_filter(content)
        id = str(analyzed_list[0]['id'])
        json_list = json.dumps(analyzed_list)
        push_to_db_filt(id, name, json_list)

main()