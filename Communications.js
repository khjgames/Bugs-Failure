//For Co Op between allies using creep.say and creep.saying
var AllianceModule = require("AllianceModule");//allies list

function Defend(msg){
var room = DecodeMsg(msg);
console.log("An ally requested we send defensive creeps to :" + room);
}

function Explore(msg){
var room = DecodeMsg(msg);
console.log("An ally is sharing exploration information, such as enemy locations.etc :" + room);
}

function Attack(msg){
var room = DecodeMsg(msg);
console.log("An ally requested we send offensive creeps to :" + room);
}

function AllOutAttack(msg){
var room = DecodeMsg(msg);
console.log("An ally requested we send ALL Offensive creeps to :" + room);
}

function DecodeMsg(msg){
var decoding = msg.split("-");
var room = decoding[1]; //2nd index
return room
}

function ReadMsg(creep){
if (creep.saying != undefined){
console.log(creep.owner.username + "'s scout creep sent a message to : " + creep.room.name + "it read '" + creep.saying + "'.");
if (creep.saying.substr(0,2) == "D-")  Defend(creep.saying);
else if (creep.saying.substr(0,2) == "E-") Explore(creep.saying);
else if (creep.saying.substr(0,2) == "A-") Attack(creep.saying);
else if (creep.saying.substr(0,3) == "AA-") AllOutAttack(creep.saying);
}
}

module.exports = {
CheckMessenger : function(creep){
if (AllianceModule.run(creep.owner.username) == true && creep.hitsMax == 100){
//needs to be sent by a messenger / scout (1 move part aka 100 hits)
ReadMsg(creep); //Read message (if any)
}
}
};
