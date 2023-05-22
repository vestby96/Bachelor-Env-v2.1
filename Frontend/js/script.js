// Global variables
var scale, global_path, process_short_list, process_root, ip, port, customer, hoverTimeout;
global_path = [{'id': '0', 'name' : 'Main Page'}];
scale = 1;
ip = 'localhost';
port = '8000';
customer = 'customer';

// Run initial functions
$(document).ready(() => {
  build_left_process();
  path_scroll();
  detect_drag();

  // Recalculate the horizontal scroll on resize
  $(window).resize(() => {
    path_scroll();
  });
});

// Get the short list of process data
function get_short_list() {
  return new Promise(function(resolve, reject) {
    // Make an AJAX GET request to retrieve the short list of process data
    $.ajax({
      type: 'GET',
      url: 'http://' + ip + ':' + port + '/' + customer + '/',
      dataType: 'json',
      success: function(data) {
        // Store the retrieved data in the process_short_list variable
        process_short_list = data;
        // Resolve the promise with the retrieved data
        resolve(data);
      },
      error: function(e) {
        // Reject the promise with the encountered error
        reject(e);
      }
    });
  });
};

// Get the full info list of a given process
function get_full_process_list(process_id) {
  return new Promise(function(resolve, reject) {
    // Make an AJAX GET request to retrieve the full info list of the given process
    $.ajax({
      type: 'GET',
      url: 'http://' + ip + ':' + port + '/' + customer + '/' + process_id,
      dataType: 'json',
      success: function(data) {
        // Resolve the promise with the retrieved data
        resolve(data);
      },
      error: function(e) {
        // Reject the promise with the encountered error
        reject(e);
      }
    });
  });
};

//------------------ Handle the processes -------------------

// Display the list of processes in the left element
async function build_left_process() {
  // Wait for the API response by using the "await" keyword
  await get_short_list();

  // Variables
  let processParent, title, div, button, icon, process, i;

  // Loop through the process_short_list array
  for (i = 0; i < process_short_list.length; i++) {
    process = process_short_list[i];

    // Create HTML elements dynamically using jQuery
    processParent = $('<div>'); // Create a <div> element for the process parent
    div = $('<div>'); // Create a <div> element
    title = $('<h3>'); // Create an <h3> element for the process title
    button = $('<div>'); // Create a <div> element for the dropdown button
    icon = $('<p>'); // Create a <p> element for the icon

    // Set attributes and content for the title element
    title.attr({
      'onkeypress': 'select_process("' + process.id + '")',
      'onclick': 'select_process("' + process.id + '")',
      'title': 'Display process',
      'tabindex': '0',
    }).append(process.name);

    // Set attributes and content for the button element
    button.attr({
      'class': 'dropdownButton',
      'onkeypress': 'toggle_dropdown_content("' + process.id + '")',
      'onclick': 'toggle_dropdown_content("' + process.id + '")',
      'title': 'List process content',
      'tabindex': '0',
    }).append(icon);

    // Set attributes and append child elements for the div element
    div.attr({
      'class': 'processTop',
    }).append(title, button);

    // Set attributes and append child elements for the processParent element
    processParent.attr({
      'class': 'processParent',
      'id': process.id,
    }).append(div);

    // Append the processParent element to the 'left' element in the HTML document
    $('#left').append(processParent);
  }
};

// Get full process
async function select_process(process_id, subsheet_id = ''){
  try {
      // wait for api response
      process_root = await get_full_process_list(process_id);

      console.log(process_root);

      // make the process 'selected' in the margin
      let processes, process;
      processes = $('.processParent');
      processes.removeClass('selected');
      process = $('#' + process_id);
      process.addClass('selected');

      if (subsheet_id == ''){
        // draw main page
        draw_main_page();
      } else {
        // draw subsheet
        draw_subsheet(subsheet_id);
      };

      // return success
      return('success');
  } catch {
    // return error
      return('error in selection of process');
  };
};

// Toggle between hide/show the subsheets of process
async function toggle_dropdown_content(process_id) {
  let parent, p, local_process;
  parent = $('#' + process_id);
  p = parent.find('.dropdownButton p');

  // Checking if the content is displayed
  if (!parent.hasClass('open')) {
    // Wait for the API response
    local_process = await get_full_process_list(process_id);

    // Variables
    let div, title, subsheet_list, subsheet, i;

    subsheet_list = local_process.process.subsheetlist;
    div = $('<div>');
    div.attr({
      'class': 'dropdownContent',
    }).hide();

    // Main page
    title = $('<h4>');
    title.attr({
      'onclick': 'empty_path();select_process("' + process_id + '")',
      'title': 'Main Page',
    }).append('Main Page');
    div.append(title);

    // Loop through subsheets
    for (i = 0; i < subsheet_list.length; i++) {
      subsheet = subsheet_list[i];
      title = $('<h4>');
      title.attr({
        'onclick': 'empty_path();select_process("' + process_id + '","' + subsheet.id + '")',
        'title': subsheet.name,
      }).append(subsheet.name);
      div.append(title);
    }

    parent.append(div);

    // Slide down the content
    p.css('transform', 'rotateZ(0deg)');
    parent.find('.dropdownContent').slideDown(200);
  } else {
    // Slide up the content
    p.css('transform', 'rotateZ(180deg)');
    parent.find('.dropdownContent').slideUp(200);

    // Wait for the animation to end before removing the content
    setTimeout(function() {
      parent.find('.dropdownContent').remove();
    }, 250);
  }

  // Toggle the class
  parent.toggleClass('open');
};

// This is a prototype, further testing required
function convert_to_image(str, element){
  try{
    let img = $('<img>');

    // denne må gjøres bedre slik at flere format fungerer
    let start = 'data:image/png;base64,';
    str = start + str;

    img.attr('src', str);
    element.append(img);

    return true;
  } catch {
    return false;
  };
};

//---------------------- SVG -----------------------
// Draw an SVG path from given start and end coordinates
function draw_line(x1, y1, x2, y2, arrow = true, id = null, onfalse = false) {
  let line, midX, midY;
  midX = (x1 + x2) / 2;
  midY = (y1 + y2) / 2;

  // Create an SVG path element using the createElementNS method
  line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  line.setAttribute('class', 'line');
  line.setAttribute('d', "M " + x1 + " " + y1 + " L " + midX + " " + midY + " L " + x2 + " " + y2);
  line.setAttribute('stroke', 'black');
  line.setAttribute('stroke-width', '1px');

  // Set attributes based on the provided arguments
  if (arrow === true) {
    line.setAttribute('marker-mid', 'url(#arrow)');
  }
  if (id !== null) {
    line.setAttribute('id', id);
  }
  if (onfalse === true) {
    line.setAttribute('stroke-dasharray', "5,5");
  }

  // Append the line to the SVG element in the document
  $('svg').append(line);

  // Return the line element
  return line;
};

// Draw lines for the choices
function draw_choice_lines() {
  let start, end, start_x, start_y, end_x, end_y, center_x, center_y;

  // Get the size of the SVG element
  center_x = $('svg').outerWidth() / 2;
  center_y = $('svg').outerHeight() / 2;

  // Iterate over each element with stage_type=Choice attribute
  $('[stage_type=Choice]').each((i, start_element) => {
    start = $(start_element);
    end = $('.stage').filter('[id=' + start.attr('ontrue') + ']');

    // Calculate the start and end coordinates relative to the SVG element
    start_x = start.position().left + start.outerWidth() / 2 + center_x;
    start_y = start.position().top + start.outerHeight() / 2 + center_y;
    end_x = end.position().left + end.outerWidth() / 2 + center_x;
    end_y = end.position().top + end.outerHeight() / 2 + center_y;

    // Call the draw_line function with the calculated coordinates
    draw_line(start_x, start_y, end_x, end_y);
  });
};

// Get the positions of all stages with onsucces and draw lines from start to end stage
function draw_all_lines(remove_all = false) {
  let svg, start, end, start_x, start_y, end_x, end_y, center_x, center_y;
  svg = $('svg');

  // Remove all lines if remove_all is true, otherwise remove only unnamed lines
  if (remove_all === true) {
    svg.find('path').filter('.line').remove();
  } else {
    svg.find('path').filter('.line').filter(':not([id])').remove();
  };

  // Get the size of the SVG element
  center_x = svg.outerWidth() / 2;
  center_y = svg.outerHeight() / 2;

  // Iterate over each stage element
  $('.stage').each((i, start_element) => {
    start = $(start_element);

    // Check if the stage has onsucces or ontrue or onfalse attribute
    if (
      start.attr('stage_type') !== 'ChoiceStart' &&
      (start.attr('onsuccess') !== undefined ||
        start.attr('ontrue') !== undefined ||
        start.attr('onfalse') !== undefined)
    ) {
      // Iterate over each stage element again to find the end stage
      $('.stage').each((j, end_element) => {
        end = $(end_element);

        // Check if the end stage ID matches the onsucces or ontrue or onfalse attribute of the start stage
        if (
          start.attr('onsuccess') === end.attr('id') ||
          start.attr('ontrue') === end.attr('id') ||
          start.attr('onfalse') === end.attr('id')
        ) {
          let onfalse =
            start.attr('onfalse') === end.attr('id') ? true : false;
          start_x =
            start.position().left +
            start.outerWidth() / 2 +
            center_x;
          start_y =
            start.position().top +
            start.outerHeight() / 2 +
            center_y;
          end_x =
            end.position().left +
            end.outerWidth() / 2 +
            center_x;
          end_y =
            end.position().top +
            end.outerHeight() / 2 +
            center_y;

          // Draw a line from the start stage to the end stage
          draw_line(start_x, start_y, end_x, end_y, true, null, onfalse);
        };
      });
    };

    // Handle choice start/end paths
    $('[stage_type=ChoiceStart]').each((i, start_element) => {
      start = $(start_element);
      end = $('[stage_type=ChoiceEnd]').filter(
        '[groupid=' + start.attr('groupid') + ']'
      );
      start_x =
        start.position().left +
        start.outerWidth() / 2 +
        center_x;
      start_y =
        start.position().top +
        start.outerHeight() / 2 +
        center_y;
      end_x =
        end.position().left +
        end.outerWidth() / 2 +
        center_x;
      end_y =
        end.position().top +
        end.outerHeight() / 2 +
        center_y;

      // Draw a line from the choice start stage to the choice end stage
      draw_line(start_x, start_y, end_x, end_y, false, start.attr('id'));
    });
  });
};

//---------------------- Draw Pages -----------------------

// Draw the main page sheet
function draw_main_page(){
    // Variables
    let stage_list, stage, i, choices;
    choices = {'items': new Array, 'ids': new Array};
    stage_list = process_root.process.stagelist;

    // Draw the initial path
    empty_path();
    draw_path();

    // Remove all elements in the display
    empty_page();
  
    // Draw stages
    for (i = 0; i < stage_list.length; i++) {
      stage = stage_list[i];
      if (stage.subsheetid === '') {
        // Switch to check the stage type
        switch(stage.type) {
          case 'Block':
            draw_block(stage, scale);
            break;
          case 'ChoiceStart':
            choices.ids.push(stage.id);
            choices.items.push(stage.choices);
            draw_stage(stage, scale);
            break;
          case 'ProcessInfo':
            draw_process_info(stage, scale);
            break;
          case 'SubSheetInfo':
            draw_subsheet_info(stage, scale);
            break;
          case 'Collection':
            draw_collection(stage, scale);
            break;
          default:
            draw_stage(stage, scale);
            break;
        };
      };
    };

    // Set page size
    resize_page();

    // Move items into view
    scroll_into_view();

    // Draw svg arrows
    draw_all_lines(true);

    // Draw choices, with svg arrows
    if (choices.ids.length > 0){
      for (i = 0; i < choices.ids.length; i++){
        draw_choices(choices.ids[i], choices.items[i], scale);
      };
    };

    // Initiate hover effect on all newly draw elements
    hover_effect();
};

// Draw the subsheet
function draw_subsheet(subsheet_id, path = true){
    // Variables
    let name, stage_list, stage, subsheet_list, i, choices;
    choices = {'items': new Array, 'ids': new Array};
    subsheet_list = process_root.process.subsheetlist;
    stage_list = process_root.process.stagelist;
  
    // Find the subsheet
    name = '';
    for (i = 0; i < subsheet_list.length; i++){
      if (subsheet_id == subsheet_list[i].id){
        name = subsheet_list[i].name;
      };
    };
  
    // Draw the path
    if (path === true){
      edit_path(subsheet_id, name,);
    }
  
    empty_page();
  
    // Draw stages
    for (i = 0; i < stage_list.length; i++) {
      stage = stage_list[i];

      // Skip the stage if subsheetids don't match
      if (stage.subsheetid !== subsheet_id) {
        continue;
      };

      switch(stage.type) {
        case 'Block':
          draw_block(stage, scale);
          break;
        case 'ChoiceStart':
          choices.ids.push(stage.id);
          choices.items.push(stage.choices);
          draw_stage(stage, scale);
          break;
        case 'ProcessInfo':
          draw_process_info(stage, scale);
          break;
        case 'SubSheetInfo':
          draw_subsheet_info(stage, scale);
          break;
        case 'Collection':
          draw_collection(stage, scale);
          break;
        default:
          draw_stage(stage, scale);
          break;
      };
    };
    
    resize_page();
    scroll_into_view();
    draw_all_lines(true);
    if (choices.ids.length > 0){
      for (i = 0; i < choices.ids.length; i++){
        draw_choices(choices.ids[i], choices.items[i], scale);
      };
    };
    hover_effect();
};

//---------------------- Draw Stages ----------------------

// Draw the default stage element
function draw_stage(stage, scale) {
  let element, p;
  element = $('<div>');

  p = $('<p>');
  if (stage.type === 'Anchor') {
    // No action for Anchor type
  } else if (stage.type === 'Note') {
    p.append(stage.narrative);
  } else {
    p.append(stage.name);
  };

  // Set attributes and CSS properties of the element
  element.attr({
    'class': 'stage',
    'id': stage.id,
    'onsuccess': stage.onsuccess,
    'ontrue': stage.ontrue,
    'onfalse': stage.onfalse,
    'groupid': stage.groupid,
    'stage_type': stage.type,
  }).css({
    'left': stage.x * scale,
    'top': stage.y * scale,
    'color': stage.fontcolor,
    'font-size': stage.fontsize * scale,
  }).append(p);

  // Adjust width and height if provided
  if (stage.w !== null && stage.h !== null) {
    element.css({
      'width': stage.w * scale,
      'height': stage.h * scale,
    });
  };

  // Add onclick event for SubSheet type
  if (stage.type === 'SubSheet') {
    element.attr('onclick', 'draw_subsheet("' + stage.processid + '")');
  } else if (stage.type === 'Data') {
    element.css({
      'width': element.outerWidth() * 0.8,
      'height': element.outerHeight() * 0.9,
    });
  };

  // Append the element to the display center
  $('#displayCenter').append(element);

  // Adjust width and height if not provided
  if (stage.w === null && stage.h === null) {
    element = $('#displayCenter').find('#' + stage.id);
    element.css({
      'width': element.outerWidth() * scale,
      'height': element.outerHeight() * scale,
    });
  };

  // Draw hover element for stages other than Anchor type
  if (stage.type !== 'Anchor') {
    draw_hover_element(stage);
  };
};

// Draw the choice elements
function draw_choices(id, choices, scale) {
  let i, path, point, element, center_x, center_y;
  path = document.getElementById(id);

  // Get the size of the SVG element
  center_x = $('svg').outerWidth() / 2;
  center_y = $('svg').outerHeight() / 2;

  // Check if the path exists
  if (path !== undefined) {
    // Iterate over each choice
    for (i = 0; i < choices.length; i++) {
      // Get the coordinates of the choice on the path
      point = {
        'x': path.getPointAtLength(choices[i].distance).x - center_x,
        'y': path.getPointAtLength(choices[i].distance).y - center_y,
      };

      // Create a new element for the choice
      element = $('<div>');
      element.attr({
        'name': choices[i].name,
        'id': id + choices[i].name,
        'class': 'stage',
        'ontrue': choices[i].ontrue,
        'stage_type': 'Choice',
        'title': 'Choice: ' + choices[i].name,
      }).css({
        'left': point.x,
        'top': point.y * scale,
      });

      // Append the choice element to the display center
      $('#displayCenter').append(element);
    };

    // Draw lines connecting the choices
    draw_choice_lines();
  } else {
    console.log('choice path not found');
  };
};

// Draw the subsheet info element
function draw_subsheet_info(stage, scale) {
  let element, p, i, subsheet;
  element = $('<div>');

  // Set attributes and CSS properties of the element
  element.attr({
    'class': 'stage',
    'id': stage.id,
    'onsuccess': stage.onsuccess,
    'stage_type': stage.type,
  }).css({
    'left': stage.x * scale,
    'top': stage.y * scale,
    'width': stage.w * scale,
    'height': stage.h * scale,
  });

  // Find the subsheet in the process root
  for (i = 0; i < process_root.process.subsheetlist.length; i++) {
    if (process_root.process.subsheetlist[i].id == stage.subsheetid) {
      subsheet = process_root.process.subsheetlist[i];
    };
  };

  // Create a <p> element to display the subsheet name
  p = $('<p>');
  p.css({
    'border-bottom': '1px solid black',
    'padding': '0 2px',
  }).append(subsheet.name);
  element.append(p);

  // Append the element to the display center
  $('#displayCenter').append(element);

  // Draw hover element for the stage
  draw_hover_element(stage);
};

// Draw the process info element
function draw_process_info(stage, scale){
    let element, p;
    element = $('<div>');
    element.attr({
      'class' : 'stage',
      'id' : stage.id,
      'onsuccess' : stage.onsuccess,
      'stage_type' : stage.type,
    }).css({
      'left' : stage.x * scale,
      'top' : stage.y * scale,
      'width' : stage.w * scale,
      'height' : stage.h * scale,
    });

    p = $('<p>');
    p.css({
      'border-bottom' : '1px solid black',
      'padding' : '0 2px',
    }).append(process_root.info.name);
    element.append(p);

    p = $('<p>');
    p.css({
      'padding' : '0 2px',
    }).append(process_root.process.narrative);
    element.append(p);

    p = $('<p>');
    p.css({
      'position' : 'absolute',
      'bottom' : '0',
      'left' : '0',
      'border-top' : '1px solid black',
      'padding' : '0 2px',
    }).append('Created: ' + process_root.info.usercreatedby + ', at ' + process_root.info.created);
    element.append(p);

    $('#displayCenter').append(element);
    draw_hover_element(stage);
};

// Draw the block stage element
function draw_block(stage, scale){
    let element, p;

    p = $('<p>');
    p.attr({
      'class' : 'blockLabel',
      'stage_type' : 'BlockLabel',
    }).css({
      'left' : stage.x * scale,
      'top' : stage.y * scale,
      'color' : stage.font_color,
      'font-size' : stage.font_size,
    }).append(stage.name);

    element = $('<div>');
    element.attr({
      'class' : 'stage',
      'id' : stage.id,
      'onsuccess' : stage.onsuccess,
      'stage_type' : stage.type,
    }).css({
      'left' : (stage.x + stage.w/2) * scale,
      'top' : (stage.y + stage.h/2) * scale,
      'width' : stage.w * scale,
      'height' : stage.h * scale,
    });
    $('#displayCenter').append(element);
    $('#displayCenter').append(p);
};

// Draw the collection stage element
function draw_collection(stage, scale){
    let element, p, child;

    p = $('<p>');
    p.append(stage.name);

    child = $('<div>');
    child.append(p);

    element = $('<div>');
    element.attr({
      'class' : 'stage',
      'id' : stage.id,
      'onsuccess' : stage.onsuccess,
      'stage_type' : stage.type,
    }).css({
      'left' : stage.x * scale,
      'top' : stage.y * scale,
      'width' : stage.w * 0.8 * scale,
      'height' : stage.h * 0.9 * scale,
    }).append(child);
    $('#displayCenter').append(element);

    draw_hover_element(stage);
};

// Draw the hover element
function draw_hover_element(stage){
  let hover_element, p, hover_x, hover_y, element, to_stage, i, j;

  hover_x = $('#' + stage.id).position().left;
  hover_y = $('#' + stage.id).position().top + $('#' + stage.id).outerHeight() + 1;

  hover_element = $('<div>');
  hover_element.attr({
    'class' : 'hover',
    'id' : stage.id,
  }).css({
    'top' : hover_y + 'px',
    'left' : hover_x + 'px',
  });

  element = $('<p>');
  p = $('<p>').css({'font-weight': 'bold', 'display': 'inline-block'}).append('Type:');
  element.attr('class', 'stageType').append(p, ' ' + stage.type);
  hover_element.append(element);

  if (stage.type === 'ChoiceStart'){
    element = $('<p>');
    to_stage = process_root.process.stagelist.filter(function(currentObj){return stage.groupid === currentObj.groupid && stage !== currentObj});
    p = $('<p>').css({'font-weight': 'bold', 'display': 'inline-block'}).append('Otherwise:');
    element.attr('id', 'groupid').append(p, ' ' + to_stage[0].name).hide();
    hover_element.append(element);
  };

  if (stage.onsuccess){
    element = $('<p>');
    p = $('<p>').css({'font-weight': 'bold', 'display': 'inline-block'}).append('Success:');
    to_stage = process_root.process.stagelist.filter(function(currentObj){return stage.onsuccess === currentObj.id});
    while (to_stage[0].type === 'Anchor'){
      let temp_stage = to_stage[0];
      to_stage = process_root.process.stagelist.filter(function(currentObj){return temp_stage.onsuccess === currentObj.id});
    };
    element.attr('id', 'onsuccess').append(p, ' ' + to_stage[0].name).hide();
    hover_element.append(element);
  };

  if (stage.ontrue){
    element = $('<p>');
    p = $('<p>').css({'font-weight': 'bold', 'display': 'inline-block'}).append('True:');
    to_stage = process_root.process.stagelist.filter(function(currentObj){return stage.ontrue === currentObj.id});
    while (to_stage[0].type === 'Anchor'){
      let temp_stage = to_stage[0];
      to_stage = process_root.process.stagelist.filter(function(currentObj){return temp_stage.onsuccess === currentObj.id});
    };
    element.attr('id', 'ontrue').append(p, ' ' + to_stage[0].name).hide();
    hover_element.append(element);
  };

  if (stage.onfalse){
    element = $('<p>');
    p = $('<p>').css({'font-weight': 'bold', 'display': 'inline-block'}).append('False:');
    to_stage = process_root.process.stagelist.filter(function(currentObj){return stage.onfalse === currentObj.id});
    while (to_stage[0].type === 'Anchor'){
      let temp_stage = to_stage[0];
      to_stage = process_root.process.stagelist.filter(function(currentObj){return temp_stage.onsuccess === currentObj.id});
    };
    element.attr('id', 'onfalse').append(p, ' ' + to_stage[0].name).hide();
    hover_element.append(element);
  };

  if (stage.narrative){
    element = $('<p>');
    p = $('<p>').css('font-weight', 'bold').append('Narrative:');
    element.attr('id', 'narrative').append(p, stage.narrative).hide();
    hover_element.append(element);
  };

  if (stage.datatype){
    element = $('<p>');
    p = $('<p>').css({'font-weight': 'bold', 'display': 'inline-block'}).append('Datatype:');
    element.attr('id', 'datatype').append(p, ' ' + stage.datatype).hide();
    hover_element.append(element);
  };

  if (stage.collectioninfo && stage.collectioninfo.length > 0){
    p = $('<p>').css('font-weight', 'bold').append('Collection info:');
    element = $('<p>');
    element.attr('id', 'collectioninfo').append(p);
    for (i = 0; i < stage.collectioninfo.length; i++){
      if (stage.collectioninfo[i].type){element.append('Type: ' + stage.collectioninfo[i].type)};
      if (stage.collectioninfo[i].name){element.append(', Name: ' + stage.collectioninfo[i].name)};
      if (stage.collectioninfo[i].value){element.append(', Value: ' + stage.collectioninfo[i].value)};
      element.append($('<br>'));
    };
    element.hide();
    hover_element.append(element);
  };

  if (stage.initialvalue && stage.initialvalue.length > 0){
    p = $('<p>').css('font-weight', 'bold').append('Initialvalue:');
    element = $('<p>');
    element.attr('id', 'initialvalue').append(p);
    for (i = 0; i < stage.initialvalue.length; i++){
      element.append('Row ' + (i + 1) + '- ');
      for (j = 0; j < stage.initialvalue[i].length; j++){
        if (stage.initialvalue[i][j].type){element.append('Type: ' + stage.initialvalue[i][j].type)};
        if (stage.initialvalue[i][j].name){element.append(', Name: ' + stage.initialvalue[i][j].name)};
        if (stage.initialvalue[i][j].value){element.append(', Value: ' + stage.initialvalue[i][j].value)};
        element.append($('<br>'));
      };
    };
    element.hide();
    hover_element.append(element);
  };

  if (stage.inputs){
    element = $('<p>');
    p = $('<p>');
    p.css('font-weight', 'bold').append('Inputs: ');
    element.attr('id', 'inputs').append(p);
    for (i = 0; i < stage.inputs.length; i++){
      if (stage.inputs[i].type){element.append('Type: ' + stage.inputs[i].type)};
      if (stage.inputs[i].friendlyname){element.append(', Name: ' + stage.inputs[i].friendlyname)} else {element.append(', Name: ' + stage.inputs[i].name)};
      if (stage.inputs[i].stage){element.append(', Stage: ' + stage.inputs[i].stage)};
      if (stage.inputs[i].expr){element.append(', Expr: ' + stage.inputs[i].expr)};
      element.append($('<br>'));
    };
    element.hide();
    hover_element.append(element);
  };

  if (stage.outputs){
    element = $('<p>');
    p = $('<p>');
    p.css('font-weight', 'bold').append('Outputs: ');
    element.attr('id', 'outputs').append(p);
    for (i = 0; i < stage.outputs.length; i++){
      if (stage.outputs[i].type){element.append('Type: ' + stage.outputs[i].type)};
      if (stage.outputs[i].friendlyname){element.append(', Name: ' + stage.outputs[i].friendlyname)} else {element.append(', Name: ' + stage.outputs[i].name)};
      if (stage.outputs[i].stage){element.append(', Stage: ' + stage.outputs[i].stage)};
      element.append($('<br>'));
    };
    element.hide();
    hover_element.append(element);
  };

  element = $('<div>');
  element.attr({
    'class' : 'button',
    'onclick' : 'toggle_expand_hover("' + stage.id + '")',
  }).append('More...');
  hover_element.append(element);

  $('#displayCenter').append(hover_element);
};

//-------------------- Toggle Functions --------------------

// Toggle the expanded hover element
function toggle_expand_hover(stage_id){
  let hover_element;

  // Find the hover element
  hover_element = $('.hover').filter('#' + stage_id);
  if (hover_element.hasClass('expanded')){

    // Hide all, and show selected elements inside hover
    hover_element.find('*').hide();
    hover_element.find('.stageType').show().find('*').show();
    hover_element.find('.button').show().empty().append('More...');
  } else {

    // Show all elements inside hover
    hover_element.find('*').show();
    hover_element.find('.button').empty().append('Less...');
  };

  // Resize the hover element
  hover_element.css('height', 'fit-content').toggleClass('expanded');
};

// Toggle between show/hide the settings element
function toggle_settings(){
  let scaleInput = $('#scaleInput'), scaleButton = $('#scale .button');
  if (!$('#settings').hasClass('showSettings')){
    
    // Show settings
    scaleInput.attr('tabindex', 0);
    scaleButton.attr('tabindex', 0);
  } else {
    
    // Hide settings
    scaleInput.attr('tabindex', -1);
    scaleButton.attr('tabindex', -1);
  }

  // Toggle the class
  $('#settings').toggleClass('showSettings');
};

// Toggle between show/hide the info page
function toggle_info(){
  let info, wrapper, container, details = $('.summary');
  info = $('#info'), wrapper = $('#wrapper'), container = $('#container');

  if (info.hasClass('hiddenInfo')){
    
    // Show the info
    info.removeClass('hiddenInfo');
    wrapper.removeClass('hiddenWrapper');

    // Delay the function
    setTimeout(function(){
      container.removeClass('hiddenContainer');
    }, 400);

    // Apply attribute to all summary icons
    details.each(function(){
      summary = $(this);
      summary.find('.icon').attr('tabindex', 0);
    });
  } else {

    // Hide the info
    setTimeout(function(){
      info.addClass('hiddenInfo');
    }, 1000);
    container.addClass('hiddenContainer');
    wrapper.addClass('hiddenWrapper');
    details.each(function(){
      summary = $(this);
      summary.find('.icon').attr('tabindex', -1);
    });
  };
};

// Toggle between show/hide the expanded detail element
function toggle_detail(type){

  // Find the detail and icon
  let detail = $('.detail').filter('#' + type);
  let button = detail.find('.icon');

  // Toggle classes
  detail.toggleClass('expanded');
  button.toggleClass('rotate');
};

// Toggle between show/hide the search input
function toggle_search(){
  let input = $('#inputDiv');
  if (input.hasClass('hidden')){

    // Show the input
    input.slideDown(200);
    input.find('input').focus();
  } else {

    // Hide the input
    input.slideUp(200);
    input.find('input').val('');
    search();
  };
  input.toggleClass('hidden');
};

// Toggle between show/hide the prosess list
function toggle_left(){
  $('#left').toggleClass('hiddenLeft')
  $('#toggleLeftButton').toggleClass('hiddenLeftButton');
};

//------------------------ Other ------------------------
// Remove all stages
function empty_page(){
  $('#displayCenter').empty();
};

// Empty and reset the path
function empty_path(){
  global_path = [{'id': '0', 'name' : 'Main Page'}];
  $('#path').empty();
};

// Add or remove items in the path
function edit_path(page_id, name, index = ''){
  // Updating the list
  if (index == ''){
    // Adding new list-item
    global_path.push({'id' : page_id, 'name' : name});
  } else {
    // Removing all list items after index
    global_path.length = parseInt(index) + 1;
  };
  // Last draw the new path
  draw_path();
};

// Draw the path
function draw_path(){
  let path_div, btn_element, p_element, i;

  // Empty the entire path-element
  path_div = $('#path');
  path_div.empty();

  // Loop through the path list
  for (i = 0; i < global_path.length - 1; i++){

    // Create a button for each entry
    btn_element = $('<button>');
    btn_element.attr({
      'class' : 'pathButton',
      'title' : 'Go to ' + global_path[i].name,
    });
    
    // If the id of the page is 0 it is the main page
    if (global_path[i].id == '0'){
      btn_element.attr({
        'onclick' : 'edit_path("", ""," ' + i + '"); draw_main_page()',
      });
    } else {
      btn_element.attr({
        'onclick' : 'edit_path("", "", "' + (i - 1) + '"); draw_subsheet("' + global_path[i].id + '")',
      });
    };

    // Element text
    p_element = $('<p>');
    p_element.append(global_path[i].name);

    btn_element.append(p_element);
    path_div.append(btn_element);
  };

  // adding the current page to the label
  $('#pageLabel').empty().attr({
    'page_id' : global_path[global_path.length - 1].id,
  }).append(global_path[global_path.length - 1].name);
};

// Horizontal scroll for the path
function path_scroll() {
  let element, length, position;
  element = $('#path');

  // Calculate the length of the scrollable path
  length = element.prop('scrollWidth') - element.outerWidth();

  // Initialize the starting position
  position = 0;

  // Bind the 'wheel' event to the element
  element.bind('wheel', (e) => {
    // Check if the position is within the scrollable range
    if (position <= length && position >= 0) {
      // Scroll up when the wheel is scrolled up
      if (e.originalEvent.wheelDelta / 120 > 0) {
        position -= 20;
        element.scrollLeft(position);
      } else {
        // Scroll down when the wheel is scrolled down
        position += 20;
        element.scrollLeft(position);
      };
    } else if (position > length) {
      // Adjust the position if it exceeds the scrollable range
      position = length - 20;
    } else if (position < 0) {
      // Adjust the position if it goes below 0
      position = 20;
    };
  });

  // Update the position when the element is scrolled
  element.scroll(() => {
    position = element.scrollLeft();
  });
};

// Take the scale from the input element and draw the stages
function change_scale(){
  scale = parseInt($('#scaleInput').val())/5;
  let label = $('#pageLabel');
  if (label.attr('page_id') !== '0'){
    draw_subsheet(label.attr('page_id'), false);
  } else {
    draw_main_page();
  };
};

// Set the value of the input element to 5 and draw the stages
function reset_scale(){
  let slider = $('#scaleInput');
  slider.val(5);
  change_scale();
};

// Change the size of the page to make the stages fit
function resize_page() {
  let x = y = 0, display, stage, left, top;

  // Get the display element
  display = $('#display');

  // Iterate over each stage element in the display
  display.find('.stage').each(function(e, elem) {
    stage = $(elem);
    left = stage.position().left;
    top = stage.position().top;

    // Update the maximum x and y coordinates based on stage positions
    if (left < 0 && Math.abs(left) > x) {
      x = Math.abs(left);
    } else if (left > 0 && (left + stage.outerWidth()) > x) {
      x = left + stage.outerWidth();
    }

    if (top < 0 && Math.abs(top) > y) {
      y = Math.abs(top);
    } else if (top > 0 && (top + stage.outerHeight()) > y) {
      y = top + stage.outerHeight();
    }
  });

  // Round up x and y to the nearest multiple of 10
  x = Math.ceil(x / 10) * 10;
  y = Math.ceil(y / 10) * 10;

  // Update the width and height of the display element
  display.css({
    'width': x * 2 + 100,
    'height': y * 2 + 100,
  });
};

// Filter the processes in the margin
function search() {
  let search = $('#searchInput').val().toLowerCase();

  // Get the search input value and convert it to lowercase
  $('.processParent').each((i, element) => {
    let name = $(element).find('.processTop h3').text().toLowerCase();

    // Get the name of each process element and convert it to lowercase
    if (name.indexOf(search) != -1) {
      // If the search term is found in the process name, show the element
      $(element).stop().show();
    } else {
      // If the search term is not found in the process name, hide the element
      $(element).stop().hide();
    };
  });
};

// Hover effect on the stages
function hover_effect() {
  let stage, hover;

  // Mouse enter event for stage elements
  $('.stage').mouseenter(function() {
    stage = $(this);
    clearTimeout(hoverTimeout);

    // Delayed execution of hover effect
    hoverTimeout = setTimeout(function() {
      hover = $('#displayCenter').find('.hover').filter('#' + stage.attr('id'));
      hover.addClass('showHover').stop().slideDown(200);
    }, 500);
  });

  // Mouse leave event for stage elements
  $('.stage').mouseleave(function() {
    clearTimeout(hoverTimeout);
    hover = $('#displayCenter').find('.hover').filter('#' + $(this).attr('id'));
    hover.removeClass('showHover').stop().slideUp(100);
  });

  // Mouse enter event for hover elements
  $('.hover').mouseenter(function() {
    $(this).addClass('showHover').stop().slideDown(200);
  });

  // Mouse leave event for hover elements
  $('.hover').mouseleave(function() {
    $(this).removeClass('showHover').stop().slideUp(100);
  });
};

// This is a prototype, further testing required
function control_drag(display, window_elem){
  let sides, window, transition;

  window = {
    'width' : window_elem.outerWidth(),
    'height' : window_elem.outerHeight(),
  };

  display.draggable({
    start: function(event, ui){
      transition = display.css('transition');
      display.css({
        'transition' : 'none',
      });
    },
    stop: function(event, ui){
      sides = {
        'left' : display.position().left,
        'right' : display.position().left + display.outerWidth(),
        'top' : display.position().top,
        'bottom' : display.position().top + display.outerHeight(),
      };

      display.css({
        'transition' : transition,
      });

      if (sides.left > 0){
        display.css({
          'left' : 0,
        });
      } else if (sides.right < window.width){
        display.css({
          'left' : window.width - display.outerWidth(),
        });
      };
      if (sides.top > 0){
        display.css({
          'top' : 0,
        });
      } else if (sides.bottom < window.height){
        display.css({
          'top' : window.height - display.outerHeight(),
        });
      };
    }
  });
};

// This is a prototype, further testing required
function detect_display_scroll(){
  let parent, display, transition, sides, window;
  parent = $('#displayParent');
  display = $('#display');

  transition = display.css('transition');

  window = {
    'width' : parent.outerWidth(),
    'height' : parent.outerHeight(),
  };

  parent.bind('wheel', (e) => {
    sides = {
      'left' : display.position().left,
      'right' : display.position().left + display.outerWidth(),
      'top' : display.position().top,
      'bottom' : display.position().top + display.outerHeight(),
    };

    // vertical scroll
    if (e.originalEvent.deltaY !== 0 /* check if display sides are inside the window */){
      display.css('transition', 'none');
      if (e.originalEvent.deltaY / 120 < 0 && sides.top < 0) {
        display.css('top', '+=5');
      } else if (e.originalEvent.deltaY / 120 > 0 && sides.bottom > window.height){
        display.css('top', '-=5');
      };
    };
    // horizontal scroll
    if (e.originalEvent.deltaX !== 0 /* check if display sides are inside the window */){
      display.css('transition', 'none');
      if (e.originalEvent.deltaX / 120 < 0 && sides.left < 0) {
        display.css('left', '+=5');
      } else if (e.originalEvent.deltaX / 120 > 0 && sides.right > window.width) {
        display.css('left', '-=5');
      };
    };
    display.css('transition', transition);
  });
};

// Control the cursor on drag
function detect_drag() {
  // Mouse down event on the display element
  $('#display').mousedown(function(e) {
    // Check if the left element is hidden and toggle it if necessary
    if (!$('#left').hasClass('hiddenLeft')) {
      toggle_left();
    };

    // Add 'dragging' class to the display and its child elements
    $(this).addClass('dragging');
    $(this).find('*').addClass('dragging');
  }).mouseup(function() {
    // Remove 'dragging' class from the display and its child elements
    $(this).removeClass('dragging');
    $(this).find('*').removeClass('dragging');
  }).draggable().focus();
};


// Scroll top left element into view
function scroll_into_view() {
  let display, size, sides, x = y = 0, stage, scrollPos;

  // Get the display element and its size
  display = $('#display');
  size = {
    'x' : display.outerWidth(),
    'y' : display.outerHeight(),
    'centerX' : display.outerWidth()/2,
    'centerY' : display.outerHeight()/2,
  };

  // Find the minimum x and y positions among the stage elements
  display.find('.stage').each(function(i, elem) {
    stage = $(elem);
    sides = {
      'left' : stage.position().left,
      'top' : stage.position().top,
    };
    if (sides.left < x) {
      x = sides.left;
    };
    if (sides.top < y) {
      y = sides.top;
    };
  });

  // Calculate the scroll position relative to the display element
  scrollPos = {
    'x' : size.centerX - Math.abs(x),
    'y' : size.centerY - Math.abs(y),
  };

  // Set the CSS left and top properties to scroll the display element into view
  display.css({
    'left' : -scrollPos.x + 100,
    'top' : -scrollPos.y + 100,
  });
};