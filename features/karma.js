/* Basic re to match IRC nicks */
var irc_nick_re = "([A-Za-z0-9]+)";

var Karma = function(client) {
  var karma_scores = {};

  client.addListener('message#', function(nick, to, text) {
    get_karma_re = new RegExp('^karma ' + irc_nick_re + '$');
    var match = get_karma_re.exec(text);
    if(match) {
      nick = match[1];
      if(nick in karma_scores) {
        response = nick + " has " + karma_scores[nick] + " karma.";
      } else {
        response = nick + " has no karma.";
      }
      client.say(to, response);
    }
  });

  client.addListener('message#', function(nick, to, text) {
    inc_karma_re = new RegExp('^' + irc_nick_re + '\\+\\+$');
    var match = inc_karma_re.exec(text);
    if(match) {
      nick = match[1];
      (nick in karma_scores) ? karma_scores[nick]++ : karma_scores[nick] = 1;
    }
  });

  client.addListener('message#', function(nick, to, text) {
    dec_karma_re = new RegExp('^' + irc_nick_re + '\\-\\-$');
    var match = dec_karma_re.exec(text);
    if(match) {
      nick = match[1];
      (nick in karma_scores) ? karma_scores[nick]-- : karma_scores[nick] = -1;
    }
  });

  return {
    name: "karma",
    description: "Internet points",
    commands: {
      'karma <username>': "Get a user's karma score",
      '<username>++': "Increment a user's karma score",
      '<username>--': "Decrement a user's karma score"
    }
  }
};

module.exports = Karma;
