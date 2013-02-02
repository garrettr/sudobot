var irc = require('irc');

function Sudobot(server, nick, options) {
  this.server = server;
  this.nick = nick;
  this.options = options;

  this.client = new irc.Client(server, nick, options);

  this.features = []; 
}

Sudobot.prototype.addFeature = function(feature) {
  this.features.push(feature(this.client));
}

module.exports = Sudobot;
