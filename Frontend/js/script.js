// global variables
var global_path, process_short_list, displayed_object, displayed_process, file_info, ip, port, customer_name, hoverTimeout;

ip = 'localhost';
port = '8000';
customer_name = 'customer';

$(document).ready(() => {
  // run initial functions
  path_scroll();
  get_process_short_list();

  // some functions are effected by the width of the window
  $(window).resize(() => {
    draw_all_lines();
    path_scroll();
  });
});

// function to get the short list of process data
function get_process_short_list(){
  $.ajax({
    type: 'GET',
    url: 'http://' + ip + ':' + port + '/' + customer_name + '/',
    dataType: 'json',
    success: function(data){
      process_short_list = data;
      build_margin(data);
    },
    error(e){
      alert(e);
    }
  });
};

// function to get the full info list of a given process id
function get_full_process(process_id, purpose = '', page_id = ''){
  $.ajax({
    type: 'GET',
    url: 'http://' + ip + ':' + port + '/' + customer_name + '/' + process_id,
    dataType: 'json',
    success:(data) => {
      if (purpose == '' && page_id == ''){
        // if only process id i given, the dropdown content will be built
        build_dropdown_content(data);
      } else if (purpose == 'mainPage' && page_id == ''){
        // if the purpose says main page, the main page will be drawn
        displayed_process = data[0];
        file_info = data[1];
        draw_main_page();
      } else if ( purpose == '' && page_id != ''){
        // if a page id is given, the given page will be drawn
        displayed_process = data[0];
        file_info = data[1];
        draw_subsheet(page_id);
      };
    },
    error(e){
      // catch error
      alert(e);
    }
  });
};

// horizontal scroll for the path
function path_scroll(){
  let element, length, position;
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

// input a short list of process ids and names and add them to the margin
function build_margin(short_list){
  let process_element, buttons_element, processButton_element, process_p, dropdownButton_element, dropdown_p, id, name, i;
  for (i = 0; i < short_list.length; i++){
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
      'onclick' : 'get_full_process("' + id + '", "mainPage")',
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

// toggle the dropdown content in the margin of a given process
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

// get the the main page and all subsheets of a given process and add them to the margin
function build_dropdown_content(data){
    let j;
  
    // variables
    let process_id, process_name, subsheet_list, subsheet_id, subsheet_name, dropdownContent_element, page_element;
        
    // storing the name, id and subsheet list
    process_id = data[0].id;
    process_name = data[0].name;
    subsheet_list = data[0].child_process.subsheet_list;

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
      'onclick' : 'empty_path();get_full_process("' + process_id + '", "mainPage")',
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
        'onclick' : 'empty_path();get_full_process("' + process_id + '", "", "' + subsheet_id + '")',
      });
      dropdownContent_element.append(page_element);
    };

    // append the dropdown content
    $('.process').filter('#' + process_id).append(dropdownContent_element);
    $('.process').filter('#' + process_id).find('.dropdownContent').stop().slideDown();
};

// remove all stages
function empty_page(){
    $('#displayCenterProcess').empty();
};

// empty and reset the path
function empty_path(){
    global_path = [{'id': '0', 'name' : 'Main Page'}];
    $('#path').empty();
};

// add or remove items in the path
function edit_path(page_id, name, index = ''){
    // updating the list
    if (index == ''){
      // adding new list-item
      global_path.push({'id' : page_id, 'name' : name});
    } else {
      // removing all list items after index
      global_path.length = parseInt(index) + 1;
    };
    // last draw the new path
    draw_path();
};

// draw the path
function draw_path(){
    // variables
    let path_div, btn_element, i;
    // empty the entire path-element
    path_div = $('#path');
    path_div.empty();
  
    // loop through the path list
    for (i = 0; i < global_path.length - 1; i++){
      // create a button for each entry
      btn_element = $('<button>');
      btn_element.attr({
        'class' : 'pathButton',
      });
      
      // if the id of the page is 0 it is the main page
      if (global_path[i].id == '0'){
        btn_element.attr({
          'onclick' : 'edit_path("", ""," ' + i + '"); draw_main_page()',
        });
      } else {
        btn_element.attr({
          'onclick' : 'edit_path("", "", "' + (i - 1) + '"); draw_subsheet("' + global_path[i].id + '")',
        });
      }
      btn_element.text('/' + global_path[i].name);
      path_div.append(btn_element);
    };

    // adding the current page to the label
    $('#pageLabel').empty().append(global_path[global_path.length - 1].name);
};

// draw an svg path from given start and end coordinates
function draw_line(x1, y1, x2, y2){
  let line, midX, midY;
  midX = (x1 + x2)/2
  midY = (y1 + y2)/2
  
  line = document.createElementNS('http://www.w3.org/2000/svg','path');
  line.setAttribute('id','line');
  line.setAttribute('d', "M " + x1 + " " + y1 + " L " + midX + " " + midY + " L " + x2 + " " + y2);
  line.setAttribute('stroke', 'black');
  line.setAttribute('stroke-width', '1px');
  line.setAttribute('marker-mid', 'url(#arrow)');
  $('svg').append(line);
};

// get the positions of all stages with onsucces and draw lines from start to end stage
function draw_all_lines(){
  $('svg').find('path').filter('#line').remove();

  let start_x, start_y, end_x, end_y, center_x, center_y;

  // get the size of section element
  center_x = $('svg').outerWidth() / 2;
  center_y = $('svg').outerHeight() / 2;

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

// toggle the search filter in the html
function toggle_filter(){
  // declearing variables
  let marginTop, input, inputDiv, button;

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

// filter the processes in the margin
function search(){
  let search, name;
  search = $('#searchInput').val().toLowerCase();

  $('.process').each((i, element) => {
    name = $(element).find('.processButton').text();
    if (name.indexOf(search) != -1){
      $(element).stop().show();
    } else {
      $(element).stop().hide();
    };
  });
};

// hover effect on the stages
function hover_effect(){
  let stage, hover;
  $('.stage').mouseenter(function() {
    stage = $(this);
    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(function(){
      hover = $('#displayCenterProcess').find('.hover').filter('#' + stage.attr('id'));
      hover.addClass('showHover').stop().slideDown(200);
    }, 1000);
  });
  $('.stage').mouseleave(function() {
    clearTimeout(hoverTimeout);
    hover = $('#displayCenterProcess').find('.hover').filter('#' + $(this).attr('id'));
    hover.removeClass('showHover').stop().slideUp(100);
  });
  $('.hover').mouseenter(function() {
    $(this).addClass('showHover').stop().slideDown(200);
  });
  $('.hover').mouseleave(function() {
    $(this).removeClass('showHover').stop().slideUp(100);
  });
};

//---------------------- Draw Pages -----------------------
function draw_main_page(){
    // variables
    let child_process, stage_list, stage, i;

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
    let name, stage_list, stage, subsheet_list, i;
  
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
    let btn, hover, hover_x, hover_y, hover_btn, hover_type;

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
      'left' : parseInt(stage.x) + 'px',
      'top' : parseInt(stage.y) + 'px',
      'transform' : 'translate(-50%, -50%)',
      'background-color' : 'white',
      'padding' : '10px',
      'z-index' : 1,
      'font-size' : 12,
    });
    btn.append(stage.name);
    $('#displayCenterProcess').append(btn);

    hover_x = $('#' + stage.id).position().left;
    hover_y = $('#' + stage.id).position().top + $('#' + stage.id).outerHeight() + 1;

    hover_type = $('<p>');
    hover_type.append(stage.type);

    hover_btn = $('<button>');
    hover_btn.attr({

    }).css({
      
    }).append('More...');

    hover = $('<div>');
    hover.attr({
      'class' : 'hover',
      'id' : stage.id,
    }).css({
      'top' : hover_y + 'px',
      'left' : hover_x + 'px',
    }).append(hover_type, hover_btn);

    $('#displayCenterProcess').append(hover);
};
  
function draw_start_end(stage){
    let btn, hover_x, hover_y, hover_type, hover_btn, hover;

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
      'left' : parseInt(stage.x) + 'px',
      'top' : parseInt(stage.y) + 'px',
      'transform' : 'translate(-50%, -50%)',
      'background-color' : 'white',
      'padding' : '10px',
      'border-radius' : '25%',
      'z-index' : 1,
      'font-size' : 12,
    });
    btn.append(stage.name);
    $('#displayCenterProcess').append(btn);

    hover_x = $('#' + stage.id).position().left;
    hover_y = $('#' + stage.id).position().top + $('#' + stage.id).outerHeight() + 1;

    hover_type = $('<p>');
    hover_type.append(stage.type);

    hover_btn = $('<button>');
    hover_btn.attr({

    }).css({
      
    }).append('More...');

    hover = $('<div>');
    hover.attr({
      'class' : 'hover',
      'id' : stage.id,
    }).css({
      'top' : hover_y + 'px',
      'left' : hover_x + 'px',
    }).append(hover_type, hover_btn);

    $('#displayCenterProcess').append(hover);
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
    let btn, hover_x, hover_y, hover_type, hover_btn, hover;

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
      'left' : parseInt(stage.x) + 'px',
      'top' : parseInt(stage.y) + 'px',
      'transform' : 'translate(-50%, -50%)',
      'background-color' : 'white',
      'z-index' : 1,
      'font-size' : 12,
    });
  
    btn.append(stage.name);
    $('#displayCenterProcess').append(btn);

    hover_x = $('#' + stage.id).position().left;
    hover_y = $('#' + stage.id).position().top + $('#' + stage.id).outerHeight() + 1;

    hover_type = $('<p>');
    hover_type.append(stage.type);

    hover_btn = $('<button>');
    hover_btn.attr({

    }).css({
      
    }).append('More...');

    hover = $('<div>');
    hover.attr({
      'class' : 'hover',
      'id' : stage.id,
    }).css({
      'top' : hover_y + 'px',
      'left' : hover_x + 'px',
    }).append(hover_type, hover_btn);

    $('#displayCenterProcess').append(hover);
};
  
function draw_stage_subsheet_info(stage){
    draw_default_stage(stage);
};
  
function draw_stage_process_info(stage){
    let btn, hover_x, hover_y, hover_type, hover_btn, hover, p_element;

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
      'left' : parseInt(stage.x) + 'px',
      'top' : parseInt(stage.y) + 'px',
      'transform' : 'translate(-50%, -50%)',
      'background-color' : 'white',
      'opacity' : 0.5,
      'z-index' : 0,
      'font-size' : 12,
    });

    p_element = $('<p>');
    p_element.css({
      'border-bottom' : '1px solid black',
    }).append(file_info.name);
    btn.append(p_element);

    p_element = $('<p>');
    p_element.append(displayed_process.child_process.narrative);
    btn.append(p_element);

    p_element = $('<p>');
    p_element.css({
      'position' : 'absolute',
      'bottom' : '0',
      'left' : '0',
      'border-top' : '1px solid black',
    }).append('Created: ' + file_info.user_created_by + ', at ' + file_info.created);
    btn.append(p_element);

    $('#displayCenterProcess').append(btn);

    hover_x = $('#' + stage.id).position().left;
    hover_y = $('#' + stage.id).position().top + $('#' + stage.id).outerHeight() + 1;

    hover_type = $('<p>');
    hover_type.append(stage.type);

    hover_btn = $('<button>');
    hover_btn.attr({

    }).css({
      
    }).append('More...');

    hover = $('<div>');
    hover.attr({
      'class' : 'hover',
      'id' : stage.id,
    }).css({
      'top' : hover_y + 'px',
      'left' : hover_x + 'px',
    }).append(hover_type, hover_btn);

    $('#displayCenterProcess').append(hover);
};
  
function draw_stage_process(stage){
    draw_default_stage(stage);
};
  
function draw_decision(stage){
    let btn, hover_x, hover_y, hover_type, hover_btn, hover;

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
      'left' : parseInt(stage.x) + 'px',
      'top' : parseInt(stage.y) + 'px',
      'transform' : 'translate(-50%, -50%)',
      'border' : 'none',
      'background-color' : 'transparent',
      'background-image' : 'url("./img/decision.png")',
      'background-repeat' : 'no-repeat',
      'background-size' : '100% 95%',
      'background-position' : 'center',
      'z-index' : 1,
      'font-size' : 12,
    });
    btn.append(stage.name);
    $('#displayCenterProcess').append(btn);

    hover_x = $('#' + stage.id).position().left;
    hover_y = $('#' + stage.id).position().top + $('#' + stage.id).outerHeight() + 1;

    hover_type = $('<p>');
    hover_type.append(stage.type);

    hover_btn = $('<button>');
    hover_btn.attr({

    }).css({
      
    }).append('More...');

    hover = $('<div>');
    hover.attr({
      'class' : 'hover',
      'id' : stage.id,
    }).css({
      'top' : hover_y + 'px',
      'left' : hover_x + 'px',
    }).append(hover_type, hover_btn);

    $('#displayCenterProcess').append(hover);
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
    let btn, hover_x, hover_y, hover_type, hover_btn, hover, onsuccess_element;
    
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
      'left' : parseInt(stage.x) + parseInt(stage.w)/2 + 'px',
      'top' : parseInt(stage.y) + parseInt(stage.h)/2 + 'px',
      'transform' : 'translate(-50%, -50%)',
      'background-color' : 'lightblue',
      'opacity' : 0.5,
      'z-index' : 0,
      'font-size' : 11,
    });
    btn.append(stage.name);
    $('#displayCenterProcess').append(btn);

    hover_x = $('#' + stage.id).position().left;
    hover_y = $('#' + stage.id).position().top + $('#' + stage.id).outerHeight() + 1;

    hover_type = $('<p>');
    hover_type.attr('class', 'stageType').append(stage.type);

    onsuccess_element = $('<p>');
    onsuccess_element.attr('id', 'onsuccess').append('Onsuccess: ' + stage.onsuccess).hide();

    hover_btn = $('<button>');
    hover_btn.attr({
      'class' : 'expandButton',
      'onclick' : 'toggle_expand_hover("' + stage.id + '")',
    }).css({
      
    }).append('More...');

    hover = $('<div>');
    hover.attr({
      'class' : 'hover',
      'id' : stage.id,
    }).css({
      'top' : hover_y + 'px',
      'left' : hover_x + 'px',
    }).append(hover_type, onsuccess_element, hover_btn);

    $('#displayCenterProcess').append(hover);
};
  
function draw_collection(stage){
    let btn, stage_name, hover_x, hover_y, hover_type, hover_element, hover_btn;

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
      'left' : parseInt(stage.x) + 'px',
      'top' : parseInt(stage.y) + 'px',
      'transform' : 'translate(-50%, -50%) skew(-45deg)',
      'background-color' : 'white',
      'padding' : '5px',
      'z-index' : 1,
      'font-size' : 12,
    });
  
    stage_name = $('<p>');
    stage_name.attr({
      'class' : 'stageName',
    }).css({
      'transform' : 'skew(45deg)',
    });
    stage_name.append(stage.name);
  
    btn.append(stage_name);
    $('#displayCenterProcess').append(btn);

    hover_x = $('#' + stage.id).position().left;
    hover_y = $('#' + stage.id).position().top + $('#' + stage.id).outerHeight() + 1;

    hover_type = $('<p>');
    hover_type.attr('class', 'stageType').append(stage.type);

    hover_btn = $('<button>');
    hover_btn.attr({
      'onclick' : 'toggle_expand_hover("' + stage.id + '")',
    }).append('More...');

    hover_element = $('<div>');
    hover_element.attr({
      'class' : 'hover',
      'id' : stage.id,
    }).css({
      'top' : hover_y + 'px',
      'left' : hover_x + 'px',
    }).append(hover_type, hover_btn);

    $('#displayCenterProcess').append(hover_element);
};

function draw_stage_page(stage){
    draw_default_stage(stage);
};

function toggle_expand_hover(stage_id){
  var hover_element;
  hover_element = $('.hover').filter('#' + stage_id);
  if (hover_element.hasClass('expanded')){
    // hide all, and show selected elements inside hover
    hover_element.find('*').hide();
    hover_element.find('.stageType').show();
    hover_element.find('.expandButton').show().empty().append('More...');
  } else {
    // show all elements inside hover
    hover_element.find('*').show();
    hover_element.find('.expandButton').empty().append('Less...');
  }
  // resize the hover element
  hover_element.css('height', 'fit-content').toggleClass('expanded');
};