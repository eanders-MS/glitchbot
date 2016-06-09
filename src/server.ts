import restify = require('restify');
import builder = require('botbuilder');
import commands = require('./commands');

//----------------------------------------------------------------------------

// Get secrets from server environment
var botConnectorOptions = {
    appId: process.env.BOTFRAMEWORK_APPID,
    appSecret: process.env.BOTFRAMEWORK_APPSECRET,
    minSendDelay: 5
};

// Create bot
var bot = new builder.BotConnectorBot(botConnectorOptions);

//----------------------------------------------------------------------------

// Install dialog
commands.install(bot);

//----------------------------------------------------------------------------

// Setup listening socket
var server = restify.createServer();

server.listen(process.env.port || 2134, function () {
    console.log(`${server.name} listening on ${server.url}`);
});

// Add route for Bot Framework messages
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
