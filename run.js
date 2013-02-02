var Sudobot = require('./sudobot.js');

var Karma = require('./features/karma.js');
var Room = require('./features/room.js');

bot = new Sudobot('chat.freenode.net', 'sudobot', {
        channels: ['#sudobot']
});

bot.addFeature(Karma);
bot.addFeature(Room);
