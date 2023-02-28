$(document).ready(function() {
    $.ajax({
      type: "GET",
      url: "http://localhost:8000/api/data",
      success: function(data) {
        console.log(data);
        // loop through items in array
        for (var i = 0; i < data.length; i++) {
          var parent_process = data[i]
          // Create a new section tag for each parent process
          var parent_process_tag = $('<section>').addClass('parent_process').attr({
            'id' : parent_process.id,
            'name' : parent_process.name
          }).css({
            'position' : 'relative'
          });
          $('body').append(parent_process_tag);
  
          // Create a new div tag for each child process
          var child_process = data[i].child_process;
          var child_process_tag = $('<div>').addClass('child_process').attr('id', child_process.id);
          child_process_tag.text(child_process.name);
          $('.parent_process').append(child_process_tag);
  
          // subsheets
          var subsheet_list = child_process.subsheet_list;
  
          // main page
          var main_page_tag = $('<div>').addClass('main_page').css({
            'position' : 'relative',
            'width' : '800px',
            'height' : '500px'
          });
          $('.child_process').append(main_page_tag);
  
          // loop through subsheet list
          for (var j = 0; j < subsheet_list.length; j++){
            var subsheet = subsheet_list[j];
            var subsheet_tag = $('<div>').addClass('subsheet').attr({
              'id' : subsheet.id
            }).css({
              'position' : 'relative',
              'width' : '800px',
              'height' : '500px'
            });
            $('.child_process').append(subsheet_tag);
  
            var stage_list = child_process.stage_list;
            // loop through stage list
            for (var k = 0; k < stage_list.length; k++){
              var stage = stage_list[k];
              if (stage.subsheet_id == subsheet.id){
                var x = parseInt(stage.x) + 400;
                var y = parseInt(stage.y) + 250;
  
                var stage_tag = $('<input>');
                stage_tag.attr({
                  'class' : 'stage',
                  'id' : stage.id,
                  'onsuccess' : stage.onsuccess,
                  'type' : 'button',
                  'value' : stage.name,
                  'onclick' : "console.log('" + stage.id + "')"
                });
                stage_tag.css({
                  'cursor' : 'pointer',
                  'background-color' : 'lightblue',
                  'position' : 'absolute',
                  'left' : x + 'px',
                  'top' : y + 'px',
                  'padding' : '5px',
                  'border' : '1px solid black'
                });
  
                var hover_div = $('<div>');
                var hover_x = parseInt(stage.x) + 400;
                var hover_y = parseInt(stage.y) + 280;
                hover_div.attr({
                  'class' : 'hover_div',
                  'id' : stage.id
                });
                hover_div.css({
                  'position' : 'absolute',
                  'left' : hover_x + 'px',
                  'top' : hover_y + 'px',
                  'background-color' : '#41b3a3',
                  'opacity' : '0',
                  'z-index' : '-1',
                  'border' : '1px solid black',
                  'padding' : '0px 15px'
                });
                hover_div.append(
                  "<p>Id: " + stage.id + "</p>" +
                  "<p>Type: " + stage.type + "</p>" +
                  "<p>Onsuccess: " + stage.onsuccess + "</p>"
                );
                $('#' + stage.subsheet_id).append(hover_div);
                $('#' + stage.subsheet_id).append(stage_tag);
              }
              else if (!stage.subsheet_id && !$('#' + stage.id).length){
                var x = parseInt(stage.x) + 400;
                var y = parseInt(stage.y) + 250;
  
                if (stage.type == 'Block'){
                  var stage_tag = $('<div>');
                  stage_tag.css({
                    'width' : stage.w,
                    'height' : stage.h,
                    'opacity' : 0.5
                  });
                  stage_tag.append(stage.name)
                } else {
                  var stage_tag = $('<input>');
                };
                
                stage_tag.attr({
                  'class' : 'stage',
                  'id' : stage.id,
                  'onsuccess' : stage.onsuccess,
                  'type' : 'button',
                  'value' : stage.name,
                  'onclick' : "console.log('" + stage.id + "')"
                });
                stage_tag.css({
                  'cursor' : 'pointer',
                  'background-color' : 'lightblue',
                  'position' : 'absolute',
                  'left' : x + 'px',
                  'top' : y + 'px',
                  //'padding' : '5px',
                  'border' : '1px solid black'
                });
                
                
                var hover_div = $('<div>');
                var hover_x = parseInt(stage.x) + 400;
                var hover_y = parseInt(stage.y) + 280;
                hover_div.attr({
                  'class' : 'hover_div',
                  'id' : stage.id
                });
                hover_div.css({
                  'position' : 'absolute',
                  'left' : hover_x + 'px',
                  'top' : hover_y + 'px',
                  'background-color' : '#41b3a3',
                  'opacity' : '0',
                  'z-index' : '-1',
                  'border' : '1px solid black',
                  'padding' : '0px 15px'
                });
                hover_div.append(
                  "<p>Id: " + stage.id + "</p>" +
                  "<p>Type: " + stage.type + "</p>" +
                  "<p>Onsuccess: " + stage.onsuccess + "</p>"
                );
                $('.main_page').append(hover_div);
                $('.main_page').append(stage_tag);
              };
              $('.stage').hover(function(){
                var stage_tag = $(this);
                $('#' + stage_tag.attr('id')).css({
                  'opacity' : '1',
                  'z-index' : '1'
                });
              }, function(){
                var stage_tag = $(this);
                $('#' + stage_tag.attr('id')).css({
                  'opacity' : '0',
                  'z-index' : '-1'
                });
              });
            };
            };
            var svg_element = $('<svg>');
            svg_element.attr({
              'class' : 'arrow_tag'
            });
            svg_element.css({
              'position' : 'absolute',
              'z-index' : '-1',
              'width' : '800px',
              'height' : '500px'
            });
            $('.main_page').append(svg_element);
            for (var k = 0; k < stage_list.length; k++){
              stage = stage_list[k];
              if (stage.onsuccess){
                var start_tag = $('#' + stage.id);
                var end_tag = $('#' + stage.onsuccess);
                // test
                $(document.createElementNS('http://www.w3.org/2000/svg','line')).attr({
                  'x1':start_tag.css('left'),
                  'y1':start_tag.css('top'),
                  'x2':end_tag.css('left'),
                  'y2':end_tag.css('top'),
                  'stroke':'black',
                  //'stroke-width':'2px'
                }).css({
                  //'position' : 'relative',
                  //'z-index' : '1'
                }).appendTo(".arrow_tag");
              };
          };
        };
      },
      error: function(error) {
        console.log(error);
      }
    });
  });
  