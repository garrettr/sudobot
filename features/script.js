/*
 * Allow re-programming the bot on the fly
 * TODO: Persist the scripts
 */

var Script = function(client) {
  var scripts = {};
  
  client.addListener('message', function(nick, to, text) {
	args = text.split(" ");
	cmd = args[0]

	// 'chan' points at user if it was a pm, else the public channel
	chan = nick
    if ( to.match(/^[#&]/) ) 
	  chan = to

	// re/defining a script
	if(cmd == "script!") {
	  result = text.match(/script! ([^ ]*) (.*)/);
	  if(!result) {
		client.say(chan, "invalid command");
		return;
	  }
	  script_name = result[1];
	  script_txt = result[2];
	  script_txt = "ff=function() {"+script_txt+"}";
	  scripts[script_name] = eval(script_txt);
	}

	// executing a script
	if(scripts[cmd])
	  scripts[cmd]();
  });

  return {
    name: "script",
    description: "Add commands on the fly",
    commands: {
      'script!': 'Add a new script. Eg: script! hello client.say(chan, "Greetings "+nick)'
    }
  };
};

module.exports = Script;
