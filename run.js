var Sudobot = require('./sudobot.js');

var Karma = require('./features/karma.js');
var Room = require('./features/room.js');
var Script = require('./features/script.js');

bot = new Sudobot('chat.freenode.net', 'sudobot', {
        channels: ['#sudobot']
});

bot.addFeature(Karma);
bot.addFeature(Room);
bot.addFeature(Script);
