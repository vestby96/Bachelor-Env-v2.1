// global variables
var ip, port, global_path, customer_name, customer_str, process_name_list, selected_process;
global_path = [{'id': '0', 'name' : 'Main Page'}];
ip = 'localhost';
port = '8000';

$(document).ready(function(){
  customer_name = 'customer';
  customer_str = capitalize_str(customer_name);
  $('nav h1').append(customer_str);
  
  // adjust the height of the margin
  $('#margin').css('height', $(window).outerHeight() - $('nav').outerHeight());
  $('#displayProcess').css('height', $(window).outerHeight() - $('nav').outerHeight() - $('#path').outerHeight() - 4);

  get_process_names();
  
  window.onresize = function(){
    console.log('resize').delay(800);
  };
});

function path_scroll(){
  var element, length, position;
  element = $('#path');
  length = element.prop('scrollWidth') - element.outerWidth();
  position = 0;
  element.bind('wheel', (e) => {
    if (position <= length && position >= 0) {
      if (e.originalEvent.wheelDelta / 120 > 0) {
        position -= 20;
        element.scrollLeft(position);
      } else {
        position += 20;
        element.scrollLeft(position);
      };
    } else if (position > length){
      position = length - 20;
    } else if (position < 0){
      position = 0 + 20;
    };
  });
  element.scroll(() => {
    position = element.scrollLeft();
  });
};

function move_items(){
  $('.stage').each((i, element) => {
    var top = $(element).css('top');
    var left = $(element).css('left');
    $(element).css({
      'top' : get_center().y + top + 'px',
      'left' : get_center().x + left + 'px',
    });
  });
};

function get_center(){
  var display_element = $('#displayProcess');
  var x = display_element.outerWidth() / 2;
  var y = display_element.outerHeight() / 2;
  return {'x' : x, 'y' : y};
};

function dropdown_item(id, name){
  var process_element, buttons_element, processButton_element, process_p, dropdownButton_element, dropdown_p, dropdownContent_element, page_element, i;
  process_element = $('<div>');
  process_element.attr({
    'class' : 'process',
    'id' : id,
  });

  buttons_element = $('<div>');
  buttons_element.attr({
    'class' : 'buttons',
    'id' : id,
    'onclick' : 'dropdown_process("' + id + '", "' + name + '")',
  });

  processButton_element = $('<button>');
  processButton_element.attr({
    'class' : 'processButton',
    'id' : id,
    'onclick' : 'console.log("' + name + '")',
  });

  process_p = $('<p>');
  process_p.append(name);

  dropdown_p = $('<p>');
  dropdown_p.css({
    'width' : '20px',
    'height' : '20px',
    'background-image' : 'url("./img/arrow-left.png")',
    'background-position' : 'center',
    'background-size' : '80%',
    'background-repeat' : 'no-repeat',
  });

  dropdownButton_element = $('<button>');
  dropdownButton_element.attr({
    'class' : 'dropdownButton',
    'id' : id,
  });

  dropdownContent_element = $('<div>');
  dropdownContent_element.attr({
    'class' : 'dropdownContent',
    'id' : id,
  });
  /*
  for (i = 0; i < subsheets; i++){
    page_element = $('<input>');
    page_element.attr({
      'class' : 'page',
      'id' : id
      'type' : 'submit',
      'value' : 'subsheet ' + i,
      'onclick' : 'console.log("process ' + id + ', subsheet ' + i + '")',
    });
    dropdownContent_element.append(page_element);
  };
  */
  processButton_element.append(process_p);
  dropdownButton_element.append(dropdown_p);
  buttons_element.append(processButton_element,dropdownButton_element);
  process_element.append(buttons_element, dropdownContent_element)
  $('#margin').append(process_element);
};

function dropdown_process(id, name){
  // variables
  var buttons, dropdownButton, dropdownContent, i;
  
  //styles
  buttons = $('.buttons').filter('[id="' + id + '"]');
  buttons.toggleClass('openButtons');
  dropdownButton = $('.dropdownButton').filter('[id="' + id + '"]');
  dropdownButton.toggleClass('open');
  dropdownContent = $('.dropdownContent').filter('[id="' + id + '"]');
  dropdownContent.toggleClass('show');

  process = get_process(id, name);
  console.log(process);
  for (i = 0; i < process.child_process.subsheet_list.length; i++){

  };
};

function path_item(subsheet_id){
  var button;
  button = $('<button>');
  button.attr({
    'onclick' : 'console.log("' + subsheet_id + '")'
  });
  button.append('Page: ' + subsheet_id);
  $('#path').append('/', button);
};

function draw_line(x1, y1, x2, y2){
  // variables
  var svg, line;

  svg  = document.getElementById('svg');
  line = document.createElementNS('http://www.w3.org/2000/svg','line');

  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);

  length = Math.sqrt( (x2-=x1)*x2 + (y2-=y1)*y2 );
  line.setAttribute('length', length);
  svg.appendChild(line);
};

function draw_all_lines(){
  // remove all previous svg lines
  $('#svg').empty();

  // variables
  var to_stage_element, from_stage_element, elements, i, j, center_x, center_y, x1, y1, x2, y2;

  // get the size of section element
  center_x = $('#displaySectionProcess').outerWidth() / 2;
  center_y = $('#displaySectionProcess').outerHeight() / 2;

  // list of all stage elements on the page
  elements = $('.stage');
  // loop through all stages
  for (i = 0; i < elements.length; i++){
    // checking if the stage has an onsuccess id
    from_stage_element = $(elements[i]);
    if (from_stage_element.attr('onsuccess') || from_stage_element.attr('ontrue') || from_stage_element.attr('onfalse')){
      for (j = 0; j < elements.length; j++){
        // finding the onsuccess stage
        to_stage_element = $(elements[j]);
        if (from_stage_element.attr('onsuccess') == to_stage_element.attr('id') || from_stage_element.attr('ontrue') == to_stage_element.attr('id') || from_stage_element.attr('onfalse') == to_stage_element.attr('id')){
          // getting the positions of the stages
          x1 = from_stage_element.position().left + from_stage_element.outerWidth()/2;
          y1 = from_stage_element.position().top + from_stage_element.outerHeight()/2;
          x2 = to_stage_element.position().left + to_stage_element.outerWidth()/2;
          y2 = to_stage_element.position().top + to_stage_element.outerHeight()/2;
          // drawing the line
          draw_line(x1, y1, x2, y2);
        };
      };
    };
  };
};

function capitalize_str(str){
  str = str.toLowerCase().replace(/\b[a-z]/g, function(letter) {
    return letter.toUpperCase();
  });
  return str;
};

function get_process_names(){
  try {
    // api call to get the process names
    $.ajax({
      type: 'GET',
      url: 'http://' + ip + ':' + port + '/' + customer_name + '/',
      success:function(data){
        // checking if the api response is an error
        if (data.length) {
          process_name_list = data;
          console.log(process_name_list);

          for (var i = 0; i < process_name_list.length; i++){
            var id = process_name_list[i][0];
            var name = process_name_list[i][1];
            dropdown_item(id, name);
          };
        } else {
          console.log('No customer found');
        };
      },
      error(error){
        console.log(error);
      }
    });
  } catch {
    console.log('No customer found');
  };
};

function get_process(id, name){
  try {
    // api call to get the process content
    $.ajax({
      type: 'GET',
      url: 'http://' + ip + ':' + port + '/' + customer_name + '/' + name + '/',
      success:function(data){
        // if the data type is an object it is an error
        if (data.length){
          return data[0];
        } else {
          console.log('No Process Found');
        };
      },
      error(error){
        console.log(error);
      }
    });
  } catch {
    console.log('No Process Found');
  };
}

function select_process(process_name){
  try {
    // api call to get the process content
    $.ajax({
      type: 'GET',
      url: 'http://' + ip + ':' + port + '/' + customer_name + '/' + process_name + '/',
      success:function(data){
        // if the data type is an object it is an error
        if (data.length){
          selected_process = data[0];
          console.log(selected_process);
          draw_main_page();
        } else {
          console.log('No Process Found');
        };
      },
      error(error){
        console.log(error);
      }
    });
  } catch {
    console.log('No Process Found');
  };
};

function hover_effect(){
  $('.stage').hover(function(){
    var stage_element, hover_div, hover_x, hover_y;
    stage_element = $(this);
    hover_div = $('<div>');
    hover_x = stage_element.position().left;
    hover_y = stage_element.position().top + stage_element.outerHeight() + 2;
    hover_div.attr({
      'class' : 'hover',
    }).css({
      'position' : 'absolute',
      'left' : hover_x,
      'top' : hover_y,
      'background-color' : 'lightgray',
      'z-index' : '1',
      'border' : '1px solid black',
      'padding' : '5px 10px',
      'width' : '350px',
    });
    hover_div.append(
      "<p>Id: " + stage_element.attr('id') + "</p>" + 
      "<p>Type: " + stage_element.attr('stage_type') + "</p>"
    );
    $('#displayCenterProcess').append(hover_div);
  }, function(){
    $('.hover').remove();
  });
};

function reset_page(){
  console.log('clean_page');
  $('#displayCenterProcess').empty();
};

function reset_path(){
  global_path = [{'id': '0', 'name' : 'Main Page'}];
  $('#processPath').empty();
};

function edit_path(page_id, name, index){
  // updating the list
  if (index == undefined){
    // adding new list-item
    var path_page = {
      'id' : page_id,
      'name' : name,
    };
    global_path.push(path_page);
  } else {
    // removing all list items after index
    global_path.length = parseInt(index) + 1;
  };
  draw_path();
};

function draw_path(){
  // variables
  var path_div, btn_element, div_element, i;
  // updating the path-element
  path_div = $('#processPath');
  path_div.empty();

  for (i = 0; i < global_path.length - 1; i++){
    btn_element = $('<button>');
    btn_element.attr({
      'class' : 'pathButton',
    });

    if (global_path[i].id == '0'){
      btn_element.attr({
        'onclick' : 'edit_path("", "", ' + i + '); draw_main_page()',
      });
    } else {
      btn_element.attr({
        'onclick' : 'edit_path("", "", ' + (i - 1) + ');draw_subsheet("' + global_path[i].id + '")',
      });
    };
    btn_element.append(global_path[i].name);
    path_div.append(btn_element);
  };
  div_element = $('<div>');
  div_element.append(global_path[global_path.length - 1].name);
  path_div.append(div_element);
};

//---------------------- Draw Pages -----------------------
function draw_main_page(){
  // variables
  var child_process, stage_list, stage, i, dimensions, display, svg;
  child_process = selected_process.child_process;
  stage_list = child_process.stage_list;
  
  dimensions = get_size();

  display = $('#displayCenterProcess');
  display.css({
    'width' : dimensions.x + 300 + 'px',
    'height' : dimensions.y + 100 + 'px',
  });

  svg = $('#svg');
  svg.css({
    'width' : dimensions.x + 300 + 'px',
    'height' : dimensions.y + 100 + 'px',
  });

  var test;
  test = get_center(display);
  console.log(dimensions.x + ':' + dimensions.y)
  console.log(test.x + ':' + test.y)

  // draw the initial path
  reset_path();
  draw_path();
  reset_page();

  //draw stages
  for (i = 0; i < stage_list.length; i++){
    stage = stage_list[i];
    if (!stage.subsheet_id && stage.type == 'Block'){
      draw_block(stage);
    } else if (!stage.subsheet_id && (stage.type == 'Start' || stage.type == 'End')){
      draw_start_end(stage);
    } else if (!stage.subsheet_id && stage.type == 'SubSheet'){
      draw_stage_subsheet(stage);
    } else if (!stage.subsheet_id && stage.type == 'SubSheetInfo'){
      draw_stage_subsheet_info(stage);
    } else if (!stage.subsheet_id && stage.type == 'ProcessInfo'){
      draw_stage_process_info(stage);
    } else if (!stage.subsheet_id && stage.type == 'Decision'){
      draw_decision(stage);
    } else if (!stage.subsheet_id && stage.type == 'Exception'){
      draw_exception(stage);
    } else if (!stage.subsheet_id && stage.type == 'Action'){
      draw_action(stage);
    } else if (!stage.subsheet_id && stage.type == 'Calculation'){
      draw_calculation(stage);
    } else if (!stage.subsheet_id && stage.type == 'Collection'){
      draw_collection(stage);
    } else if (!stage.subsheet_id && stage.type == 'Data'){
      draw_data(stage);
    } else if (!stage.subsheet_id && stage.type == 'LoopStart'){
      draw_loop_start(stage);
    } else if (!stage.subsheet_id && stage.type == 'LoopEnd'){
      draw_loop_end(stage);
    } else if (!stage.subsheet_id && stage.type == 'MultipleCalculation'){
      draw_multiple_calculation(stage);
    };
  };
  draw_all_lines();
  hover_effect();
};

function draw_subsheet(subsheet_id){
  // variables
  var name, stage_list, stage, subsheet_list, i;

  // find the subsheet
  subsheet_list = selected_process.child_process.subsheet_list
  name = 'Undefined';
  for (i = 0; i < subsheet_list.length; i++){
    if (subsheet_id == subsheet_list[i].id){
      name = subsheet_list[i].name;
    };
  };

  // draw the path
  edit_path(subsheet_id, name,);

  // remove previous page and create new blank page
  reset_page();

  // stage list
  stage_list = selected_process.child_process.stage_list;

  // draw stages
  for (i = 0; i < stage_list.length; i++){
    stage = stage_list[i];
    if (stage.subsheet_id == subsheet_id && stage.type == 'Block'){
      draw_block(stage);
    } else if (stage.subsheet_id == subsheet_id && (stage.type == 'Start' || stage.type == 'End')){
      draw_start_end(stage);
    } else if (stage.subsheet_id == subsheet_id && stage.type == 'SubSheet'){
      draw_stage_subsheet(stage);
    } else if (stage.subsheet_id == subsheet_id && stage.type == 'SubSheetInfo'){
      draw_stage_subsheet_info(stage);
    } else if (stage.subsheet_id == subsheet_id && stage.type == 'ProcessInfo'){
      draw_stage_process_info(stage);
    } else if (stage.subsheet_id == subsheet_id && stage.type == 'Decision'){
      draw_decision(stage);
    } else if (stage.subsheet_id == subsheet_id && stage.type == 'Exception'){
      draw_exception(stage);
    } else if (stage.subsheet_id == subsheet_id && stage.type == 'Action'){
      draw_action(stage);
    } else if (stage.subsheet_id == subsheet_id && stage.type == 'Calculation'){
      draw_calculation(stage);
    } else if (stage.subsheet_id == subsheet_id && stage.type == 'Collection'){
      draw_collection(stage);
    } else if (stage.subsheet_id == subsheet_id && stage.type == 'Data'){
      draw_data(stage);
    } else if (stage.subsheet_id == subsheet_id && stage.type == 'LoopStart'){
      draw_loop_start(stage);
    } else if (stage.subsheet_id == subsheet_id && stage.type == 'LoopEnd'){
      draw_loop_end(stage);
    } else if (stage.subsheet_id == subsheet_id && stage.type == 'MultipleCalculation'){
      draw_multiple_calculation(stage);
    };
  };
  draw_all_lines();
  hover_effect();
};

//---------------------- Draw Stages ----------------------
function draw_default_stage(stage){
  var btn, center;
  center = get_center($('#displayCenterProcess'));
  btn = $('<button>');
  btn.attr({
    'class' : 'stage',
    'id' : stage.id,
    'onsuccess' : stage.onsuccess,
    'type' : 'button',
    'stage_type' : stage.type,
  }).css({
    'display' : 'flex',
    'align-items' : 'center',
    'justify-content' : 'center',
    'width' : parseInt(stage.w),
    'height' : parseInt(stage.h),
    'position' : 'absolute',
    'left' : parseInt(stage.x) + center.x + 'px',
    'top' : parseInt(stage.y) + center.y + 'px',
    'transform' : 'translate(-50%, -50%)',
    'border' : '1px solid black',
    'background-color' : 'white',
    'cursor' : 'pointer',
    'padding' : '10px',
    'z-index' : 1,
    'font-size' : 12,
  });
  btn.append(stage.name);
  $('#displayCenterProcess').append(btn);
};

function draw_start_end(stage){
  var btn, center;
  center = get_center($('#displayCenterProcess'));
  btn = $('<button>');
  btn.attr({
    'class' : 'stage',
    'id' : stage.id,
    'onsuccess' : stage.onsuccess,
    'type' : 'button',
    'stage_type' : stage.type,
  }).css({
    'display' : 'flex',
    'align-items' : 'center',
    'justify-content' : 'center',
    'width' : parseInt(stage.w),
    'height' : parseInt(stage.h),
    'position' : 'absolute',
    'left' : parseInt(stage.x) + center.x + 'px',
    'top' : parseInt(stage.y) + center.y + 'px',
    'transform' : 'translate(-50%, -50%)',
    'border' : '1px solid black',
    'background-color' : 'white',
    'cursor' : 'pointer',
    'padding' : '10px',
    'border-radius' : '25%',
    'z-index' : 1,
    'font-size' : 12,
  });
  btn.append(stage.name);
  $('#displayCenterProcess').append(btn);
};

function draw_choice(stage){
  draw_default_stage(stage);
};

function draw_note(stage){
  draw_default_stage(stage);
};

function draw_anchor(stage){
  draw_default_stage(stage);
};

function draw_stage_subsheet(stage){
  var btn, center;
  center = get_center($('#displayCenterProcess'));
  btn = $('<button>');
  btn.attr({
    'class' : 'stage',
    'id' : stage.id,
    'onsuccess' : stage.onsuccess,
    'type' : 'button',
    'stage_type' : stage.type,
    'onclick' : 'draw_subsheet("' + stage.process_id + '")',
  }).css({
    'display' : 'flex',
    'align-items' : 'center',
    'justify-content' : 'center',
    'width' : parseInt(stage.w),
    'height' : parseInt(stage.h),
    'position' : 'absolute',
    'left' : parseInt(stage.x) + center.x + 'px',
    'top' : parseInt(stage.y) + center.y + 'px',
    'transform' : 'translate(-50%, -50%)',
    'border' : '1px solid black',
    'background-color' : 'white',
    'cursor' : 'pointer',
    'z-index' : 1,
    'font-size' : 12,
  });

  btn.append(stage.name);
  $('#displayCenterProcess').append(btn);
};

function draw_stage_subsheet_info(stage){
  draw_default_stage(stage);
};

function draw_stage_process_info(stage){
  var btn, center;
  center = get_center($('#displayCenterProcess'));
  btn = $('<div>');
  btn.attr({
    'class' : 'stage',
    'id' : stage.id,
    'onsuccess' : stage.onsuccess,
    'type' : 'button',
    'stage_type' : stage.type,
  }).css({
    'width' : parseInt(stage.w),
    'height' : parseInt(stage.h),
    'position' : 'absolute',
    'left' : parseInt(stage.x) + center.x + 'px',
    'top' : parseInt(stage.y) + center.y + 'px',
    'transform' : 'translate(-50%, -50%)',
    'border' : '1px solid black',
    'background-color' : 'white',
    'cursor' : 'pointer',
    'opacity' : 0.5,
    'z-index' : 0,
    'font-size' : 12,
  });
  btn.append(stage.name);
  $('#displayCenterProcess').append(btn);
};

function draw_stage_process(stage){
  draw_default_stage(stage);
};

function draw_decision(stage){
  var btn, center;
  center = get_center($('#displayCenterProcess'));
  btn = $('<button>');
  btn.attr({
    'class' : 'stage',
    'id' : stage.id,
    'onsuccess' : stage.onsuccess,
    'ontrue' : stage.ontrue,
    'onfalse' : stage.onfalse,
    'type' : 'button',
    'stage_type' : stage.type,
  }).css({
    'display' : 'flex',
    'align-items' : 'center',
    'justify-content' : 'center',
    'width' : parseInt(stage.w),
    'height' : parseInt(stage.h),
    'position' : 'absolute',
    'left' : parseInt(stage.x) + center.x + 'px',
    'top' : parseInt(stage.y) + center.y + 'px',
    'transform' : 'translate(-50%, -50%)',
    'border' : 'none',
    'background-color' : 'transparent',
    'background-image' : 'url("./img/decision.png")',
    'background-repeat' : 'no-repeat',
    'background-size' : '100% 95%',
    'background-position' : 'center',
    'cursor' : 'pointer',
    'z-index' : 1,
    'font-size' : 12,
  });
  btn.append(stage.name);
  $('#displayCenterProcess').append(btn);
};

function draw_exception(stage){
  draw_default_stage(stage);
};

function draw_calculation(stage){
  draw_default_stage(stage);
};

function draw_alert(stage){
  draw_default_stage(stage);
};

function draw_recover(stage){
  draw_default_stage(stage);
};

function draw_resume(stage){
  draw_default_stage(stage);
};

function draw_loop_start(stage){
  draw_default_stage(stage);
};

function draw_loop_end(stage){
  draw_default_stage(stage);
};

function draw_data(stage){
  draw_collection(stage);
};

function draw_action(stage){
  draw_default_stage(stage);
};

function draw_multiple_calculation(stage){
  draw_default_stage(stage);
};

function draw_block(stage){
  var btn, center;
  center = get_center($('#displayCenterProcess'));
  btn = $('<div>');
  btn.attr({
    'class' : 'stage',
    'id' : stage.id,
    'onsuccess' : stage.onsuccess,
    'type' : 'button',
    'stage_type' : stage.type,
  }).css({
    'width' : parseInt(stage.w),
    'height' : parseInt(stage.h),
    'position' : 'absolute',
    'left' : parseInt(stage.x) + parseInt(stage.w)/2 + center.x + 'px',
    'top' : parseInt(stage.y) + parseInt(stage.h)/2 + center.y + 'px',
    'transform' : 'translate(-50%, -50%)',
    'border' : '1px solid black',
    'background-color' : 'lightblue',
    'cursor' : 'pointer',
    'opacity' : 0.5,
    'z-index' : 0,
    'font-size' : 11,
  });
  btn.append(stage.name);
  $('#displayCenterProcess').append(btn);
};

function draw_collection(stage){
  var btn, center;
  center = get_center($('#displayCenterProcess'));
  btn = $('<button>');
  btn.attr({
    'class' : 'stage',
    'id' : stage.id,
    'onsuccess' : stage.onsuccess,
    'type' : 'button',
    'stage_type' : stage.type,
  }).css({
    'width' : parseInt(stage.w)*0.8,
    'height' : parseInt(stage.h)*0.8,
    'position' : 'absolute',
    'left' : parseInt(stage.x) + center.x + 'px',
    'top' : parseInt(stage.y) + center.y + 'px',
    'transform' : 'translate(-50%, -50%) skew(-45deg)',
    'border' : '1px solid black',
    'background-color' : 'white',
    'cursor' : 'pointer',
    'padding' : '5px',
    'z-index' : 1,
    'font-size' : 12,
  });

  var stage_name = $('<p>');
  stage_name.attr({
    'class' : 'stageName',
  }).css({
    'transform' : 'skew(45deg)',
  });
  stage_name.append(stage.name);

  btn.append(stage_name);
  $('#displayCenterProcess').append(btn);
};

function draw_stage_page(stage){
  draw_default_stage(stage);
};