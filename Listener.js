var Communications = require("Communications");
for (var a in Game.rooms){
var rooom = Game.rooms[a];
var kreeps = rooom.find(FIND_HOSTILE_CREEPS);
for (var b in kreeps){
var creep = kreeps[b];
Communications.CheckMessenger(creep);//Listening.
}
}
