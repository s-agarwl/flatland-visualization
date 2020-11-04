function preparePlayback()
{
    d3.select("#video").selectAll("*").remove();



    var gameData = window.data['environmentData'];
    var numRows = gameData["grid"].length;
    var numColumns = gameData["grid"][0].length;
    var episodeLength = gameData["episode"].length;

    _param.numRows = numRows;
    _param.numColumns = numColumns;

    

    var playbackDiv = d3.select("#playbackDiv");
    window.svgWidthHeight = 400;
    var divwidth = playbackDiv.node().getBoundingClientRect().width;
    var video = d3.select("#video").append("svg").attr("id", "videoSVG").attr("width", divwidth).attr("height",svgWidthHeight).append("g").attr("id","playbackSvgGroup");
    var i=0;
    renderFirstFrame(gameData, i, video, numRows, numColumns, episodeLength);
    
    i++;
    window.intervalId = null;
    window.playClicked = false;
    d3.select("#play").on("click", function(){
        if(window.playClicked ==false)
        {
            i = $( "#slider" ).slider("value");
            
            window.intervalId = setInterval(function()
                {
                    renderNextFrame(gameData, parseInt(i), numRows, numColumns);
                    i++; 
                }, window.timeWait);

                var sbar = d3.select("#status");
                var t = d3.select('#status').node().transform.baseVal[0].matrix;
                var currentX = t["e"];
                var totalDuration = episodeLength * window.timeWait;
                var visEndX = globalXScale(episodeLength) ;
                var visStartX = globalXScale(0);
                var alpha = ((visEndX - visStartX)/totalDuration);
                var dur = (currentX - visStartX)/alpha;
                d3.select("#status").attr("transform","translate("+currentX+",0)" )
                .transition().duration((totalDuration - dur))
                .ease(d3.easeLinear)
                .attr("transform","translate("+(visEndX)+",0)" );
                window.playClicked = true;
        }
    });

    d3.select("#pause").on("click", function(){
        if(window.playClicked == true)
        {
            clearInterval(window.intervalId);
            d3.select("#status").interrupt();
            window.playClicked = false;
                return;
        }
    });
    
    d3.select("#previous").on("click", function(){
        i = $( "#slider" ).slider("value");
        if(i>0)
        {
            clearInterval(intervalId);
            d3.select("#status").interrupt();
            i--;
            $( "#slider" ).slider("value",i);
            d3.select("#frame").text(i);
            d3.select("#status").attr("transform", "translate("+ globalXScale(i) + ","+ 0 +")");
            renderNextFrame(gameData, i, numRows, numColumns);
        }
        
            return;
    });
    d3.select("#next").on("click", function(){
        i = $( "#slider" ).slider("value");
        if(i<episodeLength)
        {
            clearInterval(intervalId);
            d3.select("#status").interrupt();
            i++;
            $( "#slider" ).slider("value",i);
            d3.select("#frame").text(i);
            // d3.select("#status").attr("x", globalXScale(i));
            var currentX = d3.select("#status").attr("currentX");
            // d3.select("#status").attr("transform","translate("+( globalXScale(i) - currentX)+",0)" );
            d3.select("#status").attr("transform", "translate("+ globalXScale(i) + ","+ 0 +")");
            renderNextFrame(gameData, i, numRows, numColumns);
        }
        
            return;
    });
    renderNextFrame(gameData, 0, numRows, numColumns);
    var svgElement = document.querySelector('#videoSVG')
    var panZoomTiger = svgPanZoom(svgElement, {controlIconsEnabled: true});


}

function viewBox(svg) {
    var box = svg.getAttribute('viewBox');
    return {x: parseInt(box.split(' ')[0], 10), y: parseInt(box.split(' ')[1], 10), width: parseInt(box.split(' ')[2], 10), height: parseInt(box.split(' ')[3], 10)};
};
function zoom(svg, initialBox, factor) {
    svg.setAttribute('viewBox', initialBox.x + ' ' + initialBox.y + ' ' + initialBox.width / factor + ' ' + initialBox.height / factor);
  }
   
  function zoomFactor(svg) {
    var height = parseInt(svg.getAttribute('height').substring(0, svg.getAttribute('height').length - 2), 10);
    return 1.0 * viewBox(svg).height / height;
  }
  function pan(svg, panX, panY) {
    var pos = viewBox(svg);
    var factor = zoomFactor(svg);
    svg.setAttribute('viewBox', (pos.x - factor * panX) + ' ' + (pos.y - factor * panY) + ' ' + pos.width + ' ' + pos.height);
  }

function renderFirstFrame(gameData, i, video, numRows, numColumns, episodeLength)
{
    video.selectAll("*").remove();



    $( "#slider" ).slider({
        min:0,
        max: episodeLength,
        value: i,
        slide: function( event, ui ) {
            // select[ 0 ].selectedIndex = ui.value - 1;
            d3.select("#frame").text(ui.value);
            var isplaying = window.playClicked;
            if(window.playClicked == true)
            {
                clearInterval(window.intervalId);
                d3.select("#status").interrupt();
                window.playClicked = false;
                
            }

            renderNextFrame(gameData, ui.value, numRows, numColumns);
            var currentX = window.globalXScale(ui.value);
            d3.select("#status").attr("transform", "translate("+ currentX + ","+ 0 +")");
        }});

    var dataForElements = [];
    var board = gameData["grid"];
    var agents = gameData["agents"];
    for(var j=0; j<board.length; j++)
    {
        for(var k=0; k<board[j].length; k++)
        {
            var imagePath = returnImagePath(board[j][k]);

            video.append("image").attrs({
                "xlink:href":function(){
                        return imagePath;
                },
                "width": window.svgWidthHeight/numColumns,
                "height": window.svgWidthHeight/numRows,
                "x": k*window.svgWidthHeight/numColumns,
                "y": j*window.svgWidthHeight/numRows,
                "id": "Image"+j+"_"+k,
                "class": "tiles"
            });
            temp = {"x": k*window.svgWidthHeight/numColumns, "y": j*window.svgWidthHeight/numRows};
            dataForElements.push(temp);
            // video.append("circle").attrs({

            //     "cx": k*window.svgWidthHeight/numColumns,
            //     "cy": j*window.svgWidthHeight/numRows,
            //     "r": 5,
            //     "fill":"black",
            //     "class":"dot",
            //     // "id": "Station"+stationsDict[station].id
            // });

            
        }
    }

    // var circles = video.append("g")
    //     .attr("class", "dot")
    //     .selectAll("circle")
    //     .data(dataForElements)
    //     .enter().append("circle")
    //     .attr("r", 5)
    //     .attr("cx", function(d) { return d.x; })
    //     .attr("cy", function(d) { return d.y; })
    //     .attr("fill", function(d) { return "black"; });

    // render start positions of agents
    for(var i=0; i<agents.length; i++)
    {
        var imagePath = returnAgentImagePath(agents[i]["agent_index"]);
        
        // video.append("image").attrs({
        //     "xlink:href":function(){
        //             return imagePath;
        //     },
        //     "width": window.svgWidthHeight/numColumns,
        //     "height": window.svgWidthHeight/numRows,
        //     "x": agents[i]["initial_position"][1]*window.svgWidthHeight/numColumns,
        //     "y": agents[i]["initial_position"][0]*window.svgWidthHeight/numRows,
        //     "id": "Agent"+agents[i]["agent_index"]
        // }).append("title").text(function(){
        //     return "Agent"+agents[i]["agent_index"];
        // });
        
        // video.append("text").attrs({
        //     "x": agents[i]["initial_position"][1]*window.svgWidthHeight/numColumns + window.svgWidthHeight/(2*numColumns),
        //     "y": agents[i]["initial_position"][0]*window.svgWidthHeight/numRows + window.svgWidthHeight/(2*numRows),
        //     "id": "Agent"+agents[i]["agent_index"],
        //     "class": "agentIdText"
        // }).text(agents[i]["agent_index"]).append("title").text(function(){
        //     return "Agent"+agents[i]["agent_index"];
        // });

        var imageGroup = video.append("g").attr("id", "Agent"+agents[i]["agent_index"]);
        var xPos = agents[i]["initial_position"][1]*window.svgWidthHeight/numColumns + window.svgWidthHeight/(2*numColumns);
        var yPos = agents[i]["initial_position"][0]*window.svgWidthHeight/numRows + window.svgWidthHeight/(2*numRows);
        imageGroup.append("circle").attrs({
            "cx": xPos,
            "cy": yPos,
            "r": window.svgWidthHeight/(2*numRows),
            "fill":"white",
            "fill-opacity": 1.0,
            "stroke": _param.nodeColor,
            "stroke-width": "1px",
            "id": "AgentCircle"+agents[i]["agent_index"]
        });
        imageGroup.append("text").attrs({
            "x": xPos,
            "y": yPos,
            "class": "agentIdText",
            "font-size": (window.svgWidthHeight/(numRows) * 0.7)+"px",
            "id": "AgentText"+agents[i]["agent_index"]
            // "dominant-baseline": "text-before-edge"
        }).text(agents[i]["agent_index"]).append("title").text(function(){
            return "Train "+agents[i]["agent_index"];
        });
       
        // imageGroup.attr("transform", "translate("+ xPos + ","+ yPos +")");

    }

    //render bahnofs/stations
    var stationsDict ={};
    var stationIdCounter = 1;
    for(var i=0; i<agents.length; i++)
    {
        
        var station_id_string = agents[i].target[1] + "_" + agents[i].target[0];
        if(!(station_id_string in stationsDict))
        {
            stationsDict[station_id_string] = {"x": agents[i].target[1], "y": agents[i].target[0], "id": stationIdCounter++};
        }
    }
    for(var station in stationsDict)
    {
        video.append("image").attrs({
            "xlink:href":function(){
                    return "./static/resources/png/Bahnhof_d50000.png";
            },
            "width": window.svgWidthHeight/numColumns,
            "height": window.svgWidthHeight/numRows,
            "x": stationsDict[station].x*window.svgWidthHeight/numColumns,
            "y": stationsDict[station].y*window.svgWidthHeight/numRows,
            "id": "Station"+stationsDict[station].id
        });
        
    }
    
    // Lasso functions to execute while lassoing
    // lasso.items(circles);
    // video.call(lasso);
    enableSelectioninplaybackSVG();
    computeOccupyingCellsByRegions(d3.select("#transitionGraphSvg"));

}

function posToSetElementString(pos)
{
    return '['+pos[0]+','+pos[1]+']';
}

function computeOccupyingCellsByRegions(svgRoot)
{
    var rectArray = _param.selectionRectanglesArray;

    var numColumns = _param.numColumns;
    var numRows = _param.numRows;
    var widthHeight = window.svgWidthHeight/numColumns;

    var regionDict = {};
    var nodes = {};
    var edges = [];
    var allSelectedCells = new Set();

    // TODO: what if region is described by clicking and then dragging towards left or upwards? widhth and height are in negative?

    for(var i=0; i<rectArray.length; i++)
    {
        let setOfGridCells = new Set();
        var x = +d3.select(rectArray[i]["_groups"][0][0]).attr("x");
        var y = +d3.select(rectArray[i]["_groups"][0][0]).attr("y");
        var selectionWidth = +d3.select(rectArray[i]["_groups"][0][0]).attr("width");
        var selectionHeight = +d3.select(rectArray[i]["_groups"][0][0]).attr("height");

        var startingX = Math.floor(x/widthHeight);
        var startingY = Math.floor(y/widthHeight);

        var rbcornerX = startingX + Math.floor(selectionWidth/widthHeight);
        var rbcornerY = startingY + Math.floor(selectionHeight/widthHeight);

        for(var j=startingX;j<=rbcornerX; j++ )
        {
            for(var k=startingY; k<=rbcornerY; k++)
            {
                setOfGridCells.add(posToSetElementString([k,j]));
                allSelectedCells.add(posToSetElementString([k,j]));
            }
        }
        var regionIdLabel = i+1;
        regionDict[regionIdLabel] = {"id": regionIdLabel, "cells": setOfGridCells};
        // regionDict[i]["cells"] = setOfGridCells;
        // regionDict[i]["id"] = "Region 1";
        nodes[regionIdLabel] = {"id": regionDict[regionIdLabel]["id"], "trains": {}};

    }
    // console.log(regionDict);


    // TODO: raise error if regions are overlapping

    // 

    

    var episode = window.data['environmentData']["episode"];
    var agent_index_currentRegionLocation = {};

    for(var i=0; i<episode.length; i++)
    {
        for(var agent_index=0; agent_index<episode[i].length; agent_index++)
        {
            var tty = episode[i][agent_index][0], ttx = episode[i][agent_index][1];
            var ttpos = [tty, ttx];
            if(allSelectedCells.has(posToSetElementString(ttpos)))
            {
                var found = false;
                for(var regid in regionDict)
                {
                    if(regionDict[regid]["cells"].has(posToSetElementString(ttpos)) && found == false)
                    {
                        if(!(agent_index in nodes[regid]["trains"]))
                        {
                            nodes[regid]["trains"][agent_index] = {"agent_index": agent_index, 
                                  "timesteps": [i], "numTimesteps": 1};
                        }
                        else
                        {
                            nodes[regid]["trains"][agent_index]["timesteps"].push(i);
                            nodes[regid]["trains"][agent_index]["numTimesteps"] += 1;
                        }

                        if(!(agent_index in agent_index_currentRegionLocation))
                        {
                            agent_index_currentRegionLocation[agent_index] = regid;
                        }
                        else
                        {
                            if(agent_index_currentRegionLocation[agent_index] != regid)
                            {
                                edges.push({"source":agent_index_currentRegionLocation[agent_index],
                                   "target": regid, "timestep": i, "train": agent_index } );
                                agent_index_currentRegionLocation[agent_index] = regid;
                            }
                        }

                        found = true;
                        
                    }
                }
            }
        }
    }

    // console.log(nodes, edges);
    
    // removing duplicate edges
    var aggregatedEdges = [];
    for(var i=0; i<edges.length; i++)
    {
        var found = false;
        for(var j=0; j<aggregatedEdges.length; j++)
        {
            if(edges[i]["source"] == aggregatedEdges[j]["source"] && edges[i]["target"] == aggregatedEdges[j]["target"])
            {
                found = true;
                aggregatedEdges[j]["value"] +=1;
                aggregatedEdges[j]["trains"].push(edges[i]["train"]);
            }
        }
        if(found == false)
        {
            aggregatedEdges.push({"source": edges[i]["source"], "target": edges[i]["target"], "value": 1, "trains": [edges[i]["train"]] });
        }
    }
    console.log(edges, aggregatedEdges);

    // adding nodeweight params
    for(var nodeid in nodes)
    {
        var numTrains = Object.keys(nodes[nodeid].trains).length;
        nodes[nodeid]["numTrains"] = numTrains;

        var numTimesteps =  0;
        for(var train in nodes[nodeid].trains)
        {
            numTimesteps += nodes[nodeid].trains[train]["numTimesteps"];
        }
        nodes[nodeid]["numTimesteps"] = numTimesteps;
    }

    _param.graph = {"nodes": nodes, "links": aggregatedEdges};
    drawTransitionGraph(svgRoot);

}

function drawTransitionGraph(svgRoot)
{
    var height = window.svgWidthHeight;
    var width = d3.select("#transitionGraphDiv").node().getBoundingClientRect().width;
    // d3.select("#transitionGraphSvg g").remove();
    svgRoot.selectAll("*").remove();
    var svgRoot = d3.select("#transitionGraphSvg").attr("width", width).attr("height",window.svgWidthHeight);
    var svg =svgRoot;

    // svg.append("defs").append("marker").attrs({
    //     "id": "head",
    //     "orient": "auto",
    //     "markerWidth": 2,
    //     "markerHeight": 4,
    //     "refX": 0.1,
    //     "refY": 2
    // }).append("path").attrs({
    //     // "d": 'M0,0 V4 L2,2 Z',
    //     "d": 'M 0 0 L -4 2 L -4 -2 Z',
    //     "fill": "black"
    // })
    var defs = svg.append('defs')
    defs.append("svg:marker")
            .attr("id", "head")
            .attr("viewBox","0 0 10 10")
            .attr("refX","15")
            .attr("refY","5")
            .attr("markerUnits","strokeWidth")
            .attr("markerWidth","9")
            .attr("markerHeight","5")
            .attr("orient","auto")
            .append("svg:path")
            .attr("d","M 0 0 L 10 5 L 0 10 L 0 0")
            .attr("fill", _param.linkColor);

 

    var graph = _param.graph;

    var maxNodeWeight = -1;
    for(var nodeid in _param.graph.nodes)
    {
        var metricValue = _param.graph.nodes[nodeid]["numTrains"];
        if(maxNodeWeight < metricValue)
        {
            maxNodeWeight = metricValue;
        }
    }

    var maxEdgeValue = -1;
    for(var i=0; i<_param.graph.links.length; i++)
    {
        var edgeValue = _param.graph.links[i]["value"];
        if(edgeValue > maxEdgeValue)
            maxEdgeValue = edgeValue;
    }

    var nodeSizeScale = d3.scaleLinear().domain([1, maxNodeWeight]).range([3, 15]);
    var edgeThicknessScale = d3.scaleLinear().domain([ 1, maxEdgeValue]).range([3,8]);

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var nodesArray = [];
    for(var nodeid in graph.nodes)
    {
        nodesArray.push(graph.nodes[nodeid]);
    }
    // window.distanceMin = 300;
    // window.distanceMax = 500;
//     var attractForce = d3.forceManyBody().strength(20).distanceMax(400).distanceMin(100);
// var repelForce = d3.forceManyBody().strength(-140).distanceMax(200).distanceMin(100);

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(180))
        .force("charge", d3.forceManyBody().strength(-200))
        .force('collide', d3.forceCollide().radius(function(d){ return nodeSizeScale(d.numTrains) }).strength(-50))
        // .force("attractForce",attractForce).force("repelForce",repelForce)
        .force("center", d3.forceCenter(width / 2, height / 2));

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      
      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }
      
      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }


  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("g")
    .data(nodesArray)
    .enter().append("g")
    
    
  var circles = node.append("circle")
      .attr("r", function(d){ 
          var r =1;
            if(d.numTrains != 0)
                {
                    r = nodeSizeScale(d.numTrains);
                }
                d.radius = r;
                return r;
            })
      .attr("fill", function(d) { return "grey"; })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));
    circles.on("mouseover", function(d, i){
        console.log(d,i);
        for(var trainid in d.trains)
        {
            d3.select("#highlighter"+trainid).attr("opacity", _param.highlightOpacity);
        }

    }).on("mouseout", function(d){
        d3.selectAll(".highlighters").attr("opacity", 0);

    })

  var lables = node.append("text")
      .text(function(d) {
        return "Region "+d.id;
      })
      .attr('x', function(d){ return nodeSizeScale(d.numTrains);})
      .attr('y', 3);

  node.append("title")
      .text(function(d) { return "#Trains "+ d.numTrains; });

      var link = svg.append("g")
                    .attr("class", "links")
                    .selectAll("path")
                    .data(graph.links)
                    .enter().append("path")
                    .attrs({
                        "stroke-width": function(d) { return edgeThicknessScale(d.value)+"px"},
                        "fill": "none",
                        "stroke": _param.linkColor,
                        "marker-end": 'url(#head)'
                        });

      link.append("title")
      .text(function(d) { return "#Trains "+ d.value; });

  simulation
      .nodes(nodesArray)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  function ticked() {
    // link
    //     .attr("x1", function(d) { return d.source.x; })
    //     .attr("y1", function(d) { return d.source.y; })
    //     .attr("x2", function(d) { return d.target.x; })
    //     .attr("y2", function(d) { return d.target.y; });

    link.attrs({
        "d": function(d){
            var midpoint = [(d.source.x + d.target.x)/2, (d.source.y + d.target.y)/2];
            var sx = +d.source.x, sy = +d.source.y, dx = +d.target.x, dy = +d.target.y;
            var diffx = dx - sx, diffy = dy - sy;
            var cx = sx + diffx/2, cy = sy + diffy/2;

            var m2 = -1 *(dx - sx)/ (dy - sy);
            var cy0 = 0, cx0 = (m2*cx - cy)/m2;
            var distance = 50;

            var t = distance/ (Math.sqrt( Math.pow((cx - cx0), 2) + Math.pow((cy - cy0), 2)  ));
            t = Math.abs(t);
            if(sx > dx) t = -1*t;

            midpoint[0] = t*cx0 + (1-t)*cx;
            midpoint[1] = t*cy0 + (1-t)*cy;

            pathLength = Math.sqrt((diffx * diffx) + (diffy * diffy));

            // x and y distances from center to outside edge of target node
            offsetX = (diffx * d.target.radius) / pathLength;
            offsetY = (diffy * d.target.radius) / pathLength;

            offsetXsource = (diffx * d.source.radius) / pathLength;
            offsetYsource = (diffy * d.source.radius) / pathLength;

            // return "M" + d.source.x + "," + d.source.y + "L" + (d.target.x - offsetX) + "," + (d.target.y - offsetY);
            
            var offset = 40;

            var midpoint_x = (d.source.x + d.target.x) / 2;
            var midpoint_y = (d.source.y + d.target.y) / 2;
    
            var dx = (d.target.x - d.source.x);
            var dy = (d.target.y - d.source.y);
    
            var normalise = Math.sqrt((dx * dx) + (dy * dy));
    
            var offSetX = midpoint_x + offset*(dy/normalise);
            var offSetY = midpoint_y - offset*(dx/normalise);
    
            return "M" + (d.source.x + offsetXsource) + "," + (d.source.y + offsetYsource) +
                "S" + offSetX + "," + offSetY +
                " " + (d.target.x - offsetX) + "," + (d.target.y - offsetY);

            // angle = Math.atan2(dy - sy, dx - sx);
            // d.targetX = dx - Math.cos(angle) * (nodeRadius + arrowheadLength);
            // d.targetY = dy - Math.sin(angle) * (nodeRadius + arrowheadLength);
            
            // if(diffx > diffy)
            // {
            //     midpoint[0] = sx + diffx/2;
            //     midpoint[1] = sy + diffy/2 - diffy/2;
            // }
            // else
            // {
            //     midpoint[0] = sx + diffx/2 - diffx/2;
            //     midpoint[1] = sy + diffy/2;
            // }
            return "M " + (d.source.x + offsetXsource) + " " + (d.source.y + offsetYsource) + " S " + midpoint[0] + " " + midpoint[1] + " " + (d.target.x + 2*offsetX ) + " " + (d.target.y + 2*offsetY);
            // return "M " + d.source.x + " " + d.source.y + " Q " + midpoint[0] + " " + midpoint[1] + " " + d.target.x + " " + d.target.y;
        }
    });
    
    

    node
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
  }


}

function renderNextFrame(stateArray, i, numRows, numColumns)
{
    if(i>=stateArray["episode"].length)
    {
        return;
    }
    var durationOfFrame = window.timeWait;
    if(i==stateArray.length)
    {
        clearInterval(intervalId);
        return;
    }
    $( "#slider" ).slider({
        value: i
    });
    d3.select("#frame").text(i);
    d3.selectAll(".backgroundTileImage"+ (i-1)).remove();

    var previousActions = stateArray["actions"][i-1];
    var board = stateArray["grid"];
    

    for(var k=0; k< stateArray["episode"][i].length; k++)
    {
        
        var player = d3.select("#Agent"+k);
        var currentPos = [stateArray["episode"][i][k][1] , stateArray["episode"][i][k][0] ];
        // var previousPos =  stateArray[i-1]["agents"][j]["position"];
        var newXPosBoard = currentPos[0]*window.svgWidthHeight/numColumns+ window.svgWidthHeight/(2*numColumns);
        var newYPosBoard = currentPos[1]*window.svgWidthHeight/numRows + window.svgWidthHeight/(2*numRows);
        // var tempAgentStatusArray = [1,1,1,1];
        if(stateArray["episode"][i][k][2] == 3 ) 
        {
            player.attr("visibility", "hidden");
        }
        if(stateArray["grid"][0][0] == 0 && currentPos[0] == 0 && currentPos[1] == 0)
        {
            player.attr("visibility", "hidden");
        }
        else 
        {
            player.attr("visibility", "visible");
            // player.transition().duration(durationOfFrame).attr("y", newYPosBoard).attr("x", newXPosBoard);

            var playerCircle = d3.select("#AgentCircle"+k);
            var playerText = d3.select("#AgentText"+k);
            playerCircle.transition().duration(durationOfFrame).attr("cy", newYPosBoard).attr("cx", newXPosBoard);
            playerText.transition().duration(durationOfFrame).attr("y", newYPosBoard).attr("x", newXPosBoard);
            
            // var split = d3.select("#Agent"+k).attr("transform").split(",");
            // var xPos = parseFloat(split[0].split("(")[1]);
            // var yPos = parseFloat(split[1].split(")")[0]);
            // // var xPos = t.translate[0], yPos = t.translate[1];
            // // console.log(xPos, yPos);
            // // player.transition().duration(durationOfFrame).attr("transform", "translate(" +(newXPosBoard - xPos)+","+ (newYPosBoard - yPos)+")");
            // player.attr("transform", "translate(" +(newXPosBoard - xPos)+","+ (newYPosBoard - yPos)+")");
        }  
    }

    drawPerFrameStatistics(i);
}

function drawPerFrameStatistics(frame_num)
{
    
    // d3.select("#totalNumTrains").text(overallStatisticsDict.totalNumTrains);
    d3.selectAll(".currentNumTrainsReachedDestination").text(window.perFrameStatisticsArray[frame_num][0]);
    d3.selectAll(".currentNumTrainsInProgress").text(window.perFrameStatisticsArray[frame_num][1]);
    d3.selectAll(".currentNumTrainsYetToStart").text(window.perFrameStatisticsArray[frame_num][2] );

}

function returnAgentImagePath(agentIndex)
{
    var imagePath = "./static/resources/png/";
    // switch(agentIndex)
    // {
        // case 0: 
            imagePath += "Zug_Gleis_d50000.png";
            // break;
    // }
    return imagePath;
}

function returnImagePath(cellValue)
{
    var imagePath = "./static/resources/png/";
    switch(cellValue)
    {
        case 0:
            imagePath += "Background_white_filter.png";
            break;
        case 1025:
            imagePath += "Gleis_horizontal.png";
            break;
        case 32800:
            imagePath += "Gleis_vertikal.png";
            break;
        case 72:
            imagePath += "Gleis_Kurve_oben_rechts.png";
            break;
        case 4608:
            imagePath += "Gleis_Kurve_unten_links.png";
            break;
        case 16386:
            imagePath += "Gleis_Kurve_unten_rechts.png";
            break;
        case 2064:
            imagePath += "Gleis_Kurve_oben_links.png";
            break;
        case 38505:
            imagePath += "Weiche_Double_Slip.png";
            break;
        case 52275:
            imagePath += "Weiche_Double_Slip_r90.png";
            break;
        case 1097:
            imagePath += "Weiche_horizontal_oben_rechts.png";
            break;
        case 3089:
            imagePath += "Weiche_horizontal_oben_links.png";
            break;
        case 5633:
            imagePath += "Weiche_horizontal_unten_links.png";
            break;
        case 17411:
            imagePath += "Weiche_horizontal_unten_rechts.png";
            break;
        case 34864:
            imagePath += "Weiche_vertikal_oben_links.png";
            break;
        case 32872:
            imagePath += "Weiche_vertikal_oben_rechts.png";
            break;
        case 37408:
            imagePath += "Weiche_vertikal_unten_links.png";
            break;
        case 49186:
            imagePath += "Weiche_vertikal_unten_rechts.png";
            break;
        case 18450:
            imagePath += "Gleis_Kurve_oben_links_unten_rechts.png";
            break;
        case 4680:
            imagePath += "Gleis_Kurve_oben_links_unten_rechts_r90.png";
            break;
        case 33825:
            imagePath += "Gleis_Diamond_Crossing.png";
            break;
        case 38433:
            imagePath += "Weiche_Single_Slip.png";
            break;
        case 35889:
            imagePath += "Weiche_Single_Slip_r90.png";
            break;
        case 33897:
            imagePath += "Weiche_Single_Slip_r180.png";
            break;
        case 50211:
            imagePath += "Weiche_Single_Slip_r270.png";
            break;
        case 20994:
            imagePath += "Weiche_Symetrical.png";
            break;
        case 6672:
            imagePath += "Weiche_Symetrical_r90.png";
            break;
        case 2136:
            imagePath += "Weiche_Symetrical_r180.png";
            break;
        case 16458:
            imagePath += "Weiche_Symetrical_r270.png";
            break;
        case 53794:
            imagePath += "Weiche_Symetrical_gerade.png";
            break;
        case 7697:
            imagePath += "Weiche_Symetrical_gerade_r90.png";
            break;
        case 34936:
            imagePath += "Weiche_Symetrical_gerade_r180.png";
            break;
        case 17483:
            imagePath += "Weiche_Symetrical_gerade_r270.png";
            break;
            
    }
    return imagePath;
}
