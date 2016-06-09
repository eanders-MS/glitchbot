"use strict";
var builder = require('botbuilder');
var tasks = require('./tasks');
function install(bot) {
    bot.add('/', new builder.CommandDialog()
        .matches('^help', function (session, args) {
        tasks.helpTask("", session);
    })
        .matches('^hi', function (session, args) {
        tasks.helpTask("Hi!", session);
    })
        .matches('^hello', function (session, args) {
        tasks.helpTask("Hi!", session);
    })
        .matches('^howdy', function (session, args) {
        tasks.helpTask("Hi!", session);
    })
        .matches('^bye', function (session, args) {
        tasks.goodbyeTask(session);
    })
        .matches('^goodbye', function (session, args) {
        tasks.goodbyeTask(session);
    })
        .matches('^again', function (session, args) {
        tasks.randomizeTask(session);
    })
        .matches('^randomize', function (session, args) {
        tasks.randomizeTask(session);
    })
        .matches('^seed\\s+(\\d+)', function (session, args) {
        tasks.paramTask("seed", session, args);
    })
        .matches('^amount\\s+(\\d+)', function (session, args) {
        tasks.paramTask("amount", session, args);
    })
        .matches('^http:', function (session, args) {
        session.userData = {};
        tasks.glitchTask(session.message.text, session);
    })
        .matches('^https:', function (session, args) {
        session.userData = {};
        tasks.glitchTask(session.message.text, session);
    })
        .onDefault(function (session) {
        if (session.message.attachments && session.message.attachments.length) {
            session.userData = {};
            var attachment = session.message.attachments[0];
            tasks.glitchTask(attachment.contentUrl, session);
        }
        else {
            tasks.helpTask("I didn't understand that.", session);
        }
    }));
}
exports.install = install;
//# sourceMappingURL=commands.js.map