"use strict";
var builder = require('botbuilder');
var http = require('http');
var https = require('https');
var url = require('url');
var glitcher = require('./glitcher');
function goodbyeTask(session) {
    session.send("See you later.");
}
exports.goodbyeTask = goodbyeTask;
function helpTask(prefix, session) {
    prefix = prefix.trim();
    if (prefix.length)
        prefix = prefix + " ";
    session.send((prefix + "Upload an image and I will glitch it, or paste a URL. Once I have your image, I can:\n\n") +
        "**again** - Re-glitch with new parameters.\n\n" +
        "**seed** _anything_ - Seed the random number generator.\n\n" +
        "**amount** _number in 0..1024_ - Change the amount of corruption.\n\n" +
        "\n\nI can only glitch JPG images right now. I'm still learning other image formats!");
}
exports.helpTask = helpTask;
function randomizeTask(session) {
    var contentUrl = session.userData.contentUrl;
    if (contentUrl) {
        session.userData.params = undefined;
        glitchTask(contentUrl, session);
    }
    else {
        session.send("Upload an image first.");
    }
}
exports.randomizeTask = randomizeTask;
function paramTask(name, session, args) {
    var contentUrl = session.userData.contentUrl;
    var params = session.userData.params;
    if (contentUrl && params) {
        var value = args.matches[1];
        session.userData.params[name] = value;
        glitchTask(contentUrl, session);
    }
    else {
        session.send("Upload an image first.");
    }
}
exports.paramTask = paramTask;
function glitchTask(contentUrl, session) {
    console.log("glitching " + contentUrl);
    var parsedUrl = url.parse(contentUrl);
    var protocol = (parsedUrl.protocol == 'https:' ? https : http);
    var request = protocol.get(contentUrl, function (response) {
        var jpgBytes = new Uint8Array(0);
        response.on('data', function (chunk) {
            var buffer = new Uint8Array(jpgBytes.length + chunk.length);
            buffer.set(jpgBytes, 0);
            buffer.set(chunk, jpgBytes.length);
            jpgBytes = buffer;
        });
        response.on('end', function () {
            try {
                var params = session.userData.params || {
                    seed: Date.now(),
                    amount: parseInt("" + (1 + Math.random() * 79)),
                };
                params = glitcher.validateParams(params);
                glitcher.glitchJpg(jpgBytes, params);
                var encoder = new Buffer(jpgBytes);
                var encoded = encoder.toString('base64');
                var message = new builder.Message();
                message.addAttachment({
                    contentType: "image/jpeg",
                    content: encoded
                });
                message.setText(session, ("**seed**: " + params.seed + "\n\n") +
                    ("**amount**: " + params.amount + "\n\n"));
                session.userData.contentUrl = contentUrl;
                session.userData.params = params;
                session.send(message);
            }
            catch (e) {
                console.error(e);
                session.send("I failed to glitch that image, sorry!");
            }
        });
    });
}
exports.glitchTask = glitchTask;
//# sourceMappingURL=tasks.js.map