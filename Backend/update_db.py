import mysql.connector
import xml.etree.ElementTree as ET
import json
from datetime import date

def pull_from_db_sens(customer_name):
    # connect to sensitive db files
    mydb = mysql.connector.connect(
        host="mysqldb-sens",
        user="root",
        password="Password-123",
        database=customer_name
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
    
    process_file_info = {
        'name' : str(root.find('bpr:name', ns).text),
        'release_notes' : str(root.find('bpr:release-notes', ns).text),
        'created' : str(root.find('bpr:created', ns).text),
        'package_id' : str(root.find('bpr:package-id', ns).text),
        'package_name' : str(root.find('bpr:package-name', ns).text),
        'user_created_by' : str(root.find('bpr:user-created-by', ns).text),
    }
    
    # select the process elements
    for process in root.findall(".//proc:process", ns):
        # handeling the parent processes
        if process.get('id') is not None:
            process_dict = {
                'id' : process.get('id'),
                'name' : process.get('name'),
                'xmlns' : process.get('xmlns'),
                'child_process' : {}
            }
            parent_process_list.append(process_dict)
        # handling the child processes
        else:
            process_dict = {
                'name' : process.get('name'),
                'version' : process.get('version'),
                'bpversion' : process.get('bpversion'),
                'narrative' : process.get('narrative'),
                'byrefcollection' : process.get('byrefcollection'),
                'view' : {
                    'camerax' : int(),
                    'cameray' : int(),
                    'zoom' : int(),
                },
                'preconditions' : list(),
                'endpoint' : str(),
                'subsheet_list' : list(),
                'stage_list' : list()
            }
            
            # view
            view_element = process.find('proc:view', ns)
            if view_element is not None:
                camerax = view_element.find('proc:camerax', ns)
                cameray = view_element.find('proc:cameray', ns)
                zoom = view_element.find('proc:zoom', ns)
                if camerax is not None:
                    process_dict['view']['camerax'] = float(camerax.text)
                if cameray is not None:
                    process_dict['view']['cameray'] = float(cameray.text)
                if zoom is not None:
                    process_dict['view']['zoom'] = float(zoom.text)
            
            # preconditions
            preconditions = process.find('proc:preconditions', ns)
            if preconditions is not None:
                conditions = preconditions.findall('proc:condition', ns)
                for condition in conditions:
                    process_dict['preconditions'].append(condition.get('narrative'))
            
            # endpoint
            process_dict['endpoint'] = str(process.find('proc:endpoint', ns).get('narrative'))
            
            # select the subsheet elements
            for subsheet in process.findall('.//proc:subsheet', ns):
                subsheet_dict = {
                    'id' : subsheet.get('subsheetid'),
                    'type' : subsheet.get('type'),
                    'published' : subsheet.get('published'),
                    'name' : str(),
                    'view' : {
                        'camerax' : float(),
                        'cameray' : float(),
                        'zoom' : float(),
                    }
                }
                name = subsheet.find('proc:name', ns)
                if name is not None:
                    subsheet_dict['name'] = str(name.text)
                
                # view
                view_element = subsheet.find('proc:view', ns)
                if view_element is not None:
                    camerax = view_element.find('proc:camerax', ns)
                    cameray = view_element.find('proc:cameray', ns)
                    zoom = view_element.find('proc:zoom', ns)
                    if camerax is not None:
                        subsheet_dict['view']['camerax'] = float(camerax.text)
                    if cameray is not None:
                        subsheet_dict['view']['cameray'] = float(cameray.text)
                    if zoom is not None:
                        subsheet_dict['view']['zoom'] = float(zoom.text)
                
                process_dict['subsheet_list'].append(subsheet_dict)
                    
            # select the stage elements
            for stage in process.findall('.//proc:stage', ns):
                stage_dict = {
                    'id' : stage.get('stageid'),
                    'name' : stage.get('name'),
                    'type' : stage.get('type')
                }
                    
                # x, y, w, h
                display_element = stage.find('proc:display', ns)
                if display_element is not None:
                    x = display_element.get('x')
                    y = display_element.get('y')
                    try:
                        w = display_element.get('w')
                        h = display_element.get('h')
                    except:
                        w = 0
                        h = 0
                    stage_dict['x'] = x
                    stage_dict['y'] = y
                    stage_dict['w'] = w
                    stage_dict['h'] = h
                   
                # font
                font_element = stage.find('proc:font', ns)
                if font_element is not None:
                    stage_dict['font_color'] = '#' + str(font_element.get('color'))
                    stage_dict['font_size'] = font_element.get('size')
                   
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
                
                # outputs
                outputs_element = stage.find('proc:outputs', ns)
                if outputs_element is not None:
                    outputs = outputs_element.findall('proc:output', ns)
                    stage_dict['outputs'] = list()
                    for output in outputs:
                        output_obj = {
                            'type' : output.get('type'),
                            'name' : output.get('name'),
                            'friendlyname' : output.get('friendlyname'),
                            'stage' : output.get('stage')
                        }
                        stage_dict['outputs'].append(output_obj)

                # inputs
                inputs_element = stage.find('proc:inputs', ns)
                if inputs_element is not None:
                    inputs = inputs_element.findall('proc:input', ns)
                    stage_dict['inputs'] = list()
                    for input in inputs:
                        input_obj = {
                            'type' : input.get('type'),
                            'name' : input.get('name'),
                            'friendlyname' : input.get('friendlyname'),
                            'stage' : input.get('stage'),
                            'expr' : input.get('expr')
                        }
                        stage_dict['inputs'].append(input_obj)
                
                # decision expression
                decision_element = stage.find('proc:decision', ns)
                if decision_element is not None:
                    stage_dict['decision'] = decision_element.get('expression')
                
                # exception
                exception_element = stage.find('proc:exception', ns)
                if exception_element is not None:
                    stage_dict['exception']  = {
                        'localized' : exception_element.get('localized'),
                        'type' : exception_element.get('type'),
                        'detail' : exception_element.get('detail')
                    }
                
                # loginhibit
                loginhibit_element = stage.find('proc:loginhibit', ns)
                if loginhibit_element is not None:
                    stage_dict['loginhibit'] = loginhibit_element.get('onsuccess')
                
                # group id
                groupid_element = stage.find('proc:groupid', ns)
                if groupid_element is not None:
                    stage_dict['groupid'] = str(groupid_element.text)
                
                # loop type
                loop_type_element = stage.find('proc:looptype', ns)
                if loop_type_element is not None:
                    stage_dict['loop_type'] = str(loop_type_element.text)
                
                # loop data
                loop_data_element = stage.find('proc:loopdata', ns)
                if loop_data_element is not None:
                    stage_dict['loop_data'] = str(loop_data_element.text)
                
                # data type
                data_type_element = stage.find('proc:datatype', ns)
                if data_type_element is not None:
                    stage_dict['data_type'] = str(data_type_element.text)
                
                # private
                private_element = stage.find('proc:private', ns)
                if private_element is not None:
                    stage_dict['private'] = True
                else:
                    stage_dict['private'] = False
                
                # alwaysinit
                alwaysinit_element = stage.find('proc:alwaysinit', ns)
                if alwaysinit_element is not None:
                    stage_dict['alwaysinit'] = True
                else:
                    stage_dict['alwaysinit'] = False
                
                # collectioninfo
                collectioninfo_element = stage.find('proc:collectioninfo', ns)
                if collectioninfo_element is not None:
                    stage_dict['collectioninfo'] = {}
                    field = collectioninfo_element.find('proc:field', ns)
                    if field is not None:
                        stage_dict['collectioninfo']['field'] = {
                            'name' : field.get('name'),
                            'type' : field.get('type')
                        }

                # initialvalue
                initialvalue_element = stage.find('proc:initialvalue', ns)
                if initialvalue_element is not None:
                    row_elements = initialvalue_element.findall('proc:row', ns)
                    if len(row_elements) == 0:
                        stage_dict['initialvalue'] = str(initialvalue_element.text)
                    else:
                        stage_dict['initialvalue'] = list()
                        for row_element in row_elements:
                            field_element = row_element.find('proc:field', ns)
                            if field_element is not None:
                                field = {
                                    'name' : field_element.get('name'),
                                    'type' : field_element.get('type'),
                                    'value' : field_element.get('value')
                                }
                                stage_dict['initialvalue'].append(field)
                
                # resource
                resource_element = stage.find('proc:resource', ns)
                if resource_element is not None:
                    stage_dict['resource'] = {
                        'object' : resource_element.get('object'),
                        'action' : resource_element.get('action')
                    }
                
                # steps
                steps_element = stage.find('proc:steps', ns)
                if steps_element is not None:
                    calculation_elements = steps_element.findall('proc:calculation', ns)
                    stage_dict['steps'] = list()
                    for calculation_element in calculation_elements:
                        calculation = {
                            'expression' : calculation_element.get('expression'),
                            'stage' : calculation_element.get('stage')
                        }
                        stage_dict['steps'].append(calculation)
                
                process_dict['stage_list'].append(stage_dict)
                
            # finding the parent process
            for parent in parent_process_list:
                if parent['name'] == process.get('name'):
                    # saving the child process as a dict in the parent process dict
                    parent['child_process'] = process_dict
    
    parent_process_list.append(process_file_info)
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
    xml_list = pull_from_db_sens('customer')
    for item in xml_list:
        name = item[1]
        content = item[2]
        analyzed_list = analyze_and_filter(content)
        id = str(analyzed_list[0]['id'])
        json_list = json.dumps(analyzed_list)
        push_to_db_filt(id, name, json_list)

main()