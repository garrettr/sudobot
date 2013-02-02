var irc = require('irc');

function Sudobot(server, nick, options) {
  this.server = server;
  this.nick = nick;
  this.options = options;

  this.client = new irc.Client(server, nick, options);

  this.features = []; 

  /* Help message */
  var client = this.client;
  var features = this.features;
  client.addListener('message', function(nick, to, text, message) {
    if(to == this.nick && text == "help") {
      var help_msg = "Hi! I'm sudobot, your friendly Sudo Room IRC chatbot.\n";
      help_msg += "I have been programmed with the following features:\n";
      for(var i=0; i < features.length; i++) {
        var feature = features[i];
        // TODO handle missing fields gracefully
        help_msg += "    - " + feature.name + " : " + feature.description + "\n";
        if(feature.commands) {
          for(command in feature.commands) {
            help_msg += "        " + command + " : " + feature.commands[command] + "\n";
          }
        }
      }
      client.say(nick, help_msg);
    }
  });

  /* Advertise help message on joining the channel */
  client.addListener('join', function(channel, nick, message) {
    if(nick == this.nick) {
      // Say hi and advertise help functionality
      client.say(channel, "Hi! I'm sudobot, your friendly Sudo Room IRC chatbot. You can learn more about me by typing '/msg sudobot help'.");
    }
  });


  /* Log any errors from IRC - try to keep running */
  client.addListener('error', function(message) {
    console.log('error: ', message);
  });
}

Sudobot.prototype.addFeature = function(feature) {
  this.features.push(feature(this.client));
}

module.exports = Sudobot;
