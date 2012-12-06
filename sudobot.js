var irc = require('irc');
var client = new irc.Client('chat.freenode.net', 'Sudobot1', {
    channels: ['#sudobot'],
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
karma_list = {}

/* Request a user's karma score */
client.addListener('message', function(from, to, message) {
    var karma_query_re = new RegExp("karma " + irc_nick_re.source);
    query_match = karma_query_re.exec(message);

    if( query_match ) {
        username = query_match[1];
        if(username in karma_list) {
            console.log(username + " has " + karma_list[username] + " karma.");
        } else {
            console.log(username + " has no karma score.");
        }
    }
});

/* Increment a user's karma score */
client.addListener('message', function(from, to, message) {
    var karma_inc_re = new RegExp(irc_nick_re.source + "\\+\\+");
    inc_match = karma_inc_re.exec(message);

    if( inc_match ) {
        username = inc_match[1];

        console.log("inc match");

        if(username in karma_list) {
            karma_list[username]++;
        } else {
            /* need to instantiate karma score for user */
            karma_list[username] = 1;
        }
    }
});

/* Decrement a user's karma score */
client.addListener('message', function(from, to, message) {
    var karma_inc_re = new RegExp(irc_nick_re.source + "\\-\\-");
    dec_match = karma_inc_re.exec(message);

    if( dec_match ) {
        username = dec_match[1];

        console.log("dec match");

        if(username in karma_list) {
            karma_list[username]--;
        } else {
            /* need to instantiate karma score for user */
            karma_list[username] = -1;
        }
    }
});
