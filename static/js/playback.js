function preparePlayback(playbackData) {
  d3.select("#video").selectAll("*").remove();

  var gameData = playbackData["environmentData"];
  var numRows = gameData["grid"].length;
  var numColumns = gameData["grid"][0].length;
  var episodeLength = gameData["episode"].length;

  _param.numRows = numRows;
  _param.numColumns = numColumns;

  var playbackDiv = d3.select("#playbackDiv");
  window.svgWidthHeight = 332;
  var divwidth = playbackDiv.node().getBoundingClientRect().width;
  
  
  var video = d3
    .select("#video")
    .append("svg")
    .attr("id", "videoSVG")
    .attr("width", divwidth)
    .attr("height", svgWidthHeight)
    // .attr("class", "solidBorder")
    .append("g")
    .attr("id", "playbackSvgGroup");
  var i = 0;
  renderFirstFrame(gameData, i, video, numRows, numColumns, episodeLength, playbackData);

  

  i++;
  window.intervalId = null;
  window.playClicked = false;
  d3.select("#play").on("click", function () {
    if (window.playClicked == false) {
      i = $("#slider").slider("value");

      window.intervalId = setInterval(function () {
        renderNextFrame(gameData, parseInt(i), numRows, numColumns);
        i++;
      }, window.timeWait);

    //   var sbar = d3.select("#status");
    //   var t = d3.select("#status").node().transform.baseVal[0].matrix;
    //   var currentX = t["e"];
    //   var totalDuration = episodeLength * window.timeWait;
    //   var visEndX = globalXScale(episodeLength);
    //   var visStartX = globalXScale(0);
    //   var alpha = (visEndX - visStartX) / totalDuration;
    //   var dur = (currentX - visStartX) / alpha;
    //   d3.select("#status")
    //     .attr("transform", "translate(" + currentX + ",0)")
    //     .transition()
    //     .duration(totalDuration - dur)
    //     .ease(d3.easeLinear)
    //     .attr("transform", "translate(" + visEndX + ",0)");
      window.playClicked = true;
    }
  });

  d3.select("#pause").on("click", function () {
    if (window.playClicked == true) {
      clearInterval(window.intervalId);
      d3.select("#status").interrupt();
      window.playClicked = false;
      return;
    }
  });

  d3.select("#previous").on("click", function () {
    i = $("#slider").slider("value");
    if (i > 0) {
      clearInterval(intervalId);
      d3.select("#status").interrupt();
      i--;
      $("#slider").slider("value", i);
      d3.select("#frame").text(i);
      d3.select("#status").attr(
        "transform",
        "translate(" + globalXScale(i) + "," + 0 + ")"
      );
      renderNextFrame(gameData, i, numRows, numColumns);
    }

    return;
  });
  d3.select("#next").on("click", function () {
    i = $("#slider").slider("value");
    if (i < episodeLength) {
      clearInterval(intervalId);
      d3.select("#status").interrupt();
      i++;
      $("#slider").slider("value", i);
      d3.select("#frame").text(i);
      // d3.select("#status").attr("x", globalXScale(i));
      var currentX = d3.select("#status").attr("currentX");
      // d3.select("#status").attr("transform","translate("+( globalXScale(i) - currentX)+",0)" );
      d3.select("#status").attr(
        "transform",
        "translate(" + globalXScale(i) + "," + 0 + ")"
      );
      renderNextFrame(gameData, i, numRows, numColumns);
    }

    return;
  });
  renderNextFrame(gameData, 0, numRows, numColumns);
  var svgElement = document.querySelector("#videoSVG");
  svgPanZoom(svgElement, { controlIconsEnabled: true });

  d3.select("#svg-pan-zoom-zoom-in").attr("pointer-events","all").on("mousedown", function(){
    d3.event.stopPropagation();
  })

  d3.select("#svg-pan-zoom-reset-pan-zoom").attr("pointer-events","all").on("mousedown", function(){
    d3.event.stopPropagation();
  })

  d3.select("#svg-pan-zoom-zoom-out").attr("pointer-events","all").on("mousedown", function(){
    d3.event.stopPropagation();
  })


 
}

function viewBox(svg) {
  var box = svg.getAttribute("viewBox");
  return {
    x: parseInt(box.split(" ")[0], 10),
    y: parseInt(box.split(" ")[1], 10),
    width: parseInt(box.split(" ")[2], 10),
    height: parseInt(box.split(" ")[3], 10),
  };
}
function zoom(svg, initialBox, factor) {
  svg.setAttribute(
    "viewBox",
    initialBox.x +
      " " +
      initialBox.y +
      " " +
      initialBox.width / factor +
      " " +
      initialBox.height / factor
  );
}

function zoomFactor(svg) {
  var height = parseInt(
    svg
      .getAttribute("height")
      .substring(0, svg.getAttribute("height").length - 2),
    10
  );
  return (1.0 * viewBox(svg).height) / height;
}
function pan(svg, panX, panY) {
  var pos = viewBox(svg);
  var factor = zoomFactor(svg);
  svg.setAttribute(
    "viewBox",
    pos.x -
      factor * panX +
      " " +
      (pos.y - factor * panY) +
      " " +
      pos.width +
      " " +
      pos.height
  );
}

function renderFirstFrame(
  gameData,
  i,
  video,
  numRows,
  numColumns,
  episodeLength, playbackData
) {
  video.selectAll("*").remove();

  $("#slider").slider({
    min: 0,
    max: episodeLength,
    value: i,
    slide: function (event, ui) {
      // select[ 0 ].selectedIndex = ui.value - 1;
      d3.select("#frame").text(ui.value);
      var isplaying = window.playClicked;
      if (window.playClicked == true) {
        clearInterval(window.intervalId);
        d3.select("#status").interrupt();
        window.playClicked = false;
      }

      renderNextFrame(gameData, ui.value, numRows, numColumns);
      var currentX = window.globalXScale(ui.value);
      d3.select("#status").attr(
        "transform",
        "translate(" + currentX + "," + 0 + ")"
      );
    },
  });
  var gridGroup = video.append("g").attr("class", "grid");
  var dataForElements = [];
  var board = gameData["grid"];
  var agents = gameData["agents"];
  for (var j = 0; j < board.length; j++) {
    for (var k = 0; k < board[j].length; k++) {
      var imagePath = returnImagePath(board[j][k]);

      gridGroup.append("image").attrs({
        "xlink:href": function () {
          return imagePath;
        },
        width: window.svgWidthHeight / numColumns,
        height: window.svgWidthHeight / numRows,
        x: (k * window.svgWidthHeight) / numColumns,
        y: (j * window.svgWidthHeight) / numRows,
        id: "Image" + j + "_" + k,
        class: "tiles",
      });
      temp = {
        x: (k * window.svgWidthHeight) / numColumns,
        y: (j * window.svgWidthHeight) / numRows,
      };
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
  video.append("g").attr("id", "railRegionGroup");
  video.append("g").attr("id", "heatMap");
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
  for (var i = 0; i < agents.length && window.comparison == false; i++) {
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

    var imageGroup = video
      .append("g")
      .attrs({
          "id": "Agent" + agents[i]["agent_index"],
          "pointer-events":"visible",
          "trainid": agents[i]["agent_index"]
          
        });
    var xPos =
      (agents[i]["initial_position"][1] * window.svgWidthHeight) / numColumns +
      window.svgWidthHeight / (2 * numColumns);
    var yPos =
      (agents[i]["initial_position"][0] * window.svgWidthHeight) / numRows +
      window.svgWidthHeight / (2 * numRows);

    window.circleRaidusInMap = window.svgWidthHeight / (2 * numRows) + 1;
    // window.circleRaidusInMap = window.svgWidthHeight / (2 * numRows) - 0.5;
    // window.directionCircleRadius = 0.5;
    window.directionCircleRadius = 1;

    imageGroup.append("circle").attrs({
      cx: xPos,
      cy: yPos,
      r: window.circleRaidusInMap,
      fill: "black",
      "fill-opacity": 1.0,
      stroke: "black",
      "stroke-width": "1px",
      id: "AgentCircle" + agents[i]["agent_index"],
      "trainid1": agents[i]["agent_index"],
      "class": "agentCircles",
    //   "pointer-events": "bounding-box"
    });
    imageGroup.append("circle").attrs({
        cx: xPos,
        cy: yPos - window.circleRaidusInMap + window.directionCircleRadius - 0.5,
        r: window.directionCircleRadius,
        fill: "white",
        "fill-opacity": 1.0,
        stroke: "none",
        "stroke-width": "1px",
        id: "AgentDirection" + agents[i]["agent_index"],
        "trainid1": agents[i]["agent_index"],
        "class": "agentDirections",
      //   "pointer-events": "bounding-box"
      });

    

    imageGroup
      .append("text")
      .attrs({
        x: xPos,
        y: yPos,
        class: "agentIdText",
        "font-size": (window.svgWidthHeight / numRows) * 0.7 + "px",
        // "font-size": "3px",
        // "font-size": "6px",
        id: "AgentText" + agents[i]["agent_index"],
        "fill":"white"
        // "dominant-baseline": "text-before-edge"
      })
      .text(agents[i]["agent_index"])
      .append("title")
      .text(function () {
        return "Train " + agents[i]["agent_index"];
      });

      imageGroup.on("mouseover", function(){
        var tid = +d3.select(this).attr("trainid");
        highlightTrainLabel(tid);
        highlightTrains([tid]);
    }).on("mouseout", function(){
        deHighlightTrains();
    })


    // imageGroup.attr("transform", "translate("+ xPos + ","+ yPos +")");
  }



  //render bahnofs/stations
//   var stationsDict = {};
//   var stationIdCounter = 1;
//   for (var i = 0; i < agents.length; i++) {
//     var station_id_string = agents[i].target[1] + "_" + agents[i].target[0];
//     if (!(station_id_string in stationsDict)) {
//       stationsDict[station_id_string] = {
//         x: agents[i].target[1],
//         y: agents[i].target[0],
//         id: stationIdCounter++,
//       };
//     }
//   }
//   for (var station in stationsDict) {
//     video.append("image").attrs({
//       "xlink:href": function () {
//         return "./static/resources/png/Bahnhof_d50000.png";
//       },
//       width: window.svgWidthHeight / numColumns,
//       height: window.svgWidthHeight / numRows,
//       x: (stationsDict[station].x * window.svgWidthHeight) / numColumns,
//       y: (stationsDict[station].y * window.svgWidthHeight) / numRows,
//       id: "Station" + stationsDict[station].id,
//     });
//   }

  var stationDict = playbackData["stationsDictionary"];
  var stationGroup = video.append("g").selectAll("g").data(Object.keys(stationDict)).enter().append("g");
  stationGroup.append("image").attrs({
    "xlink:href": function () {
      return "./static/resources/png/Bahnhof_d50000.png";
    },
    width: window.svgWidthHeight / numColumns,
    height: window.svgWidthHeight / numRows,
    x: function(d){
            return (stationDict[d]["pos"][1] * window.svgWidthHeight) / numColumns;
        },
    y: function(d)
    {
        return (stationDict[d]["pos"][0] * window.svgWidthHeight) / numRows;
    },
    id: function(d){
        return "Station" + stationDict[d]["id"];
    }
  }).on("mouseover", function(d){
      var trainsArray = playbackData["stationsDictionary"][d]["trains"];
      highlightStations([playbackData["stationsDictionary"][d]["id"]]);
      highlightTrains(trainsArray);
  }).on("mouseout", function(){
    deHighlightStations();
    deHighlightTrains();
  });


    findStationLabelPositions(playbackData);
    var widthOfCell = window.svgWidthHeight / numColumns;
    var heightOfCell = window.svgWidthHeight / numRows;

  stationGroup.append("text").attrs({
      x: function(d){
        return (stationDict[d]["labelPosition"][1] * window.svgWidthHeight) / numColumns + widthOfCell/2;
      },
      y: function(d){
        return (stationDict[d]["labelPosition"][0] * window.svgWidthHeight) / numRows + heightOfCell/2;
      },
      "text-anchor": "middle",
      "dominant-baseline": "central",
      "font-size": widthOfCell +"px",
      "cursor":"pointer",
      "pointer-events":"all",
      "class": function(d){
          return "stationLabelMap stationLabel"+stationDict[d]["id"];
      }

  }).text(function(d){
      return "S"+stationDict[d]["id"];
  }).on("mouseover", function(d){
    var trainsArray = playbackData["stationsDictionary"][d]["trains"];
    highlightStations([playbackData["stationsDictionary"][d]["id"]]);
    highlightTrains(trainsArray);
}).on("mouseout", function(){
  deHighlightStations();
  deHighlightTrains();
});


  // Lasso functions to execute while lassoing
  // lasso.items(circles);
  // video.call(lasso);
  if(window.comparison)
  {
    d3.select("#playbackControlsDiv").style("opacity",0.2);
    d3.select("#animatedGraphSpan").style("opacity",0.2);
  }
  else
  {
    d3.select("#playbackControlsDiv").style("opacity",1);
    d3.select("#animatedGraphSpan").style("opacity",1);


  }

  enableSelectioninplaybackSVG();
  computeOccupyingCellsByRegions(d3.select("#transitionGraphSvg"), playbackData);
}

function findStationLabelPositions(data)
{
    
    var stationDict = data["stationsDictionary"];
    var labelPositionSet = new Set();
    for(var key in stationDict)
    {
        var returnDict = findAvailablePosition(stationDict[key]["pos"], labelPositionSet, data);
        var posString = "["+returnDict["pos"][0]+","+returnDict["pos"][1]+"]";
        labelPositionSet.add(posString);
        stationDict[key]["labelPosition"] = [returnDict["pos"][0],returnDict["pos"][1]];
        stationDict[key]["labelDistance"] = returnDict["dist"];
    }

    data["stationsIdDictionary"] = {};
    var tempOb = data["stationsDictionary"];
    for(var key in tempOb)
    {
        data["stationsIdDictionary"][tempOb[key]["id"]] = tempOb[key];
    }
    // console.log(stationDict);
}

function findAvailablePosition(position, labelPositionSet, data)
{
    var grid = window.grid;
    var numRows = grid.length;
    var numColumns = grid[0].length;
    var stationPos = position;
    var dist = 1, foundPosition =false;
    returnDict = {};
    while(foundPosition == false)
    {
        var i = stationPos[0], j=stationPos[1];
        var pValueArray = [i-dist, i+dist, i];
        for(var s=0; s<pValueArray.length && foundPosition == false; s++)
        {
            var p=pValueArray[s];
            var qValueArray = [];
            if(p == i) qValueArray = [j+dist, j-dist];
            else if(p == (i-dist) || p==(i+dist)) qValueArray = [j];

            for(var t =0; t<qValueArray.length && foundPosition == false; t++)
            {
                var q = qValueArray[t];
                if(p>=0 && q>=0 && p<numRows && q<numColumns && grid[p][q] ==0)
                {
                    var posString = "["+p+","+q+"]";
                    if(!labelPositionSet.has(posString))
                    {
                        
                        foundPosition = true;
                        returnDict = {"pos": [p,q], "dist":dist};
                        return returnDict;

                    }
                }
            }
        }
        dist +=1;
    }
}

function posToSetElementString(pos) {
  return "[" + pos[0] + "," + pos[1] + "]";
}

function computeOccupyingCellsByRegions(svgRoot, gameData) {

    initializeSelectedRegions2();
  var rectArray = _param.selectedRectanglesRaw;

  var numColumns = _param.numColumns;
  var numRows = _param.numRows;
  var widthHeight = window.svgWidthHeight / numColumns;

  var regionDict = {};
  var nodes = {};
  var edges = [];
  var allSelectedCells = new Set();


    for(var i=0; i<window.selectedRegions.length; i++)
    {
        var region = window.selectedRegions[i];
        var id = region["id"];
        if(region["type"] == "rect")
        {
            var index = region["index"];
            let setOfGridCells = new Set();
            // var x = +d3.select(rectArray[index]["_groups"][0][0]).attr("x");
            // var y = +d3.select(rectArray[index]["_groups"][0][0]).attr("y");

            // var selectionWidth = +d3
            // .select(rectArray[index]["_groups"][0][0])
            // .attr("width");
            // var selectionHeight = +d3
            // .select(rectArray[index]["_groups"][0][0])
            // .attr("height");

            var x = rectArray[index].x;
            var y = rectArray[index].y;
            var selectionWidth = rectArray[index].width;
            var selectionHeight = rectArray[index].height;


            if (selectionWidth < widthHeight) selectionWidth = widthHeight;
            if (selectionHeight < widthHeight) selectionHeight = widthHeight;

            var startingX = Math.floor(x / widthHeight);
            var startingY = Math.floor(y / widthHeight);

            var rbcornerX = startingX + Math.ceil(selectionWidth / widthHeight);
            var rbcornerY = startingY + Math.ceil(selectionHeight / widthHeight);

            for (var j = startingX; j < rbcornerX; j++) {
            for (var k = startingY; k < rbcornerY; k++) {
                setOfGridCells.add(posToSetElementString([k, j]));
                allSelectedCells.add(posToSetElementString([k, j]));
            }
            }

            d3.select("#Rect" + (id)).attrs({
                "x": startingX * widthHeight,
                "y": startingY * widthHeight,
                "width": (rbcornerX - startingX) * widthHeight,
                "height": (rbcornerY - startingY) * widthHeight
            });
            d3.select("#Rect" + (id)).attr("y", startingY * widthHeight);
            
            var regionIdLabel = i + 1;
            regionDict[regionIdLabel] = { id: regionIdLabel, cells: setOfGridCells };
            nodes[regionIdLabel] = { id: regionDict[regionIdLabel]["id"], trains: {} };

        }
        else
        {
            var regionIdLabel = id;
            var railId = region["railId"];

            var continuousRail_id_pos_dict = window.data["continuousRail_id_pos_dict"];
            // for(var selectedRailRegionId in _param.selectedRailRegionIds)
            {
                _param.selectedRailRegionIds[railId] = regionIdLabel;
                var posArray = continuousRail_id_pos_dict[railId];
                var setOfGridCells = new Set();
                for(var x=0; x<posArray.length; x++)
                {
                    var pos = posArray[x];
                    allSelectedCells.add(posToSetElementString(pos));
                    setOfGridCells.add(posToSetElementString(pos));
                }
                regionDict[regionIdLabel] = { id: regionIdLabel, cells: setOfGridCells };
                nodes[regionIdLabel] = { id: regionDict[regionIdLabel]["id"], trains: {} };
                regionIdLabel +=1;
            }
        }
    }



  // console.log(regionDict);

  // TODO: raise error if regions are overlapping

  //

  var episode = gameData["environmentData"]["episode"];
  var agent_index_currentRegionLocation = {};

  for (var i = 0; i < episode.length; i++) {
    for (var agent_index = 0; agent_index < episode[i].length; agent_index++) {
      var tty = episode[i][agent_index][0],
        ttx = episode[i][agent_index][1];
      var ttpos = [tty, ttx];
      if (allSelectedCells.has(posToSetElementString(ttpos))) {
        var found = false;
        for (var regid in regionDict) {
          if (
            regionDict[regid]["cells"].has(posToSetElementString(ttpos)) &&
            found == false
          ) {
            if (!(agent_index in nodes[regid]["trains"])) {
              nodes[regid]["trains"][agent_index] = {
                agent_index: agent_index,
                timesteps: [i],
                numTimesteps: 1,
              };
            } else {
              nodes[regid]["trains"][agent_index]["timesteps"].push(i);
              nodes[regid]["trains"][agent_index]["numTimesteps"] += 1;
            }

            if (!(agent_index in agent_index_currentRegionLocation)) {
              agent_index_currentRegionLocation[agent_index] = regid;
            } else {
              if (agent_index_currentRegionLocation[agent_index] != regid) {
                edges.push({
                  source: agent_index_currentRegionLocation[agent_index],
                  target: regid,
                  timestep: i,
                  train: agent_index,
                });
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
  for (var i = 0; i < edges.length; i++) {
    var found = false;
    for (var j = 0; j < aggregatedEdges.length; j++) {
      if (
        edges[i]["source"] == aggregatedEdges[j]["source"] &&
        edges[i]["target"] == aggregatedEdges[j]["target"]
      ) {
        found = true;
        aggregatedEdges[j]["value"] += 1;
        aggregatedEdges[j]["trains"].push(edges[i]["train"]);
        var timestep = edges[i]["timestep"], trainTempIndex = edges[i]["train"];
        if(timestep in aggregatedEdges[j]["timestep_train"])
        {
            aggregatedEdges[j]["timestep_train"][timestep].push(trainTempIndex);
        }
        else
        {
            aggregatedEdges[j]["timestep_train"][timestep] = [trainTempIndex];
        }
      }
    }
    if (found == false) {
        var tempDict = {};
        var timestep = edges[i]["timestep"], trainTempIndex = edges[i]["train"];
        tempDict[timestep]= [trainTempIndex] ;
      aggregatedEdges.push({
        source: edges[i]["source"],
        target: edges[i]["target"],
        value: 1,
        trains: [edges[i]["train"]],
        timestep_train: tempDict
      });
    }
  }


  // adding nodeweight params
  for (var nodeid in nodes) {
    var numTrains = Object.keys(nodes[nodeid].trains).length;
    nodes[nodeid]["numTrains"] = numTrains;

    var numTimesteps = 0;
    for (var train in nodes[nodeid].trains) {
      numTimesteps += nodes[nodeid].trains[train]["numTimesteps"];
    }
    nodes[nodeid]["numTimesteps"] = numTimesteps;
  }

  _param.graph = { nodes: nodes, links: aggregatedEdges };
  _param.regionDictionary = regionDict;
  drawRegionsOnTimeline();
  drawTransitionGraph(svgRoot, gameData);
}

function drawRegionsOnTimeline()
{
    var regionNodes = _param.graph["nodes"];
    var agent_regionTimestepsDict = {};
    d3.select("#regionsOnTimeline").selectAll("*").remove();
    var regionGroup = d3.select("#regionsOnTimeline");
    for( var nodeid in regionNodes)
    {
        var node = regionNodes[nodeid];
        var trains = node["trains"];
        for(var agent_index in trains)
        {
            var timestepsInsideRegion = trains[agent_index]["timesteps"];
            var arrayOfContinuousTimesteps = computeContinuousTimesteps(timestepsInsideRegion);
            _param.graph["nodes"][nodeid]["trains"][agent_index]["continuousTimestepsArray"] = arrayOfContinuousTimesteps;
            for(var j=0; j<arrayOfContinuousTimesteps.length; j++)
            {
                var continuous = arrayOfContinuousTimesteps[j];
                var startT = continuous[0];
                var endT = continuous[continuous.length -1];
                var x = globalXScale(startT), width = globalXScale(endT+1) - x;
                // console.log(x, startT, endT);
                var heightOfrectangle = _param.heightOfRow -5;
                if(startT != undefined && endT !=undefined)
                {
                        regionGroup.append("rect").attrs({
                        "x": x,
                        "y": globalYScale(agent_index) - heightOfrectangle/2 ,
                        // "y": globalYScale(agent_index) ,
                        "width": width,
                        "height": heightOfrectangle,
                        "stroke": "black",
                        "stroke-width":"1px",
                        "visibility": "hidden",
                        "pointer-events":"none",
                        "fill-opacity":0.35,
                        "fill":"grey",
                        "class": "region_"+nodeid+ " regionsOnTimelineClass"
                    });
                }
            }
        }
    }
}

function computeContinuousTimesteps(timestepsInsideRegion)
{
    var sorted = timestepsInsideRegion.sort(function(a,b){return a-b;});
    var result = [];
    var oneContinuous = [];
    if(sorted.length <=1)
    {
        // if(sorted.length ==1)
        //     sorted.push(sorted[0]+1);
        result.push(sorted);
    }
    else
    {
        oneContinuous.push(sorted[0]);
        for(var i=1; i<sorted.length; i++)
        {
            if(sorted[i-1] + 1 == sorted[i])
            {
                oneContinuous.push(sorted[i])
            }
            else
            {
                result.push(oneContinuous);
                oneContinuous = [sorted[i]];
            }
        }
        result.push(oneContinuous);
    }
    return result;
}

function drawTransitionGraph(svgRoot, playbackData) {
  var height = window.svgWidthHeight;
  var width = d3.select("#transitionGraphDiv").node().getBoundingClientRect()
    .width;
  // d3.select("#transitionGraphSvg g").remove();
  svgRoot.selectAll("*").remove();
  var svgRoot = d3
    .select("#transitionGraphSvg")
    .attr("width", width)
    .attr("height", window.svgWidthHeight).append("g").attr("id", "aggregatedGraphGroup");
  var svg = svgRoot;

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
  var defs = d3.select("#transitionGraphSvg").append("defs");
  defs
    .append("svg:marker")
    .attr("id", "head")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", "11")
    .attr("refY", "4")
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", "10")
    .attr("markerHeight", "4")
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M 0 0 L 10 5 L 0 10 L 0 0")
    .attr("transform", "rotate(-5, 0,0)")
    .attr("fill", _param.linkColor);

  var graph = _param.graph;

  var maxNodeWeight = -1;
  for (var nodeid in _param.graph.nodes) {
    var metricValue = _param.graph.nodes[nodeid]["numTrains"];
    if (maxNodeWeight < metricValue) {
      maxNodeWeight = metricValue;
    }
  }

  var maxEdgeValue = -1;
  for (var i = 0; i < _param.graph.links.length; i++) {
    var edgeValue = _param.graph.links[i]["value"];
    if (edgeValue > maxEdgeValue) maxEdgeValue = edgeValue;
  }

  var startRadius = _param.nodeMinRadius,
    endRadius = _param.nodeMaxRadius;
  var nodeSizeScale = d3
    .scaleLinear()
    .domain([0, maxNodeWeight])
    .range([
      Math.PI * startRadius * startRadius,
      Math.PI * endRadius * endRadius,
    ]);
  var edgeThicknessScale = d3
    .scaleLinear()
    .domain([1, maxEdgeValue])
    .range([_param.linkMinWidth, _param.linkMaxWidth]);

    var linkDistanceScale = d3
        .scaleLinear()
        .domain([0, maxEdgeValue])
        .range([height/2, height/4]);

_param.nodeSizeScale = nodeSizeScale;
_param.edgeThicknessScale = edgeThicknessScale;
  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var nodesArray = [];
  for (var nodeid in graph.nodes) {
    nodesArray.push(graph.nodes[nodeid]);
  }

  var simulation = d3
    .forceSimulation()
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    // .force("link", d3.forceLink(graph.links))
    .force("link", d3.forceLink()
        .id(function (d) {
          return d.id;
        })
        // .distance(150)
        .distance(function(d)
        {
            // console.log(d);
            return linkDistanceScale(d.value);
        })
    )
    // .force("charge", d3.forceManyBody().strength(-100))
    // .force("collide", d3.forceCollide()
    //     .radius(function (d) {
    //         var r = 0;
    //   if (d.numTrains != 0) {
    //     r = Math.sqrt(nodeSizeScale(d.numTrains) / Math.PI);
    //   }
    //       return r;
    //     })
    //     .strength(-5)
    // )
    // // .force("attractForce",attractForce).force("repelForce",repelForce)
    // .force("center", d3.forceCenter(width / 2, height / 2));

  function dragstarted(d) {
    // if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    // // if(d.x >=0 && d.y >=0)
    // // {
    // d.fx = d.x;
    // d.fy = d.y;
    d3.select(this).classed("fixed", true);
    // }
    // d3.select(this).classed("fixed", d.fixed = true);
  }

  function clamp(x, lo, hi) {
    return x < lo ? lo : x > hi ? hi : x;
  }

  function dragged(d) {
    // d.fx = d3.event.x;
    // d.fy = d3.event.y;
    d.fx = clamp(d3.event.x, 0, width);
    d.fy = clamp(d3.event.y, 0, height);
    simulation.alpha(1).restart();
  }

  function dragended(d) {
    // if (!d3.event.active) simulation.alphaTarget(0);
    // d.fx = null;
    // d.fy = null;
  }
  var link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("path")
    .data(graph.links)
    .enter()
    .append("path")
    .attrs({
      "stroke-width": function (d) {
        return edgeThicknessScale(d.value) + "px";
      },
      fill: "none",
      stroke: _param.linkColor,
      "marker-end": "url(#head)",
      "cursor": "pointer",
    //   "id": function(d){
    //       return "link"+d.source+"_"+d.target;
    //   },
      "class":"graphLinks"
    });

  link.append("title").text(function (d) {
    return "#Transitions: " + d.value;
  });

  link
    .on("mouseover", function (d, i) {
      highlightTrains(d.trains);
    })
    .on("mouseout", function (d) {
      d3.selectAll(".highlighters").attr("opacity", 0);
    });

    var gameData = playbackData["environmentData"];
    var numRows = gameData["grid"].length;
    var numColumns = gameData["grid"][0].length;

    nodesArray.forEach(function(d) {
        var regionPos = [];
        var regionCells = _param.regionDictionary[d.id]["cells"];
        var regionCllsArray = Array.from(regionCells);
        var posString = regionCllsArray[Math.floor(regionCllsArray.length/2)];
        posString = posString.replace("[","").replace("]","");
        posString = posString.split(",");
        regionPos[0] = +posString[0];
        regionPos[1] = +posString[1];
        d.x = (regionPos[1] * width) / numColumns; 
        d.y = (regionPos[0]*height) /numRows ; 
       });

  var node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodesArray)
    .enter()
    .append("g");

    

  var circles = node
    .append("circle")
    .attr("r", function (d) {
      var r = _param.nodeMinRadius;
      if (d.numTrains != 0) {
        r = Math.sqrt(nodeSizeScale(d.numTrains) / Math.PI);
      }
      d.radius = r;
      return r;
    })
    .attr("fill", function (d) {
        if (d.numTrains != 0)
            return "grey";
        else
        return "white"
    })
    .attrs({
        "stroke":"grey",
        "stroke-width": "1px",
        "class": "aggregatedGraphNode",
        "id": function(d){ return "aggregatedGraphRegionNode"+d.id ;}
    })
    .call(
      d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        // .on("end", dragended)
    ).classed("fixed", d => d.fx !== undefined).on("dblclick", dblclick);

    function dblclick(d) {
        delete d.fx;
        delete d.fy;
        d3.select(this).classed("fixed", false);
        // simulation.alpha(1).restart();
        simulation.alphaTarget(0.3).restart()
      }

  circles
    .on("mouseover", function (d, i) {
      var trainIdsArray = [];
      for (var trainid in d.trains) {
        trainIdsArray.push(trainid);
      }
      highlightTrains(trainIdsArray);
      highlightRegions([d.id]);
    })
    .on("mouseout", function (d) {
        deHighlightTrains();
        dehighlightRegions();
    });

  node.append("title").text(function (d) {
    return "#Trains " + d.numTrains;
  });

  var lables = node
    .append("text")
    .text(function (d) {
      return "R" + d.id;
    })
    .attr("x", function (d) {
      return Math.sqrt(nodeSizeScale(d.numTrains) / Math.PI +15);
    })
    .attr("y", 0)
    .attr("font-size", function(){
        if(window.figureForTeaser)
            return "20px";
        else
            return "12px";
    });;

_param.graphNodeSelection = node;

  simulation.nodes(nodesArray).on("tick", ticked);

  simulation.force("link").links(graph.links);

  function ticked() {
    // link
    //     .attr("x1", function(d) { return d.source.x; })
    //     .attr("y1", function(d) { return d.source.y; })
    //     .attr("x2", function(d) { return d.target.x; })
    //     .attr("y2", function(d) { return d.target.y; });

    link.attrs({
      d: function (d) {
            return calculateCurvedPathDAttribute(d.source, d.target);
      },
    });

    node.attr("transform", function (d) { 
        d.x = Math.max(d.radius, Math.min(width - d.radius - 25, d.x));
        d.y = Math.max(3*d.radius, Math.min( window.svgWidthHeight - d.radius - 25, d.y));
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

  
}

function computeGraphForEachTimestep()
{
    var superGraph = _param.graph;
    var timestepNodes = [], timestepEdges = [], timestepTrainMovement = [], timestepEdges2 = [];;

    for(var i=0; i< window.selectedEpisodeLength; i++)
    {
        timestepEdges.push([]);
        timestepEdges2.push([]);
        timestepTrainMovement.push([]);
        var tempNode = {};
        var tempDict = {};
        for(var nodeid in superGraph.nodes)
        {
            tempNode = {"x": -1, "y": -1, "trains": [], "numTrains": -1, "radius":-1, "index": -1};
            tempNode["x"] = superGraph.nodes[nodeid]["x"];
            tempNode["y"] = superGraph.nodes[nodeid]["y"];
            tempNode["index"] = superGraph.nodes[nodeid]["id"];
            for(var trainid in superGraph.nodes[nodeid]["trains"])
            {
                var train =  superGraph.nodes[nodeid]["trains"][trainid];
                if(train["timesteps"].indexOf(i)>=0)
                {
                    tempNode["trains"].push(+trainid);
                }
            }
            tempNode["numTrains"] = tempNode["trains"].length;
                var r = _param.nodeMinRadius;
            if (tempNode["numTrains"] != 0) {
                r = Math.sqrt(_param.nodeSizeScale(tempNode["numTrains"]) / Math.PI);
            }
                tempNode["radius"] = r;
                tempDict[nodeid] = tempNode;
        }
        timestepNodes.push(tempDict);

    }
    var  trainsDict_MovementArray = {};
    for(var i=0; i<superGraph.links.length; i++)
    {
        var edge = superGraph.links[i];
        for(var timestep in edge["timestep_train"])
        {
            var timestep_trainsArray = edge["timestep_train"][timestep];
            var tempEdge = {"source": edge["source"], "target": edge["target"], "timestep": +timestep, "trains":timestep_trainsArray, "startingTimestep": 999999 } ;
            
            
            for(var z =0; z< timestep_trainsArray.length; z++)
            {
                var train_index = timestep_trainsArray[z];
                var srcTimestepsArray = edge["source"]["trains"][train_index]["timesteps"];
                var leavingTimestep = d3.max(srcTimestepsArray) + 1;
                if(train_index in trainsDict_MovementArray)
                {
                    trainsDict_MovementArray[train_index].push({"source": edge["source"], "target": edge["target"], "leavingTimestep": leavingTimestep, "reachingTimestep": +timestep});
                }
                else
                {
                    trainsDict_MovementArray[train_index] = [{"source": edge["source"], "target": edge["target"], "leavingTimestep": leavingTimestep, "reachingTimestep": +timestep}];
                }
                if(leavingTimestep < tempEdge["startingTimestep"])
                    tempEdge["startingTimestep"] = leavingTimestep;
                
            }
            timestepEdges[timestep].push(tempEdge);
            
        }
    }

    for(var i=0; i<timestepEdges.length; i++)
    {
        for(var j=0; j<timestepEdges[i].length; j++)
        {
            var edge = timestepEdges[i][j];
            // timestepEdges[i][j]["edgeWidth"] = _param.edgeThicknessScale(edge["trains"].length)+"px";
            var startingTimestep = edge["startingTimestep"];
            for(var k=startingTimestep; k<i; k++)
            {
                timestepEdges[k].push(timestepEdges[i][j]);
            }
        }
    }

    //Merge duplicate edges in each timestep - Buggy
   
    for(var i=0; i<timestepEdges.length; i++)
    {
        for(var j=0; j<timestepEdges[i].length; j++)
        {
            var edge1 = timestepEdges[i][j];
            var edgeFound = false;
            var edgeIndex = -1;
            for(var k=0; k<timestepEdges2[i].length; k++)
            {
                var edge2 = timestepEdges2[i][k];
                if(edge1.source.id == edge2.source.id && edge1.target.id == edge2.target.id)
                {
                    
                    timestepEdges2[i][k]["trains"] = mergeArrays(edge2["trains"], edge1["trains"]);
                    timestepEdges2[i][k]["timestepsArray"].push(+edge1["timestep"]);
                    edgeFound = true;
                    break;
                }
            }
            if(edgeFound == false)
            {
                edge1["timestepsArray"] = [edge1["timestep"]];
                timestepEdges2[i].push(edge1);
            }
            
        }
    }
    for(var i=0; i<timestepEdges2.length; i++)
    {
        for(var j=0; j<timestepEdges2[i].length; j++)
        {
            var edge = timestepEdges2[i][j];
            timestepEdges2[i][j]["edgeWidth"] = _param.edgeThicknessScale(edge["trains"].length)+"px";
        }
    }


    for(var train_index in trainsDict_MovementArray)
    {
        for(var m=0; m<trainsDict_MovementArray[train_index].length; m++)
        {
            var movement = trainsDict_MovementArray[train_index][m];
            var leavingTimestep = movement["leavingTimestep"];
            var reachingTimestep = movement["reachingTimestep"];
            var src = movement["source"];
            var target = movement["target"];
            var P0 = [src.x, src.y], P2=[target.x, target.y];
            var P1 = calculateMidControlPoint(P0, P2, 40);
            var xscale = d3.scaleLinear().domain([leavingTimestep, reachingTimestep]).range([src.x, target.x]);
            var yscale = d3.scaleLinear().domain([leavingTimestep, reachingTimestep]).range([src.y, target.y]);

            var t = d3.scaleLinear().domain([leavingTimestep, reachingTimestep]).range([0,1]);
            for(var n = leavingTimestep; n<reachingTimestep; n++)
            {
                var point = calculatePointOnCurve(P0, P1, P2, t(n));
                timestepTrainMovement[n].push([+train_index, point[0], point[1]]);
            }

        }
    }

    // console.log(timestepNodes, timestepEdges, trainsDict_MovementArray, timestepTrainMovement);
    _param.graphForEachTimestep = {"nodes": timestepNodes, "links": timestepEdges, "timestepTrainMovement":timestepTrainMovement, "trainsDict_MovementArray": trainsDict_MovementArray};
    d3.selectAll("#dynamicGraphGroup").remove();
    d3.select("#transitionGraphSvg").append("g").attr("id", "dynamicGraphGroup");
    _param.drawDynamicGraph = true;
    var movingTrainsGroup = d3.select("#dynamicGraphGroup").append("g").attr("class", "movingTrains");
    var movingTrainNodes = movingTrainsGroup.selectAll("circle")
            .data(Object.keys(trainsDict_MovementArray))
            .enter()
            .append("circle").attrs({
                "id": function(d){ return "movingtrain"+d},
                "class": "movingTrains",
                "visibility":"hidden",
                "r":3,
                "fill":_param.trainColorInDynamicGraph,
                "stroke": "black",
                "stroke-width":"1px",
                "cursor":"pointer"
            }).on("mouseover", function(d){
                var trainIdsArray = [+d];
                highlightTrains(trainIdsArray);
            }).on("mouseout", function (d) {
                deHighlightTrains();
            });
            movingTrainNodes.append("title").text(function(d){
                return "Train "+d; })
    // for(var train_index in trainsDict_MovementArray)
    // {
    //     movingTrainsGroup.append("circle").attrs({
    //         "id": "movingtrain"+train_index,
    //         "class": "movingTrains",
    //         "visibility":"hidden",
    //         "r":3,
    //         "fill":"grey",
    //         "stroke": "black",
    //         "stroke-width":"1px",
    //         "trainid": train_index
    //     });
    // }
    var nodesArray = [];
    for (var nodeid in _param.graph.nodes) {
        nodesArray.push(_param.graph.nodes[nodeid]);
    }
    var dynamicNodes = d3.select("#dynamicGraphGroup");
    var node = dynamicNodes
    .append("g")
    .attr("class", "dynamicNodes")
    .selectAll("g")
    .data(nodesArray)
    .enter()
    .append("g").attr("id", function(d){
        return "nodeGroup"+d.id;
    });;

    var circles = node
    .append("circle").attrs({
        "id": function(d){
        return "node"+d.id;},
        "cx": function(d){
            return d.x;
        },
        "cy": function(d){
            return d.y;
        },
        "fill": _param.currentFrameColor,
        "fill-opacity": 0.5,
        "stroke":"black",
        "stroke-width": "1px",
        "cursor":"pointer"
        
    })

    circles
    .on("mouseover", function (d, i) {
        var currentFrameValue =  $("#slider").slider("value");
        var trainIdsArray = _param.graphForEachTimestep["nodes"][currentFrameValue][d.id]["trains"];
        highlightTrains(trainIdsArray);
        highlightRegions([d.id]);
    })
    .on("mouseout", function (d) {
        deHighlightTrains();
        dehighlightRegions();
    });

    node.append("title").attr("id", function(d){ return "dynamicNodeTitle"+d.id ;}).text("");

    var lables = node
    .append("text")
    .text(function (d) {
        return "R" + d.id;
    }).attrs({
        "x": function(d){return d.x + 15;},
        "y": function(d){return d.y;},

    });

    var dynamicLinks = d3.select("#dynamicGraphGroup")
        .append("g")
        .attr("class", "dynamicLinksGroup")
        .selectAll("path")
        .data(_param.graph.links)
        .enter()
        .append("path")
        .attrs({
        // "stroke-width": function (d) {
        //     return _param.edgeThicknessScale(d.value) + "px";
        // },
        fill: "none",
        stroke: _param.linkColor,
        "marker-end": "url(#head)",
        "cursor": "pointer",
        "id": function(d){
            return "link"+d.source.id+"_"+d.target.id;
        },
        "class":"dynamicLinks",
        "stroke-opacity": 0.5,
        // "stroke-width": "2px",
        "d": function(d){
                return calculateCurvedPathDAttribute(d.source, d.target);
            }
        }).on("mouseover", function (d, i) {
            highlightTrains(d.trains);
          })
          .on("mouseout", function (d) {
            d3.selectAll(".highlighters").attr("opacity", 0);
          });

        dynamicLinks.append("title").text(function (d) {
        return "#Trains " + d.value;
    });

    var currentFrame = parseInt($("#slider").slider("value"));
    

    var numColumns = _param.numColumns;
    var numRows = _param.numRows;

  _param.dynamicNodesSelection = d3.selectAll(".dynamicNodes circle");
  _param.dynamicLinksSelection = d3.selectAll(".dynamicLinks");
  _param.movingTrainsSelection = d3.selectAll(".movingTrains");

  if(!window.comparison)
    renderNextFrame(window.data["environmentData"], currentFrame, numRows, numColumns);
    
}
function calculateCurvedPathDAttribute(source, target)
{
    var P0 = [+source.x, +source.y], P2=[+target.x, +target.y];
    var diffx = P2[0] - P0[0],
        diffy = P2[1] - P0[1];
    pathLength = Math.sqrt(diffx * diffx + diffy * diffy);
    offsetX = (diffx * target.radius) / pathLength;
    offsetY = (diffy * target.radius) / pathLength;

    var sourceRadiusOffset = [ (diffx * source.radius) / pathLength , (diffy * source.radius) / pathLength];
    var targetRadiusOffset = [ (diffx * target.radius) / pathLength , (diffy * target.radius) / pathLength];

    //P1- mid control point
    var P1 = calculateMidControlPoint(P0, P2, 40);
    return (
        "M" +
        (P0[0] + sourceRadiusOffset[0]) +
        "," +
        (P0[1] + sourceRadiusOffset[1]) +
        "S" +
        P1[0] +
        "," +
        P1[1] +
        " " +
        (P2[0] - targetRadiusOffset[0]) +
        "," +
        (P2[1] - targetRadiusOffset[1])
      );
}

function calculateMidControlPoint(P0, P2, offset)
{

    // var offset = 40;
    var midpoint_x = (P0[0] + P2[0]) / 2;
    var midpoint_y = (P0[1] + P2[1]) / 2;
    var dx = P2[0] - P0[0];
    var dy = P2[1] - P0[1];

    var normalise = Math.sqrt(dx * dx + dy * dy);
    var offSetX = midpoint_x + offset * (dy / normalise);
    var offSetY = midpoint_y - offset * (dx / normalise);
    return [offSetX, offSetY];
}

function calculatePointOnCurve(P0, P1, P2, t)
{
    var computedPoint=[0,0];
    computedPoint[0] = (1-t)*(1-t)*P0[0] + 2*(1-t)*t*P1[0] + t*t*P2[0];
    computedPoint[1] = (1-t)*(1-t)*P0[1] + 2*(1-t)*t*P1[1] + t*t*P2[1];
    return computedPoint;
}

Set.prototype.union = function(otherSet) 
{ 
    // creating new set to store union 
    var unionSet = new Set(); 
  
    // iterate over the values and add  
    // it to unionSet 
    for (var elem of this) 
    { 
        unionSet.add(elem); 
    } 
  
    // iterate over the values and add it to  
    // the unionSet 
    for(var elem of otherSet) 
        unionSet.add(elem); 
  
    // return the values of unionSet 
    return unionSet; 
} 

function mergeArrays(arr1, arr2)
{
    var set1 = new Set(arr1);
    var set2 = new Set(arr2);
    var mergedSet = set1.union(set2); 
    var mergedarray = Array.from(mergedSet);
    return mergedarray;
}

function renderNextFrame(stateArray, i, numRows, numColumns) {
  if (i >= stateArray["episode"].length) {
    return;
  }
  var durationOfFrame = window.timeWait;
  if (i == stateArray.length) {
    clearInterval(intervalId);
    return;
  }
 

  $("#slider").slider({
    value: i,
  });
  d3.select("#frame").text(i);
  d3.selectAll(".backgroundTileImage" + (i - 1)).remove();

  var previousActions = stateArray["actions"][i - 1];
  var board = stateArray["grid"];

  for (var k = 0; k < stateArray["episode"][i].length; k++) {
    var player = d3.select("#Agent" + k);
    var currentPos = [
      stateArray["episode"][i][k][1],
      stateArray["episode"][i][k][0],
    ];
    // var previousPos =  stateArray[i-1]["agents"][j]["position"];
    var newXPosBoard =
      (currentPos[0] * window.svgWidthHeight) / numColumns +
      window.svgWidthHeight / (2 * numColumns);
    var newYPosBoard =
      (currentPos[1] * window.svgWidthHeight) / numRows +
      window.svgWidthHeight / (2 * numRows);
    // var tempAgentStatusArray = [1,1,1,1];
    if (stateArray["episode"][i][k][2] == 3) {
      player.attr("visibility", "hidden");
    }
    if (
      stateArray["grid"][0][0] == 0 &&
      currentPos[0] == 0 &&
      currentPos[1] == 0
    ) {
      player.attr("visibility", "hidden");
    } else {
      player.attr("visibility", "visible");
      // player.transition().duration(durationOfFrame).attr("y", newYPosBoard).attr("x", newXPosBoard);

      var playerCircle = d3.select("#AgentCircle" + k);
      var playerText = d3.select("#AgentText" + k);
      var playerDirection = d3.select("#AgentDirection" + k);
      playerCircle
        .transition()
        .duration(durationOfFrame)
        .attr("cy", newYPosBoard)
        .attr("cx", newXPosBoard);
      playerText
        .transition()
        .duration(durationOfFrame)
        .attr("y", newYPosBoard)
        .attr("x", newXPosBoard);

    if(!window.comparison)
    {
        if(k in window.data["agentTrajectoryData"])
        {
            if(i in window.data["agentTrajectoryData"][k])
            {
                var railNodeId = window.data["agentTrajectoryData"][k][i]["railNodeId"];
                var tempSplit = railNodeId.split(", ")[2].replace(")","");
                var direction = parseInt(tempSplit);

                playerDirection
                    .transition()
                    .duration(durationOfFrame)
                    .attr("cy", newYPosBoard - window.circleRaidusInMap + window.directionCircleRadius - 0.5)
                    .attr("cx", newXPosBoard)
                    .attr("transform", `rotate(${90*direction} ${newXPosBoard} ${newYPosBoard})`);
                    }
        }
        
    }

      // var split = d3.select("#Agent"+k).attr("transform").split(",");
      // var xPos = parseFloat(split[0].split("(")[1]);
      // var yPos = parseFloat(split[1].split(")")[0]);
      // // var xPos = t.translate[0], yPos = t.translate[1];
      // // console.log(xPos, yPos);
      // // player.transition().duration(durationOfFrame).attr("transform", "translate(" +(newXPosBoard - xPos)+","+ (newYPosBoard - yPos)+")");
      // player.attr("transform", "translate(" +(newXPosBoard - xPos)+","+ (newYPosBoard - yPos)+")");

    //   var t = d3.select("#status").node().transform.baseVal[0].matrix;
    //   var currentX = t["e"];
      var visEndX = globalXScale(i);
      d3.select("#status")
        //   .attr("transform", "translate(" + currentX + ",0)")
          .transition()
          .duration(durationOfFrame)
          .ease(d3.easeLinear)
          .attr("transform", "translate(" + visEndX + ",0)");

        //   Draw node size according to the current frame
        if(_param.drawDynamicGraph)
        {
            // d3.selectAll(".dynamicLinks").attr("visibility", "hidden");
            _param.dynamicLinksSelection.attr("visibility", "hidden");
            // d3.selectAll(".dynamicNodes circle").attr("fill", "white");
            _param.dynamicNodesSelection.attr("fill", "white");
            // d3.selectAll(".movingTrains").attr("visibility", "hidden");
            _param.movingTrainsSelection.attr("visibility", "hidden");

            for(var nodeid in _param.graphForEachTimestep["nodes"][i])
            {
                d3.select("#node"+nodeid).transition().duration(durationOfFrame).attr("r",  _param.graphForEachTimestep["nodes"][i][nodeid]["radius"]);
                if(_param.graphForEachTimestep["nodes"][i][nodeid]["numTrains"] >0)
                {
                    var node = d3.select("#node"+nodeid);
                    node.attr("fill", _param.currentFrameColor).attr("fill-opacity", 0.5);
                    d3.select("#dynamicNodeTitle"+nodeid).text("# Trains: "+_param.graphForEachTimestep["nodes"][i][nodeid]["numTrains"]);
                }
                else
                {
                    d3.select("#dynamicNodeTitle"+nodeid).text("# Trains: 0");
                }
            }
            for(var z=0; z<_param.graphForEachTimestep["links"][i].length; z++)
            {
                var tlink = _param.graphForEachTimestep["links"][i][z];
                d3.select("#link"+tlink.source.id+"_"+tlink.target.id).attr("visibility", "visible");
                d3.select("#link"+tlink.source.id+"_"+tlink.target.id).transition().duration(durationOfFrame).attr("stroke-width", tlink["edgeWidth"]);
            }
            
            for(var z=0; z<_param.graphForEachTimestep["timestepTrainMovement"][i].length; z++)
            {
                var temp = _param.graphForEachTimestep["timestepTrainMovement"][i][z];
                d3.select("#movingtrain"+temp[0]).transition().duration(durationOfFrame).attrs({
                    "cx": temp[1],
                    "cy": temp[2],
                    "visibility":"visible"
                })
            }
        }
        


    }
  }
  if(!window.comparison)
    drawPerFrameStatistics(i);
}

function drawPerFrameStatistics(frame_num) {
  // d3.select("#totalNumTrains").text(overallStatisticsDict.totalNumTrains);
  d3.selectAll(".currentNumTrainsReachedDestination").text(
    window.perFrameStatisticsArray[frame_num][0]
  );
  d3.selectAll(".currentNumTrainsInProgress").text(
    window.perFrameStatisticsArray[frame_num][1]
  );
  d3.selectAll(".currentNumTrainsYetToStart").text(
    window.perFrameStatisticsArray[frame_num][2]
  );
}

function returnAgentImagePath(agentIndex) {
  var imagePath = "./static/resources/png/";
  // switch(agentIndex)
  // {
  // case 0:
  imagePath += "Zug_Gleis_d50000.png";
  // break;
  // }
  return imagePath;
}

function returnImagePath(cellValue) {
  var imagePath = "./static/resources/png/";
  switch (cellValue) {
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
