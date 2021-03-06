var minor = require('./minor.js');
var memory = require('./memoryarcana.js');
var major = require('./major.js');
var action = require('./action.js');



var common = function(channel) {
    if (channel.c === null) {
        var toAdd = {
            card: [],
            graveyard: []
        };
        minor.shaffle(toAdd);
        channel.c = toAdd;
    }
    return channel.c;
}
var tarot = function(channel) {
    if (channel.t === null) {
        var toAdd = {
            card: [],
            graveyard: []
        };
        major.shaffle(toAdd);
        channel.t = toAdd;
    }
    return channel.t;
}
// take the position of the player deck
var deckPosition = function(playerName, channel) {
    var position = channel.decks.length;
    for (var x = 0; x < channel.decks.length; x++) {
        if (channel.decks[x].player === playerName) {
            position = x
        }
    }
    //if there isn't a deck it will create one
    if (position === channel.decks.length) {
        var toAdd = {
            card: [],
            hand: [],
            graveyard: [],
            player: playerName
        };
        minor.shaffle(toAdd);
        channel.decks.push(toAdd);
    }
    return position;
}

var deck = function(playerName, channel) {
    return channel.decks[deckPosition(playerName, channel)];
}
// reset all the deck
var reset = function(channel) {
    channel.decks = [];
}

var init = function(playerName, channel) {
    //todo controll the player name
    var position = deckPosition(playerName, channel);
    if (position === (channel.decks.length - 1)) {
        // if is the first time it will shaffle two time
        //todo better code
        var toAdd = {
            card: [],
            hand: [],
            graveyard: [],
            player: playerName
        };
        minor.shaffle(toAdd);
        channel.decks[position] = toAdd;
    }
}

module.exports = {
    commandDecks: function(userID, channelID, message, transport) {
        var respond = {
            who: userID,
            what: 'Il futuro tace',
            where: channelID
        }

        var channel = memory.getChannel(channelID);
        var args = message.substring(1).split(' ');
        if (args.length >= 2) {
            var cmd = args[1];

            switch (cmd) {
                case 'pesca':
                    if (args.length === 3) {
                        respond.what = 'Peschi in ordine:\n' + action.drawCard(deck(userID, channel), args[2]);
                    } else {
                        respond.what = 'Command wrong: dichiara quante carte vuoi pescare dal tuo deck es /d pesca 52';
                    }
                    break;
                case 'comincia':
                    if (args.length === 2) {
                        init(userID, channel);
                        respond.what = 'Mescolato';
                    } else {
                        respond.what = 'Command wrong: dichiara di ricominciare il tuo mazzo es /d comincia';
                    }
                    break;
                case 'mescola':
                    if (args.length === 2) {
                        action.rando(deck(userID, channel));
                        respond.what = 'Mescolato';
                    } else {
                        respond.what = 'Command wrong: dichiara di mescolare il tuo mazzo es /d mescola';
                    }
                    break;
                case 'rivela':
                    if (args.length === 3) {
                        respond.what = 'Le prossime carte in ordine sono:\n' + action.reveal(deck(userID, channel), args[2]);
                    } else {
                        respond.what = 'Command wrong:dichiara quante carte vuoi rivelare dalla cima del mazzo es /d rivela 52';
                    }
                    break;
                case 'scarti':
                    if (args.length === 2) {
                        respond.what = 'Il carte pescate sono:\n' + action.graveyard(deck(userID, channel));
                    } else {
                        respond.what = 'Command wrong: dichiara di accedere al mazzo delle carte pescate es /d scarti';
                    }
                    break;
                case 'cima':
                    if (args.length === 3) {
                        action.top(deck(userID, channel), args[2]);
                        respond.what = 'Rimescolate nel mazzo';
                    } else {
                        respond.what = 'Command wrong: dichiara di mettere in cima dagli scarti delle carte con un numero es /d cima k';
                    }
                    break;
                case 'rimetti':
                    if (args.length === 3) {
                        action.place(deck(userID, channel), args[2]);
                        respond.what = 'Rimescolate nel mazzo';
                    } else {
                        respond.what = 'Command wrong: dichiara di mescolare nel mazzo dagli scarti delle carte con un numero es /d rimetti k';
                    }
                    break;
                case 'resetta':
                    if (args.length === 2) {
                        major.shaffle(tarot(channel));
                        minor.shaffle(common(channel));
                        reset(channel);
                        respond.what = 'resettato tutti i mazzi!';
                    } else {
                        respond.what = 'Command wrong: dichiara resetta es /d reset';
                    }
                    break;
                case 'aiuto':
                    respond.what = 'digita /d per il tuo mazzo francese , /t per il mazzo condiviso dei tarocchi o /c per il mazzo condiviso francese\n' +
                        'seguito da uno dei seguenti comandi:\n' +
                        '/d pesca seguito dal numero di carte da pescare \n' +
                        '/d comincia per rimescolare il mazzo con gli scarti\n' +
                        '/d mescola per mescolare il mazzo\n' +
                        '/d rivela seguito dal numero di carte da rivelare dalla cima del mazzo \n' +
                        '/d scarti per vedere le carte pescate\n' +
                        '/d cima per mettere in cima al mazzo delle carte dagli scarti (con quel numero)\n' +
                        '/d rimetti per mettere nel mazzo delle carte dagli scarti (con quel numero)\n' +
                        '/d aiuto per rivedere questa pappardella\n';
                    break;
                default:
                    respond.what = 'digita /d aiuto';
                    break;
            }
        } else {
            respond.what = 'digita /d aiuto';
        }
        if (channel.decks.length >= 10) {
            respond.what = respond.what + '\nTroppo mazzi per un cartomante! Quando finisci la partita lancia un: /d resetta\nResettarai tutti i mazzi del canale';
        }
        memory.setChannel(channel.id, channel);
        transport.reply('\n' + respond.what);
    },
    commandCommon: function(userID, channelID, message, transport) {
        var respond = {
            who: userID,
            what: 'Il futuro tace',
            where: channelID
        }

        var channel = memory.getChannel(channelID);
        var args = message.substring(1).split(' ');
        if (args.length >= 2) {
            var cmd = args[1];

            switch (cmd) {
                case 'pesca':
                    if (args.length === 3) {
                        respond.what = 'Peschi in ordine:\n' + action.drawCard(common(channel), args[2]);
                    } else {
                        respond.what = 'Command wrong: dichiara quante carte vuoi pescare dal tuo deck es /c pesca 52';
                    }
                    break;
                case 'comincia':
                    if (args.length === 2) {
                        minor.shaffle(common(channel))
                        respond.what = 'Mescolato';
                    } else {
                        respond.what = 'Command wrong: dichiara di ricominciare il tuo mazzo es /c comincia';
                    }
                    break;
                case 'mescola':
                    if (args.length === 2) {
                        action.rando(common(channel));
                        respond.what = 'Mescolato';
                    } else {
                        respond.what = 'Command wrong: dichiara di mescolare il tuo mazzo es /c mescola';
                    }
                    break;
                case 'resetta':
                    if (args.length === 2) {
                        major.shaffle(tarot(channel));
                        minor.shaffle(common(channel));
                        reset(channel);
                        respond.what = 'resettato tutti i mazzi!';
                    } else {
                        respond.what = 'Command wrong: dichiara resetta es /d reset';
                    }
                    break;
                case 'rivela':
                    if (args.length === 3) {
                        respond.what = 'Le prossime carte in ordine sono:\n' + action.reveal(common(channel), args[2]);
                    } else {
                        respond.what = 'Command wrong:dichiara quante carte vuoi rivelare dalla cima del mazzo es /c rivela 52';
                    }
                    break;
                case 'scarti':
                    if (args.length === 3) {
                        respond.what = 'Il carte pescate sono:\n' + action.graveyard(common(channel));
                    } else {
                        respond.what = 'Command wrong: dichiara di accedere al mazzo delle carte pescate es /c scarti';
                    }
                    break;
                case 'cima':
                    if (args.length === 3) {
                        action.top(common(channel), args[2]);
                        respond.what = 'Rimescolate nel mazzo';
                    } else {
                        respond.what = 'Command wrong: dichiara di mettere in cima dagli scarti delle carte con un numero es /c cima k';
                    }
                    break;
                case 'rimetti':
                    if (args.length === 3) {
                        action.place(common(channel), args[2]);
                        respond.what = 'Rimescolate nel mazzo';
                    } else {
                        respond.what = 'Command wrong: dichiara di mescolare nel mazzo dagli scarti delle carte con un numero es /c rimetti k';
                    }
                    break;
                case 'aiuto':
                    respond.what = 'digita /d per il tuo mazzo francese , /t per il mazzo condiviso dei tarocchi o /c per il mazzo condiviso francese\n' +
                        'seguito da uno dei seguenti comandi:\n' +
                        '/c pesca seguito dal numero di carte da pescare \n' +
                        '/c comincia per rimescolare il mazzo con gli scarti\n' +
                        '/c mescola per mescolare il mazzo\n' +
                        '/c rivela seguito dal numero di carte da rivelare dalla cima del mazzo \n' +
                        '/c scarti per vedere le carte pescate\n' +
                        '/c cima per mettere in cima al mazzo delle carte dagli scarti (con quel numero)\n' +
                        '/c rimetti per mettere nel mazzo delle carte dagli scarti (con quel numero)\n' +
                        '/c aiuto per rivedere questa pappardella\n';
                    break;
                default:
                    respond.what = 'digita /c aiuto';
                    break;
            }
        } else {
            respond.what = 'digita /c aiuto';
        }
        memory.setChannel(channel.id, channel);
        transport.reply('\n' + respond.what);

    },
    commandTarot: function(userID, channelID, message, transport) {
        var respond = {
            who: userID,
            what: 'Il futuro tace',
            where: channelID
        }

        var channel = memory.getChannel(channelID);
        var args = message.substring(1).split(' ');
        if (args.length >= 2) {
            var cmd = args[1];

            switch (cmd) {
                case 'pesca':
                    if (args.length === 3) {
                        respond.what = 'Peschi in ordine:\n' + action.drawCard(tarot(channel), args[2]);
                    } else {
                        respond.what = 'Command wrong: dichiara quante carte vuoi pescare dal tuo deck es /t pesca 22';
                    }
                    break;
                case 'comincia':
                    if (args.length === 2) {
                        major.shaffle(tarot(channel))
                        respond.what = 'Mescolato';
                    } else {
                        respond.what = 'Command wrong: dichiara di ricominciare il tuo mazzo es /t comincia';
                    }
                    break;
                case 'mescola':
                    if (args.length === 2) {
                        action.rando(tarot(channel));
                        respond.what = 'Mescolato';
                    } else {
                        respond.what = 'Command wrong: dichiara di mescolare il tuo mazzo es /c mescola';
                    }
                    break;
                case 'rivela':
                    if (args.length === 3) {
                        respond.what = 'Le prossime carte in ordine sono:\n' + action.reveal(tarot(channel), args[2]);
                    } else {
                        respond.what = 'Command wrong:dichiara quante carte vuoi rivelare dalla cima del mazzo es /t rivela 22';
                    }
                    break;
                case 'resetta':
                    if (args.length === 2) {
                        major.shaffle(tarot(channel));
                        minor.shaffle(common(channel));
                        reset(channel);
                        respond.what = 'resettato tutti i mazzi!';
                    } else {
                        respond.what = 'Command wrong: dichiara resetta es /d reset';
                    }
                    break;
                case 'scarti':
                    if (args.length === 3) {
                        respond.what = 'Il carte pescate sono:\n' + action.graveyard(tarot(channel));
                    } else {
                        respond.what = 'Command wrong: dichiara di accedere al mazzo delle carte pescate es /t scarti';
                    }
                    break;
                
                case 'cima':
                    if (args.length === 3) {
                        action.top(tarot(channel), args[2]);
                        respond.what = 'Rimescolate nel mazzo';
                    } else {
                        respond.what = 'Command wrong: dichiara di mettere in cima dagli scarti delle carte con un numero es /t cima k';
                    }
                    break;
                case 'rimetti':
                    if (args.length === 3) {
                        action.place(tarot(channel), args[2]);
                        respond.what = 'Rimescolate nel mazzo';
                    } else {
                        respond.what = 'Command wrong: dichiara di mescolare nel mazzo dagli scarti delle carte con un numero es /t rimetti k';
                    }
                    break;
                case 'aiuto':
                    respond.what = 'digita /d per il tuo mazzo francese , /t per il mazzo condiviso dei tarocchi o /c per il mazzo condiviso francese\n' +
                        'seguito da uno dei seguenti comandi:\n' +
                        '/t pesca seguito dal numero di carte da pescare \n' +
                        '/t comincia per rimescolare il mazzo con gli scarti\n' +
                        '/t mescola per mescolare il mazzo\n' +
                        '/t rivela seguito dal numero di carte da rivelare dalla cima del mazzo \n' +
                        '/t scarti per vedere le carte pescate\n' +
                        '/t cima per mettere in cima al mazzo delle carte dagli scarti (con quel numero)\n' +
                        '/t rimetti per mettere nel mazzo delle carte dagli scarti (con quel numero)\n' +
                        '/t aiuto per rivedere questa pappardella\n';
                    break;
                default:
                    respond.what = 'digita /t aiuto';
                    break;
            }
        } else {
            respond.what = 'digita /t aiuto';
        }
        memory.setChannel(channel.id, channel);
        transport.reply('\n' + respond.what);
    }
};