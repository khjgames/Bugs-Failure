//var Go = require("Movement")

function getCallback(roomName,worker){
    
    let room = Game.rooms[roomName];
    
    if (!room) return;
    
    let costs = new PathFinder.CostMatrix;
    
    room.find(FIND_STRUCTURES).forEach(function(structure) {
          if (structure.structureType === STRUCTURE_ROAD) {
            // Favor roads over plain tiles
            costs.set(structure.pos.x, structure.pos.y, 1);
          } else if (structure.structureType !== STRUCTURE_CONTAINER && 
                     (structure.structureType !== STRUCTURE_RAMPART ||
                      !structure.my)) {
            // Can't walk through non-walkable buildings
            costs.set(structure.pos.x, structure.pos.y, 0xff);
          } else if (structure.structureType == STRUCTURE_WALL) {
              costs.set(structure.pos.x, structure.pos.y, 200);
          } else if (structure.structureType == STRUCTURE_RAMPART) {
              costs.set(structure.pos.x, structure.pos.y, 1);
            }
    });
    
    if (worker == true){
    room.find(FIND_EXIT).forEach(function(ext) {
      costs.set(ext.pos.x, ext.pos.y, 0xff);
    });
    }
    
    return costs;
}

module.exports = {
    
GoTo : function(creep,target,rangee,worker){
creep.say("New Path!");
//console.log(creep.name + " is using GoTo!")
if (!worker) worker = false;
if (!rangee) rangee = 1;  //specify range, 0 to move on, 1 to move near.etc
PathFinder.use(true);
var Goal = {pos: target, range: rangee};
var Search = PathFinder.search(creep.pos, Goal, {plainCost: 2, swampCost: 10, roomCallback: function(roomName) {return getCallback(roomName,worker)}} );
  var positions = [];
  var directions = [];
  Search.path.forEach((obj) => positions.push([obj["x"],obj["y"]]));
  var startpos = positions.shift();
  startpos.push(creep.room.name);//for room pos
  var prevpos = startpos;
  function GetDirection(pos){
  var x1 = pos[0];
  var y1 = pos[1];
  var x2 = prevpos[0];
  var y2 = prevpos[1];
  var dir = 0;
  if (x1 < x2 && y1 < y2) dir = 8; //left_up
  else if (x1 == x2 && y1 < y2) dir = 1; //up
  else if (x1 > x2 && y1 < y2) dir = 2; //up_right
  else if (x1 > x2 && y1 == y2) dir = 3; //right
  else if (x1 > x2 && y1 > y2) dir = 4; //right_down
  else if (x1 == x2 && y1 > y2) dir = 5; //down
  else if (x1 < x2 && y1 > y2) dir = 6; //down_left
  else if (x1 < x2 && y1 == y2) dir = 7; //left
  return dir
  }
  function dothis(pos){
  directions.push(GetDirection(pos));
  prevpos = pos;
  }
  positions.forEach((pos) => dothis(pos));
  creep.memory.goalsize = rangee;
  creep.memory.goalpos = target;
  creep.memory.startpos = startpos;
  creep.memory.directions = directions.toString();
  //console.log("Before path serialization : " + Search.path);
  //console.log("And after custom path serialization : " + directions.toString());
},

RoadTo : function(creep,target){
PathFinder.use(true);
var Goal = {pos: target, range: 1};
}

};