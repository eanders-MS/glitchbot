"use strict";
var seedrandom = require('seedrandom');
var utils = require('./utils');
//----------------------------------------------------------------------------
function validateParams(params) {
    return {
        seed: params.seed || utils.makeSeed(),
        amount: utils.clamp(Number(params.amount) || 1, 1, 1024)
    };
}
exports.validateParams = validateParams;
//----------------------------------------------------------------------------
function glitchJpg(buffer, params) {
    params = validateParams(params);
    var offset = getJpegHeaderOffset(buffer);
    var rng = seedrandom.xor4096("" + params.seed);
    for (var i = 0; i < params.amount; ++i) {
        glitchByte(buffer, offset, i, params.amount, rng);
    }
}
exports.glitchJpg = glitchJpg;
//----------------------------------------------------------------------------
function glitchByte(buffer, offset, curr, total, rng) {
    var maxIndex = buffer.length - offset - 4;
    var index = Math.floor(Math.random() * maxIndex);
    buffer[index] = 0;
}
//----------------------------------------------------------------------------
function getJpegHeaderOffset(buffer) {
    // TODO: Use a jpg lib
    var result = 417;
    for (var i = 0, len = buffer.length; i < len; i++) {
        if (buffer[i] === 255 && buffer[i + 1] === 218) {
            result = i + 2;
            break;
        }
    }
    return result;
}
//# sourceMappingURL=glitcher.js.map