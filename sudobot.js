BOT_CHANNEL = '#sudobot'
BOT_NAME    = 'Sudobot1'

/* Object to store persistent state maintained by sudobot */
/* Idea for storing state - callback on process.exit (?) */
var sudo_state = {
    karma_scores: {},
    open_flag: false,
    opener: undefined,
    opened: undefined,
    open_times: []
};

var irc = require('irc');
var client = new irc.Client('chat.freenode.net', BOT_NAME, {
    channels: [BOT_CHANNEL],
});

client.addListener('message', function(from, to, message) {

	if(message.indexOf('yarr') > -1) {
		client.say(to, 'Arrr Matey!');
	}
});

client.addListener('message', function(from, to, message) {
    
    if(message.indexOf('<3') > -1) {
        client.say(to, '<3');
    }
});

client.addListener('message', function(from, to, message) {
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
client.addListener('message', function(from, to, message) {
    var karma_query_re = new RegExp("karma " + irc_nick_re.source);
    query_match = karma_query_re.exec(message);

    if( query_match ) {
        username = query_match[1];
        if(username in sudo_state.karma_scores) {
            client.say(BOT_CHANNEL, username + " has " + sudo_state.karma_scores[username] + " karma.");
        } else {
            client.say(BOT_CHANNEL, username + " has no karma score.");
        }
    }
});

/* Increment a user's karma score */
client.addListener('message', function(from, to, message) {
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
client.addListener('message', function(from, to, message) {
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

client.addListener('message', function(from, to, message) {
    open_cmds = [
        "sudo open",
        "open!"
    ];

    if(string_in_list(message, open_cmds)) {
        if( sudo_state.open_flag == false ) {
            sudo_state.open_flag = true;
            sudo_state.opener = from;
            opened = new Date(); // defaults to now
            client.say(BOT_CHANNEL, "sudoroom is open!");
        } else {
            client.say(BOT_CHANNEL, "sudoroom is already open. If this is a mistake, please close and re-open so I can keep track of our open times.");
        }
    }
});

client.addListener('message', function(from, to, message) {
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

            client.say(BOT_CHANNEL, "sudoroom is closed.");
        } else {
            client.say(BOT_CHANNEL, "sudoroom was already closed.");
        }
    }
});

client.addListener('message', function(from, to, message) {
    if(message == "open?") {
        if( sudo_state.open_flag == true ) {
            client.say(BOT_CHANNEL, "sudoroom is open! (thanks, " + sudo_state.opener + ")" );
        } else {
            client.say(BOT_CHANNEL, "sudoroom is closed right now." );
        }
    }
});
