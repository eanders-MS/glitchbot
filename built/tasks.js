"use strict";
var builder = require('botbuilder');
var http = require('http');
var https = require('https');
var url = require('url');
var glitcher = require('./glitcher');
var utils = require('./utils');
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
        "**showme** - Just show me a picture!" +
        "\n\nI can only glitch JPG images right now. I'm still learning other image formats!");
    showMeTask(session);
}
exports.helpTask = helpTask;
function againTask(session) {
    var contentUrl = session.userData.contentUrl;
    if (contentUrl) {
        session.userData.params = undefined;
        glitchTask(contentUrl, session);
    }
    else {
        session.send("Upload an image first.");
    }
}
exports.againTask = againTask;
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
function showMeTask(session) {
    var images = [
        'http://johnmcdonald.net.au/wp-content/uploads/2014/11/22544_CLOSE.jpg',
        'http://portra.wpshower.com/wp-content/uploads/2014/03/martin-schoeller-clint-eastwood-portrait-up-close-and-personal.jpg',
        'http://static1.squarespace.com/static/54ad3f73e4b0114202826a72/54bd4aa8e4b013117e10708f/54bd4ad0e4b07b4a7d21ae84/1436142186094/PariDukovicPortraits_01.jpg',
        'http://a4.files.biography.com/image/upload/c_fit,cs_srgb,dpr_1.0,h_1200,q_80,w_1200/MTIwNjA4NjMzODg2NTc0MDky.jpg',
        'http://a4.files.biography.com/image/upload/c_fit,cs_srgb,dpr_1.0,h_1200,q_80,w_1200/MTE1ODA0OTcxMjc3MzIxNzQx.jpg',
        'https://s-media-cache-ak0.pinimg.com/736x/31/16/93/311693428ecf431808a55e483a293d79.jpg'
    ];
    var index = Math.floor(Math.random() * images.length);
    glitchTask(images[index], session);
}
exports.showMeTask = showMeTask;
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
                    seed: utils.makeSeed(8),
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