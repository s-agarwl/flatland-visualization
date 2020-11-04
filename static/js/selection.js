
function enableSelectioninplaybackSVG(){
    var offset = {x: -400, y:-100 };
    _param.selectionRectanglesArray = [];
    
    var selectionRect = {
	element			: null,
	previousElement : null,
	currentY		: 0,
	currentX		: 0,
	originX			: 0,
    originY			: 0,
    id:-1,
	setElement: function(ele) {
		this.previousElement = this.element;
		this.element = ele;
	},
	getNewAttributes: function() {
		var x = this.currentX<this.originX?this.currentX:this.originX;
		var y = this.currentY<this.originY?this.currentY:this.originY;
		var width = Math.abs(this.currentX - this.originX);
		var height = Math.abs(this.currentY - this.originY);
		return {
	        x       : x,
	        y       : y,
	        width  	: width,
	        height  : height
		};
	},
	getCurrentAttributes: function() {
		// use plus sign to convert string into number
		var x = +this.element.attr("x");
		var y = +this.element.attr("y");
		var width = +this.element.attr("width");
		var height = +this.element.attr("height");
		return {
			x1  : x,
	        y1	: y,
	        x2  : x + width,
	        y2  : y + height
		};
	},
	getCurrentAttributesAsText: function() {
		var attrs = this.getCurrentAttributes();
		return "x1: " + attrs.x1 + " x2: " + attrs.x2 + " y1: " + attrs.y1 + " y2: " + attrs.y2;
	},
	init: function(newX, newY) {
		var rectElement = zoomPanGroup.append("rect")
		    .attrs({
		        rx      : 4,
		        ry      : 4,
		        x       : 0,
		        y       : 0,
		        width   : 0,
                height  : 0,
                "fill-opacity": 0.3,
                "id":  "Rect" + (_param.selectionRectanglesArray.length +1)
		    })
		    .classed("selection", true);
	    this.setElement(rectElement);
		this.originX = newX;
        this.originY = newY;
        this.id = (_param.selectionRectanglesArray.length +1);
        this.update(newX, newY);
        var selectionText = zoomPanGroup.append("text").attrs({
            x: newX,
            y: newY - 5,
            "class": "regionIdText",
            "id": "TextRect"+(_param.selectionRectanglesArray.length +1)
        }).text("Region "+ (_param.selectionRectanglesArray.length +1));
        _param.selectionRectanglesArray.push(rectElement);
	},
	update: function(newX, newY) {
		this.currentX = newX;
		this.currentY = newY;
        this.element.attrs(this.getNewAttributes());
        d3.select("#TextRect"+this.id).attrs({
            x: newX,
            y:newY - 5
        })
	},
	focus: function() {
        this.element
            .style("stroke", "#000000")
            .style("stroke-width", "2.5");
    },
    remove: function() {
    	this.element.remove();
    	this.element = null;
    },
    removePrevious: function() {
    	if(this.previousElement) {
    		this.previousElement.remove();
    	}
    }
};

function htmlToSvgcoordinate(p)
{
  var videoSVG = document.getElementById('videoSVG');


  let domPt = videoSVG.createSVGPoint();
      
  domPt.x = p[0]*(1/window.zoomFactor);
  domPt.y = p[1]*(1/window.zoomFactor);
  let svgPt = domPt.matrixTransform(videoSVG.getScreenCTM().inverse());
  var tViewport = document.querySelector('g.svg-pan-zoom_viewport');
  var tMatrix = tViewport.transform.baseVal.getItem(0).matrix;
  let svgPt2 = svgPt.matrixTransform(tMatrix.inverse());
  return [svgPt2.x, svgPt2.y];
}


function dragStart(e) {
    var p = [d3.event.sourceEvent.clientX, d3.event.sourceEvent.clientY];
    updated_p = htmlToSvgcoordinate(p);
    selectionRect.init(updated_p[0], updated_p[1]);
}

function dragMove() {
    var p = [d3.event.sourceEvent.clientX, d3.event.sourceEvent.clientY];
    updated_p = htmlToSvgcoordinate(p);
    selectionRect.update(updated_p[0], updated_p[1]);
}

function dragEnd() {
	var finalAttributes = selectionRect.getCurrentAttributes();
	if(finalAttributes.x2 - finalAttributes.x1 > 1 && finalAttributes.y2 - finalAttributes.y1 > 1){
		d3.event.sourceEvent.preventDefault();
        selectionRect.focus();
        computeOccupyingCellsByRegions(d3.select("#transitionGraphSvg"));
	} else {
        selectionRect.remove();
    }
    
}

var dragBehavior = d3.drag()

    .on("drag", dragMove)
    .on("start", dragStart)
    .on("end", dragEnd);

var svg = d3.select("#videoSVG");
var zoomPanGroup = d3.select("#playbackSvgGroup");
svg.call(dragBehavior);


d3.select("#video").append("button").style("display", "block").on("click", function(){
    for(var i=0; i<_param.selectionRectanglesArray.length; i++)
        _param.selectionRectanglesArray[i].remove();
    _param.selectionRectanglesArray = [];
    d3.selectAll(".regionIdText").remove();
    d3.select("#transitionGraphSvg").selectAll("*").remove();
    } ).text("Clear Selection");

}
