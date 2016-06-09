import builder = require('botbuilder');
import http = require('http');
import https = require('https');
import url = require('url');
import tasks = require('./tasks');
import glitcher = require('./glitcher');
import utils = require('./utils');


export function goodbyeTask(session: builder.Session) {
    session.send("See you later.");
}

export function helpTask(prefix: string, session: builder.Session) {
    prefix = prefix.trim();
    if (prefix.length)
        prefix = prefix + " ";

    session.send(
        `${prefix}Upload an image for me to glitch, or paste a URL. Once I have your image, I can:\n\n` +
        "**again** - Randomize all parameters.\n\n" +
        "**seed** _number in 0..1024_ - Change the random seed.\n\n" +
        "**amount** _number in 0..1024_ - Change the amount of corruption.\n\n" +
        "\n\nI can only glitch JPG files right now. I'm still learning other file formats."
        );
}

export function randomizeTask(session: builder.Session) {
    var contentUrl = session.userData.contentUrl;
    if (contentUrl) {
        session.userData.params = undefined;
        glitchTask(contentUrl, session);
    }
    else {
        session.send("Upload an image first.");
    }
}

export function paramTask(name: string, session: builder.Session, args: any) {
    var contentUrl = session.userData.contentUrl;
    var params = session.userData.params;
    if (contentUrl && params) {
        var value = parseInt(args.matches[1], 10);
        session.userData.params[name] = value;
        glitchTask(contentUrl, session);
    }
    else {
        session.send("Upload an image first.");
    }
}

export function glitchTask(contentUrl: string, session: builder.Session) {
    console.log(`glitching ${contentUrl}`);
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
                    seed: parseInt("" + (Math.random() * 1024)),
                    amount: parseInt("" + (1 + Math.random() * 79)),
                };

                params = utils.clampParams(params);

                glitcher.glitchJpg(jpgBytes, params);

                var encoder = new Buffer(jpgBytes);
                var encoded = encoder.toString('base64');
                var message = new builder.Message();
                message.addAttachment(<any>{
                    contentType: "image/jpeg",
                    content: encoded
                });
                message.setText(session,
                    `**seed**: ${params.seed}\n\n` +
                    `**amount**: ${params.amount}\n\n`);

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
