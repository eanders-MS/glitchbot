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
        `${prefix}Upload an image and I will glitch it, or paste a URL. Once I have your image, I can:\n\n` +
        "**again** - Re-glitch with new parameters.\n\n" +
        "**seed** _anything_ - Seed the random number generator.\n\n" +
        "**amount** _number in 0..1024_ - Change the amount of corruption.\n\n" +
        "**showme** - Just show me a picture!" +
        "\n\nI can only glitch JPG images right now. I'm still learning other image formats!"
        );
    showMeTask('Sample of the goods:', session);
}

export function againTask(session: builder.Session) {
    var contentUrl = session.userData.contentUrl;
    if (contentUrl) {
        session.userData.params = undefined;
        glitchTask('Re-glitched...', contentUrl, session);
    }
    else {
        session.send("Upload an image first.");
    }
}

export function paramTask(name: string, session: builder.Session, args: any) {
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

export function showMeTask(prompt: string, session: builder.Session) {
    const images = [
        'http://johnmcdonald.net.au/wp-content/uploads/2014/11/22544_CLOSE.jpg',
        'http://portra.wpshower.com/wp-content/uploads/2014/03/martin-schoeller-clint-eastwood-portrait-up-close-and-personal.jpg',
        'http://a4.files.biography.com/image/upload/c_fit,cs_srgb,dpr_1.0,h_1200,q_80,w_1200/MTIwNjA4NjMzODg2NTc0MDky.jpg',
        'http://a4.files.biography.com/image/upload/c_fit,cs_srgb,dpr_1.0,h_1200,q_80,w_1200/MTE1ODA0OTcxMjc3MzIxNzQx.jpg',
        'https://s-media-cache-ak0.pinimg.com/736x/31/16/93/311693428ecf431808a55e483a293d79.jpg'
    ];

    const prompts = [
        'Check it out:',
        'here\'s one:',
        'One of my personal favorites:',
        'Here\'s what I do:',
    ];

    prompt = prompt || prompts[Math.floor(Math.random() * prompts.length)];

    session.userData.params = undefined;

    glitchTask(prompt, images[Math.floor(Math.random() * images.length)], session);
}

export function glitchTask(prompt:string, contentUrl: string, session: builder.Session) {
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
                message.setText(session,
                    `${prompt}` +
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
