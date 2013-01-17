/* Object to store persistent state maintained by sudobot */
/* Idea for storing state - callback on process.exit (?) */
var sudo_state = {
    karma_scores: {},
    open_flag: false,
    opener: undefined,
    opened: undefined,
    open_times: []
};

SUDOBOT_STATE_FILE = "sudobot-state.json"

var fs = require('fs');

/* Do state read/writes synchronously. This is not necessary for when we load
 * the state, but it *is* for when we write it on exit */

var load_sudobot_state = function() {
    if(fs.existsSync(SUDOBOT_STATE_FILE)) {
        console.log("Found state file, loading state from file.");
        data = fs.readFileSync(SUDOBOT_STATE_FILE);
        sudo_state = JSON.parse(data);
    } else {
        console.log("No state file found, starting with default state.");
    }
};

load_sudobot_state();

var save_sudobot_state = function() {
    fs.writeFileSync(
        SUDOBOT_STATE_FILE,
        JSON.stringify(sudo_state) // TODO: error handling?
    );
};

var teardown_sudobot = function(save_state) {
    if(save_state) {
        console.log('Saving state to file...');
        save_sudobot_state();
    }
    console.log('Goodbye!');
    process.exit(0);
};

process.on('SIGINT', function() {
    teardown_sudobot(true);
});

var irc = require('irc');

var client = new irc.Client('chat.freenode.net', 'sudobot', {
    channels: ['#sudobot']
    //debug:true
});

/* keep track of transient state - for now, just lists of nicks so we can do
 * sanity checks */
var transient_state = {
    channels: {}
};

client.addListener('names', function(channel, nicks) {
    // Initialize a transient state object for this channel if needed
    if( !(channel in transient_state.channels) ) {
        transient_state.channels[channel] = {};
    }
    // The nicks object passed to the callback is keyed by nick names, and has
    // values ‘’, ‘+’, or ‘@’ depending on the level of that nick in the
    // channel.
    transient_state.channels[channel].nicks = nicks;
});

client.addListener('message#', function(from, to, message) {

	if(message.indexOf('yarr') > -1) {
		client.say(to, 'Arrr Matey!');
	}
});

client.addListener('message#', function(from, to, message) {
    
    if(message.indexOf('<3') > -1) {
        client.say(to, '<3');
    }
});

client.addListener('message#', function(from, to, message) {
    if(message == 'randomize') {
        client.say(to, Math.round(Math.random() * 10));
    }
});

/* add super basic error listener to avoid sudobot fatal stack trace */
client.addListener('error', function(message) {
    console.log('error: ', message);
});

/* Basic re to match IRC nicks */
var irc_nick_re = /([A-Za-z0-9\[\]\{\}\-\\\^\<]+)/;

/* Request a user's karma score */
client.addListener('message#', function(from, to, message) {
    var karma_query_re = new RegExp("karma " + irc_nick_re.source);
    query_match = karma_query_re.exec(message);

    if( query_match ) {
        username = query_match[1];
        if(username in sudo_state.karma_scores) {
            client.say(to, username + " has " + sudo_state.karma_scores[username] + " karma.");
        } else {
            client.say(to, username + " has no karma score.");
        }
    }
});

/* Increment a user's karma score */
client.addListener('message#', function(from, to, message) {
    var karma_inc_re = new RegExp(irc_nick_re.source + "\\+\\+");
    inc_match = karma_inc_re.exec(message);

    if( inc_match ) {
        username = inc_match[1];

        if(username in sudo_state.karma_scores) {
            sudo_state.karma_scores[username]++;
        } else {
            /* need to instantiate karma score for user */
            sudo_state.karma_scores[username] = 1;
        }
    }
});

/* Decrement a user's karma score */
client.addListener('message#', function(from, to, message) {
    var karma_inc_re = new RegExp(irc_nick_re.source + "\\-\\-");
    dec_match = karma_inc_re.exec(message);

    if( dec_match ) {
        username = dec_match[1];

        if(username in sudo_state.karma_scores) {
            sudo_state.karma_scores[username]--;
        } else {
            /* need to instantiate karma score for user */
            sudo_state.karma_scores[username] = -1;
        }
    }
});

var string_in_list = function(string, list) {
    for(var i = 0; i < list.length; i++) {
        if(list[i] == string) {
            return true;
        }
    }
    return false;
};

client.addListener('message#', function(from, to, message) {
    open_cmds = [
        "sudo open",
        "open!"
    ];

    if(string_in_list(message, open_cmds)) {
        if( sudo_state.open_flag == false ) {
            sudo_state.open_flag = true;
            sudo_state.opener = from;
            sudo_state.opened = new Date();
            client.say(to, "sudoroom is open!");
        } else {
            client.say(to, "sudoroom is already open. If this is a mistake, please close and re-open so I can keep track of our open times.");
        }
    }
});

client.addListener('message#', function(from, to, message) {
    close_cmds = [
        "sudo close",
        "closed!"
    ];
    
    if(string_in_list(message, close_cmds)) {
        if( sudo_state.open_flag == true ) {
            /* save metadata */
            sudo_state.open_times.push({
                'start': sudo_state.opened,
                'stop': new Date(),
                'opener': sudo_state.opener,
            });

            /* reset flags */
            sudo_state.open_flag = false;
            sudo_state.opened = undefined;
            sudo_state.opener = undefined;

            client.say(to, "sudoroom is closed.");
        } else {
            client.say(to, "sudoroom was already closed.");
        }
    }
});

client.addListener('message#', function(from, to, message) {
    if(message == "open?") {
        if( sudo_state.open_flag == true ) {
            client.say(to, "sudoroom is open! (thanks, " + sudo_state.opener + ")" );
        } else {
            client.say(to, "sudoroom is closed right now." );
        }
    }
});
