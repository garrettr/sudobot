var Sudobot = require('./sudobot.js');

var Karma = require('./features/karma.js');

bot = new Sudobot('chat.freenode.net', 'sudobot', {
        channels: ['#sudobot']
});

bot.addFeature(Karma);
