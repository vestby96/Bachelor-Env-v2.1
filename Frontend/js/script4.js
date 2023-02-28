// global variables
var path = '';

$(document).ready(function() {
  $.ajax({
    type: "GET",
    url: "http://localhost:8000/api/data",
    success: function(data) {
      console.log(data);
      draw_main_page(data[0]);
    },
    error: function(error) {
      console.log(error);
    }
  });
});
  
function draw_main_page(parent_process){
  console.log('draw_main_page');
  var child_process = parent_process.child_process;
  var stage_list = child_process.stage_list;
  
  // create page element
  var main_page_element = $('<div>')
  main_page_element.attr({
    'class' : 'page',
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
    } else if (!stage.subsheet_id && stage.type == 'Collection'){
      draw_collection(stage);
    } else if (!stage.subsheet_id){
      draw_default_stage(stage);
    };
  };
};

function draw_subsheet(subsheet, stage_list){
  console.log('draw_subsheet');
};

function draw_block(stage){
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
    'z-index' : 0
  });
  stage_element.append(stage.name);
  $('.page').append(stage_element);
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

function draw_collection(stage){
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