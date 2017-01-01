var Go = require("Movement")

module.exports = { // KHJGAMES WAS CODING SOME COOL STUFF AND THIS HAPPENED.
   run: function(creep) {
        if (creep && creep.pos && creep.room.name){
        // multi room movement note, you know automatically when a path room changes based on a position 49 changing to a position 0 or vice versa, so look for that and account for it later.
            
        var Home = Game.rooms[creep.memory.home];
        var srcid = creep.memory.sourceid;
        var memroot = Home.memory.sources[srcid];
        var CMemory = creep.memory;
        
        if (!CMemory.LastTickPos) CMemory.LastTickPos = 2;
        if (!CMemory.TickPos) CMemory.LastTickPos = 1;
        
        function Magnitude(x,y){
        var opt1 = Math.abs(creep.pos.x - x);
        var opt2 = Math.abs(creep.pos.y - y);
        if (opt1 < opt2) return opt2
        else return opt1
        }
        
        function FollowDirections(){
        var Directions = CMemory.directions.split(",");
        var Positions = [];
        var Startpos = new RoomPosition(CMemory.startpos[0], CMemory.startpos[1], CMemory.startpos[2]);
        var Goalpos = new RoomPosition(CMemory.goalpos["x"],CMemory.goalpos["y"],CMemory.goalpos["roomName"]);
        var CPos = creep.pos;
        var Stpos = [CMemory.startpos[0], CMemory.startpos[1], CMemory.startpos[2]];
        var prevpos = Stpos;
        var currentpos = [creep.pos.x,creep.pos.y,creep.room.name];
        
        function FindClosestPointOnPath(){
        //choose the highest index, of the nearby points on path
        //distance, multiple, priority
        var distances = [];
        var closepoints = [];
        var BiggestIndex = 0;
        Positions.forEach((pos) => distances.push(Magnitude(pos[0],pos[1])));
        var SmallestDist = distances.sort(function(a, b){return a-b})[0];
        function evalONE(pos){
        if (Magnitude(pos[0],pos[1]) == SmallestDist) closepoints.push(pos);
        }
        function evalTWO(arr){
        if (arr[3] > BiggestIndex) BiggestIndex = arr[3];
        }
        Positions.forEach((pos) => evalONE(pos));
        closepoints.forEach((pos) => pos.push(Positions.indexOf(pos)));// adds index's to arrays
        closepoints.forEach((arr) => evalTWO(arr)); // Finds the close point in the direction we want to head!
        return Positions[BiggestIndex];
        }
        
        function DirMath(a,b){
        var newdir = a + b;
        while (newdir > 8) newdir -= 8;
        while (newdir < 1) newdir += 8;
        return newdir
        }
        
        function TileMobility(dir){
        prevpos = [creep.pos.x,creep.pos.y];
        var posit = GetPosition(dir);
        var mobility = 0;
        var looky = creep.room.lookAt(posit[0],posit[1]);
            looky.forEach(function(lookObject) {
                if (lookObject.type == LOOK_CREEPS) mobility = 10;
                if (lookObject.type == LOOK_TERRAIN && lookObject[LOOK_TERRAIN] == "wall" ) mobility = 10;
                if (lookObject.type == LOOK_STRUCTURES && lookObject[LOOK_STRUCTURES].structureType != STRUCTURE_RAMPART && lookObject[LOOK_STRUCTURES].structureType != STRUCTURE_CONTAINER && lookObject[LOOK_STRUCTURES].structureType != STRUCTURE_ROAD) mobility = 10;
                if (lookObject.type == LOOK_STRUCTURES && lookObject[LOOK_STRUCTURES].structureType == STRUCTURE_ROAD && mobility < 10) mobility = 0;
                if (lookObject.type == LOOK_TERRAIN && lookObject[LOOK_TERRAIN] == "swamp" && mobility < 10 && mobility > 0) mobility = 5;
                if (lookObject.type == LOOK_TERRAIN && lookObject[LOOK_TERRAIN] == "plain" && mobility < 10 && mobility > 0) mobility = 1;
            });
        return mobility
        }
        
        function GoAroundObstacles(){
        var facing = creep.memory.facing;
        var directs = [DirMath(facing,7),DirMath(facing,1),DirMath(facing,6),DirMath(facing,2)];
        var rawmob = [];
        var bestmobility = 100;
        function best(mob){
        if (mob < bestmobility) bestmobility = mob;
        }
        directs.forEach((dir) => rawmob.push(TileMobility(dir)));
        rawmob.forEach((mob) => best(mob));
        var solution = directs[rawmob.indexOf(bestmobility)];
        //console.log(creep.name + " is trying to get unstuck! Trying to move : " + solution);
        //console.log("direction : " + solution + " was chosen because of its mobility score of :" + bestmobility);
        return Math.abs(solution);
        }
        
        function IsStuck(){
        return (CMemory.LastTickPos["x"] == creep.pos.x && CMemory.TickPos["x"] == creep.pos.x && CMemory.LastTickPos["y"] == creep.pos.y && CMemory.TickPos["y"] == creep.pos.y)
        }
        
        function IsOnPath(post){
        var match = Positions.find((pos) => pos[0] == post[0] && pos[1] == post[1] && pos[2] == post[2])
        return match != undefined
        }
        
        function IsNearStart(){
        return (creep.pos.getRangeTo(Startpos) <= 1)
        }
        
        function DetermineRoomChange(x1,y1,x2,y2,roomname){
        var letter1 = roomname.charAt(0);
        var roomname2 = roomname.slice(1);
        var letter2;
        var lookfor = ["N","E","S","W"];
        function test(char){
        if (roomname2.indexOf(char) > 0){
        letter2 = roomname2.charAt(roomname2.indexOf(char));
        }
        }
        lookfor.forEach((char) => test(char));
        var pos = roomname2.split(letter2);
        //console.log("Letter 1 is :" + letter1);
        //console.log("Letter 2 is :" + letter2);
        //console.log("X and Y are :" + pos.toString())
        if (x1 < x2) pos[0]++;
        else if (x1 > x2) pos[0]--;
        else if (y1 < y2) pos[1]++;
        else if (y1 > y2) pos[1]--;
        var NewRoomName = (letter1 + pos[0] + letter2 + pos[1]);
        console.log("Path moves from " + roomname + " to " + NewRoomName);
        return NewRoomName
        }
        
        function GetPosition(dir,Startroom,pair){
          var x1 = prevpos[0];
          var y1 = prevpos[1];
          var x2 = prevpos[0];
          var y2 = prevpos[1];
          var rooomName = prevpos[2];
          if (dir == 8) {x1--; y1--;} //left_up
          else if (dir == 1) {y1--;} //up
          else if (dir == 2) {x1++; y1--;} //up_right
          else if (dir == 3) {x1++;} //right
          else if (dir == 4) {x1++; y1++;} //right_down
          else if (dir == 5) {y1++;} //down
          else if (dir == 6) {x1--; y1++;} //down_left
          else if (dir == 7) {x1--;} //left
          if (x1 > 49 && y1 > 49) {x1 -= 49; y1 -= 49; pair++}
          else if (x1 > 49 && y1 < 0) {x1 -= 49; y1 += 49; pair++}
          else if (x1 < 0 && y1 > 49) {x1 += 49; y1 -= 49; pair++}
          else if (x1 < 0 && y1 < 0) {x1 += 49; y1 += 49; pair++}
          else if (x1 > 49) {x1 -= 49; pair++}
          else if (y1 > 49) {y1 -= 49; pair++}
          else if (x1 < 0) {x1 += 49; pair++}
          else if (y1 < 0) {x1 += 49; pair++}
          if (pair == 2) {rooomName = DetermineRoomChange(x1,y1,x2,y2,rooomName); pair = 0;}
          return [x1,y1,rooomName];
          }
          
        function dothis(dir,Startroom,pair){
          var post = GetPosition(dir,Startroom,pair);
          Positions.push(post);
          prevpos = post;
          }
        
        var Startroom = CMemory.startpos[2];
        var pair = 0;
        Directions.forEach((dir) => dothis(dir,Startroom,pair));
        Positions.push([CMemory.goalpos["x"], CMemory.goalpos["y"], CMemory.goalpos["roomName"]])
        if (!creep.memory.facing) creep.memory.facing = creep.pos.getDirectionTo(Goalpos);
        //Positions.forEach((pos) => console.log(pos));
        if (creep.memory.getunstuck > 1){
        creep.memory.getunstuck --;
        creep.say(GoAroundObstacles());
        creep.move(GoAroundObstacles());
        //creep.say("Detour!");
        }
        else if (IsStuck()){
        creep.say(GoAroundObstacles());    
        creep.move(GoAroundObstacles());
        //creep.say("GetUnStuck");
        creep.memory.getunstuck = 4;
        }
        else if (creep.memory.getunstuck == 1){
        creep.memory.getunstuck = 0;
        creep.memory.facing = creep.pos.getDirectionTo(Goalpos);
        creep.move(creep.memory.facing);
        creep.say("Made It?");
        }
        else if (IsOnPath(currentpos)){
        var lastmove = Positions.findIndex((post) => post[0] == currentpos[0] && currentpos[1] == post[1] && currentpos[2] == post[2]);
        var next = lastmove + 1;
        creep.memory.facing = Directions[next];
        creep.move(creep.memory.facing);
        creep.say("Next Step");
        }
        else if (creep.pos.isEqualTo(Startpos)){
        creep.memory.facing = Directions[0];
        creep.move(creep.memory.facing);
        creep.say("Begin Step");
        }
        else if (creep.pos.isNearTo(Startpos)){
        creep.memory.facing = creep.pos.getDirectionTo(Startpos);
        creep.move(creep.memory.facing);
        creep.say("Prep Step");
        }
        else {
        var point = FindClosestPointOnPath();
        creep.memory.facing = creep.pos.getDirectionTo(new RoomPosition(point[0],point[1],point[2]));
        creep.move(creep.memory.facing);
        creep.say("BackOnPath")
        }
        }
        
        function MoveTo(target,range){
        if (!range) range = 1;
        if (!CMemory.directions || CMemory.goalpos.x != target.x || CMemory.goalpos.y != target.y) Go.GoTo(creep,target,range);
        else if (creep.pos.getRangeTo(new RoomPosition(CMemory.goalpos["x"],CMemory.goalpos["y"],CMemory.goalpos["roomName"])) > CMemory.goalsize) FollowDirections();
        }
        
        if (!memroot) memroot = Home.memory.EXsources[srcid];
        if (creep.memory.building == null || creep.memory.building == undefined) creep.memory.building = false;
        var source = new RoomPosition(memroot.xpos, memroot.ypos, memroot.roomname);
        if (creep.memory.working == false){
        if (creep.pos.getRangeTo(source) > 16 && creep.memory.building == false || creep.room.name != memroot.roomname) {
            MoveTo(source);
        }
        else {
        var src = source.findInRange(FIND_SOURCES, 0)[0];
        var containersite = src.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
            filter: s => s.structureType == STRUCTURE_CONTAINER})[0];
        var container = src.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_CONTAINER})[0];
        if (!container && !containersite){
        creep.memory.working = true;
        }
        var fixfast = src.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_CONTAINER && (s.hits < s.hitsMax * 0.2)})[0];creep.pos.findInRange(FIND_STRUCTURES,2,{filter: (s) => s.hits < s.hitsMax && s.structureType == STRUCTURE_CONTAINER})[0];
        var structure = src.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_CONTAINER && s.hits < s.hitsMax})[0];creep.pos.findInRange(FIND_STRUCTURES,2,{filter: (s) => s.hits < s.hitsMax && s.structureType == STRUCTURE_CONTAINER})[0];
        var constructionSite = source.findInRange(FIND_CONSTRUCTION_SITES,1, {filter: (s) => s.structureType == STRUCTURE_CONTAINER})[0];
        var constructPath = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {filter: (s) => s.structureType == STRUCTURE_ROAD});
        var energyy = creep.pos.findInRange(FIND_DROPPED_ENERGY,2)[0];
        if (creep.carry.energy == creep.carryCapacity){
        if (fixfast && creep.memory.uilding == false){
        if (creep.repair(fixfast) == ERR_NOT_IN_RANGE) MoveTo(fixfast.pos,2);
        }
        else if (constructionSite){
        creep.memory.building == true;
        //creep.say("SRCrBuild");
        if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
        MoveTo(constructionSite.pos,2);
        }
        }
        else if (container && constructPath && creep.room.name != creep.memory.home){
        creep.memory.building = true;
        //creep.say("SRCrBuild");
        if (creep.build(constructPath) == ERR_NOT_IN_RANGE) {
        MoveTo(constructPath.pos,2);
        }
        }
        else if (creep.pos.isEqualTo(container.pos)){
        //creep.say("SRCrSource");
        if (structure) creep.repair(structure);
        else creep.transfer(container,RESOURCE_ENERGY);
        }
        else {MoveTo(container.pos,0)
        //creep.say("SRCrPrep");
        }
        }
        if (energyy){
        if (creep.pickup(energyy) == ERR_NOT_IN_RANGE) MoveTo(energyy.pos);
        else creep.pickup(energyy);
        }
        else if (creep.harvest(src) == ERR_NOT_IN_RANGE && creep.memory.building == false){
        MoveTo(source);
        //creep.say("SRCrMove!");
        }
        else if (creep.memory.building == true && creep.carry.energy == 0) {creep.memory.building = false;}
        else if (container && constructPath && creep.room.name != creep.memory.home){
        //creep.say("SRCrBuild");
        if (creep.build(constructPath) == ERR_NOT_IN_RANGE) {
        MoveTo(constructPath.pos);
        }
        }  
        }
        }
        else if (creep.memory.working == true){
            var src = source.findInRange(FIND_SOURCES, 2)[0];
            //console.log("Sourcer is placing container for its source");
            var containersite = src.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
            filter: s => s.structureType == STRUCTURE_CONTAINER})[0];
            var container = src.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_CONTAINER})[0];
            if (!container && !containersite) {
            MoveTo(source);
            if (creep.pos.findInRange(FIND_SOURCES,1)[0]) creep.room.createConstructionSite(creep.pos.x,creep.pos.y,STRUCTURE_CONTAINER);
            }
            else {
            console.log("Placed a container")
            creep.memory.working = false; 
            }
        }
    
        CMemory.LastTickPos = CMemory.TickPos;
        CMemory.TickPos = creep.pos;

        }
   }
};