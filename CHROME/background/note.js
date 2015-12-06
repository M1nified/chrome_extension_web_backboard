var color = "#000";
var runWebNote = function(){
	console.log("LOADED")
	setEnv();	
}
var setEnv = function(){
	$(".pwj_elem").remove();
	if(!$(".pwj_elem")[0]){
		$("body").append('<div class="pwj_draw_box pwj_elem"><canvas id="pwj_draw"></canvas></div><div class="pwj_elem" id="pwj_tool_box"><input type="color" class="pwj_color_picker"> <button class="pwj_button undo_canvas">&lt;-</button></div><section class="pwj_elem" id="pwj_spawner"></section>')
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
	$(".pwj_draw_box").on('dblclick',function(evt){
		console.log(evt)
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
		console.log(pathon)
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
		var c = $(this).val();
		color = c;
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
	ctx.strokeStyle = color;
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
	$("#pwj_spawner").append('<div class="pwj_note_box" style="top:'+y+'px;left:'+x+'px;"><textarea class="pwj_note"></textarea></div>')
}