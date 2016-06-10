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
        "**again** - Re-glitch same image.\n\n" +
        "**seed** _anything_ - Random number seed.\n\n" +
        "**amount** _number in 1..1024_ - How much glitch.\n\n" +
        "**showme** - Just glitch me a picture!" +
        "\n\nI only work on JPG images right now. I'm still learning the other formats!");
    showMeTask('Sample of the goods:', session);
}
exports.helpTask = helpTask;
function againTask(session) {
    var contentUrl = session.userData.contentUrl;
    if (contentUrl) {
        session.userData.params = undefined;
        glitchTask('Re-glitched...', contentUrl, session);
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
        glitchTask('Re-glitched...', contentUrl, session);
    }
    else {
        session.send("Upload an image first.");
    }
}
exports.paramTask = paramTask;
function showMeTask(prompt, session) {
    var images = [
        'http://johnmcdonald.net.au/wp-content/uploads/2014/11/22544_CLOSE.jpg',
        'http://portra.wpshower.com/wp-content/uploads/2014/03/martin-schoeller-clint-eastwood-portrait-up-close-and-personal.jpg',
        'http://a4.files.biography.com/image/upload/c_fit,cs_srgb,dpr_1.0,h_1200,q_80,w_1200/MTIwNjA4NjMzODg2NTc0MDky.jpg',
        'http://a4.files.biography.com/image/upload/c_fit,cs_srgb,dpr_1.0,h_1200,q_80,w_1200/MTE1ODA0OTcxMjc3MzIxNzQx.jpg',
        'https://s-media-cache-ak0.pinimg.com/736x/31/16/93/311693428ecf431808a55e483a293d79.jpg',
        'http://ngm.nationalgeographic.com/2011/08/robots/img/08-child-robot-face-714.jpg',
        'https://i.ytimg.com/vi/0oBx7Jg4m-o/maxresdefault.jpg',
        'http://cbsnews2.cbsistatic.com/hub/i/r/2005/07/01/b82b0d01-a644-11e2-a3f0-029118418759/thumbnail/620x350/06670add9acfee22becb652c62fc64c4/image705913x.jpg',
        'http://cdn.history.com/sites/2/2014/02/jqadams_portrait-P.jpeg'
    ];
    var prompts = [
        'Check it out:',
        'here\'s one:',
        'One of my personal favorites:',
        'Here\'s what I do:',
    ];
    prompt = prompt || prompts[Math.floor(Math.random() * prompts.length)];
    session.userData.params = undefined;
    glitchTask(prompt, images[Math.floor(Math.random() * images.length)], session);
}
exports.showMeTask = showMeTask;
function glitchTask(prompt, contentUrl, session) {
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
                    seed: utils.makeSeed(),
                    amount: parseInt("" + (3 + Math.random() * 76)),
                };
                params = glitcher.validateParams(params);
                glitcher.glitchJpg(jpgBytes, params);
                var encoder = new Buffer(jpgBytes);
                var encoded = encoder.toString('base64');
                var message = new builder.Message();
                message.addAttachment({
                    contentType: "image/jpeg",
                    contentUrl: "data:image/jpeg;base64," + encoded
                });
                prompt = prompt || "";
                if (prompt.length > 0)
                    prompt = prompt + "\n\n";
                message.setText(session, ("" + prompt) +
                    ("**seed**: " + params.seed + "\n\n") +
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