"use strict";
var utils = require('./utils');
//----------------------------------------------------------------------------
function glitchJpg(jpgBytes, params) {
    var jpgHeaderLength = getJpegHeaderSize(jpgBytes);
    params = utils.clampParams(params);
    for (var i = 0; i < params.amount; ++i) {
        glitchJpgByte(jpgBytes, jpgHeaderLength, params.seed, i, params.amount);
    }
}
exports.glitchJpg = glitchJpg;
//----------------------------------------------------------------------------
function glitchJpgByte(jpgBytes, jpgHeaderLength, seed, i, len) {
    var maxIndex = jpgBytes.length - jpgHeaderLength - 4;
    var pxMin = maxIndex / len * i;
    var pxMax = maxIndex / len * (i + 1);
    var delta = pxMax - pxMin;
    var pxIndex = pxMin + delta * (seed / 100);
    if (pxIndex > maxIndex) {
        pxIndex = maxIndex;
    }
    var index = Math.floor(jpgHeaderLength + pxIndex);
    jpgBytes[index] = 0;
}
//----------------------------------------------------------------------------
function getJpegHeaderSize(jpgBytes) {
    var result = 417;
    for (var i = 0, len = jpgBytes.length; i < len; i++) {
        if (jpgBytes[i] === 255 && jpgBytes[i + 1] === 218) {
            result = i + 2;
            break;
        }
    }
    return result;
}
//# sourceMappingURL=glitcher.js.map