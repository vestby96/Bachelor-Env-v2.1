// global variables
var global_path = [{'id': '0', 'name' : 'Main Page'}];
var global_data, selected_process = [];

function get_all_processes_for_customer(){
  // getting the customer search value
  var customer_name = $('#searchCustomerInput').val();
  // removing the path, process list and stages
  clean_path();
  $('#processList li').remove();
  $('#searchCustomerResponse p').remove();
  clean_page();
  // api
  $.ajax({
    type: "GET",
    // get the process by process name
    url: "http://localhost:8000/" + customer_name + "/",
    success: function(data) {
      try {
        // checking if the api response is a process list or error
        if (data.length == undefined){
          alert('No customer found');
        } else {
          // storing the data from the api globaly
          // the global_data is now a list of lists, where each sub-list is a xml-parent-process
          global_data = data;
          console.log(global_data);
          // creating a button for each processes to the customer
          var p_element = $('<p>');
          p_element.append(global_data.length + ' processes found');
          $('#searchCustomerResponse').append(p_element);
          // loop through each item in the api response
          for (var i = 0; i < global_data.length; i++){
            // create a list item with an anchor for each process the customer has access to
            var li_element = $('<li>');
            var button_element = $('<button>');
            button_element.attr({
                'onclick' : 'select_process(' + i + ');reset_path();draw_main_page()',
            });
            button_element.append(global_data[i][0].name);
            li_element.append(button_element);
            $('#processList').append(li_element);
          };
          // hover function
          hover_effect();
        };
      } catch {
        alert('No customer found');
      };
    },
    error: function(error) {
      alert(error);
      console.log(error);
    }
  });
};

function select_process(index){
  try {
    selected_process = global_data[parseInt(index)];
  } catch {
    console.log('error in select_process function');
  };
};

function search_function(){
  // get the input
  // find matching results
  // create anchors for each result
  // remove anchors and reset input when an achor is clicked
  var filter = $("#searchInput").val().toUpperCase();
  var div = $("#myDropdown");
  var a = div.find("a");
  for (i = 0; i < a.length; i++) {
    var txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    };
  };
};

function filter_function() {
  var input, filter, ul, li, a, i;
  input = $("#searchInput");
  filter = input.val().toUpperCase();
  div = $("#myDropdown");
  a = div.find("a");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    };
  };
};

function hover_effect(){
  $('.stage').hover(function(){
    var stage_element = $(this);
    var hover_div = $('<div>');
    var hover_x = stage_element.position().left;
    var hover_y = stage_element.position().top + stage_element.outerHeight() + 2;
    hover_div.attr({
      'class' : 'hover',
    }).css({
      'position' : 'absolute',
      'left' : hover_x,
      'top' : hover_y,
      'background-color' : 'lightgray',
      'z-index' : '1',
      'border' : '1px solid black',
      'padding' : '0px 15px',
    });
    hover_div.append(
      "<p>Id: " + stage_element.attr('id') + "</p>" + 
      "<p>Type: " + stage_element.attr('stage_type') + "</p>"
    );
    $('.page').append(hover_div);
  }, function(){
    $('.hover').remove();
  });
};

function reset_path(){
  // reset the path
  global_path = [{'id': '0', 'name' : 'Main Page'}];
  draw_path();
};

function clean_page(){
  console.log('clean_page');
  $('.page').empty();
};

function clean_path(){
  global_path = [{'id': '0', 'name' : 'Main Page'}];
  $('.path_ul').remove();
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
    global_path.length = parseInt(index + 1);
  };
  draw_path();
};

//--------------- List path and draw arrows ---------------
function draw_path(){
  // updating the path-element
  var header_element = $('.path');
  $('.path_ul').remove();
  var ul_element = $('<ul>');
  ul_element.attr({
    'class' : 'path_ul',
  });
  for (var i = 0; i < global_path.length - 1; i++){
    var li_element = $('<li>');
    var btn_element = $('<button>');
    btn_element.attr({
      'class' : 'pathButton',
    }).css({

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
    li_element.append(btn_element);
    ul_element.append(li_element);
  };
  var li_element = $('<li>');
  li_element.append(global_path[global_path.length - 1].name);
  ul_element.append(li_element);
  header_element.append(ul_element);
};

function draw_arrows(){
  $('.canvas').remove();
  
  var canvas_element = $('<canvas>');
  canvas_element.attr({

  }).css({

  });

  var stage_element_list = $('.stage').get();
  for (var i = 0; i < stage_element_list.length; i++){
    var stage_element_from = stage_element_list[i];
    if (stage_element_from.attr('onsuccess')){
      for (var j = 0; j < stage_element_list.length; j++){
        var stage_element_to = stage_element_list[j];
        if (stage_element_from.attr('onsuccess') == stage_element_to.attr('id')){

        }
      };
    }
  };
};

//---------------------- Draw Pages -----------------------
function draw_main_page(){
  // draw the initial path
  draw_path();
  clean_page();
  console.log('draw_main_page');

  // variables
  var child_process = selected_process[0].child_process;
  var stage_list = child_process.stage_list;

  //draw stages
  for (var i = 0; i < stage_list.length; i++){
    var stage = stage_list[i];
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
  hover_effect();
};

function draw_subsheet(subsheet_id){
  // find the subsheet name and draw the path
  var name = 'Undefined';
  for (var i = 0; i < selected_process[0].child_process.subsheet_list.length; i++){
    if (subsheet_id == selected_process[0].child_process.subsheet_list[i].id){
      name = selected_process[0].child_process.subsheet_list[i].name;
    };
  };
  edit_path(subsheet_id, name,);

  // remove previous page and create new blank page
  clean_page();
  console.log('draw_subsheet');

  // global stage list
  var stage_list = selected_process[0].child_process.stage_list;

  // draw stages
  for (var i = 0; i < stage_list.length; i++){
    var stage = stage_list[i];
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
  hover_effect();
};

//---------------------- Draw Stages ----------------------
function draw_default_stage(stage){
  var btn = $('<button>');
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
    'left' : parseInt(stage.x) + 400 + 'px',
    'top' : parseInt(stage.y) + 250 + 'px',
    'transform' : 'translate(-55%, -55%)',
    'border' : '1px solid black',
    'background-color' : 'white',
    'cursor' : 'pointer',
    'padding' : '10px',
    'z-index' : 1,
    'font-size' : 12,
  });
  btn.append(stage.name);
  $('.page').append(btn);
};

function draw_start_end(stage){
  var btn = $('<button>');
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
    'left' : parseInt(stage.x) + 400 + 'px',
    'top' : parseInt(stage.y) + 250 + 'px',
    'transform' : 'translate(-55%, -55%)',
    'border' : '1px solid black',
    'background-color' : 'white',
    'cursor' : 'pointer',
    'padding' : '10px',
    'border-radius' : '25%',
    'z-index' : 1,
    'font-size' : 12,
  });
  btn.append(stage.name);
  $('.page').append(btn);
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
  var btn = $('<button>');
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
    'left' : parseInt(stage.x) + 400 + 'px',
    'top' : parseInt(stage.y) + 250 + 'px',
    'transform' : 'translate(-55%, -55%)',
    'border' : '1px solid black',
    'background-color' : 'white',
    'cursor' : 'pointer',
    'z-index' : 1,
    'font-size' : 12,
  });

  btn.append(stage.name);
  $('.page').append(btn);
};

function draw_stage_subsheet_info(stage){
  draw_default_stage(stage);
};

function draw_stage_process_info(stage){
  var btn = $('<div>');
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
    'left' : parseInt(stage.x) + 400 + 'px',
    'top' : parseInt(stage.y) + 250 + 'px',
    'transform' : 'translate(-55%, -55%)',
    'border' : '1px solid black',
    'background-color' : 'white',
    'cursor' : 'pointer',
    'opacity' : 0.5,
    'z-index' : 0,
    'font-size' : 12,
  });
  btn.append(stage.name);
  $('.page').append(btn);
};

function draw_stage_process(stage){
  draw_default_stage(stage);
};

function draw_decision(stage){
  var btn = $('<button>');
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
    'left' : parseInt(stage.x) + 400 + 'px',
    'top' : parseInt(stage.y) + 250 + 'px',
    'transform' : 'translate(-55%, -55%)',
    'border' : '1px solid black',
    'background-color' : 'white',
    'cursor' : 'pointer',
    'z-index' : 1,
    'font-size' : 12,
  });
  btn.append(stage.name);
  $('.page').append(btn);
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
  var btn = $('<div>');
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
    'left' : parseInt(stage.x) + parseInt(stage.w)/2 + 400 + 'px',
    'top' : parseInt(stage.y) + parseInt(stage.h)/2 + 250 + 'px',
    'transform' : 'translate(-55%, -55%)',
    'border' : '1px solid black',
    'background-color' : 'lightblue',
    'cursor' : 'pointer',
    'opacity' : 0.5,
    'z-index' : 0,
    'font-size' : 11,
  });
  btn.append(stage.name);
  $('.page').append(btn);
};

function draw_collection(stage){
  var btn = $('<button>');
  btn.attr({
    'class' : 'stage',
    'id' : stage.id,
    'onsuccess' : stage.onsuccess,
    'type' : 'button',
    'stage_type' : stage.type,
  }).css({
    'width' : parseInt(stage.w)*0.8,
    'height' : parseInt(stage.h)*0.9,
    'position' : 'absolute',
    'left' : parseInt(stage.x) + 400 + 'px',
    'top' : parseInt(stage.y) + 250 + 'px',
    'transform' : 'translate(-55%, -55%) skew(-45deg)',
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
  $('.page').append(btn);
};

function draw_stage_page(stage){
  draw_default_stage(stage);
};
