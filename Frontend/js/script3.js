// global variables
var path = '';

$(document).ready(function() {
  $.ajax({
    type: "GET",
    url: "http://localhost:8000/api/data",
    success: function(data) {
      console.log(data);
      test();
      //draw_main_page(data[0]);
    },
    error: function(error) {
      console.log(error);
    }
  });
});
  
function draw_main_page(parent_process){
  clean_page();
  console.log('draw_main_page');
  var child_process = parent_process.child_process;
  var stage_list = child_process.stage_list;
  
  // create page element
  var main_page_element = $('<div>')
  main_page_element.attr({
    'class' : 'page',
    'id' : 'main_page',
  }).css({
    'position' : 'relative',
    'width' : '800px',
    'height' : '500px',
  })
  $('body').append(main_page_element)

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
};

function draw_subsheet(subsheet_id, stage_list){
  // remove previous page and create new blank page
  clean_page();
  console.log('draw_subsheet');
  var page_element = $('<div>')
  page_element.attr({
    'class' : 'page',
    'id' : subsheet_id,
  }).css({
    'position' : 'relative',
    'width' : '800px',
    'height' : '500px',
  })
  $('body').append(page_element)

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
};

function draw_default_stage(stage){
  // position variables
  var stage_x = parseInt(stage.x) + 400;
  var stage_y = parseInt(stage.y) + 250;
  
  // draw stage element
  var stage_element = $('<div>');
  stage_element.attr({
    'class' : 'stage',
    'id' : stage.id,
    'onclick' : "console.log('" + stage.id + ' --> ' + stage.onsuccess + "')",
  }).css({
    'cursor' : 'pointer',
    'background-color' : 'lightblue',
    'position' : 'absolute',
    'left' : stage_x + 'px',
    'top' : stage_y + 'px',
    'border' : '1px solid black',
    'z-index' : 1,
  });
  stage_element.append(stage.name);
  $('.page').append(stage_element);
};

function draw_start_end(stage){
  draw_default_stage(stage);
};

function draw_stage_subsheet(stage){
  draw_default_stage(stage);
};

function draw_stage_subsheet_info(stage){
  draw_default_stage(stage);
};

function draw_stage_process_info(stage){
  draw_default_stage(stage);
};

function draw_decision(stage){
  draw_default_stage(stage);
};

function draw_exception(stage){
  draw_default_stage(stage);
};

function draw_calculation(stage){
  draw_default_stage(stage);
};

function draw_loop_start(stage){
  draw_default_stage(stage);
};

function draw_loop_end(stage){
  draw_default_stage(stage);
};

function draw_data(stage){
  draw_default_stage(stage);
};

function draw_action(stage){
  draw_default_stage(stage);
};

function draw_multiple_calculation(stage){
  draw_default_stage(stage);
};

function draw_block(stage){
  draw_default_stage(stage);
};

function draw_collection(stage){
  draw_default_stage(stage);
};

function clean_page(){
  console.log('clean_page');
  $('.page').remove();
};

function test(){
  var div = $('<div>');
  div.attr({

  }).css({
    'margin' : '50px',
    'background-color' : 'lightgreen',
    'width' : '100px',
    'height' : '100px',
    'border-radius' : '25%',
    'text-align' : 'center',
  });
  div.append('Start')
  $('body').append(div)
}