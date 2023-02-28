# imports
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import mysql.connector
import xml.etree.ElementTree as ET
#import pyperclip

# fastapi app
app = FastAPI()

# allow comms from localhost port 8080
@app.middleware("http")
async def add_cors_header(request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:8080"
    return response

@app.get('/test')
def get_xml(process_name):
    mydb = mysql.connector.connect(
        host="mysqldb",
        user="root",
        password="Password-123",
        database="files"
    )
    cursor = mydb.cursor()
    cursor.execute(f"SELECT content FROM xml WHERE name = '{process_name}'")

    xml_string = cursor.fetchone()[0]
    #pyperclip.copy(xml_string)
    
    cursor.close()

    return xml_string
    
@app.get('/api/data')
def main():
    # parse xml file
    xml_string = get_xml('test_process')
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
                    
                process_dict['stage_list'].append(stage_dict)
            
            # finding the parent process
            for parent in parent_process_list:
                if parent['name'] == process.get('name'):
                # saving the child process as a dict in the parent process dict
                    parent['child_process'] = process_dict

    return JSONResponse(content=parent_process_list)

