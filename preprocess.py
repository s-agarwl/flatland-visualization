from collections import OrderedDict
from flatland.envs.observations import TreeObsForRailEnv
from flatland.envs.rail_env import RailEnv
from flatland.utils.rendertools import RenderTool
from PIL import Image
import networkx as nx
import json
from numpy import array
import numpy as np
import pandas as pd
import random
import matplotlib.pyplot as plt
from IPython.display import display, HTML
from ipywidgets import Button, HBox, VBox
from flatland_contrib.graphs.graph_utils import RailEnvGraph, trans_int_to_4x4, trans_int_to_binstr, trans_int_to_nesw, get_rail_transitions_df
from flatland_contrib.graphs.graph_utils import get_simple_path, plotGraphEnv
import flatland_contrib.graphs.graph_utils as gu
from flatland.envs.rail_generators import rail_from_manual_specifications_generator
from flatland.envs.rail_generators import random_rail_generator, complex_rail_generator, sparse_rail_generator
from flatland.envs.persistence import RailEnvPersister

def serializeAgents(objectList):
    #print(len(objectList))
    serializedList = []
    for i in range(0,len(objectList)):
        agent_index = i
        agentObject = {"agent_index": agent_index }
        objectAttributes = objectList[i].__dict__.keys()
        for attr in objectAttributes:
            #print(getattr(objectList[i], attr))
            agentObject[attr] = getattr(objectList[i], attr)
        serializedList.append(agentObject)
    return serializedList

import json
import numpy as np
import os
import copy

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return super(NpEncoder, self).default(obj)

def findStepNumOfAgentStarting(agent_index, initial_position, episodeArray):
    for k in range(0, len(episodeArray)):
        step = episodeArray[k]
        if step[agent_index][0] == initial_position[0] and step[agent_index][1] == initial_position[1]:
            return k
    return -1

def findEndStepNumOfAgent(agent_index, target_position, beginStepNum, episodeArray):
    
    endStepNum = -1   
    for k in range(beginStepNum, len(episodeArray)-1):
        step = episodeArray[k][agent_index]
        nextStep = episodeArray[k+1][agent_index]
        stepPosition = [step[0], step[1]]
        if isOneStepAwayFromTarget(stepPosition, target_position) and nextStep[0]==0 and nextStep[1] == 0 :
            endStepNum= k+1
            break
    return endStepNum

def positionsAreSame(position, newPosition):
    if position[0] == newPosition[0] and position[1] == newPosition[1]:
        return True
    else:
        return False

def findNextPosition(agent_index, position, stepNum, episodeArray):
    for k in range(stepNum+1, len(episodeArray)):
        newPosition = [episodeArray[k][agent_index][0], episodeArray[k][agent_index][1]]
        if positionsAreSame(position, newPosition):
            continue
        else:
            return newPosition
    return -1

def computeDirection(position, nextPosition):
    yoffset = nextPosition[0] - position[0]
    xoffset = nextPosition[1] - position[1]
    direction = -1
    if yoffset == 1 and xoffset == 0:
        direction = 2
    elif yoffset == -1 and xoffset ==0:
        direction = 0
    elif yoffset == 0 and xoffset ==1:
        direction = 1
    elif yoffset ==0 and xoffset == -1:
        direction = 3
    else:
        direction = -1
    return direction
    
def findMovementDirection(agent_index, position, stepNum, agentBeginStepNum, episodeArray, previousDirection):
    nextPosition = findNextPosition(agent_index, position, stepNum, episodeArray)
    movementDirection = -1
    if nextPosition !=-1:
        movementDirection = computeDirection(position, nextPosition)
    if movementDirection == -1:
        movementDirection = previousDirection
        
    return movementDirection

def isOneStepAwayFromTarget(currentPosition, targetPosition):
    offset = abs(targetPosition[0] - currentPosition[0]) + abs(targetPosition[1] - currentPosition[1])
    if offset ==1:
        return True
    else:
        return False

def getPositionArrayFromNodeId(node):
#     node = str(node)
    nodeString = node.replace('(', '').replace(')','')
    nodeParts = nodeString.split(', ')
    return [int(nodeParts[0]), int(nodeParts[1])]

def convertStringNodeIdToTuple(node):
#     node = str(node)
    nodeString = node.replace('(', '').replace(')','')
    nodeParts = nodeString.split(', ')
    return (int(nodeParts[0]), int(nodeParts[1]), int(nodeParts[2]))
                                   
def getValidSiblings(node, tempGraph):
    directions = [0,1,2,3]
    nodeString = node[1: len(node)-1]
    nodeParts = nodeString.split(', ')

    siblings = []
    for d in directions:
        tempNode = (int(nodeParts[0]), int(nodeParts[1]), d)
        if d!=int(nodeParts[2]) and tempNode in list(tempGraph.nodes()):
            siblings.append(tempNode)
    return siblings

def checkPositionIsNotAgentsTarget(position, agent_index, agentsArray):
    for agent in agentsArray:
        if agent['agent_index'] == agent_index:
            if position[0] == agent['target'][0] and position[1] == agent['target'][1]:
                return False
            else:
                return True
    return -1

def positionArrayToString(position):
    posString='['+ str(position[0])+', '+str(position[1])+']'
    return posString

def setToArray(currentSet):
    tempArray = []
    for element in currentSet:
        tempArray.append(element)
    return tempArray

def checkDeadlocks2(step, currentRailNodeId, agent_index, agentsArray, tempGraph, step_occupiedNodesGridId_agent_dict):
    temp_current_position_Array = getPositionArrayFromNodeId(str(currentRailNodeId))
    
    nextNodes = []
    deadlockArray = []
    conditionFlag = True
    
    while conditionFlag and checkPositionIsNotAgentsTarget(temp_current_position_Array, agent_index, agentsArray):
        temp_current_position_String = positionArrayToString(temp_current_position_Array)
            
        if temp_current_position_String in step_occupiedNodesGridId_agent_dict[step]:
            occupying_agent_index = step_occupiedNodesGridId_agent_dict[step][temp_current_position_String]
                

    #                             Check whether the occupying agent index also does not have a end station in between. Or check for the duplicacy at the end in deadlockArray
            if occupying_agent_index != agent_index:
                deadlock_dict = {'step': step, 'agents': [agent_index, occupying_agent_index]}
                deadlockArray.append(deadlock_dict)
        nextNodes.clear()
        temp_nextNode = currentRailNodeId
        if temp_nextNode in tempGraph.adj:
            for n,e in tempGraph.adj[temp_nextNode].items():
                if e['type'] == 'dir':
                    nextNodes.append(n)
                
        if len(nextNodes) == 1:
            currentRailNodeId = nextNodes[0]
            temp_current_position_Array = getPositionArrayFromNodeId(str(currentRailNodeId))
        else:
            
            conditionFlag = False       
    
    return deadlockArray

def extractDirectionFromNodeid(nodeidString):
    nodeString = nodeidString.replace('(', '').replace(')','')
    nodeParts = nodeString.split(', ')
    return nodeParts[2]

def computeAgentMovementDict(agentsArray, episodes, graph):
    edgesToBeRemoved = []
    for s,t,data in graph.edges(data=True):
        if(data['type']=='grid'):
            edgesToBeRemoved.append([s,t])
    graph.remove_edges_from(edgesToBeRemoved)
    agent_movement_dict = {}
#     
    for agent in agentsArray:
        agent_index = agent['agent_index']
        
        if (agent_index not in agent_movement_dict):
            agent_movement_dict[agent_index] = []

        stepNum = findStepNumOfAgentStarting(agent_index, agent['initial_position'], episodes)
        agentBeginStepNum = stepNum
        agentEndStepNum = findEndStepNumOfAgent(agent_index, getPositionArrayFromNodeId(str(agent['target'])), agentBeginStepNum,  episodes)
        nextPosition = []
        agentHasTakenFirstStep = False
        

        endIndex = agentEndStepNum 
        if endIndex == -1:
            endIndex = len(episodes)
        
        for k in range(agentBeginStepNum, endIndex-1):
            currentPosition = [episodes[k][agent_index][0], episodes[k][agent_index][1]]
            nextPosition = [episodes[k+1][agent_index][0], episodes[k+1][agent_index][1]]
            sourceNode = (currentPosition[0], currentPosition[1])
            targetNode = (nextPosition[0], nextPosition[1])
            
            path = nx.shortest_path(graph, sourceNode, targetNode)
            if currentPosition[0]!=nextPosition[0] or currentPosition[1] != nextPosition[1]:
                if agentHasTakenFirstStep == False:
                    agentHasTakenFirstStep = True
                    tempDict = {"node": str(path[1]), "step": agentBeginStepNum, "direction": extractDirectionFromNodeid(str(path[1]))}
                    agent_movement_dict[agent_index].append(tempDict)
                
                tempDict = {"node": str(path[2]), "step": k+1, "direction": extractDirectionFromNodeid(str(path[2]))}
                agent_movement_dict[agent_index].append(tempDict)
                    
            
#                 print("sourceNode, targetNode, agent_index = ")
#                 print(sourceNode, targetNode, agent_index)
        
#         currentPosition = [episodes[agentEndStepNum-1][agent_index][0], episodes[agentEndStepNum-1][agent_index][1]]
#         print(agent['target'])
#         nextPosition = getPositionArrayFromNodeId(str(agent['target']))
#         sourceNode = (currentPosition[0], currentPosition[1])
#         targetNode = (nextPosition[0], nextPosition[1])
#         print("currentPosition, nextPosition, sourceNode, targetNode")
#         print(currentPosition, nextPosition, sourceNode, targetNode)
#         if currentPosition[0]!=nextPosition[0] or currentPosition[1] != nextPosition[1]:
#             path = nx.shortest_path(graph, sourceNode, targetNode)
#             print(path)
#             tempDict = {"node": path[2], "step": agentEndStepNum}
#             agent_movement_dict[agent_index].append(tempDict)
        
                
#     print(agent_movement_dict)        
    return agent_movement_dict

def convertRailNodeToGridNode(railNode):
    gridNode = [railNode[0], railNode[1]]
    return gridNode
    
def computePathDistance(path):
    distance = 0
    for i in range(0, len(path)-1):
        currentPos = path[i]
        nextPos = path[i+1]
        if currentPos[0] == nextPos[0] and currentPos[1] == nextPos[1]:
            continue
        else:
            distance +=1
    return distance
    
def computeTwoPathsPerAgent(agentsArray, episodes, graph, grid):
    edgesToBeRemoved = []
    for s,t,data in graph.edges(data=True):
        if(data['type']=='grid'):
            edgesToBeRemoved.append([s,t])
    graph.remove_edges_from(edgesToBeRemoved)
    agent_movement_dict = {}
#     
    for agent in agentsArray:
        agent_index = agent['agent_index']
        
        if (agent_index not in agent_movement_dict):
            agent_movement_dict[agent_index] = {}
        
        initialPosition = agent['initial_position']
        targetPosition = agent['target']
        sourceNode = (initialPosition[0], initialPosition[1])
        targetNode = (targetPosition[0], targetPosition[1])
        
        agent_shortestPath_railNodeId = nx.shortest_path(graph, sourceNode, targetNode)
        agent_shortestPath_gridnodes = []
        
        if len(agent_shortestPath_railNodeId) >=4:
            for i in range(1, len(agent_shortestPath_railNodeId)-1):
                agent_shortestPath_gridnodes.append(convertRailNodeToGridNode(agent_shortestPath_railNodeId[i]))
        else:
            agent_shortestPath_gridnodes = []
        shortest_distance = computePathDistance(agent_shortestPath_gridnodes)
        
        
        
        actualPath = []
        for ep in episodes:
            tempPos = [ ep[agent_index][0] , ep[agent_index][1]]
            if tempPos[0] == 0 and tempPos[1] ==0 and grid[0][0]==0:
                continue
            else:
                actualPath.append(tempPos)
#                 print(tempPos)
        actualPath.append(targetPosition)
        actual_distance = computePathDistance(actualPath)
        
#         print("agent_index, initialPosition, targetPosition, sourceNode, targetNode, shortest_distance, actual_distance")
#         print(agent_index, initialPosition, targetPosition, sourceNode, targetNode, shortest_distance, actual_distance)
        
        agent_movement_dict[agent_index] = {"shortest_path_length": shortest_distance, "actual_path_length": actual_distance, "shortest_path":agent_shortestPath_gridnodes, "actual_path":actualPath  }
            
    return agent_movement_dict
    

def processTrajectoryData(agent_trajectory_dict):
    new_dict = {}
    for k,v in agent_trajectory_dict.items():
        new_dict[int(k)] = {}
        for k2,v2 in v.items():
            new_dict[int(k)][int(k2)] = v2
    return new_dict
        

#path = "/home/shivam/shared/Flatland/flatland_data/recording76716-rl/recording76716/"
# path = "../../data/test_deadlock/"
# path = "../../data/test/"
# dataPaths = {"RL":"../../data/recording76716-rl/","OR": "../../data/recording76738-or/"}
# dataPaths = {"RL":"../../data/test_deadlock/"}
def processData(folder, dataPaths):
    returnDict = {}
    fileKeyArray=[]
    # for technique, path in dataPaths.items():
    for file in dataPaths:
        # path2 = ""
        dataArray = []
        dataDictionary = {}
        # for r, d, f in os.walk(path):
        #     for folder in d:
        #         path2 = os.path.join(r, folder)
        #         print(folder, path2)
        #         for r2, d2, f2 in os.walk(path2):
        #             for file in f2:
                        #dataDictionary = {}
        # env_file = os.path.join(folder, file)
        env_file = folder+"/"+file
        fileSize = os.path.getsize(env_file)
        print(env_file)
        #print(fileSize)
        if fileSize < (20 * 1024*1024):
            print("filesize test passed")
            env, env_dict = RailEnvPersister.load_new(env_file)
            env.reset(random_seed=1001)
            serialized_env_dict = {}
            serialized_env_dict["actions"] = env_dict["actions"]
            serialized_env_dict["grid"] = env_dict["grid"]
            serialized_env_dict["malfunction"] = env_dict["malfunction"]
            serialized_env_dict["max_episode_steps"] = env_dict["max_episode_steps"]
            serialized_env_dict["episode"] = env_dict["episode"]
            serialized_env_dict["agents"] = serializeAgents(env_dict["agents"])
            # fileKey = technique+"-"+folder +'_'+ file.replace('.pkl', '')
            fileKey = file.replace('.pkl', '')
            fileKeyArray.append(fileKey)
            #dataDictionary["name"] = fileKey
            #json_object=json.dumps(serialized_env_dict, cls=NpEncoder)
            #dataDictionary["data"] = serialized_env_dict
            #dataDictionary["data"] = json_object
            dataDictionary[fileKey] = serialized_env_dict
            gEnv = RailEnvGraph(env)
            G2 = gEnv.graph_rail_grid()
            edgesToBeRemoved = []
            edgesToBeAdded = []
            for s,t,data in G2.edges(data=True):
                if(data['type']=='hold'):
                    edgesToBeRemoved.append([s,t])
                    edgesToBeAdded.append([t,s])

            env_renderer = RenderTool(env, gl="PILSVG")
            env_renderer.render_env(show=False, show_observations=False, show_agents=False)
            aImg = env_renderer.get_image()
#                     gu.plotGraphEnv(G2, env, aImg, node_colors={"grid":"red", "rail":"lightblue"}, show_edges=("dir"))
#                     gEnv.savejson("test2.json")
            G2.add_edges_from(edgesToBeAdded, type = 'hold', l=1)
#                     new_agent_movement_dict = computeAgentMovementDict(serialized_env_dict["agents"], serialized_env_dict["episode"], G2)
            agent_shortest_actualPaths_dict = computeTwoPathsPerAgent(serialized_env_dict["agents"], serialized_env_dict["episode"], G2, env_dict["grid"])

            agent_movement_dict = {}
            for agent in serialized_env_dict["agents"]:
#                         print(agent)
                if (agent['agent_index'] not in agent_movement_dict):
                    agent_movement_dict[agent['agent_index']] = []

                stepNum = findStepNumOfAgentStarting(agent['agent_index'], agent['initial_position'], env_dict["episode"])
                agentBeginStepNum = stepNum
                previousDirection = -1
                if stepNum !=-1:
                    while stepNum < len(env_dict["episode"]):
                        tempDict = {"node": '', "step": -1, "direction": -1}
                        position = [env_dict["episode"][stepNum][agent['agent_index']][0], env_dict["episode"][stepNum][agent['agent_index']][1]]
                        previousPosition = -1
                        if(stepNum>0):
                            previousPosition = [ env_dict["episode"][stepNum-1][agent['agent_index']][0], env_dict["episode"][stepNum-1][agent['agent_index']][1]]

                        if position[0]==0 and position[1]==0 and env_dict["grid"][0][0] == 0:
                            stepNum+=1
                            continue

                        elif position[0]!=0 or position[1]!=0:
                            direction = findMovementDirection(agent['agent_index'], position, stepNum, agentBeginStepNum, env_dict["episode"], -1)
                            if isOneStepAwayFromTarget(position, agent['target']) and stepNum < (len(env_dict["episode"]) -1):
                                direction = previousDirection
                                tempDict['node'] = '('+str(agent['target'][0]) + ', '+str(agent['target'][1])+ ')'
                                tempDict['step'] = stepNum
                                tempDict['direction'] = -1
                                agent_movement_dict[agent['agent_index']].append(tempDict)

                            if direction != -1:
                                tempDict['direction'] = direction
                                tempDict['node'] = '('+str(position[0]) + ', '+str(position[1])+ ', '+ str(direction) + ')'
                                tempDict['step'] = stepNum
                                agent_movement_dict[agent['agent_index']].append(tempDict)
                                previousDirection = direction

                            else:
                                if position[0] != agent['initial_position'][0] or position[1] != agent['initial_position'][1]:
                                    tempDict['direction'] = previousDirection
                                    tempDict['node'] = '('+str(position[0]) + ', '+str(position[1])+ ', '+ str(previousDirection) + ')'
                                    tempDict['step'] = stepNum
                                    agent_movement_dict[agent['agent_index']].append(tempDict)


#                                 elif isOneStepAwayFromTarget(previousPosition, agent['target']):
#                                     tempDict['node'] = '('+str(agent['target'][0]) + ', '+str(agent['target'][1])+ ')'
#                                     tempDict['step'] = stepNum
#                                     tempDict['direction'] = -1
#                                     agent_movement_dict[agent['agent_index']].append(tempDict)



                        stepNum+=1

            G2.remove_edges_from(edgesToBeRemoved)


#                     print("Printing agent 1s episode values")
#                     for ep in env_dict["episode"]:
#                         print(ep[1])

#                     print("agent 1 target = ")
#                     print(serialized_env_dict["agents"][1])
#                     print("agent_movement_dict = ")
#                     print(agent_movement_dict)
#                     print("NEW agent_movement_dict = ")
#                     print(new_agent_movement_dict)

            #Key: nodeId : {stepNum: agent_index}
            node_occupancy_dict = {}

            # step: {nodeid: agent_index }
            step_occupiedNodes_agent_dict = {}
            step_occupiedNodesGridId_agent_dict = {}

            #agent_index: {step: {'railNode':nodeId, 'gridNode': gridNode}}
            agent_trajectory_dict = {}

            for agent_index, movementArray in agent_movement_dict.items():
                for move in movementArray:
                    nodeId = move['node']
                    if nodeId != '':
                        if nodeId not in node_occupancy_dict:
                            node_occupancy_dict[nodeId] = {}
#                             temp_dict = {move['step']: agent_index}
                        node_occupancy_dict[nodeId][move['step']] = agent_index

                        if move['step'] not in step_occupiedNodes_agent_dict:
                            step_occupiedNodes_agent_dict[move['step']] = {}
                            step_occupiedNodesGridId_agent_dict[move['step']] = {}
                        step_occupiedNodes_agent_dict[move['step']][nodeId] = agent_index 
                        step_occupiedNodesGridId_agent_dict[move['step']][str(getPositionArrayFromNodeId(nodeId))] = agent_index 

                        if agent_index not in agent_trajectory_dict:
                            agent_trajectory_dict[agent_index] = {}
                        agent_trajectory_dict[agent_index][move['step']] = {'railNodeId': nodeId, 'gridNode': getPositionArrayFromNodeId(nodeId) } 


# #                     print("node_occupancy_dict = ")
# #                     print(node_occupancy_dict)
#                     print("step_occupiedNodes_agent_dict = ")
#                     print( step_occupiedNodes_agent_dict)
# #                     print( step_occupiedNodes_agent_dict[421])
#                     print("step_occupiedNodesGridId_agent_dict = ")
#                     print( step_occupiedNodesGridId_agent_dict)
#                         print("agent_trajectory_dict = ")
#                         print( agent_trajectory_dict)
#                     print()

            deadlockArray=[]
            deadLockInfoDict = {}
            finalDetectedDeadlocksDict = {}
            tempGraph = copy.deepcopy(G2)
            episodeLength = int(serialized_env_dict["max_episode_steps"])
            for step, nodeId_agent_index_dict in step_occupiedNodes_agent_dict.items():

                for agent_current_positionString, temp_agent_index in nodeId_agent_index_dict.items():

                    railNodeId = convertStringNodeIdToTuple(agent_current_positionString)

                    returnedDeadlockArray = checkDeadlocks2(step, railNodeId, temp_agent_index, serialized_env_dict["agents"], tempGraph, step_occupiedNodesGridId_agent_dict)
#                             if step==421 and temp_agent_index == 11:
#                                 print("returnedDeadlockArray = ")
#                                 print(returnedDeadlockArray)
                    for item in returnedDeadlockArray:
#                                     deadlockArray.append(item)
                        if item['step'] not in deadLockInfoDict:
                            deadLockInfoDict[item['step']] = []
                        deadLockInfoDict[item['step']].append(item['agents'])


            for step, dependencyEdgesArray in deadLockInfoDict.items():
                arrayOfDetectedCycles = []
                depGraph = nx.DiGraph()
                for edge in dependencyEdgesArray:
#                             print(edge)
                    depGraph.add_edge(edge[0], edge[1])


                cycleList = list(nx.simple_cycles(depGraph))
                isThereCycle = False
                if len(cycleList) >0:
                    isThereCycle = True

                while isThereCycle:
                    toBeMerged =  set()
                    oneCycle = cycleList[0]
                    tempSet =  set()
                    for temp_node in oneCycle:
                        tempSet.add(temp_node)
                    setAlreadyExists = False

                    for i in range(0, len(arrayOfDetectedCycles)):
                        existingSet = arrayOfDetectedCycles[i]
                        intersectionSet = existingSet.intersection(tempSet)
                        if len(intersectionSet)>0:
                            setAlreadyExists = True
                            toBeMerged = copy.deepcopy(tempSet)
                            arrayOfDetectedCycles[i] = arrayOfDetectedCycles[i].union(tempSet)
                            break

                    if setAlreadyExists == False and len(tempSet)>0:
                        arrayOfDetectedCycles.append(copy.deepcopy(tempSet))
                        toBeMerged = copy.deepcopy(tempSet)


                    node1 = []
                    if len(toBeMerged) >1:
                        node1 = toBeMerged.pop()
                    while len(toBeMerged) >=1:
                        node2 = toBeMerged.pop()
                        depGraph = nx.contracted_nodes(depGraph, node1, node2, self_loops=False, copy = False)

                    cycleList = list(nx.simple_cycles(depGraph))
                    if len(cycleList) >0:
                        isThereCycle = True
                    else:
                        isThereCycle = False



                #Add incoming edges to the deadlocked nodes also to the deadlocked nodes list.
#                         edgesToBeremoved2 = []
                for source, target in depGraph.edges():
#                             print(source, target)
                    targetFoundInDeadlockedNodeSets = False
                    for existingSet in arrayOfDetectedCycles:
                        if target in existingSet:
                            targetFoundInDeadlockedNodeSets = True
                            existingSet.add(source)
#                                     edgesToBeremoved2.append([source, target])
                            break
#                         if step in [420, 421,422]:  
#                             print("After merging graph edges| step, cycles, edges")
#                             print(step, arrayOfDetectedCycles, depGraph.edges)
                finalDetectedDeadlocksDict[step] = arrayOfDetectedCycles
#                     print(finalDetectedDeadlocksDict)
            exportedDeadlockData = {}
            deadlockId =1
            deadLockIdDictionary = {}
            sortedStepsArray= sorted (finalDetectedDeadlocksDict.keys())

            #There is a bug in agent_movement_dict. Trying to compensate with this dirty hack
            for k in range(0, len(sortedStepsArray)-4):
                a = finalDetectedDeadlocksDict[sortedStepsArray[k]]
                b = finalDetectedDeadlocksDict[sortedStepsArray[k+1]]
                c = finalDetectedDeadlocksDict[sortedStepsArray[k+2]]
                d = finalDetectedDeadlocksDict[sortedStepsArray[k+3]]

                if str(a) == str(c) and str(b) == str(d) and str(a) != str(b):
                    finalDetectedDeadlocksDict[sortedStepsArray[k+2]] = copy.deepcopy(finalDetectedDeadlocksDict[sortedStepsArray[k+3]])

            #------------------

            for k in range(0, len(sortedStepsArray)):
                step = sortedStepsArray[k]
                deadlockSetsArray = finalDetectedDeadlocksDict[step]
#                         print(step,  deadlockSetsArray)
                if k==0:
                    currentDArray = deadlockSetsArray
                    for dlockSet in deadlockSetsArray:
                        deadLockIdDictionary[deadlockId] = {'id': deadlockId, 'originalset': dlockSet, 'finalset': dlockSet,  'createdStep': step, 'added': []}
                        deadlockId +=1
                if k>0:
                    currentDArray = deadlockSetsArray
                    previousDArray = finalDetectedDeadlocksDict[sortedStepsArray[k-1]]
                    for t_currentSet in currentDArray:
                        setIsSameAsPrevious = False
                        for t_previousSet in previousDArray:
                            if t_currentSet.issubset(t_previousSet) and t_previousSet.issubset(t_currentSet):
                                setIsSameAsPrevious = True
                                break
                        #Now it means that current set may be an expanded version of some previous set or a new set altogether
                        setisExpanded = False
                        for t_previousSet in previousDArray:
                            if t_previousSet.issubset(t_currentSet):
                                setisExpanded = True
                                addedElements = t_currentSet - t_previousSet
                                if len(addedElements)>0:
                                    #Update in existing deadLockIdDictionary
                                    for k,v in deadLockIdDictionary.items():
                                        t_set = v['finalset']
                                        if t_set.issubset(t_previousSet) and t_previousSet.issubset(t_set):
                                            v['finalset'] = t_set.union(addedElements)
                                            v['added'].append({'step': step, 'elements':setToArray(addedElements)})
                                            break
                                break

                        #Means that it is a new set altogether
                        if setisExpanded == False:
                            deadLockIdDictionary[deadlockId] = {'id': deadlockId, 'originalset': t_currentSet, 'finalset': t_currentSet, 'createdStep': step,  'added': []}
                            deadlockId +=1


#                     print("deadLockIdDictionary")
#                     print(deadLockIdDictionary)

            #-----Hack to "clean" the list of detected deadlocks
            cleanedDeadlockDictionary = {}
            for DId, DDetails in deadLockIdDictionary.items():
                foundFlag = False
                for t_k, t_v in cleanedDeadlockDictionary.items():
                    if DDetails['finalset'].issubset(t_v['finalset']):
                        foundFlag = True
                        break
                if foundFlag==False:
                    cleanedDeadlockDictionary[DId] = DDetails
            #--------------------

            #Serializing sets
            for k,v in cleanedDeadlockDictionary.items():
                cleanedDeadlockDictionary[k]['originalset'] = setToArray(cleanedDeadlockDictionary[k]['originalset'])
                cleanedDeadlockDictionary[k]['finalset'] = setToArray(cleanedDeadlockDictionary[k]['finalset'])

#                     new_agent_trajectory_dict = processTrajectoryData(agent_trajectory_dict)

            exportedDataDict = {'deadlockData': cleanedDeadlockDictionary, 'agentTrajectoryData': agent_trajectory_dict, 'environmentData': serialized_env_dict, "agentPathsData": agent_shortest_actualPaths_dict }
            returnDict[fileKey] = exportedDataDict
            json_object=json.dumps(exportedDataDict, cls=NpEncoder, indent = 4)
            # saveFileName = fileKey+".json"
            # text_file = open('./'+saveFileName, "w+")
            # n = text_file.write(json_object)
            # text_file.close()
    returnDict['testLevels'] = fileKeyArray
    print(returnDict)
    return json.dumps(returnDict, cls=NpEncoder, indent = 4)





