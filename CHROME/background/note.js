function paintPalette(){
	var printLastColors = function(){
		$('#pwj_last_colors').empty().append(function(){
			// console.log(last_colors)
			var ret='';
			for(i in last_colors){
				ret+='<button class="pwj_last_color pwj_button" data-color="'+last_colors[i]+'" style="width: 50px;height:25px; background-color:'+last_colors[i]+';"></button>'
			}
			return ret;
		}.call())
	}
	var addLastColors = function(colors){
		// console.log(typeof colors);
		var addElement = function(elem){
			if(last_colors.indexOf(elem)===-1){
				last_colors.push(elem);
			}
		}
		// console.log('add all');
		if(typeof colors === 'object'){
			for(i in colors){
				addElement(colors[i]);
			}
		}else if(typeof colors === 'string'){
			// console.log('2');
			addElement(colors);
		}
		// console.log(last_colors);
		if(last_colors.length>10){
			last_colors = last_colors.slice(0,10);
		}
		chrome.storage.local.set({last_colors:last_colors})
		printLastColors();
	}
	var last_colors = [];
	var	color = "#000000";
	chrome.storage.local.get(['last_colors'], function(data){
		if(data){
			addLastColors(data.last_colors);
		}
	})
	return {
		color : color,
		last_colors : last_colors,
		setColor : function setColor(color){
			if(this.color===color){
				return;
			}
			this.color = color;
			addLastColors(this.color);
			$('.pwj_color_picker').val(this.color);
		},
		addLastColors : addLastColors
	}
}
//var paintPalette = {};
$(document).on('click','.pwj_last_color',function(){
	paintPalette.setColor($(this).data('color'));
})


var runWebNote = function(){
	console.log("LOADED")
	setEnv();
	paintPalette = new paintPalette();
}
var setEnv = function(){
	$(".pwj_elem").remove();
	if(!$(".pwj_elem")[0]){
		$("body").append('<section class="pwj_blackboard">\
		<div class="pwj_draw_box pwj_elem">\
		<canvas id="pwj_draw"></canvas>\
		</div>\
		<div class="pwj_elem" id="pwj_tool_box">\
		<input type="color" class="pwj_color_picker pwj_button" title="Pick color">\
		<section id="pwj_last_colors"></section>\
		<button class="pwj_button undo_canvas" title="Undo paint">Undo</button>\
		<button class="pwj_button pwj_right pwj_hide" title="Hide blackboard">Hide</button>\
		</div>\
		<section class="pwj_elem" id="pwj_spawner"></section>\
		</section>\
		<button class="pwj_button pwj_show">&lt;</button>\
		')
		setLogic();
	}
	optimizeView();
}
var optimizeView = function(){
	$(".pwj_draw_box").css("height",0);
	var height = $("html")[0].scrollHeight
	$(".pwj_draw_box").css("width",0);
	var width = $("html")[0].scrollWidth;
	$(".pwj_draw_box").css("height",height)
	$(".pwj_draw_box").css("width",width)
	$("canvas#pwj_draw").attr("width",width).attr("height",height)
}
var setLogic = function(){
	$('.pwj_hide').on('click',function clickHide(){
		$('.pwj_blackboard').hide();
		$('.pwj_show').show();
	});
	$('.pwj_show').on('click',function clickHide(){
		$('.pwj_blackboard').show();
		$('.pwj_show').hide();
	});
	$(".pwj_draw_box").on('dblclick',function(evt){
		//console.log(evt)
		spawnNote(evt);
	})
	$("canvas#pwj_draw").on('mousemove',function(evt){
		//console.log("MOVE")
		//console.log(evt)
		evt.preventDefault();
		//var canvas = this;
		var canvas = document.getElementById("pwj_draw")
		var ctx = canvas.getContext("2d")
		var x = evt.offsetX;
		var y = evt.offsetY;
		if(evt.which === 1 || evt.buttons === 1){
			printPixel(ctx,x,y)
		}
	}).on('mousedown mouseup',function(evt){
		pathon=!pathon;
		//console.log(pathon)
		var canvas = document.getElementById("pwj_draw")
		var ctx = canvas.getContext("2d")
		if(pathon){
			ctx.beginPath();
			saveCanvas();
		}
	}).on('mouseout',function(){
		//pathon = false;
	})
	$(window).on('resize',function(){
		optimizeView();
	})
	$(".pwj_color_picker").on('change',function(){
		paintPalette.setColor($(this).val());
	})
	$(".undo_canvas").on('click',function(){
		undoCanvas();
	})
	$(document).on('mousedown', '.pwj_note_box', function(e) {
		if($(e.target).hasClass("pwj_note")){
			return;
		}
		console.log(e)
		var correctX = e.offsetX;
		var correctY = e.offsetY;
        $(this).addClass('draggable').parents().on('mousemove', function(e) {
            $('.draggable').offset({
                top: e.pageY - correctY,
                left: e.pageX - correctX
            }).on('mouseup', function() {
                $(this).removeClass('draggable');
            });
        });
        e.preventDefault();
    }).on('mouseup', function() {
        $('.draggable').removeClass('draggable');
    });
}
pathon = false;
var printPixel = function(ctx,x,y){
	//canvas = document.getElementById("pwj_draw")
	//var ctx = canvas.getContext("2d")
	//ctx.fillRect(x, y, 1, 1);
	//
	//ctx.arc(x,y,4,0,2*Math.PI)

	ctx.lineTo(x,y);
	ctx.strokeStyle = paintPalette.color;
	ctx.stroke();
	//console.log(x+" "+y)
}
var canvasStack = [];
var saveCanvas= function(){
	var canvas = document.getElementById("pwj_draw")
	var ctx = canvas.getContext("2d")
	var data = ctx.getImageData(0,0,canvas.width,canvas.height);
	canvasStack.push(data);
	if(canvasStack.length>20){
		canvasStack.shift();
	}
}
var undoCanvas = function(){
	if(canvasStack.length > 0){
		var image = canvasStack.pop();
		var canvas = document.getElementById("pwj_draw")
		var ctx = canvas.getContext("2d")
		var data = ctx.putImageData(image,0,0);
	}
}
var spawnNote = function(evt){
	var x = evt.offsetX;
	var y = evt.offsetY;
	var box = $('<div class="pwj_note_box untouchable" style="top:'+y+'px;left:'+x+'px;"><textarea class="pwj_note"></textarea></div>');
	$("#pwj_spawner").append(box);
	$('textarea',box).focus();
}

$(window).on('keydown',function windowOnKeydown(evt){
	// console.log(evt);
	if(evt.keyCode === 17 || evt.which === 17){
		$('.untouchable').addClass('touch-me-now');
	}
})
$(window).on('keyup',function windowOnKeyup(evt){
	// console.log(evt);
	if(evt.keyCode === 17 || evt.which === 17){
		$('.untouchable').removeClass('touch-me-now');
	}
})
