function exportSequenceData()
{
    approaches = ["OR_old_driver", "RL_jbr_hse", "RL_netcetera", "RL_marmot"];
    window.collectiveJSONData = {};
    console.log(approaches);
    fetchDataForAnApproach("OR_old_driver");

    // console.log(JSON.parse(JSON.stringify(collectiveJSONData)));
}

function fetchDataForAnApproach(approach)
{
    var schedulingA = approach;
    window.schedulingA = schedulingA;
    console.log("Fetching data for "+schedulingA);
    d3.select("#OverallStatsA").style("display","inline");
    d3.select("#totalNumTrainsA").text("");
    d3.select("#totalNumTrainsReachedDestinationA").text("");
    d3.select("#totalNumTrainsInProgressA").text("");
    d3.select("#totalNumTrainsYetToRunA").text("");

    syncHighlighting();
    visualize();
    window.collectiveJSONData[approach] = objectOfOneApproach();
}


function objectOfOneApproach()
{
    jsonData = _param.graph;
    jsonData["trainTimeline"] = _param.agentTimelineData;
    // console.log(JSON.parse(JSON.stringify(jsonData)));
    return jsonData;
}

function initializeSelectedRegions1()
{

    // window.selectedRegions = [
    //     {
    //         "type": "rect",
    //         "index": 0,
    //         "id": 1
    //     },
    //     {
    //         "type": "rect",
    //         "index": 1,
    //         "id": 2
    //     },
    //     {
    //         "type": "rect",
    //         "index": 2,
    //         "id": 3
    //     },
    //     {
    //         "type": "rect",
    //         "index": 3,
    //         "id": 4
    //     },
    //     {
    //         "type": "rect",
    //         "index": 4,
    //         "id": 5
    //     },
    //     {
    //         "type": "rect",
    //         "index": 5,
    //         "id": 6
    //     },
    //     {
    //         "type": "rect",
    //         "index": 6,
    //         "id": 7
    //     },
    //     {
    //         "type": "rect",
    //         "index": 7,
    //         "id": 8
    //     },
    //     {
    //         "type": "rect",
    //         "index": 8,
    //         "id": 9
    //     },
    //     {
    //         "type": "rect",
    //         "index": 9,
    //         "id": 10
    //     },
    //     {
    //         "type": "rect",
    //         "index": 10,
    //         "id": 11
    //     },
    //     {
    //         "type": "rect",
    //         "index": 11,
    //         "id": 12
    //     }
    // ];
    // window.selectedRegionIdCounter = 13;
}

function initializeSelectedRegions2()
{
    // _param.selectedRectanglesRaw = [
    //     {
    //         "x": 12.886940002441406,
    //         "y": 51.0576171875,
    //         "width": 56.151756286621094,
    //         "height": 89.84288024902344
    //     },
    //     {
    //         "x": 109.87644958496094,
    //         "y": 18.387483596801758,
    //         "width": 38.79570007324219,
    //         "height": 53.088979721069336
    //     },
    //     {
    //         "x": 203.80303955078125,
    //         "y": 14.3037109375,
    //         "width": 23.481689453125,
    //         "height": 47.9842643737793
    //     },
    //     {
    //         "x": 283.4364929199219,
    //         "y": 39.82726287841797,
    //         "width": 54.109954833984375,
    //         "height": 71.46593475341797
    //     },
    //     {
    //         "x": 152.75601196289062,
    //         "y": 102.10472106933594,
    //         "width": 42.879547119140625,
    //         "height": 28.58636474609375
    //     },
    //     {
    //         "x": 243.6197509765625,
    //         "y": 130.6910858154297,
    //         "width": 56.151885986328125,
    //         "height": 32.67015075683594
    //     },
    //     {
    //         "x": 66.99690246582031,
    //         "y": 185.8219451904297,
    //         "width": 39.81672668457031,
    //         "height": 72.48689270019531
    //     },
    //     {
    //         "x": 171.13296508789062,
    //         "y": 217.47113037109375,
    //         "width": 28.586334228515625,
    //         "height": 49.005218505859375
    //     },
    //     {
    //         "x": 288.4364929199219,
    //         "y": 255.5758514404297,
    //         "width": 22.4608154296875,
    //         "height": 49.00520324707031
    //     },
    //     {
    //         "x": 75.05972290039062,
    //         "y": 278.03656005859375,
    //         "width": 37.774810791015625,
    //         "height": 29.607330322265625
    //     },
    //     {
    //         "x": 143.46278381347656,
    //         "y": 226.98948669433594,
    //         "width": 13.272201538085938,
    //         "height": 20.4188232421875
    //     },
    //     {
    //         "x": 252.45230102539062,
    //         "y": 217.2565155029297,
    //         "width": 16.33502197265625,
    //         "height": 26.54449462890625
    //     }
    // ];
}