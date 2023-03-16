var global_path, process_short_list, displayed_object, displayed_process, ip, port, customer_name;
ip = '192.168.0.40';
port = '8000';
customer_name = 'customer';

$(document).ready(() => {
  // adjust the height of the margin
  $('#margin').css('height', $(window).outerHeight() - $('nav').outerHeight());
  $('#displayProcess').css('height', $(window).outerHeight() - $('nav').outerHeight() - $('#path').outerHeight() - 4);
  
  path_scroll();

  get_process_short_list();

  $(window).resize(() => {
    draw_all_lines();
    path_scroll();
    $('#margin').css('height', $(window).outerHeight() - $('nav').outerHeight());
    $('#displayProcess').css('height', $(window).outerHeight() - $('nav').outerHeight() - $('#path').outerHeight() - 4);
    //move_items();
  });
});

function get_process_short_list(){
  $.ajax({
    type: 'GET',
    url: 'http://' + ip + ':' + port + '/' + customer_name + '/',
    dataType: 'json',
    success: function(data){
      process_short_list = data;
      console.log(process_short_list);
      build_margin(data);
    },
    error(e){
      alert(e);
    }
  });
};

function get_full_process(process_id, purpose = '', page_id = ''){
  $.ajax({
    type: 'GET',
    url: 'http://' + ip + ':' + port + '/' + customer_name + '/' + process_id,
    dataType: 'json',
    success:(data) => {
      if (purpose == ''){
        console.log(data);
        build_dropdown_content(data);
      } else if (purpose == 'mainPage'){
        displayed_process = data[0];
        displayed_object = data[1];
        draw_main_page();
      } else if (page_id != ''){
        displayed_process = data[0];
        displayed_object = data[1];
        draw_subsheet(page_id);
      };
    },
    error(e){
      alert(e);
    }
  });
};

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
    $(element).css({
      'top' : get_center().y + 'px',
      'left' : get_center().x + 'px',
    });
  });
};

function get_center(){
  var display_element = $('#displayProcess');
  var x = display_element.outerWidth() / 2;
  var y = display_element.outerHeight() / 2;
  return {'x' : x, 'y' : y};
};

function build_margin(short_list){
  var process_element, buttons_element, processButton_element, process_p, dropdownButton_element, dropdown_p, i;
  for (i = 0; i < short_list.length; i++){
    var id, name;
    id = short_list[i].id;
    name = short_list[i].name;

    process_p = $('<p>');
    process_p.append(name);

    dropdown_p = $('<p>');

    dropdownButton_element = $('<button>');
    dropdownButton_element.attr({
      'class' : 'dropdownButton',
      'id' : id,
      'onclick' : 'toggle_dropdown("' + id + '")',
    }).append(dropdown_p);

    processButton_element = $('<button>');
    processButton_element.attr({
      'class' : 'processButton showProcess',
      'id' : id,
      'onclick' : 'console.log("' + name + '"); get_full_process("' + id + '", "mainPage")',
    }).append(process_p);

    buttons_element = $('<div>');
    buttons_element.attr({
      'class' : 'buttons',
      'id' : id,
      'onclick' : '',
    }).append(processButton_element, dropdownButton_element);

    process_element = $('<div>');
    process_element.attr({
      'class' : 'process',
      'id' : id,
    }).append(buttons_element);

    $('#margin').append(process_element);
  };
};

function toggle_dropdown(process_id){
  var process, button, content, dropdownTimeout;
  
  process = $('.process').filter('#' + process_id);
  button = process.find('.dropdownButton');
  content = process.find('.dropdownContent');

  button.toggleClass('open');
  process.toggleClass('openProcess');
  
  if (content.hasClass('dropdownContent')){
    content.stop().slideUp(500);
    clearTimeout(dropdownTimeout);
    dropdownTimeout = setTimeout(() => {
      content.remove();
    }, 500);
  } else {
    get_full_process(process_id);
  };
};

function build_dropdown_content(data){
  var i, j;
  
  for (i = 0; i < data.length; i++){
    // variables
    var process_id, process_name, subsheet_list, subsheet_id, subsheet_name, dropdownContent_element, page_element;
        
    // storing the name, id and subsheet list
    process_id = data[i].id;
    process_name = data[i].name;
    subsheet_list = data[i].child_process.subsheet_list;

    // dropdown content parent
    dropdownContent_element = $('<div>');
    dropdownContent_element.attr({
      'class' : 'dropdownContent',
      'id' : process_id,
    });

    // main page
    page_element = $('<input>');
    page_element.attr({
      'class' : 'page',
      'id' : '0',
      'type' : 'submit',
      'value' : 'Main Page',
      'onclick' : 'console.log("Page ' + 0 + '")',
    });
    dropdownContent_element.append(page_element).stop().hide();
    
    // loop through subsheets
    for (j = 0; j < subsheet_list.length; j++){
      subsheet_id = subsheet_list[j].id;
      subsheet_name = subsheet_list[j].name;

      page_element = $('<input>');
      page_element.attr({
        'class' : 'page',
        'id' : subsheet_id,
        'type' : 'button',
        'value' : subsheet_name,
        'onclick' : 'console.log("' + subsheet_name + '")',
      });
      dropdownContent_element.append(page_element);
    };

    // append the dropdown content
    $('.process').filter('#' + process_id).append(dropdownContent_element);
    $('.process').filter('#' + process_id).find('.dropdownContent').stop().slideDown();
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

function empty_page(){
    console.log('clean_page');
    $('#displayCenterProcess').empty();
};
  
function empty_path(){
    global_path = [{'id': '0', 'name' : 'Main Page'}];
    $('#path').empty();
};

function edit_path(page_id, name, index = ''){
    // updating the list
    if (index == ''){
      // adding new list-item
      var path_page = {
        'id' : page_id,
        'name' : name,
      };
      global_path.push(path_page);
    } else {
      // removing all list items after index
      global_path.length = parseInt(index + 1);
    };
    draw_path();
};

function draw_path(){
    // variables
    var path_div, btn_element, i;
    // updating the path-element
    path_div = $('#path');
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
          'onclick' : 'edit_path("", "", ' + (i - 1) + '); draw_subsheet("' + global_path[i].id + '")',
        });
      };
      btn_element.append(global_path[i].name);
      path_div.append('/');
      path_div.append(btn_element);
    };
    $('#pageLabel').empty();
    $('#pageLabel').append(global_path[global_path.length - 1].name);
};

function draw_line(x1, y1, x2, y2){
  var line;
  line = document.createElementNS('http://www.w3.org/2000/svg','line');
  line.setAttribute('id','line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  $('svg').append(line);
};

function draw_all_lines(){
  $('svg').empty();

  var start_x, start_y, end_x, end_y;

  // get the size of section element
  var center_x = $('svg').outerWidth() / 2;
  var center_y = $('svg').outerHeight() / 2;

  $('.stage').each((i, start_element) => {
    if ($(start_element).attr('onsuccess') || $(start_element).attr('ontrue') || $(start_element).attr('onfalse')){
      $('.stage').each((j, end_element) => {
        if ($(start_element).attr('onsuccess') == $(end_element).attr('id') || $(start_element).attr('ontrue') == $(end_element).attr('id') || $(start_element).attr('onfalse') == $(end_element).attr('id')){
          start_x = $(start_element).position().left + $(start_element).outerWidth()/2 + center_x;
          start_y = $(start_element).position().top + $(start_element).outerHeight()/2 + center_y;
          end_x = $(end_element).position().left + $(end_element).outerWidth()/2 + center_x;
          end_y = $(end_element).position().top + $(end_element).outerHeight()/2 + center_y;
          draw_line(start_x, start_y, end_x, end_y);
        };
      });
    };
  });
};

//---------------------- Draw Pages -----------------------
function draw_main_page(){
    // variables
    var child_process, stage_list, stage, i, dimensions, display, svg;
    child_process = displayed_process.child_process;
    stage_list = child_process.stage_list;

    // draw the initial path
    empty_path();
    draw_path();
    empty_page();
  
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
    subsheet_list = displayed_process.child_process.subsheet_list
    name = 'Undefined';
    for (i = 0; i < subsheet_list.length; i++){
      if (subsheet_id == subsheet_list[i].id){
        name = subsheet_list[i].name;
      };
    };
  
    // draw the path
    edit_path(subsheet_id, name,);
  
    // remove previous page and create new blank page
    empty_page();
  
    // stage list
    stage_list = displayed_process.child_process.stage_list;
  
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
    var btn;
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
      'left' : parseInt(stage.x) + 'px',
      'top' : parseInt(stage.y) + 'px',
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
    var btn;
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
      'left' : parseInt(stage.x) + 'px',
      'top' : parseInt(stage.y) + 'px',
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
    var btn;
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
      'left' : parseInt(stage.x) + 'px',
      'top' : parseInt(stage.y) + 'px',
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
    var btn;
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
      'left' : parseInt(stage.x) + 'px',
      'top' : parseInt(stage.y) + 'px',
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
    var btn;
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
      'left' : parseInt(stage.x) + 'px',
      'top' : parseInt(stage.y) + 'px',
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
    var btn;
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
      'left' : parseInt(stage.x) + parseInt(stage.w)/2 + 'px',
      'top' : parseInt(stage.y) + parseInt(stage.h)/2 + 'px',
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
    var btn;
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
      'left' : parseInt(stage.x) + 'px',
      'top' : parseInt(stage.y) + 'px',
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

function toggle_filter(){
  // declearing variables
  var marginTop, input, inputDiv, button;

  // getting the html elements
  marginTop = $('#marginTop');
  button = $('#marginTop div');
  input = $('#searchInput');
  inputDiv = $('#searchDiv');

  if (input.hasClass('openSearch')){
    // hide the search input
    button.css({
      'transform' : 'scaleX(-1) translate(50%, -50%)',
    });
    input.val('');
    search();
  } else {
    // show the search input
    button.css({
      'transform' : 'scaleX(1) translate(-50%, -50%)',
    });
  };

  // toggle the search class
  input.toggleClass('openSearch');
  inputDiv.toggleClass('openSearchDiv');
};

function search(){
  var search = $('#searchInput').val();

  var process = $('.process').each((i, element) => {
    var name = $(element).find('.processButton').text();
    if (name.indexOf(search) != -1){
      $(element).stop().show();
    } else {
      $(element).stop().hide();
    };
  });
};

function hover_effect(){
    $('.stage').hover(function(){
      var stage_element, hover_div, hover_x, hover_y, id_element, type_element, button_element;
      stage_element = $(this);

      id_element = $('<p>');
      id_element.append(stage_element.attr('id'));

      type_element = $('<p>');
      type_element.append(stage_element.attr('stage_type'));

      button_element = $('<button>');
      button_element.append('...');
      
      hover_div = $('<div>');
      hover_x = stage_element.position().left;
      hover_y = stage_element.position().top + stage_element.outerHeight() + 2;
      hover_div.attr({
        'class' : 'hover',
      }).css({
        'left' : hover_x,
        'top' : hover_y,
      });
      hover_div.append(id_element, type_element, button_element);
      $('#displayCenterProcess').append(hover_div);
    }, function(){
      $('.hover').remove();
    });
};

function capitalize_str(str){
    str = str.toLowerCase().replace(/\b[a-z]/g, function(letter) {
      return letter.toUpperCase();
    });
    return str;
};