function timelineComparison()
{

}

function drawComparisonVisualization(boolA, boolB)
{
    d3.select("#transitionGraphSvg").remove();

    var agentTimelineDataA = processData(window.dataA, "A");
    _param.agentTimelineDataA = agentTimelineDataA;
    window.overallStatisticsDictA = computeOverallStatistics(agentTimelineDataA);
    window.perFrameStatisticsArrayA = computePerFrameStatistics(agentTimelineDataA);
    drawOverallStatistics(window.overallStatisticsDictA, boolA, false);

    var agentTimelineDataB = processData(window.dataB, "B");
    _param.agentTimelineDataB = agentTimelineDataB;
    window.overallStatisticsDictB = computeOverallStatistics(agentTimelineDataB);
    window.perFrameStatisticsArrayB = computePerFrameStatistics(agentTimelineDataB);
    drawOverallStatistics(window.overallStatisticsDictB, false, boolB);

    var episodeDataA = window.dataA["environmentData"];
    var episodeLengthA = episodeDataA["episode"].length;
    window.selectedEpisodeLengthA = episodeLengthA;

    var episodeDataB = window.dataB["environmentData"];
    var episodeLengthB = episodeDataB["episode"].length;
    window.selectedEpisodeLengthB = episodeLengthB;


    var numRows = episodeDataA["grid"].length;
    var numColumns = episodeDataA["grid"][0].length;

    // $("#slider").slider({
    // value: 1,
    // min: 0,
    // max: episodeLength,
    // });
    // d3.select("#frame").text("0");

    d3.select("#mainVisualizationGroup").selectAll("*").remove();
    d3.select("#histogram").remove();
    
    d3.select("#scrollBar").remove();
    d3.select("#topLegend").remove();

    var leftPadding = _param.leftPadding,
    rightPadding = _param.rightPadding,
    topPadding = _param.topPadding,
    bottomPadding = _param.bottomPadding,
    width = _param.svgWidth,
    svgHeight = _param.svgHeight,
    height = _param.svgHeight,
    textEnd = _param.textEnd;

    var minHeightOfRow = 2*_param.minHeightOfRow;

    window.visEndX = width - rightPadding - textEnd;
    window.visStartX = textEnd;
    window.maxHeightOfHistogramBars = 40;
    window.statusHeight = height + bottomPadding + maxHeightOfHistogramBars;
    var radiusOfSmallDots = 1.5;
    var radiusOfCircle = _param.radiusOfCircle;
    var glyphOPacity = _param.glyphOPacity;
    var marginTextBeforeMatrix = _param.marginTextBeforeMatrix;

    width = document.body.clientWidth * 0.7/window.zoomFactor;
    _param.mainVisualizationSvgWidth = width;
    d3.select("#item4").attr("style", "width:"+(width)+"px;");
    width = width - 10;
    d3.select("#rightColumn").attr("style", "width:"+((document.body.clientWidth * 0.3/window.zoomFactor) - 35)+"px;");
    _param.svgWidth = width;
    d3.select("#mainVisualization")
    .attr("width", width + "px")
    .attr("height", height + "px");
    var svg = d3.select("#mainVisualizationGroup");

    d3.select("#regionsOnTimeline").remove();
    d3
    .select("#mainVisualizationGroup")
    .append("g")
    .attr("id", "regionsOnTimeline");

    var topLegendGroup = d3
    .select("#mainVisualization")
    .append("g")
    .attr("id", "topLegend");

    groupedTrainsA = putTrainsinGroups(agentTimelineDataA);
    groupedTrainsB = putTrainsinGroups(agentTimelineDataB);

    _param.groupedTrainsA = groupedTrainsA;
    _param.groupedTrainsB = groupedTrainsB;
    metaGroupingDict = {"bothReached":[], "reached_ontrack":[], "bothOnTrack":[], "ontrack_yettostart":[] ,
                            "bothYetToStart":[], "reached_yettostart":[] };
    agentsA = groupedTrainsA["reached"]["agent_indices"];
    agentsB = groupedTrainsB["reached"]["agent_indices"];

    for(var i=0; i<agentsA.length; i++)
    {
        if(agentsB.indexOf(agentsA[i]) >=0)
        {
            pushUnique(metaGroupingDict["bothReached"],(agentsA[i]));
        }
        else if(groupedTrainsB["ontrack"]["agent_indices"].indexOf(agentsA[i]) >=0)
        {
            pushUnique(metaGroupingDict["reached_ontrack"],(agentsA[i]));
        }
        else if(groupedTrainsB["yettostart"]["agent_indices"].indexOf(agentsA[i]) >=0)
        {
            pushUnique(metaGroupingDict["reached_yettostart"],(agentsA[i]));
        }
    }

    agentsA = groupedTrainsA["ontrack"]["agent_indices"];
    agentsB = groupedTrainsB["ontrack"]["agent_indices"];

    for(var i=0; i<agentsA.length; i++)
    {
        if(agentsB.indexOf(agentsA[i]) >=0)
        {
            pushUnique(metaGroupingDict["bothOnTrack"],(agentsA[i]));
        }
        else if(groupedTrainsB["reached"]["agent_indices"].indexOf(agentsA[i]) >=0)
        {
            pushUnique(metaGroupingDict["reached_ontrack"],(agentsA[i]));
        }
        else if(groupedTrainsB["yettostart"]["agent_indices"].indexOf(agentsA[i]) >=0)
        {
            pushUnique(metaGroupingDict["ontrack_yettostart"],(agentsA[i]));
        }
    }

    agentsA = groupedTrainsA["yettostart"]["agent_indices"];
    agentsB = groupedTrainsB["yettostart"]["agent_indices"];

    for(var i=0; i<agentsA.length; i++)
    {
        if(agentsB.indexOf(agentsA[i]) >=0)
        {
            pushUnique(metaGroupingDict["bothYetToStart"],(agentsA[i]));
        }
        else if(groupedTrainsB["reached"]["agent_indices"].indexOf(agentsA[i]) >=0)
        {
            pushUnique(metaGroupingDict["reached_yettostart"],(agentsA[i]));
        }
        else if(groupedTrainsB["ontrack"]["agent_indices"].indexOf(agentsA[i]) >=0)
        {
            pushUnique(metaGroupingDict["ontrack_yettostart"],(agentsA[i]));
        }

    }

    metaGroupingDict["bothReached"] = sortTrainsBoth("startTimestep", "ascending",
    metaGroupingDict["bothReached"],
    agentTimelineDataA, agentTimelineDataB);

    metaGroupingDict["reached_ontrack"] = sortTrainsBoth("startTimestep", "ascending",
    metaGroupingDict["reached_ontrack"],
    agentTimelineDataA, agentTimelineDataB);

    metaGroupingDict["bothOnTrack"] = sortTrainsBoth("startTimestep", "ascending",
    metaGroupingDict["bothOnTrack"],
    agentTimelineDataA, agentTimelineDataB);

    metaGroupingDict["ontrack_yettostart"] = sortTrainsBoth("startTimestep", "ascending",
    metaGroupingDict["ontrack_yettostart"],
    agentTimelineDataA, agentTimelineDataB);

    metaGroupingDict["bothYetToStart"] = sortTrainsBoth("startTimestep", "ascending",
    metaGroupingDict["bothYetToStart"],
    agentTimelineDataA, agentTimelineDataB);

    metaGroupingDict["reached_yettostart"] = sortTrainsBoth("startTimestep", "ascending",
    metaGroupingDict["reached_yettostart"],
    agentTimelineDataA, agentTimelineDataB);

    // var originDestinationGrouping = groupTrainsBasedOnOriginDestination(window.dataA, window.dataB);

    var entitiesArray = [],
    entitiesNameArray = [];
    groupDict = metaGroupingDict;
    _param.groupOfTrains = groupDict;
    // entitiesArray = sortTrains("endTimestep", "ascending", entitiesArray, agentTimelineData);
    entitiesArray = groupDict["bothReached"].concat(
    groupDict["reached_ontrack"]
    );
    entitiesArray = entitiesArray.concat(groupDict["reached_yettostart"]);
    entitiesArray = entitiesArray.concat(groupDict["bothOnTrack"]);
    entitiesArray = entitiesArray.concat(groupDict["ontrack_yettostart"]);
    entitiesArray = entitiesArray.concat(groupDict["bothYetToStart"]);

    _param.entitiesArray = entitiesArray;
    for (var i = 0; i < entitiesArray.length; i++) {
    entitiesNameArray.push("Train " + sameLengthAgentName(entitiesArray[i]));
    }

    var yscale = d3
    .scaleBand()
    .domain(entitiesArray)
    .rangeRound([topPadding, height - bottomPadding])
    .padding(5);

    var maxEpisodeLength = d3.max([episodeLengthA, episodeLengthB]);
    var xscale = d3
    .scaleLinear()
    .domain([0, maxEpisodeLength])
    .range([textEnd, width - rightPadding - 15]);
    window.globalXScale = xscale;

    window.statusHeight = height + bottomPadding + maxHeightOfHistogramBars;
    var heightOfRow = (yscale(entitiesArray[1]) - yscale(entitiesArray[0]));
    if (entitiesArray.length == 1)
      heightOfRow = height - bottomPadding - topPadding;
  
    var currentHeightOfTimeline = _param.svgHeight - bottomPadding - topPadding;
    _param.computedMinHeightOfTimeline = currentHeightOfTimeline;
    var computedMinHeightOfTimeline = currentHeightOfTimeline;
  
    if (heightOfRow < minHeightOfRow) {
      var currentHeightOfTimeline = _param.svgHeight - bottomPadding - topPadding;
      var computedMinHeightOfTimeline = minHeightOfRow * entitiesArray.length;
      window.statusHeight =
        computedMinHeightOfTimeline + bottomPadding + maxHeightOfHistogramBars;
      _param.computedMinHeightOfTimeline = computedMinHeightOfTimeline;
      yscale = d3
        .scaleBand()
        .domain(entitiesArray)
        .rangeRound([topPadding, computedMinHeightOfTimeline + topPadding])
        .padding(5);
      heightOfRow = minHeightOfRow;
    }
    _param.differenceOfHeight =
      computedMinHeightOfTimeline - currentHeightOfTimeline;
  
    _param.heightOfRow = heightOfRow;
  
    window.endyPosOfMatrix =
      yscale(entitiesArray[entitiesArray.length - 1]) + heightOfRow / 2;
    window.globalYScale = yscale;
  
    // drawing scrollbar rect
    if (computedMinHeightOfTimeline > currentHeightOfTimeline) {
      var scrollBarWidth = 10;
      var heightOfScrollBar =
        (currentHeightOfTimeline / computedMinHeightOfTimeline) *
        currentHeightOfTimeline;
      _param.scrollRatio = currentHeightOfTimeline / computedMinHeightOfTimeline;
      var scrollBar = d3
        .select("#mainVisualization")
        .append("rect")
        .attrs({
          id: "scrollBar",
          x: _param.svgWidth - scrollBarWidth,
          y: globalYScale(_param.entitiesArray[0]) - _param.heightOfRow / 2,
          width: scrollBarWidth,
          height: heightOfScrollBar,
          fill: "grey",
        });
      scrollBar.on("drag", scroll);
      var dragLink = d3
        .drag()
        // .subject(function (d) { return d; })
        .on("start", function (e) {
          d3.event.sourceEvent.stopPropagation();
        })
        .on("drag", scrollDrag);
      // .on("end", dragended);
      scrollBar.call(dragLink);
    }
    var colors = _param.colors;

    var doneAgents = groupDict["bothReached"];
    var ontrackAgents = groupDict["bothOnTrack"];
    var yettostartAgents = groupDict["bothYetToStart"];
    var done_ontrackAgents = groupDict["reached_ontrack"];
    var ontrack_yettostartAgents = groupDict["ontrack_yettostart"];
    var done_yettostartAgents = groupDict["reached_yettostart"];

    if (doneAgents.length > 0) {
      makeSideVerticalLineForBoth(
        globalYScale(doneAgents[0]),
        globalYScale(doneAgents[doneAgents.length - 1]),
        "reached", "reached",
        svg,
        _param.reachedIcon, _param.reachedIcon, true
      );
    }
    if (ontrackAgents.length > 0) {
      // var ttx = textEnd - _param.marginTextBeforeMatrix - 50;
      var ttx = textEnd;
  
      svg.append("line").attrs({
        x1: ttx,
        y1: globalYScale(ontrackAgents[0]) - heightOfRow / 2 + 2,
        x2: _param.svgWidth - _param.rightPadding,
        y2: globalYScale(ontrackAgents[0]) - heightOfRow / 2 + 2,
        "stroke-width": "1px",
        stroke: "lightgray",
      });
      makeSideVerticalLineForBoth(
        globalYScale(ontrackAgents[0]),
        globalYScale(ontrackAgents[ontrackAgents.length - 1]),
        "ontrack", "ontrack", 
        svg,
        _param.ontrackIcon, _param.ontrackIcon, true
      );
    }

    if (done_ontrackAgents.length > 0) {
        // var ttx = textEnd - _param.marginTextBeforeMatrix - 50;
        var ttx = textEnd;
    
        svg.append("line").attrs({
          x1: ttx,
          y1: globalYScale(done_ontrackAgents[0]) - heightOfRow / 2 + 2,
          x2: _param.svgWidth - _param.rightPadding,
          y2: globalYScale(done_ontrackAgents[0]) - heightOfRow / 2 + 2,
          "stroke-width": "1px",
          stroke: "lightgray",
        });
        makeSideVerticalLineForBoth(
          globalYScale(done_ontrackAgents[0]),
          globalYScale(done_ontrackAgents[done_ontrackAgents.length - 1]),
          "reached", "ontrack", 
          svg,
          _param.reachedIcon, _param.ontrackIcon, true
        );
    } 

    if (ontrack_yettostartAgents.length > 0) {
        // var ttx = textEnd - _param.marginTextBeforeMatrix - 50;
        var ttx = textEnd;
    
        svg.append("line").attrs({
          x1: ttx,
          y1: globalYScale(ontrack_yettostartAgents[0]) - heightOfRow / 2 + 2,
          x2: _param.svgWidth - _param.rightPadding,
          y2: globalYScale(ontrack_yettostartAgents[0]) - heightOfRow / 2 + 2,
          "stroke-width": "1px",
          stroke: "lightgray",
        });
        makeSideVerticalLineForBoth(
          globalYScale(ontrack_yettostartAgents[0]),
          globalYScale(ontrack_yettostartAgents[ontrack_yettostartAgents.length - 1]),
          "ontrack", "yettostart", 
          svg,
          _param.ontrackIcon, _param.yettostartIcon, true
        );
    } 

    if (done_yettostartAgents.length > 0) {
        // var ttx = textEnd - _param.marginTextBeforeMatrix - 50;
        var ttx = textEnd;
    
        svg.append("line").attrs({
          x1: ttx,
          y1: globalYScale(done_yettostartAgents[0]) - heightOfRow / 2 + 2,
          x2: _param.svgWidth - _param.rightPadding,
          y2: globalYScale(done_yettostartAgents[0]) - heightOfRow / 2 + 2,
          "stroke-width": "1px",
          stroke: "lightgray",
        });
        makeSideVerticalLineForBoth(
          globalYScale(done_yettostartAgents[0]),
          globalYScale(done_yettostartAgents[done_yettostartAgents.length - 1]),
          "reached", "yettostart", 
          svg,
          _param.reachedIcon, _param.yettostartIcon, true
        );
    } 
    //
    if (yettostartAgents.length > 0) {
        svg.append("rect").attrs({
            x: ttx,
            y: globalYScale(yettostartAgents[0]) - heightOfRow / 2,
            width: _param.svgWidth - _param.rightPadding - ttx,
            height:
              globalYScale(yettostartAgents[yettostartAgents.length - 1]) -
              globalYScale(yettostartAgents[0]) +
              heightOfRow,
            fill: "red",
            opacity: 0.03,
          });

          makeSideVerticalLineForBoth(
        globalYScale(yettostartAgents[0]),
        globalYScale(yettostartAgents[yettostartAgents.length - 1]),
        "yettostart","yettostart",
        svg,
        _param.yettostartIcon, _param.yettostartIcon, true
      );
  
      svg.append("line").attrs({
        x1: ttx,
        y1: globalYScale(yettostartAgents[0]) - heightOfRow / 2 + 2,
        x2: _param.svgWidth - _param.rightPadding -15,
        y2: globalYScale(yettostartAgents[0]) - heightOfRow / 2 + 2,
        "stroke-width": "1px",
        stroke: "lightgray",
      });
    }

    var alternateBackgroundGroup = svg.append("g");
    var yLegendGroup = svg.append("g");
    for (var i = 0; i < entitiesArray.length; i++) 
    {
        var index = entitiesArray.indexOf(i);
        if(index%2==0)
        {
            alternateBackgroundGroup.append("rect").attrs({
                x: textEnd - marginTextBeforeMatrix - 70,
                y: yscale(i) - heightOfRow/2,
                width: width - textEnd + marginTextBeforeMatrix + 70,
                height: heightOfRow,
                fill: "lightgrey",
                "opacity": 0.2,
                "class": "background",
                "pointer-events":"none"
            });
        }
      yLegendGroup
        .append("text")
        .attrs({
          x: function () {
            return textEnd - marginTextBeforeMatrix + 15;
          },
          // "x": 0,
          y: yscale(entitiesArray[i]),
          class: "TrainLabels yLegend " + entitiesArray[i],
          id: "TrainLabel" + entitiesArray[i],
        })
        .text(function () {
          var maxCharacters = 17;
          var temp = entitiesNameArray[i];
          temp = agentNameSimplify(temp);
          if (temp.length > maxCharacters)
            temp = temp.substring(0, maxCharacters - 3) + "...";
          // return temp;
          return temp;
        })
        .append("title")
        .text(function () {
          var temp = entitiesNameArray[i];
          temp = agentNameSimplify(temp);
          return temp;
        });
    }

    var lastRowBottomEdgeYLoacation =
        yscale(entitiesArray[entitiesArray.length - 1]) + heightOfRow / 2;
        yLegendGroup.append("line").attrs({
        x1: textEnd,
        y1: lastRowBottomEdgeYLoacation,
        x2: width,
        y2: lastRowBottomEdgeYLoacation,
        stroke: "black",
        // "stroke-dasharray":"5 5",
        "stroke-width": "1px",
        });

        // Highlighter rows hovering
    var highlighters = svg.append("g");
    var ttx = textEnd - _param.marginTextBeforeMatrix - 60;
    for (var i = 0; i < entitiesArray.length; i++) {
        var tty = yscale(entitiesArray[i]) - heightOfRow / 2;
        highlighters.append("rect").attrs({
        x: ttx,
        y: tty + 1,
        width: _param.svgWidth - ttx,
        height: heightOfRow - 4,
        fill: _param.highlightColor,
        opacity: 0,
        // "opacity":0.0,
        stroke: "black",
        "stroke-width": "1px",
        "stroke-opacity": 0,
        "cursor":"pointer",
        class: "highlighters",
        id: "highlighter" + entitiesArray[i],
        "trainid": entitiesArray[i],
        "pointer-events": "all"
        // "visibility":"hidden",
        // "cursor": "pointer"
        });
    }

     // Draw Timeline of each agent
for(t=0; t<2; t++)
{
    var rowPositionDiff;
    if(t==0)
    {
        agentTimelineData = agentTimelineDataA;
        boolA = true;
        boolB = false;
        episodeLength = episodeLengthA;
        rowPositionDiff = (heightOfRow/_param.rowFactor);
    }
    else
    {
        agentTimelineData = agentTimelineDataB;
        boolA = false;
        episodeLength = episodeLengthB;
        boolB = true;
        rowPositionDiff = -heightOfRow/_param.rowFactor;
    }

  for (var i = 0; i < agentTimelineData.length; i++) {
    var agentTimeline = svg.append("g");
    var spaceBetweenTimesteps = xscale(2) - xscale(1);
    
    for (var j = 0; j < agentTimelineData[i]["movement"].length; j++) {
      var x_Pos;
      var y_Pos = yscale(i) - rowPositionDiff;

      

      var heightOfRectangle;
      // Movement
      if (j > 0) {
        if (agentTimelineData[i]["movement"][j] != 0) {
          x_Pos = xscale(j - 1);
          heightOfRectangle = radiusOfCircle / 2;
          agentTimeline.append("rect").attrs({
            x: x_Pos,
            y: y_Pos - heightOfRectangle / 2,
            rx: 0,
            ry: 0,
            width: spaceBetweenTimesteps,
            height: heightOfRectangle,
            fill: function(){
                if(boolA)
                    return _param.colorA;
                else if(boolB)
                    return _param.colorB;
            },
            "fill-opacity": glyphOPacity,
            class: function(){
                var classes =   "timeLineVisComponent ";
                if(boolA)
                    classes +="movedA";
                else if(boolB)
                    classes += "movedB";
                return classes;
              },
            "pointer-events":"none"
          });
        }
      }

      // Junctions
      if (agentTimelineData[i]["junctions"][j] != 0) {
        var t_width = 1.5 * radiusOfCircle,
          t_height = t_width;
        x_Pos = xscale(j) - t_width / 2;
        y_Pos = yscale(i) - rowPositionDiff - t_height / 2;
        agentTimeline.append("rect").attrs({
          x: x_Pos,
          y: y_Pos,
          rx: 0,
          ry: 0,
          width: t_width,
          height: t_height,
        //   fill: colors[3],
            fill:"none",
            stroke: "black",
            "stroke-width": "1px",
        "stroke-opacity": glyphOPacity,
          "fill-opacity": glyphOPacity,
          transform:
            "rotate(-45," +
            (x_Pos + t_width / 2) +
            "," +
            (y_Pos + t_height / 2) +
            ")",
          class: "junction timeLineVisComponent",
          "pointer-events":"none"
        });
      }

      // Malfunctions
      if (
        j > 1 &&
        agentTimelineData[i]["malfunctions"][j] > 0 &&
        agentTimelineData[i]["malfunctions"][j - 1] == 0
      ) {
        if (
          agentTimelineData[i]["status"][j] == window._STATUS.READY ||
          agentTimelineData[i]["status"][j] == window._STATUS.INCOMPLETE
        ) {
          var t_width = 2 * radiusOfCircle,
            t_height = t_width;
          x_Pos = xscale(j);
          y_Pos = yscale(i)-rowPositionDiff;
          agentTimeline
            .append("text")
            .attrs({
              x: x_Pos,
              y: y_Pos,
              "font-size": t_height + "px",
              class: function(){
                var classes =   "timeLineVisComponent ";
                if(boolA)
                    classes +="malfunctionA";
                else if(boolB)
                    classes += "malfunctionB";
                return classes;
              },
              "dominant-baseline": "central",
              "text-anchor": "middle",
              "pointer-events":"none",
              "stroke": function(){
                if(boolA)
                    return _param.colorA;
                else if(boolB)
                    return _param.colorB;
            }
            })
            .text("X");

          var malfunctionDuration = agentTimelineData[i]["malfunctions"][j];
          var malfunctionBeginning = j;
          var malfunctionEnd = malfunctionBeginning + malfunctionDuration;
          if (malfunctionEnd > episodeLength) malfunctionEnd = episodeLength;

          agentTimeline.append("line").attrs({
            x1: x_Pos,
            y1: y_Pos,
            x2: globalXScale(malfunctionEnd),
            y2: y_Pos,
            stroke: function(){
                if(boolA)
                    return _param.colorA;
                else if(boolB)
                    return _param.colorB;
            },
            "stroke-opacity": glyphOPacity,
            // "stroke-dasharray":"5 5",
            "stroke-width": "1px",
            class:  function(){
                var classes =   "timeLineVisComponent ";
                if(boolA)
                    classes +="malfunctionA";
                else if(boolB)
                    classes += "malfunctionB";
                return classes;
              },
            "pointer-events":"none"
          });

          // agentTimeline.append("rect").attrs({
          //     x: x_Pos,
          //     y: y_Pos,
          //     rx: 0,
          //     ry: 0,
          //     width: t_width,
          //     height: t_height,
          //     "fill": colors[4],
          //     "fill-opacity":glyphOPacity,
          //     // "transform": "rotate(-45," + (x_Pos + t_width/2) +","+ (y_Pos + t_height/2)+")",
          //     "class": "malfunctions"
          // });
        }
      }
    }
    //Start Timestep
    if (agentTimelineData[i]["startTimestep"] >= 0) {
      x_Pos = xscale(agentTimelineData[i]["startTimestep"]);
      y_Pos = yscale(i)-rowPositionDiff;
      agentTimeline.append("circle").attrs({
        cx: x_Pos,
        cy: y_Pos,
        r: radiusOfCircle,
        fill: "none",
        stroke: "black",
        "stroke-width": "2px",
        class: "startTimestep timeLineVisComponent",
        "pointer-events":"none"
      });
    }

    //End Timestep
    if (agentTimelineData[i]["endTimestep"] >= 0) {
      x_Pos = xscale(agentTimelineData[i]["endTimestep"]);
      y_Pos = yscale(i)-rowPositionDiff ;
      agentTimeline.append("circle").attrs({
        cx: x_Pos,
        cy: y_Pos,
        r: radiusOfCircle,
        fill: colors[4],
        "fill-opacity": glyphOPacity,
        class: "endTimestep timeLineVisComponent",
        "pointer-events":"none"
      });
    }
  }
}

highlighters.selectAll(".highlighters").on("mouseover", function (d, i) {
    d3.select(this).attr("opacity", _param.highlightOpacity);
    var agent_index = _param.entitiesArray[i];
    highlightTrainLabel(agent_index);
    highlightTrains([agent_index]);
  });
  highlighters.selectAll(".highlighters").on("mouseout", function (d) {
    d3.selectAll(".highlighters").attr("opacity", 0);
    deHighlightTrains();
  });

  document
    .getElementById("mainVisualization")
    .addEventListener("wheel", scrollFunction);

  topLegendGroup.append("rect").attrs({
    x: 0,
    y: 0,
    width: _param.svgWidth,
    height: yscale(entitiesArray[0]) - heightOfRow / 2,
    fill: "white",
  });

  topLegendGroup.append("line").attrs({
    x1: textEnd,
    y1: yscale(entitiesArray[0]) - heightOfRow / 2,
    x2: width - rightPadding,
    y2: yscale(entitiesArray[0]) - heightOfRow / 2,
    stroke: "black",
    // "stroke-dasharray":"5 5",
    "stroke-width": "1px",
  });

  //Draw episode lengths of two sessions
   var heightOfEpisodeLengths = 3;
  topLegendGroup.append("rect").attrs({
    x: xscale(0),
    y: yscale(entitiesArray[0]) - heightOfRow / 2- 2*heightOfEpisodeLengths,
    width: xscale(window.selectedEpisodeLengthA) - xscale(0),
    height: heightOfEpisodeLengths,
    stroke: "none",
    fill: _param.colorA
  });

  topLegendGroup.append("rect").attrs({
    x: xscale(0),
    y: yscale(entitiesArray[0]) - heightOfRow / 2- heightOfEpisodeLengths,
    width: xscale(window.selectedEpisodeLengthB) - xscale(0),
    height: heightOfEpisodeLengths,
    stroke: "none",
    fill: _param.colorB
  });


  // Draw Ticks at some interval

  var limit = maxEpisodeLength;
  var tempInterval = parseInt(episodeLength / 10);
  var remainder = tempInterval % 5;
  var tickInterval;
  if (remainder <= 2) tickInterval = tempInterval - remainder;
  else tickInterval = tempInterval + 5 - remainder;

  if (tickInterval == 0) tickInterval = 5;

  var tickLength = _param.tickLength;
  var tickFontSize = _param.tickFontSize;

  for (var z = 0; z <= limit - tickInterval / 2; z = z + tickInterval) {
    var tickX = xscale(z);
    var tickY = yscale(entitiesArray[0]) - heightOfRow / 2;

    topLegendGroup.append("line").attrs({
      x1: tickX,
      y1: tickY,
      x2: tickX,
      y2: tickY - tickLength,
      stroke: "black",
      // "stroke-dasharray":"5 5",
      "stroke-width": "1px",
    });
    topLegendGroup
      .append("text")
      .attrs({
        x: tickX,
        y: tickY - tickLength - 2,
        "font-size": tickFontSize,
        "class": "tickLabel",
        "text-anchor": "middle",
        "dominant-baseline": "end",
      })
      .text(z);
  }
  var tickX = xscale(limit);
  var tickY = yscale(entitiesArray[0]) - heightOfRow / 2;

  topLegendGroup.append("line").attrs({
    x1: tickX,
    y1: tickY,
    x2: tickX,
    y2: tickY - tickLength,
    stroke: "black",
    // "stroke-dasharray":"5 5",
    "stroke-width": "1px",
  });
  topLegendGroup
    .append("text")
    .attrs({
      x: tickX - 10,
      y: tickY - tickLength,
      "font-size": tickFontSize,
      "text-anchor": "end",
      "dominant-baseline": "end",
    })
    .text(limit);

  //    X-Axis Label
  var yPosGameTimelineLegend =
    yscale(entitiesArray[0]) - heightOfRow / 2 - tickLength - 2 * tickFontSize;

  _param.yPosGameTimelineLegend = yPosGameTimelineLegend;
  topLegendGroup.append("path").attrs({
    // "marker-end": 'url(#head)',
    "stroke-width": "1px",
    fill: "black",
    stroke: "black",
    d: function () {
      var halfWidth = 125;
      var centreX = (width - textEnd) / 2 + textEnd;
      var yloc = yPosGameTimelineLegend;
      var st =
        "M " +
        (centreX - halfWidth) +
        ", " +
        yloc +
        " H " +
        (centreX + halfWidth) +
        " l 0 -3 l 3 3 l -3 3 l 0 -3";
      return st;
    },
  });

  var textElm = topLegendGroup
    .append("text")
    .text("Episode Timeline (Steps)")
    .attrs({
      x: (width - textEnd) / 2 + textEnd,
      // "y": height-bottomPadding/2,
      y: yPosGameTimelineLegend,
      "dominant-baseline": "central",
      "text-anchor": "middle",
      visibility: "hidden",
    });

  var backRect = textElm.node().getBBox();
  topLegendGroup.append("rect").attrs({
    x: backRect.x,
    y: backRect.y,
    width: backRect.width,
    height: backRect.height,
    fill: "white",
  });
  topLegendGroup
    .append("text")
    .text("Episode Timeline (Steps)")
    .attrs({
      x: (width - textEnd) / 2 + textEnd,
      // "y": height-bottomPadding/2,
      y: yPosGameTimelineLegend,
      "dominant-baseline": "central",
      "text-anchor": "middle",
    });

    drawLegendOfEncodingsForBoth(topLegendGroup, true, false);
    drawRightColumnBoth(svg, topLegendGroup);
    drawDeadlockVis(svg, true, false);
    drawDeadlockVis(svg, false, true);

    var histogramDataA = computeHistogramData(
      agentTimelineDataA,
      window.selectedMetric,
      10, window.selectedEpisodeLengthA);
    var histogramDataB = computeHistogramData(
        agentTimelineDataB,
        window.selectedMetric,
        10, window.selectedEpisodeLengthB);
  
    drawEventHistogramForBoth(window.selectedMetric, "trains", 10, histogramDataA, histogramDataB, 1);
  
    var statusBar = topLegendGroup.append("g").attr("id", "status");
    var widthOfstatusBarRectangle = 60,
      heightOfStatusBarRect = 44;
    // var yBeginLocationOfStatusBar =  yscale(entitiesArray[0]) - heightOfRow/2 - tickLength - tickFontSize - heightOfStatusBarRect;
    var yBeginLocationOfStatusBar = 2;
  
    // var drag = d3
    //   .drag()
    //   // .subject(function (d) { return d; })
    //   .on("start", dragstarted)
    //   .on("drag", dragged)
    //   .on("end", dragended);


    preparePlayback(window.dataA);

    var height = window.svgWidthHeight;
    var width = d3.select("#transitionGraphDiv").node().getBoundingClientRect().width;
    var transitionGraphSvg = d3.select("#transitionGraphDiv")
        .append("svg")
        .attr("id", "transitionGraphSvg")
        // .attr("class", "solidBorder")
        .attr("width", width)
        .attr("height", window.svgWidthHeight);
    appendSampleGraphText();

    drawRailRegions(window.dataA);
     drawDifferenceHeatmap();


}

function pushUnique (array, item) 
{
    if(array.indexOf(item)<0)
    array.push(item);
  };

function groupTrainsBasedOnOriginDestination(dataA, dataB)
{
    var agentsA = dataA["environmentData"]["agents"];
    var agentsB = dataB["environmentData"]["agents"];
    var groupDict = {};

    for(var i=0; i<agentsA.length; i++)
    {
        var originString = agentsA[i]["initial_position"][0] + ","+agentsA[i]["initial_position"][1];
        var destinationString = agentsA[i]["target"][0] + ","+agentsA[i]["target"][1];
        if(!(originString in groupDict))
        {
            groupDict[originString] = {};
        }
        if(!(destinationString in groupDict[originString]))
        {
            groupDict[originString][destinationString] = {"A": {}, "B": {}};
        }

        groupDict[originString][destinationString]["A"][agentsA[i]["agent_index"]] = agentsA[i];
    }

    for(var i=0; i<agentsB.length; i++)
    {
        var originString = agentsB[i]["initial_position"][0] + ","+agentsB[i]["initial_position"][1];
        var destinationString = agentsB[i]["target"][0] + ","+agentsB[i]["target"][1];
        if(!(originString in groupDict))
        {
            groupDict[originString] = {};
        }
        if(!(destinationString in groupDict[originString]))
        {
            groupDict[originString][destinationString] = {"A": [], "B": []};
        }
        groupDict[originString][destinationString]["B"][agentsB[i]["agent_index"]] = agentsB[i];
    
    }
    console.log(groupDict);
    return groupDict;
}

function drawRightColumnBoth(svg, topLegendGroup) {
    var columnRightPadding = 8;
    var paddingRightEnd = 0;
    var widthOfDestinationColumn = 40;
    var startX = _param.svgWidth - _param.rightPadding + widthOfDestinationColumn;
    var width =
      _param.rightPadding -
      columnRightPadding -
      paddingRightEnd -
      widthOfDestinationColumn;
    var distancesArrayA = [];
    var distancesArrayB = [];
    var rightColumnGroup = svg.append("g");
    var topBottomPadding = 8;
    var paddingBetweenBars = 2;

    //Draw End Status
    var endStatus = svg.append("g");
    
    // var statusStartX = _param.textEnd - _param.marginTextBeforeMatrix + 5;
    // var statusEndX = _param.textEnd - 5;
    var statusStartX = _param.svgWidth - _param.rightPadding - 15;
    var statusEndX = _param.svgWidth - _param.rightPadding;
    var statusStartY = globalYScale(_param.entitiesArray[0]) - _param.heightOfRow / 2,
    statusEndY = globalYScale(_param.entitiesArray[_param.entitiesArray.length - 1]) +
    _param.heightOfRow / 2;

    endStatus.append("line").attrs({
        x1: statusStartX,
        y1: statusStartY,
        x2: statusStartX,
        y2: statusEndY,
        stroke: "grey",
      });
    //   endStatus.append("line").attrs({
    //     x1: statusEndX,
    //     y1: statusStartY,
    //     x2: statusEndX,
    //     y2: statusEndY,
    //     stroke: "grey",
    //   });

    //   endStatus.append("rect").attrs({
    //     x: statusStartX,
    //     y: statusStartY,
    //     width: statusEndX - statusStartX,
    //     height: statusEndY - statusStartY,
    //     fill: "lightgrey",
    //   "fill-opacity": 0.2,
    //   "pointer-events":"none"
    //   });

      topLegendGroup.append("text")
      .attrs({
        x: statusStartX + 15 / 2,
        y: statusStartY - 10,
        "text-anchor": "end",
        "dominant-baseline": "central",
        transform:
          "translate(" +
          (statusStartX + 15 / 2) +
          ", " +
          (statusStartY - 10) +
          ") rotate(45) " +
          "translate(" +
          -(statusStartX + 15 / 2) +
          ", " +
          -(statusStartY - 10) +
          ")",
      })
      .text("Status");



    for(var t=0; t<2; t++)
    {
        var tempdata;
        if(t==0)
            tempdata = window.dataA;
        else if(t==1)
            tempdata = window.dataB;

        for (var i = 0; i < tempdata["environmentData"]["agents"].length; i++) {
            var agent = tempdata["environmentData"]["agents"][i];
            endStatus
                .append("text")
                .text(function(){
                    switch(agent["status"])
                    {
                        case 0: return _param.yettostartIcon;
                            break;
                        case 1: return _param.ontrackIcon;
                            break;
                        case 3: return _param.reachedIcon;
                            break;
                    }
                })
                .attrs({
                x: statusStartX + (statusEndX - statusStartX)/2,
                class: "glyphicon",
                y: function(){
                    if(t==0)
                        return globalYScale(agent["agent_index"]) - _param.heightOfRow/_param.rowFactor;
                    else
                        return globalYScale(agent["agent_index"]) + _param.heightOfRow/_param.rowFactor;
                },
                "dominant-baseline": "central",
                "text-anchor": "middle",
                "font-size": _param.iconSize,
                });
        }
    }
  
    // Draw Destination Stations
    var destinationG = svg.append("g");
    var destinationX =
      _param.svgWidth - _param.rightPadding + widthOfDestinationColumn / 2;
    for (var i = 0; i < window.dataA["environmentData"]["agents"].length; i++) {
      var agent_index =
        window.dataA["environmentData"]["agents"][i]["agent_index"];
      var target = window.dataA["environmentData"]["agents"][i]["target"];
      var targetString = positionToString(target);
      var stationId = window.dataA["stationsDictionary"][targetString]["id"];
      var stationIdB = window.dataB["stationsDictionary"][targetString]["id"];
      if(stationId != stationIdB)
      { 
          console.log("Same train index, different destinations!");
      }
      // destinationG.attr("id", "StationGroup"+stationId).attr("class", "StationGroupClass");
      destinationG
        .append("text")
        .attrs({
          x: destinationX,
          y: globalYScale(agent_index),
          "dominant-baseline": "central",
          "text-anchor": "middle",
          "stationId": stationId,
          "cursor":"pointer",
          "class":"stationLabel stationLabel"+stationId,
          "pointer-events":"bounding-box"
        })
        .text(sameLengthStationId(stationId, window.dataA))
        .on("mouseover", function(d){
            var stationId = +d3.select(this).attr("stationId");
          var trainsArray = window.dataA["stationsIdDictionary"][stationId]["trains"];
          highlightStations([stationId]);
          highlightTrains(trainsArray);
      }).on("mouseout", function(){
        deHighlightStations();
        deHighlightTrains();
      });
    }
    findStationLabelPositions(window.dataA);
  
    var stationNumStartX = _param.svgWidth - _param.rightPadding,
      stationNumEndX = stationNumStartX + widthOfDestinationColumn;
    var stationNumStartY =
        globalYScale(_param.entitiesArray[0]) - _param.heightOfRow / 2,
      stationNumEndY =
        globalYScale(_param.entitiesArray[_param.entitiesArray.length - 1]) +
        _param.heightOfRow / 2;
    destinationG.append("line").attrs({
      x1: stationNumStartX,
      y1: stationNumStartY,
      x2: stationNumStartX,
      y2: stationNumEndY,
      stroke: "grey",
    });
    destinationG.append("line").attrs({
      x1: stationNumEndX,
      y1: stationNumStartY,
      x2: stationNumEndX,
      y2: stationNumEndY,
      stroke: "grey",
    });
    
    topLegendGroup
      .append("rect")
      .attrs({
        x: 0,
        y: 0,
        width: 100,
        height: 40,
        fill: "lightgrey",
        "fill-opacity": 0.2,
        transform:
          "rotate(45, " +
          stationNumStartX +
          "," +
          stationNumStartY +
          ") skewX(-45)" +
          "translate(" +
          (stationNumStartX + widthOfDestinationColumn - 40) +
          ", " +
          (stationNumStartY - 32) +
          ")",
      })
      .text("Destination");

    //   topLegendGroup.append("line").attrs({
    //       id: "testLine",
    //     x1: 0,
    //     y1: 0,
    //     x2: 100,
    //     y2: 0,
    //     stroke: "grey",
    //     transform:
    //       "rotate(45, " +
    //       stationNumStartX +
    //       "," +
    //       stationNumStartY +
    //       ") skewX(-45)" +
    //       "translate(" +
    //       (stationNumStartX + widthOfDestinationColumn - 40) +
    //       ", " +
    //       (stationNumStartY - 32) +
    //       ")",
    //   });
  
    //   destinationG.append("rect").attrs({
    //   x: stationNumStartX,
    //   y: stationNumStartY,
    //   width: widthOfDestinationColumn,
    //   height: stationNumEndY - stationNumStartY,
    //   fill: "lightgrey",
    //   "fill-opacity": 0.2,
    //   "pointer-events":"none"
    // });
    topLegendGroup
      .append("text")
      .attrs({
        x: stationNumStartX + widthOfDestinationColumn / 2,
        y: stationNumStartY - 10,
        "text-anchor": "end",
        "dominant-baseline": "central",
        transform:
          "translate(" +
          (stationNumStartX + widthOfDestinationColumn / 2) +
          ", " +
          (stationNumStartY - 10) +
          ") rotate(45) " +
          "translate(" +
          -(stationNumStartX + widthOfDestinationColumn / 2) +
          ", " +
          -(stationNumStartY - 10) +
          ")",
      })
      .text("Destination");
  
    for (var agent_index in window.dataA["agentPathsData"]) {
      distancesArrayA.push(
        window.dataA["agentPathsData"][agent_index]["shortest_path_length"]
      );
      distancesArrayA.push(
        window.dataA["agentPathsData"][agent_index]["actual_path_length"]
      );
    }
    for (var agent_index in window.dataB["agentPathsData"]) {
        distancesArrayB.push(
          window.dataB["agentPathsData"][agent_index]["shortest_path_length"]
        );
        distancesArrayB.push(
          window.dataB["agentPathsData"][agent_index]["actual_path_length"]
        );
      }

    var rightColumnXScale = d3
      .scaleLinear()
      .domain([0, d3.max([d3.max(distancesArrayA), d3.max(distancesArrayB)])])
      .range([0, width]);

    for (var agent_index in window.dataA["agentPathsData"]) {
      var x = startX,
        y = globalYScale(agent_index) - _param.heightOfRow / 2 ;
        if(y <0) y=0;
      var heightOfBar =
        _param.heightOfRow / 3 - paddingBetweenBars / 2 - topBottomPadding / 2;
      var actual_path_lengthA =
        window.dataA["agentPathsData"][agent_index]["actual_path_length"];
        var actual_path_lengthB =
        window.dataB["agentPathsData"][agent_index]["actual_path_length"];
      var shortest_path_length =
        window.dataA["agentPathsData"][agent_index]["shortest_path_length"];
      rightColumnGroup
        .append("rect")
        .attrs({
          x: x,
          y: y + topBottomPadding / 3,
          width: rightColumnXScale(actual_path_lengthA),
          height: heightOfBar,
          stroke: _param.colorA,
          fill: function () {
            var tt = +agent_index;
            if (_param.groupedTrainsA["ontrack"]["agent_indices"].indexOf(tt) >= 0)
              return "none";
            else return _param.colorA;
          },
        })
        .append("title")
        .text("Actual Path Length for session A: " + actual_path_lengthA + " cells");

        rightColumnGroup
        .append("rect")
        .attrs({
          x: x,
          y: y + heightOfBar + topBottomPadding / 2 + paddingBetweenBars,
          width: rightColumnXScale(actual_path_lengthB),
          height: heightOfBar,
          stroke: _param.colorB,
          fill: function () {
            var tt = +agent_index;
            if (_param.groupedTrainsB["ontrack"]["agent_indices"].indexOf(tt) >= 0)
              return "none";
            else return _param.colorB;
          },
        })
        .append("title")
        .text("Actual Path Length for session B: " + actual_path_lengthB + " cells");

      rightColumnGroup
        .append("rect")
        .attrs({
          x: x,
          y: y +  topBottomPadding / 2 + 2*(heightOfBar + paddingBetweenBars),
          width: rightColumnXScale(shortest_path_length),
          height: heightOfBar,
          fill: _param.shortestPathLengthBarColor,
          // "fill": "grey"
        })
        .append("title")
        .text("Shortest Path Length: " + shortest_path_length + " cells");
    }
    var distancesArray = distancesArrayA;
    var maxDistance = d3.max([d3.max(distancesArrayA), d3.max(distancesArrayB)]);
    var limit = maxDistance;
    var tempInterval = parseInt(maxDistance / 3);
    var remainder = tempInterval % 5;
    var tickInterval;
    if (remainder <= 2) tickInterval = tempInterval - remainder;
    else tickInterval = tempInterval + 5 - remainder;
  
    if (tickInterval == 0) tickInterval = 5;
    var tickY = globalYScale(_param.entitiesArray[0]) - _param.heightOfRow / 2;
    for (var z = 0; z < limit - tickInterval / 2; z = z + tickInterval) {
      var tickX = rightColumnXScale(z) + startX;
  
      topLegendGroup.append("line").attrs({
        x1: tickX,
        y1: tickY,
        x2: tickX,
        y2: tickY - _param.tickLength,
        "stroke-width": "1px",
        stroke: "#000000",
      });
  
      topLegendGroup
        .append("text")
        .attrs({
          x: tickX,
          y: tickY - _param.tickLength - 2,
          "font-size": _param.tickFontSize,
          "text-anchor": "middle",
          "dominant-baseline": "end",
        })
        .text(z);
    }
    // if(z<limit)
    {
      x = rightColumnXScale(limit) + startX;
      topLegendGroup.append("line").attrs({
        x1: x,
        y1: tickY,
        x2: x,
        y2: tickY - _param.tickLength,
        "stroke-width": "1px",
        stroke: "#000000",
      });
  
      topLegendGroup
        .append("text")
        .attrs({
          x: x,
          y: tickY - _param.tickLength - 2,
          "font-size": _param.tickFontSize,
          "text-anchor": "end",
          "dominant-baseline": "end",
        })
        .text(limit);
    }
  
    topLegendGroup.append("line").attrs({
      x1: startX,
      y1: tickY,
      x2: startX + rightColumnXScale(maxDistance),
      y2: tickY,
      "stroke-width": "1px",
      stroke: "#000000",
      class: "ticksupport",
    });
  
    var tempYPosOfLegend = _param.yPosGameTimelineLegend - 3 * _param.tickFontSize - 5;
    var tempYPosOfLegend = _param.yPosOfTopLegend;
    var ytranslateAmount = 12-tempYPosOfLegend;
  //   d3.select("#mainVisualization").attr("transform", "translate(0,"+ytranslateAmount+")");
    d3.select("#mainVisualizationGroup").attr("transform", "translate(0,"+ytranslateAmount+")");
    d3.select("#topLegend").attr("transform", "translate(0,"+ytranslateAmount+")");
  
    topLegendGroup
      .append("text")
      .text("Path Lengths:")
      .attrs({
        x: startX,
        // "y": height-bottomPadding/2,
        y: _param.yPosGameTimelineLegend - 3 * _param.tickFontSize ,
        "dominant-baseline": "central",
        "text-anchor": "start",
        "font-size": _param.tickFontSize,
      });
  
    topLegendGroup
      .append("text")
      .text("Actual")
      .attrs({
        x: startX + 5,
        // "y": height-bottomPadding/2,
        y: _param.yPosGameTimelineLegend - 2 * _param.tickFontSize,
        "dominant-baseline": "central",
        "text-anchor": "start",
        "font-size": _param.tickFontSize,
      });
    topLegendGroup
      .append("text")
      .text(_param.reachedIcon)
      .attrs({
        x: startX + 60,
        class: "glyphicon",
        y: _param.yPosGameTimelineLegend - 2 * _param.tickFontSize,
        "dominant-baseline": "central",
        "text-anchor": "start",
        "font-size": _param.iconSize,
      });
    //   topLegendGroup
    //   .append("text")
    //   .text("(A)")
    //   .attrs({
    //     x: startX + 70,
    //     class: "glyphicon",
    //     y: _param.yPosGameTimelineLegend - 2 * _param.tickFontSize,
    //     "dominant-baseline": "central",
    //     "text-anchor": "start",
    //     "font-size": _param.tickFontSize,
    //   });
    var tempBarHeight = _param.tickFontSize * 0.7;
    var tempBarxPos = startX + 95;
    topLegendGroup.append("rect").attrs({
      x: tempBarxPos,
      y:
        _param.yPosGameTimelineLegend -
        2 * _param.tickFontSize -
        tempBarHeight / 2,
      width: 60,
      height: tempBarHeight,
      fill: _param.colorA,
    });
  
    topLegendGroup
      .append("text")
      .text(_param.ontrackIcon)
      .attrs({
        x: startX + 60,
        class: "glyphicon",
        y: _param.yPosGameTimelineLegend - _param.tickFontSize,
        "dominant-baseline": "central",
        "text-anchor": "start",
        "font-size": _param.iconSize,
      });
    //   topLegendGroup
    //   .append("text")
    //   .text("(B)")
    //   .attrs({
    //     x: startX + 70,
    //     class: "glyphicon",
    //     y: _param.yPosGameTimelineLegend - _param.tickFontSize,
    //     "dominant-baseline": "central",
    //     "text-anchor": "start",
    //     "font-size": _param.tickFontSize,
    //   });
    var tempBarHeight = _param.tickFontSize * 0.7;
    // var tempBarxPos = startX + 90;
    topLegendGroup.append("rect").attrs({
      x: tempBarxPos,
      y: _param.yPosGameTimelineLegend - _param.tickFontSize - tempBarHeight / 2,
      width: 30,
      height: tempBarHeight,
      stroke: _param.colorB,
      fill: "none",
    });
  
    topLegendGroup
      .append("text")
      .text("Shortest")
      .attrs({
        x: startX + 5,
        // "y": height-bottomPadding/2,
        y: _param.yPosGameTimelineLegend + 2,
        "dominant-baseline": "central",
        "text-anchor": "start",
        "font-size": _param.tickFontSize,
      });
    topLegendGroup.append("rect").attrs({
      x: tempBarxPos,
      y: _param.yPosGameTimelineLegend - tempBarHeight / 2,
      width: 40,
      height: tempBarHeight,
      fill: _param.shortestPathLengthBarColor,
    });
  }

  function drawEventHistogramForBoth(eventType, entity, binSize, dataA, dataB, counter, root) {
    var y_Pos =
      window.endyPosOfMatrix + counter * (window.maxHeightOfHistogramBars + 5);
    var maximumNumberOfEventsInBin = d3.max([d3.max(dataA), d3.max(dataB)]);
    window.histogramYScaleA = d3
      .scaleLinear()
      .domain([0, maximumNumberOfEventsInBin])
      .range([0, window.maxHeightOfHistogramBars/2]);
    //   window.histogramYScaleB = d3
    //   .scaleLinear()
    //   .domain([0, maximumNumberOfEventsInBin])
    //   .range([0, -window.maxHeightOfHistogramBars/2]);
    if (root == undefined) {
      root = d3
        .select("#mainVisualization")
        .append("g")
        .attr("id", "histogram");
    } else 
    {
      root.selectAll("*").remove();
      root.remove();
      root = d3
        .select("#mainVisualization")
        .append("g")
        .attr("id", "histogram");
    }
    var maxCharacters = 22;
    var fullName = "All Trains";
    var shortName = "";
  
    if (fullName.length > maxCharacters) {
      shortName = fullName.substring(0, maxCharacters - 3) + "...";
    } else {
      shortName = fullName;
    }
  
    root.append("rect").attrs({
        x: 0,
        y: -maxHeightOfHistogramBars - 5,
        width: _param.mainVisualizationSvgWidth - 20,
        height: window.maxHeightOfHistogramBars + 25,
        fill:"white"
    });

    root
      .append("text")
      .text(shortName + ":")
      .attrs({
        x: 15,
        y: -maxHeightOfHistogramBars,
        // "font-size":"12px",
        class: "info",
        "font-weight": "bold",
        "text-anchor": "start",
        "dominant-baseline": "hanging",
      })
      .append("title")
      .text(fullName);
  
    var gameMetricGroup = root.append("g").attrs({
      "data-toggle": "modal",
      "data-target": "#myModal",
    });
    gameMetricGroup
      .append("text")
      .text(" " + window.metric_labelDictionary[eventType])
      .attrs({
        x: _param.textEnd - 30,
        y: -maxHeightOfHistogramBars / 2,
  
        "text-anchor": "end",
        "dominant-baseline": "central",
        class: "info selectedMetric",
        "text-decoration": "underline",
        cursor: "pointer",
      });
    gameMetricGroup
      .append("text")
      .text("\ue019")
      .attrs({
        x: _param.textEnd - 25,
        y: -maxHeightOfHistogramBars / 2,
        "text-anchor": "start",
        "dominant-baseline": "central",
        class: "glyphicon",
        fill: "black",
        cursor: "pointer",
      });
  
    root
      .append("text")
      .text("(bar width = 10 steps)")
      .attrs({
        x: _param.textEnd - 15,
        y: 0,
        // "font-size":"12px",
        class: "info",
        "text-anchor": "end",
        "dominant-baseline": "central",
      });
  
    // var histogramXScale = d3.scaleLinear()
    //                     .domain([ 0, window._dataForVisualization.timespan])
    //                     .range([tableLocations[i+1]["start"], tableLocations[i+1]["end"]] );
    var padding = 2;
    var widthOfOneBar = window.globalXScale(binSize) - window.globalXScale(0)-padding;
    // var numBins = Math.ceil(data.length / binSize);
  
    for(var t=0; t<2; t++)
    {
        if(t==0)
            data = dataA;
        else
            data = dataB;
            
    for (var i = 0; i < data.length; i++) {
      var bar = root.append("rect").attrs({
        x: function(){
            // if(t==0)
            return window.globalXScale(binSize * i) + padding/2;
            // else
            // return window.globalXScale(binSize * i)+ padding/2 + widthOfOneBar/2;
        },
        y: function(){
            if(t==0)
            return -window.maxHeightOfHistogramBars/2 - window.histogramYScaleA(data[i]);
            else
            return -window.maxHeightOfHistogramBars/2;

        },
        width: widthOfOneBar,
        height: function(){
            // if(t==0)
            return window.histogramYScaleA(data[i]);
            // else
            // return window.histogramYScaleB(data[i]);

        },
        fill: function()
        {
            if(t==0)return _param.colorA;
            else return _param.colorB;
        },
        "fill-opacity": 0.8,
        stroke: "white",
        "stroke-width": "0px",
      });
      root.append("rect").attrs({
          x:function(){
            // if(t==0)
            return window.globalXScale(binSize * i) + padding/2;
            // else
            // return window.globalXScale(binSize * i)+ padding/2 + t*widthOfOneBar/2;
        },
          y: function(){
            if(t==0)
            return -window.maxHeightOfHistogramBars;
            else
            return -window.maxHeightOfHistogramBars/2;

        },
          width: widthOfOneBar,
          height: window.maxHeightOfHistogramBars/2,
          fill: "none",
          "fill-opacity":0.1,
          "class":"histogramHoverBars",
          "pointer-events":"all",
          "cursor":"pointer",
          // "fill-opacity": 0.8,
          // stroke: "white",
          // "stroke-width": "1px",
        }).on("mouseover", function(){
            d3.select(this).attr("fill","grey");
        }).on("mouseout", function(){
            d3.select(this).attr("fill", "none");
        }).append("svg:title").text(function () {
            var schedule = "";
            if(t==0) schedule = "A";
            else schedule = "B";
        return `${window.metric_description[eventType]} in ${schedule} from ${binSize*i} to ${binSize*i + 10} timesteps:  ${data[i]}`;
      });
    }
    }
  //   root.append("line").attrs({
  //     x1: window.globalXScale(0),
  //     y1: 0,
  //     x2: window.globalXScale(binSize * data.length),
  //     y2: 0,
  //     stroke: "grey",
  //     "stroke-width": "1px",
  //     // "fill":"gray"
  //   });
    root.attr("style", "transform: translate(0px," + (_param.svgHeight-10)  + "px);");
  }

  function drawLegendOfEncodingsForBoth(svg, boolA, boolB) {
    var eventLegendGroup = svg.append("g");
    var rectX,
      rectY,
      rectWidth = 0,
      rectHeight = 0;
    // var distanceBetweenCircles = (width - textEnd)/(eventNameArray.length + 1);
    var textEnd = _param.textEnd;
    var radiusOfCircle = _param.radiusOfCircle;
    var distanceBetweenCircles = 130;
    var eventNameArray = _param.eventsComparison;
    var eventsDictionary = _param.eventsDictionaryComparison;
   
    var tableTop = 30;
    var topPadding = _param.topPadding;
    var glyphOPacity = _param.glyphOPacity;
    var colors = _param.colors;
    var nextStartingPosition = textEnd + 120;
    var tempComparisonPosition = nextStartingPosition;
    var previousXPosition = 0;
    var size = _param.radiusOfCircleInLegend;
    for (var i = 0; i < eventNameArray.length; i++) 
    {
      var eventKey = eventsDictionary[eventNameArray[i]];
      var eventGroup = eventLegendGroup
        .append("g")
        .attr("type", eventNameArray[i])
        .attr("cursor", "pointer")
        .attr("index", i)
        .attr("eventKey", eventKey);
      var checkboxwidth = 10;
  
      var checkboxXPos =
        nextStartingPosition - 2 * radiusOfCircle - 2 * checkboxwidth;
      var checkboxYPos;
      if(eventKey == "startTrain" || eventKey == "endTrain"|| eventKey == "junction")
        checkboxYPos = topPadding - tableTop - checkboxwidth / 2;
    else
      checkboxYPos = topPadding - tableTop - checkboxwidth ;
      if(eventKey == "deadlockB" || eventKey=="malfunctionB" || eventKey == "movementB")
      {
          checkboxXPos  = previousXPosition - 2 * radiusOfCircle - 2 * checkboxwidth;
          checkboxYPos = topPadding - tableTop + checkboxwidth / 2; 
      }
      // else
      {
          eventGroup.append("rect").attrs({
          x: checkboxXPos,
          y: checkboxYPos,
          width: checkboxwidth,
          height: checkboxwidth,
          fill: "white",
          stroke: "black",
          "stroke-width": "1px",
          class: "checkBoxes",
          id: "checkbox" + i,
          index: i,
          checked: function () {
              var eventKey = eventsDictionary[eventNameArray[i]];
              if (window.highlightEventsComparison[eventKey] == true) {
              return "true";
              } else return "false";
          },
          });
  
          eventGroup.append("path").attrs({
          d:
              "M " +
              checkboxXPos +
              " " +
              (checkboxYPos) +
              " l " +
              checkboxwidth / 2 +
              " " +
              checkboxwidth / 2 +
              " l " +
              checkboxwidth +
              " -" +
              checkboxwidth,
          stroke: "black",
          "stroke-width": "2px",
          opacity: 1,
          visibility: function () {
              var eventKey = eventsDictionary[eventNameArray[i]];
              if (window.highlightEventsComparison[eventKey] == true) {
              return "visible";
              } else return "hidden";
          },
          fill: "none",
          id: "checkMark" + i,
          });
      }
  
      if (eventsDictionary[eventNameArray[i]] == "movementA") {
        eventGroup.append("rect").attrs({
          // "x": textEnd + i*distanceBetweenCircles - radiusOfCircle,
          x: nextStartingPosition - radiusOfCircle,
          y: checkboxYPos + radiusOfCircle/2,
          width: 3 * radiusOfCircle,
          height: radiusOfCircle,
          "fill-opacity": glyphOPacity,
          fill: _param.colorA

        });
      } 
      else if (eventsDictionary[eventNameArray[i]] == "movementB") {
        eventGroup.append("rect").attrs({
          // "x": textEnd + i*distanceBetweenCircles - radiusOfCircle,
          x: previousXPosition - radiusOfCircle,
          y: checkboxYPos + radiusOfCircle/2,
          width: 3 * radiusOfCircle,
          height: radiusOfCircle,
          "fill-opacity": glyphOPacity,
          fill: _param.colorB

        });
      }
      else if (eventsDictionary[eventNameArray[i]] == "startTrain") {
        eventGroup.append("circle").attrs({
          // cx: textEnd + i*distanceBetweenCircles,
          cx: nextStartingPosition,
          cy: topPadding - tableTop,
          r: size,
          fill: "none",
          stroke: "black",
          "stroke-width": "2px",
          // "class": "startTimestep"
        });
      } else if (eventsDictionary[eventNameArray[i]] == "endTrain") {
        eventGroup.append("circle").attrs({
          // cx: textEnd + i*distanceBetweenCircles,
          cx: nextStartingPosition,
          cy: topPadding - tableTop,
          r: size,
          fill: colors[4],
          "fill-opacity": glyphOPacity,
        });
      } else if (eventsDictionary[eventNameArray[i]] == "junction") {
        var t_width = 1.3 * size,
          t_height = t_width;
        x_Pos = nextStartingPosition - t_width / 2;
        y_Pos = topPadding - tableTop - t_width / 2;
        eventGroup.append("rect").attrs({
          x: x_Pos,
          y: y_Pos,
          rx: 0,
          ry: 0,
          width: t_width,
          height: t_height,
          // fill: colors[3],
          fill:"none",
          stroke: "black",
          "stroke-width": "1px",
          "stroke-opacity": glyphOPacity,
          "fill-opacity": glyphOPacity,
          transform:
            "rotate(-45," +
            (x_Pos + t_width / 2) +
            "," +
            (y_Pos + t_height / 2) +
            ")",
        });
      } else if (eventsDictionary[eventNameArray[i]] == "malfunctionA") {
        var t_width = size,
          t_height = t_width;
        x_Pos = nextStartingPosition;
        y_Pos = checkboxYPos + t_width / 2;
        eventGroup
          .append("text")
          .attrs({
            x: x_Pos + t_width / 2,
            y: y_Pos,
            "font-size": 1.5 * t_height + "px",
            "dominant-baseline": "central",
            "text-anchor": "middle",
            "stroke":  _param.colorA
          })
          .text("X-----");
          
      } 
      else if (eventsDictionary[eventNameArray[i]] == "malfunctionB") {
        var t_width = size,
          t_height = t_width;
        x_Pos = previousXPosition;
        y_Pos = checkboxYPos + t_width / 2;
        eventGroup
          .append("text")
          .attrs({
            x: x_Pos + t_width / 2,
            y: y_Pos,
            "font-size": 1.5 * t_height + "px",
            "dominant-baseline": "central",
            "text-anchor": "middle",
            "stroke":  _param.colorB
          })
          .text("X-----");
        }
      else if (eventsDictionary[eventNameArray[i]] == "deadlockA") {
        var t_width = 1.3 * size,
          t_height = t_width;
        x_Pos = nextStartingPosition - t_width / 2;
        y_Pos = checkboxYPos;
        eventGroup.append("rect").attrs({
          x: x_Pos,
          y: y_Pos,
          width: t_width,
          height: t_height,
          fill: function(){
              if(boolA)
                  return _param.colorA;
              else if(boolB)
                  return _param.colorB;
          },
          opacity: _param.glyphOPacity,
          stroke: _param.deadlockShapeBoundaryColor,
          "stroke-width": _param.deadlockShapeStrokeWidth,
          "stroke-opacity": 1,
        });
      } 
      else if (eventsDictionary[eventNameArray[i]] == "deadlockB") {
          var t_width = 1.3 * size,
            t_height = t_width;
          x_Pos = previousXPosition - t_width / 2;
        //   y_Pos = topPadding - tableTop + t_width / 2;
          y_Pos = checkboxYPos;
          eventGroup.append("rect").attrs({
            x: x_Pos,
            y: y_Pos,
            width: t_width,
            height: t_height,
            fill:  _param.colorB,
            opacity: _param.glyphOPacity,
            stroke: _param.deadlockShapeBoundaryColor,
            "stroke-width": _param.deadlockShapeStrokeWidth,
            "stroke-opacity": 1,
          });
        } 
      else {
        eventGroup.append("circle").attrs({
          // cx: textEnd + i*distanceBetweenCircles,
          cx: nextStartingPosition,
          cy: topPadding - tableTop,
          r: size,
          "fill-opacity": function () {
            // if(eventNameArray[i] == "Death")
            // {
            //     return 1;
            // }
            // else
            return glyphOPacity;
          },
          fill: function () {
            return colors[i];
          },
        });
      }
  
      var textElm = eventGroup
        .append("text")
        .attrs({
          // x: textEnd + i*distanceBetweenCircles + 2*radiusOfCircle + 5,
          x: function (d) {
            if (eventsDictionary[eventNameArray[i]] == "malfunctionA")
                return nextStartingPosition + 2 * radiusOfCircle + 25;
              else if (eventsDictionary[eventNameArray[i]] == "malfunctionB")
                return previousXPosition + 2 * radiusOfCircle + 25;
              else if(eventsDictionary[eventNameArray[i]] == "deadlockB")
                return previousXPosition + 2 * radiusOfCircle + 5;
            else if(eventsDictionary[eventNameArray[i]] == "movementB")
                return previousXPosition + 2 * radiusOfCircle + 5;
            else return nextStartingPosition + 2 * radiusOfCircle + 5;
          },
          y: function(){
            if(eventKey == "startTrain" || eventKey == "movement"|| eventKey == "endTrain"|| eventKey == "junction")
                return topPadding - tableTop ;
            else
                return checkboxYPos;
          } ,
          "dominant-baseline": function(){
            if(eventKey == "startTrain" || eventKey == "movement"|| eventKey == "endTrain"|| eventKey == "junction")
                return "central";
            else
                 return "hanging";
          },
        })
        .text(function () {
          return eventNameArray[i];
        });
  
      var textRect = textElm.node().getBBox();
      previousXPosition = nextStartingPosition;
      nextStartingPosition = textRect.x + textRect.width + 50;

  
      if (i == eventNameArray.length - 1) {
        rectHeight = 4 * size;
        
         rectWidth = (i-3) * distanceBetweenCircles;
            
      }
  
      eventGroup.on("mousedown", function () {
        var index = d3.select(this).attr("index");
        var eventKey = d3.select(this).attr("eventKey");
        if (d3.select("#checkbox" + index).attr("checked") == "false") {
          d3.select("#checkMark" + index).attr("visibility", "visible");
          d3.select("#checkbox" + index).attr("checked", "true");
          window.highlightEventsComparison[eventKey] = true;
        } else {
          d3.select("#checkMark" + index).attr("visibility", "hidden");
          d3.select("#checkbox" + index).attr("checked", "false");
          window.highlightEventsComparison[eventKey] = false;
        }
        highlightEventsFuncBoth();
      });
    }
    
    rectWidth += 80;
    rectX = textEnd + 60;
    rectY = topPadding - tableTop - rectHeight / 2;

    _param.yPosOfTopLegend = rectY;
  
    eventLegendGroup.append("rect").attrs({
      // "x": rectX + 120,
      x: rectX,
      y: rectY,
      width: rectWidth,
      height: rectHeight + 3,
      stroke: "black",
      fill: "none",
      "stroke-width": "1px",
    });
  
    highlightEventsFuncBoth();
    eventLegendGroup.attr("transform", `translate(0,${-rectY+2})`);
  }

  function highlightEventsFuncBoth() {
    d3.selectAll(".timeLineVisComponent").attr("opacity", 0.1);
  
    var glyphOPacity = _param.glyphOPacity;
  
    for (var event in window.highlightEventsComparison) {
      if (window.highlightEventsComparison[event]) {
        if (event == "movementA")
          d3.selectAll(".movedA").attr("opacity", glyphOPacity);
          if (event == "movementB")
          d3.selectAll(".movedB").attr("opacity", glyphOPacity);
  
        if (event == "startTrain") {
          d3.selectAll(".startTimestep").attr("opacity", glyphOPacity);
        }
  
        if (event == "endTrain") {
          d3.selectAll(".endTimestep").attr("opacity", glyphOPacity);
        }
        if (event == "junction") {
          d3.selectAll(".junction").attr("opacity", glyphOPacity);
        }
        if (event == "malfunctionA") {
          d3.selectAll(".malfunctionA").attr("opacity", glyphOPacity);
        }
        if (event == "malfunctionB") {
            d3.selectAll(".malfunctionB").attr("opacity", glyphOPacity);
          }
        if (event == "deadlockA") {
          d3.selectAll(".deadlockA").attr("opacity", glyphOPacity);
        }
        if (event == "deadlockB") {
            d3.selectAll(".deadlockB").attr("opacity", glyphOPacity);
          }
        d3.selectAll("." + event).attr("fill-opacity", 0.6);
      }
    }
  }

  function drawDifferenceHeatmap(agentIds) {
    //BUG: trains target position is not logged, and hence appear as 0 in the heatmap
    var agentIndicesArray = [];
    var heatmapGridA = [];

    d3.select("#occupancyLabel").text("Occupancy Difference Distribution");
  
    var gridA = window.dataA["environmentData"]["grid"];
    var agentTrajectoryDataA = window.dataA["agentTrajectoryData"];
    if (agentIds == undefined) {
      for (var agent_index in agentTrajectoryDataA) {
        agentIndicesArray.push(agent_index);
      }
    }
  
    // Initialize heatmap gridA
    heatmapGridA = new Array(gridA.length);
    for (var i = 0; i < gridA.length; i++) {
      heatmapGridA[i] = new Array(gridA[i].length);
      for (var j = 0; j < gridA[i].length; j++) {
        heatmapGridA[i][j] = 0;
      }
    }

    var gridB = window.dataB["environmentData"]["grid"];
    var agentTrajectoryDataB = window.dataB["agentTrajectoryData"];
  
    // Initialize heatmap gridB
    heatmapGridB = new Array(gridB.length);
    for (var i = 0; i < gridB.length; i++) {
      heatmapGridB[i] = new Array(gridB[i].length);
      for (var j = 0; j < gridB[i].length; j++) {
        heatmapGridB[i][j] = 0;
      }
    }

    // initialize difference grid
    var differenceGrid = new Array(gridB.length);
    var differenceGridNormalized = new Array(gridB.length);
    for (var i = 0; i < gridB.length; i++) {
        differenceGrid[i] = new Array(gridB[i].length);
        differenceGridNormalized[i] = new Array(gridB[i].length);
      for (var j = 0; j < gridB[i].length; j++) {
        differenceGrid[i][j] = 0;
        differenceGridNormalized[i][j] = 0;
      }
    }

    var max = -1,
      min = 0;

    // /Compute heatmap for A
    for (var agent_index in agentTrajectoryDataA) 
    {
      for (var step in agentTrajectoryDataA[agent_index]) 
      {
        //   A
        var gridNode = agentTrajectoryDataA[agent_index][step]["gridNode"];
        heatmapGridA[gridNode[0]][gridNode[1]] += 1;
        if (heatmapGridA[gridNode[0]][gridNode[1]] > max)
          max = heatmapGridA[gridNode[0]][gridNode[1]];
        
      }
        // A: if train reached, increment value in cell of destination
        var reachedTrainArray = _param.groupedTrainsA["reached"]["agent_indices"];
        if (reachedTrainArray.indexOf(agent_index) >= 0) 
        {
            var target = window.dataA["agentIndex_DestinationDictionary"][agent_index];
            heatmapGridA[target[0]][target[1]] += 1;
        }
    }

    // /Compute heatmap for B
    for (var agent_index in agentTrajectoryDataB) 
    {
      for (var step in agentTrajectoryDataB[agent_index]) 
      {
        //   B
        var gridNode = agentTrajectoryDataB[agent_index][step]["gridNode"];
        heatmapGridB[gridNode[0]][gridNode[1]] += 1;
        if (heatmapGridB[gridNode[0]][gridNode[1]] > max)
          max = heatmapGridB[gridNode[0]][gridNode[1]];
        
      }
        // B: if train reached, increment value in cell of destination
        var reachedTrainArray = _param.groupedTrainsB["reached"]["agent_indices"];
        if (reachedTrainArray.indexOf(agent_index) >= 0) 
        {
            var target = window.dataB["agentIndex_DestinationDictionary"][agent_index];
            heatmapGridB[target[0]][target[1]] += 1;
        }
    }

     // compute difference grid
     var maxDifference = -1;
     var maxDifferenceNormalized = -1;
    for (var i = 0; i < differenceGrid.length; i++) {
      for (var j = 0; j < differenceGrid[i].length; j++) {
        differenceGridNormalized[i][j] = heatmapGridB[i][j]/window.selectedEpisodeLengthB - heatmapGridA[i][j]/window.selectedEpisodeLengthA;
        differenceGrid[i][j] = heatmapGridB[i][j] - heatmapGridA[i][j];
        if(Math.abs(differenceGrid[i][j]) > maxDifference)
            maxDifference = Math.abs(differenceGrid[i][j]);
        if(Math.abs(differenceGridNormalized[i][j]) > maxDifferenceNormalized)
            maxDifferenceNormalized = Math.abs(differenceGridNormalized[i][j]);
        if(heatmapGridA[i][j] ==0 && heatmapGridB[i][j] == 0)
        {
            differenceGrid[i][j] = 9999;
            differenceGridNormalized[i][j] = 9999;
        }
      }
    }

    var maxDiffTouse = maxDifference;
    var gridTouse = differenceGrid;

    // var maxDiffTouse = maxDifferenceNormalized;
    // var gridTouse = differenceGridNormalized;
  
    // console.log(heatmapGridA, max, min);
    d3.select("#heatMap").selectAll("*").remove();
  //   var playbackSvg = d3.select("#videoSVG g").append("g").attr("id", "heatMap");
    var playbackSvg = d3.select("#heatMap").append("g");
    // if (window.diffColorScale == undefined) {
      // window.heatmapColorScale = d3.scaleLinear().domain([0,max]).range([0,1]);
    //   window.diffColorScale = d3.scaleLinear().domain([-maxDifference, 0, maxDifference]).range([_param.colorA, "grey", _param.colorB]);
    //   window.diffColorScale = d3.scaleLinear().domain([-maxDifference,  maxDifference]).range([_param.colorA, _param.colorB]);
    window.diffColorScale = d3.scaleSequential(d3.interpolateRgb(_param.colorA, _param.colorB)).domain([-maxDiffTouse,maxDiffTouse]);
    // window.diffColorScale = d3.scaleSequential(d3.interpolateRgb("#292CFF", "#FF6A00")).domain([-maxDiffTouse,maxDiffTouse]);

    // }
    // colorScaleA = d3.scaleLinear().domain([-maxDifference, ]).range([_param.colorA, "#ebf2f7"]);
    // colorScaleB = d3.scaleLinear().domain().range([_param.colorB, "#fff2e5"]);
    // console.log(d3.interpolateRgb("red", "blue")(0.5));

    window.opacityScale = d3.scaleLinear().domain([0,  maxDiffTouse]).range([0.7, 0.7]);
    var tempopacityScale = d3.scaleLinear().domain([0,  maxDiffTouse]).range([0.3, 0.7]);

    var numColumns = heatmapGridA.length;
    var numRows = heatmapGridA[0].length;
    for (var i = 0; i < gridTouse.length; i++) {
      for (var j = 0; j < gridTouse[i].length; j++) {
        playbackSvg
          .append("rect")
          .attrs({
            width: window.svgWidthHeight / numColumns,
            height: window.svgWidthHeight / numRows,
            x: (j * window.svgWidthHeight) / numColumns,
            y: (i * window.svgWidthHeight) / numRows,
            "stroke-width": "1px",
            stroke: "none",
            "stroke-opacity": 1,
            class: "heatmapTiles",
            fill: function(){
                if (gridTouse[i][j] == 9999) return "none";
                // else if (gridTouse[i][j] == 0) return "grey";
                else
                return window.diffColorScale(gridTouse[i][j]);
            },
            isRail: function () {
              if (gridA[i][j] != 0) return true;
              else return false;
            },
            "fill-opacity": function () {
            //   return 0.5
            // return window.opacityScale(Math.abs(gridTouse[i][j]));
            return tempopacityScale(Math.abs(gridTouse[i][j]));
            },
          })
          .on("mouseover", function () {
            if (d3.select(this).attr("isRail") == "true")
              d3.select(this).attr("stroke", "#000000").attr("stroke-opacity", 1);
          })
          .on("mouseout", function () {
            d3.select(this).attr("stroke", "none");
          })
          .append("title")
          .text(function () {
            // if (gridA[i][j] != 0)
            var label = "";
            if(gridTouse[i][j] > 0)
                label = "(B)";
            else if (gridTouse[i][j] <0)
                label = "(A)";
            else label = ""
            //   return "Occupancy difference relative to the episode lengths : " + gridTouse[i][j]+ " "+label;
              return "Occupancy difference (B-A): " + heatmapGridB[i][j] +" - "+  heatmapGridA[i][j] +" = " + differenceGrid[i][j] + " timesteps";

          });
      }
    }


    
    
    colorScale = window.diffColorScale;
    const svg = d3.select("#videoSVG");
    const defs = svg.append("defs");
    var width = window.svgWidthHeight*2/3, height=window.svgWidthHeight;
    barHeight = 10;
    margin = ({top: window.svgWidthHeight - 1.5*barHeight, right: 5, bottom: 13, left: 150})

    const linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");
    axisBottom = g => g
  .attr("class", `x-axis`)
  .attr("transform", `translate(${margin.left},${height - margin.bottom})`)
  .call(d3.axisBottom(axisScale)
    .ticks(width / 50)
    .tickSize(-barHeight))
    axisScale = d3.scaleLinear()
    .domain(colorScale.domain())
    .range([10,  width+10])
    
    
    linearGradient.selectAll("stop")
      .data(colorScale.ticks().map(function(t, i, n){ 
          return {offset: `${100*i/n.length}%`, color: colorScale(t)}; }))
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);
    
    var legendGroup = svg.append('g');
      legendGroup.append("rect")
        // .attr('transform', `translate(${margin.left}, 0)`)
        .attr("width", width )
        .attr("height", barHeight)
        .style("fill", "url(#linear-gradient)")
        // .style("fill-opacity", 0.5);
        .style("fill-opacity", 0.8);
        svg.append("text").attrs({
            x: 0,
            y: margin.top-2,
            "font-size": "13px"
        }).text("Occupancy difference:");
        svg.append("text").attrs({
            x: 0,
            y: margin.top + 11,
            "font-size": "13px"
        }).text("(B-A) timesteps");
    legendGroup.attr("transform", `translate(${margin.left + 10},${height - margin.bottom - barHeight})`);

    
    svg.append('g')
      .call(axisBottom);



    if (window.showHeatmap == false) {
      d3.select("#heatMap").attr("display", "none");
      document.getElementById("heatmapCheckbox").checked = false;
    } else {
      d3.select("#heatMap").attr("display", "visible");
      document.getElementById("heatmapCheckbox").checked = true;
    }
  }

  function makeSideVerticalLineForBoth(y1, y2, groupType1, groupType2, svg, icon1, icon2, boolCompare) {
    var x = 50,
      tickLength = 5,
      distToLine = 13;
    svg.append("line").attrs({
      x1: x,
      y1: y1,
      x2: x,
      y2: y2,
      "stroke-width": "1px",
      stroke: "#000000",
    });
    svg.append("line").attrs({
      x1: x,
      y1: y1,
      x2: x + tickLength,
      y2: y1,
      "stroke-width": "1px",
      stroke: "#000000",
    });
    svg.append("line").attrs({
      x1: x,
      y1: y2,
      x2: x + tickLength,
      y2: y2,
      "stroke-width": "1px",
      stroke: "#000000",
    });
    // svg
    //   .append("text")
    //   .attrs({
    //     x: x - distToLine,
    //     y: y1 + (y2 - y1) / 2,
    //     "dominant-baseline": "central",
    //     "text-anchor": "middle",
    //     transform:
    //       "rotate(-90, " + (x - distToLine) + "," + (y1 + (y2 - y1) / 2) + ")",
    //   })
    //   .text(function () {
    //     if (groupType == "ontrack") 
    //     {
    //         if(boolCompare) 
    //           return "On-track (A & B)"
    //       else
    //           return "On-track";
    //     }
    //     else if (groupType == "reached")
    //     {
    //         if(boolCompare) 
    //           return "Reached (A & B)"
    //       else 
    //           return "Reached";
    //     }
    //     else if (groupType == "yettostart")
    //     {
    //         if(boolCompare) 
    //           return "Did not start (A & B)"
    //       else
    //          return "Did not start";
    //     }
    //   });
    // if (icon1 != undefined) {
      svg
        .append("text")
        .attrs({
          // "class": "currentNumTrainsReachedDestination",
          x: x - distToLine - 20,
          y: y1 + (y2 - y1) / 2,
          class: "glyphicon",
          "text-anchor": "end",
          "dominant-baseline": "central",
          fill: "black",
          "font-size": 1.5 * _param.iconSize,
          cursor: "pointer",
        })
        .text(icon1)
        .append("title")
        .text(function () {
          if (groupType1 == "ontrack") return "On-track";
          else if (groupType1 == "reached") return "Reached";
          else if (groupType1 == "yettostart") return "Did not start";
        });
        svg
        .append("text")
        .attrs({
          // "class": "currentNumTrainsReachedDestination",
          x: x - distToLine+5,
          y: y1 + (y2 - y1) / 2,
          class: "glyphicon",
          "text-anchor": "end",
          "dominant-baseline": "central",
          fill: "black",
          "font-size": 1.5 * _param.iconSize,
          cursor: "pointer",
        })
        .text(icon2)
        .append("title")
        .text(function () {
          if (groupType2 == "ontrack") return "On-track";
          else if (groupType2 == "reached") return "Reached";
          else if (groupType2 == "yettostart") return "Did not start";
        });
    // }
  }

  function computeOccupyingCellsByRegionsForBoth(svgRoot, gameDataA, gameDataB) {
    var rectArray = _param.selectionRectanglesArray;
  
    var numColumns = _param.numColumns;
    var numRows = _param.numRows;
    var widthHeight = window.svgWidthHeight / numColumns;
    var bothGraphs = {};
    bothGraphKey = "";

    for(var t=0; t<2; t++)
    {
        if(t==0)
        {
            gameData = gameDataA;
            bothGraphKey = "A";
        }
        else if (t==1)
        {
            gameData = gameDataB;
            bothGraphKey = "B";
        }
    
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
                var x = +d3.select(rectArray[index]["_groups"][0][0]).attr("x");
                var y = +d3.select(rectArray[index]["_groups"][0][0]).attr("y");
                var selectionWidth = +d3
                .select(rectArray[index]["_groups"][0][0])
                .attr("width");
                var selectionHeight = +d3
                .select(rectArray[index]["_groups"][0][0])
                .attr("height");
    
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
    
                var continuousRail_id_pos_dict = gameDataA["continuousRail_id_pos_dict"];
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
        bothGraphs[bothGraphKey] = _param.graph;

        if(t==0)
            _param.regionDictionaryA = regionDict;
        else if(t==1)
            _param.regionDictionaryB = regionDict;

    }
    _param.bothGraphs = bothGraphs;
    drawRegionsOnTimelineForBoth();
    drawTransitionGraphForBoth(svgRoot);
  }

  function drawRegionsOnTimelineForBoth()
{
    var regionNodes, rowPositionDiff;
    d3.select("#regionsOnTimeline").selectAll("*").remove();
    for(var t=0; t<2; t++)
    {
        var heightOfrectangle = _param.heightOfRow/2 - 4;
        if(t==0)
        {
            regionNodes = _param.bothGraphs["A"]["nodes"];
            rowPositionDiff = _param.heightOfRow/_param.rowFactor + heightOfrectangle/2;
        }
        else if (t==1)
        {
            regionNodes = _param.bothGraphs["B"]["nodes"];
            rowPositionDiff = -(_param.heightOfRow/_param.rowFactor - heightOfrectangle/2);
        }
     
        var agent_regionTimestepsDict = {};
        
        var regionGroup = d3.select("#regionsOnTimeline");
        for( var nodeid in regionNodes)
        {
            var node = regionNodes[nodeid];
            var trains = node["trains"];
            for(var agent_index in trains)
            {
                var timestepsInsideRegion = trains[agent_index]["timesteps"];
                var arrayOfContinuousTimesteps = computeContinuousTimesteps(timestepsInsideRegion);
                regionNodes[nodeid]["trains"][agent_index]["continuousTimestepsArray"] = arrayOfContinuousTimesteps;
                for(var j=0; j<arrayOfContinuousTimesteps.length; j++)
                {
                    var continuous = arrayOfContinuousTimesteps[j];
                    var startT = continuous[0];
                    var endT = continuous[continuous.length -1];
                    var x = globalXScale(startT), width = globalXScale(endT+1) - x;
                    // console.log(x, startT, endT);
                    
                    if(startT != undefined && endT !=undefined)
                    {
                            regionGroup.append("rect").attrs({
                            "x": x,
                            "y": globalYScale(agent_index) - rowPositionDiff,
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
}

function drawTransitionGraphForBoth(svgRoot, playbackData) {
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
    //   .append("svg:marker")
    //   .attr("id", "head")
    //   .attr("viewBox", "0 0 10 10")
    //   .attr("refX", "11")
    //   .attr("refY", "4")
    //   .attr("markerUnits", "strokeWidth")
    //   .attr("markerWidth", "10")
    //   .attr("markerHeight", "4")
    //   .attr("orient", "auto")
    //   .append("svg:path")
    //   .attr("d", "M 0 0 L 10 5 L 0 10 L 0 0")
    //   .attr("transform", "rotate(-5, 0,0)")
    //   .attr("fill", _param.linkColor);

      .append("svg:marker")
      .attr("id", "head")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", "9")
      .attr("refY", "4")
      .attr("markerUnits", "strokeWidth")
      .attr("markerWidth", "5")
      .attr("markerHeight", "5")
      .attr("orient", "auto")
      .attr("overflow", "visible")
      .append("svg:path")
      .attr("d", "M 0 0 L 10 5 L 0 5 z")
    //   .attr("transform", "rotate(-5, 0,0)")
      .attr("fill", _param.linkColor);
    //   .attr("fill", "darkgrey");

  
    var bothGraphs = _param.bothGraphs;
    var graphA = bothGraphs["A"];
    var graphB = bothGraphs["B"];
  
    var maxNodeWeight = -1;
    
    for (var nodeid in graphA.nodes) {
      var metricValue = graphA.nodes[nodeid]["numTrains"];
      if (maxNodeWeight < metricValue) {
        maxNodeWeight = metricValue;
      }
    }
    for (var nodeid in graphB.nodes) {
        var metricValue = graphB.nodes[nodeid]["numTrains"];
        if (maxNodeWeight < metricValue) {
          maxNodeWeight = metricValue;
        }
      }
  
  

      // merge edges of graph A and B
    var mergedEdges = [];
    var maxEdgeValue = -1;


    //   Merging common edges in A and B
    for(var m=0; m<graphA.links.length; m++)
    {
        var found = false;
        for(var n=0; n<graphB.links.length; n++)
        {
            if(graphA.links[m]["source"] == graphB.links[n]["source"] &&
            graphA.links[m]["target"] == graphB.links[n]["target"] )
            {
                found = true;
                var sum = graphA.links[m]["value"] + graphB.links[n]["value"];
                if(maxEdgeValue < sum)
                    maxEdgeValue = sum;
                var pieChart = [];
                pieChart.push({"color": _param.colorA, "percent": (graphA.links[m]["value"]/sum)*100});
                pieChart.push({"color": _param.colorB, "percent": (graphB.links[n]["value"]/sum)*100});
                mergedEdges.push({"sumValue": sum, "source":graphA.links[m]["source"], "target": graphA.links[m]["target"],
             "A": graphA.links[m], "B": graphB.links[n], "pieChart": pieChart});
                break;
            }
        }
        
    }
// Including edges ony in A
for(var m=0; m<graphA.links.length; m++)
    {
        var found = false;
        var graphLink = graphA.links;
        for(var n=0; n<mergedEdges.length; n++)
        {
            if(graphLink[m]["source"] == mergedEdges[n]["source"] &&
            graphLink[m]["target"] == mergedEdges[n]["target"] )
            {
                found = true;
                // break;
            }
        }
        // edge not found in merged edges, hence only in A
        if(found == false)
        {
            var sum = graphLink[m]["value"];
            if(maxEdgeValue < sum)
                maxEdgeValue = sum;
            var pieChart = [];
            pieChart.push({"color": _param.colorA, "percent": (graphLink[m]["value"]/sum)*100});
            pieChart.push({"color": _param.colorB, "percent": (0)*100});
            mergedEdges.push({"sumValue": sum, "source":graphLink[m]["source"], "target": graphLink[m]["target"],
            "A": graphLink[m], "B": {}, "pieChart": pieChart});
        }
        
    }

// Including edges ony in B
for(var m=0; m<graphB.links.length; m++)
    {
        var found = false;
        var graphLink = graphB.links;
        for(var n=0; n<mergedEdges.length; n++)
        {
            if(graphLink[m]["source"] == mergedEdges[n]["source"] &&
            graphLink[m]["target"] == mergedEdges[n]["target"] )
            {
                found = true;
                // break;
            }
        }
        // edge not found in merged edges, hence only in B
        if(found == false)
        {
            var sum = graphLink[m]["value"];
            if(maxEdgeValue < sum)
                maxEdgeValue = sum;
            var pieChart = [];
            pieChart.push({"color": _param.colorA, "percent": (0)*100});
            pieChart.push({"color": _param.colorB, "percent": (graphLink[m]["value"]/sum)*100});
            mergedEdges.push({"sumValue": sum, "source":graphLink[m]["source"], "target": graphLink[m]["target"],
            "A": {}, "B": graphLink[m], "pieChart": pieChart});
        }
        
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
          .range([0.8*height, 0.4*height]);
  
    _param.nodeSizeScale = nodeSizeScale;
    _param.edgeThicknessScale = edgeThicknessScale;
    var color = d3.scaleOrdinal(d3.schemeCategory20);
  
    var nodesArray = [];
    for (var nodeid in graphA.nodes) {
      nodesArray.push(graphA.nodes[nodeid]);
    }

    var nodesArrayB = [];
    for (var nodeid in graphB.nodes) {
      nodesArrayB.push(graphB.nodes[nodeid]);
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
              return linkDistanceScale(d.sumValue);
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

    var links = svg
      .append("g")
      .attr("class", "links")
      .selectAll("g")
      .data(mergedEdges)
      .enter().append("g");

      var link = links.append("path")
      .attrs({
        "stroke-width": function (d) {
          return edgeThicknessScale(d.sumValue) + "px";
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

      var linkPie = links.append("g");
  
    link.append("title").text(function (d) {
        var Avalue= 0, Bvalue = 0;
        if("value" in d["A"]) Avalue = d["A"].value;
        if("value" in d["B"]) Bvalue = d["B"].value;
        
      return "#Transitions: " + d.sumValue + " (A: "+ Avalue + " , B: "+Bvalue+")";
    });
  
    link
      .on("mouseover", function (d, i) {
          var trainsArray=[];
          if("trains" in d["A"])
            trainsArray = trainsArray.concat(d["A"].trains);
        if("trains" in d["B"])
            trainsArray = trainsArray.concat(d["B"].trains);
        highlightTrains(trainsArray);
      })
      .on("mouseout", function (d) {
        d3.selectAll(".highlighters").attr("opacity", 0);
      });
  
    //   var gameData = playbackData["environmentData"];
    //   var numRows = _param.numRows;
    //   var numColumns = _param.numColumns;
  
      nodesArray.forEach(function(d,i) {
          var regionPos = [];
          var regionCells = _param.regionDictionaryA[d.id]["cells"];
          var regionCllsArray = Array.from(regionCells);
          var posString = regionCllsArray[Math.floor(regionCllsArray.length/2)];
          posString = posString.replace("[","").replace("]","");
          posString = posString.split(",");
          regionPos[0] = +posString[0];
          regionPos[1] = +posString[1];
          d.x = (regionPos[1] * width) / _param.numColumns; 
          d.y = (regionPos[0]*height) /_param.numRows ; 
          if(nodesArrayB[i].id == d.id)
            {
                var sum = d.numTrains + nodesArrayB[i].numTrains;
                d.sumTrains = sum;
                d.B = nodesArrayB[i];
                d.pieChart = [];
                
                var percentA = 0;
                if(sum>0) percentA = (d.numTrains/sum)*100;
                var percentB = 0;
                if(sum>0) percentB = (d.B.numTrains/sum)*100;
                d.pieChart.push({"color": _param.colorA, "percent": percentA});
                d.pieChart.push({"color": _param.colorB, "percent": percentB});
            }
        else
            console.log("node ids not same in nodeArrayA and nodeArrayB.")

         });
  
    var node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodesArray)
      .enter()
      .append("g");
  
      /* Draw the respective pie chart for each node */
node.each(function (d) {
    var fillColor = "grey";
    if(d.sumTrains ==0) fillColor = "white";
        
    
    NodePieBuilder.drawNodePie(d3.select(this), d.pieChart, {
        parentNodeColor: fillColor,
        outerStrokeWidth: 2,
        showLabelText: true,
        labelText: "R"+d.id,
        labelColor: "black",
        radius: Math.sqrt(nodeSizeScale(d.sumTrains) / Math.PI),
        // pieChartBorderWidth: 2,
        // pieChartBorderColor: "grey"

    });
});

//  /* Draw the respective pie chart for each edge */
linkPie.each(function (d) {
    NodePieBuilder.drawNodePie(d3.select(this), d.pieChart, {
        parentNodeColor: "grey",
        outerStrokeWidth: 0,
        showLabelText: false,
        labelText: "R"+d.id,
        labelColor: "black",
        radius: _param.nodeMinRadius,
        pieChartBorderWidth: 0,
        pieChartBorderColor: "grey",
        title: function(){
            var Avalue= 0, Bvalue = 0;
            if("value" in d["A"]) Avalue = d["A"].value;
            if("value" in d["B"]) Bvalue = d["B"].value;
        return "#Transitions: " + d.sumValue + " (A: "+ Avalue + " , B: "+Bvalue+")";
        },
        mouseover: function (d, i) {
            var trainsArray=[];
            if("trains" in d["A"])
              trainsArray = trainsArray.concat(d["A"].trains);
          if("trains" in d["B"])
              trainsArray = trainsArray.concat(d["B"].trains);
          highlightTrains(trainsArray);
        }

    });
});
       
    var circles = node
      .append("circle")
      .attr("r", function (d,i) {
        var r = _param.nodeMinRadius;
        
        if (d.sumTrains != 0) {
          r = Math.sqrt(nodeSizeScale(d.sumTrains) / Math.PI);
        }
        d.radius = r;
        return r;
      })
      .attr("fill", function (d) {
          if (d.sumTrains != 0)
              return "grey";
          else
          return "white"
      })
      .attrs({
          "fill-opacity":0,
          "stroke":"grey",
          "class": "aggregatedGraphNode",
          "id": function(d){ return "aggregatedGraphRegionNode"+d.id ;}
      }).style("stroke-width", function(d){
        if (d.sumTrains != 0)
            return "3px";
        else
            return "1px";
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
        trainIdsArray = trainIdsArray.concat(Object.keys(d.trains));
        trainIdsArray = trainIdsArray.concat(Object.keys(d.B.trains));
        for (var i in trainIdsArray) {
          trainIdsArray[i] = +trainIdsArray[i];
        }
        highlightTrains(trainIdsArray);
        highlightRegions([d.id]);
      })
      .on("mouseout", function (d) {
          deHighlightTrains();
          dehighlightRegions();
      });
  
    node.append("title").text(function (d) {
      return "#Trains: " + d.sumTrains + ` (A:${d.numTrains}, B:${d.B.numTrains})`;
    });
  
    // var lables = node
    //   .append("text")
    //   .text(function (d) {
    //     return "R" + d.id;
    //   })
    //   .attr("x", function (d) {
    //     return Math.sqrt(nodeSizeScale(d.numTrains) / Math.PI +15);
    //   })
    //   .attr("y", 0);



     
  
  _param.graphNodeSelection = node;
  
    simulation.nodes(nodesArray).on("tick", ticked);
  
    simulation.force("link").links(mergedEdges);
  
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

      linkPie.attrs({
        "transform": function(d){
            return "translate("+calculateCurvedPathMidPointForPie(d.source, d.target)+")";
        }
      });
  
      node.attr("transform", function (d) { 
          d.x = Math.max(d.radius, Math.min(width - d.radius - 25, d.x));
          d.y = Math.max(3*d.radius, Math.min( window.svgWidthHeight - d.radius - 25, d.y));
        return "translate(" + d.x + "," + d.y + ")";
      });
    }
  
    
  }

  function calculateCurvedPathMidPointForPie(source, target)
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
    var P1 = calculateMidControlPoint(P0, P2, 20);
    return P1[0] + "," + P1[1];

}

function sortTrainsBoth(sortCriteria, order, entitiesArray, agentTimelineDataA, agentTimelineDataB) {
    entitiesArray.sort(function (a, b) {
      if (sortCriteria == "startTimestep" || sortCriteria == "endTimestep") 
      {

        var mintime_a;
        var tempA = agentTimelineDataA[a][sortCriteria];
        var tempB = agentTimelineDataB[a][sortCriteria];

        if (tempA != -1 && tempB != -1) mintime_a = d3.min([tempA,tempB]);
        else if (tempA == -1 && tempB != -1) mintime_a = tempB;
        else if (tempA != -1 && tempB == -1) mintime_a = tempA;

        aTime = mintime_a;

        var mintime_b;
        var tempA = agentTimelineDataA[b][sortCriteria];
        var tempB = agentTimelineDataB[b][sortCriteria];

        if (tempA != -1 && tempB != -1) mintime_b = d3.min([tempA,tempB]);
        else if (tempA == -1 && tempB != -1) mintime_b = tempB;
        else if (tempA != -1 && tempB == -1) mintime_b = tempA;
        bTime = mintime_b;
  
        if (aTime != -1 && bTime != -1) return aTime - bTime;
        else if (aTime == -1 && bTime != -1) return 1;
        else if (aTime != -1 && bTime == -1) return -1;
        else return 0;
      }
    });
    return entitiesArray;
  }