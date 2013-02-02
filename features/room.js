/*
 * Keep track of whether Sudo Room is physically open or not
 */

var Room = function(client) {
  var is_open = false;
  var open_history = [];

  /* Open the room */
  client.addListener('message#', function(nick, to, text) {
    open_re = new RegExp('^open!$');
    var match = open_re.exec(text);
    if(match) {
      if(is_open) {
        response = "sudoroom is already open...";
      } else {
        response = "sudoroom is open (thanks, " + nick + "!)";
        is_open = true;
        /* Save metadata */
        open_history.push({
          open_timestamp: new Date(),
          closed_timestamp: undefined,
          opened_by: nick,
          closed_by: undefined
        });
      }
      client.say(to, response);
    }
  });

  /* Close the room */
  client.addListener('message#', function(nick, to, text) {
    close_re = new RegExp('^close!$');
    var match = close_re.exec(text);
    if(match) {
      if(is_open) {
        response = "sudoroom is closed (thanks, " + nick + "!)";
        is_open = false;
        /* Update history */
        var last_opened_obj = open_history.pop();
        last_opened_obj.closed_timestamp = new Date();
        last_opened_obj.closed_by = nick;
        open_history.push(last_opened_obj);
      } else {
        response = "sudoroom is already closed."
      }
      client.say(to, response);
    }
  });

  /* Query the room's state */
  client.addListener('message#', function(nick, to, text) {
    open_query_re = new RegExp('^open\\?$');
    var match = open_query_re.exec(text);
    if(match) {
      if(is_open) {
        response = "sudoroom is open!";
      } else {
        response = "sudoroom is closed.";
      }
      client.say(to, response);
    }
  });
};

module.exports = Room;
