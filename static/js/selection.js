
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
		var rectElement = svg.append("rect")
		    .attrs({
		        rx      : 4,
		        ry      : 4,
		        x       : 0,
		        y       : 0,
		        width   : 0,
                height  : 0,
                "opacity": 0.3,
                "id":  "Rect" + (_param.selectionRectanglesArray.length +1)
		    })
		    .classed("selection", true);
	    this.setElement(rectElement);
		this.originX = newX;
        this.originY = newY;
        this.id = (_param.selectionRectanglesArray.length +1);
        this.update(newX, newY);
        var selectionText = svg.append("text").attrs({
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
            .style("stroke", "#DE695B")
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



var svg = d3.select("#videoSVG g");
var clickTime = d3.select("#clicktime");
var attributesText = d3.select("#attributestext");

function cursorPoint(pos){
    // pt.x = evt.clientX; pt.y = evt.clientY;
    //return pt.matrixTransform(svg.getScreenCTM().inverse());
    // var pt =  draw.node.createSVGPoint();
    // pt.x = pos[0];
    // pt.y = pos[1];

    
    // var tViewport = document.querySelector('g.svg-pan-zoom_viewport');

    // pt = pt.matrixTransform(tViewport.getCTM());
    // return [pt.x, pt.y];

    // var tMatrix = tViewport.transform.baseVal.getItem(0).matrix;
    
    pos[0] = pos[0] + offset.x;
    pos[1] = pos[1] + offset.y;
    // var tPoint = [pos[0] /tMatrix.a , pos[1] /tMatrix.d ];
    // return tPoint;
    // return [pos[0]/tMatrix.a, pos[1]/tMatrix.d];
    return pos;
    // let tempPos = document.getElementById("videoSVG").createSVGPoint();
    // tempPos.x = pos[0]
    // tempPos.y = pos[1];
    // var tGroup = document.querySelector('.svg-pan-zoom_viewport');
    // return tempPos.matrixTransform(tGroup.getScreenCTM().inverse());
}

// function cursorPoint(pos) { // svg is the svg DOM node
//     var svg = document.querySelector("#videoSVG");
//     // var pt = svg.createSVGPoint();
//     // pt.x = pos[0];
//     // pt.y = pos[1];
//     // var cursorPt = pt.matrixTransform(svg.getScreenCTM());



//     // console.log(cursorPt.x, cursorPt.y);
//     return [Math.floor(cursorPt.x), Math.floor(cursorPt.y)];
//   }

function dragStart() {
    var p = [d3.event.x, d3.event.y];
    // p[0] = p[0]+offset.x;
    // p[1] = p[1]+offset.y;
    console.log("before adjust" , p[0], p[1]);
    updated_p = cursorPoint(p);
    console.log("after adjust" , updated_p[0], updated_p[1]);
    // var x = d3.event.x - document.getElementById("videoSVG").getBoundingClientRect().x;
    // var y = d3.event.y - document.getElementById("videoSVG").getBoundingClientRect().y;
    selectionRect.init(updated_p[0], updated_p[1]);

	
}

function dragMove() {
    var p = [d3.event.x, d3.event.y]
    // p[0] = p[0]+offset.x;
    // p[1] = p[1]+offset.y;
    updated_p = cursorPoint(p);
    selectionRect.update(updated_p[0], updated_p[1]);
    attributesText
    	.text(selectionRect.getCurrentAttributesAsText());
}

function dragEnd() {
	var finalAttributes = selectionRect.getCurrentAttributes();
	// console.dir(finalAttributes);
	if(finalAttributes.x2 - finalAttributes.x1 > 1 && finalAttributes.y2 - finalAttributes.y1 > 1){
		// console.log("range selected");
		// range selected
		d3.event.sourceEvent.preventDefault();
        selectionRect.focus();
        computeOccupyingCellsByRegions();
	} else {
		console.log("single point");
        // single point selected
        selectionRect.remove();
        // trigger click event manually
        // clicked();
    }
    
}

var dragBehavior = d3.drag()

    .on("drag", dragMove)
    .on("start", dragStart)
    .on("end", dragEnd);


svg.call(dragBehavior);
// svg.on("click", function(e){
//     var p = d3.mouse(this);
//     // p[0] = p[0]+offset.x;
//     // p[1] = p[1]+offset.y;
//     console.log("before adjust" , p[0], p[1], d3.event.x, d3.event.y);
//     updated_p = cursorPoint([d3.event.x, d3.event.y]);
//     console.log("after adjust" , updated_p[0], updated_p[1]);
// })+
// svg.on("mouseover", function(e){
//     var x_old = d3.event.x, y_old = d3.event.y;
//     // var p = d3.mouse(this);
//     var x_old = p[0], y_old = p[1];

//     console.log(x_old, y_old);
//     var svg = document.querySelector("#videoSVG");
//     var tViewport = document.querySelector('g.svg-pan-zoom_viewport');
//     var tMatrix = tViewport.transform.baseVal.getItem(0).matrix;
//     console.log(" Matrix: ", tMatrix);
//     var x_new = tMatrix.a*x_old + tMatrix.c*y_old + tMatrix.e;
//     var y_new = tMatrix.b*x_old + tMatrix.d*y_old + tMatrix.f;
//     console.log("New coordinates", x_new, y_new);
// })
d3.select("#video").append("button").on("click", function(){
    for(var i=0; i<_param.selectionRectanglesArray.length; i++)
        _param.selectionRectanglesArray[i].remove();
    _param.selectionRectanglesArray = [];
    d3.selectAll(".regionIdText").remove();
    d3.select("#transitionGraphSvg").remove();
    } ).text("Clear");

}