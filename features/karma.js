/* Basic re to match IRC nicks */
var irc_nick_re = "([A-Za-z0-9\[\]\{\}\-\\\^\<]+)";

var Karma = function(client) {
  client.addListener('message', function (from, to, message) {
    console.log(from + ' => ' + to + ': ' + message);
  });
};

module.exports = Karma;
