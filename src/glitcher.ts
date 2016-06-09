import utils = require('./utils');

//----------------------------------------------------------------------------
export function glitchJpg(jpgBytes, params) {
    let jpgHeaderLength = getJpegHeaderSize(jpgBytes);
    params = utils.clampParams(params);
    for (let i = 0; i < params.amount; ++i) {
        glitchJpgByte(jpgBytes, jpgHeaderLength, params.seed, params.value, i, params.amount);
    }
}

//----------------------------------------------------------------------------
function glitchJpgByte(jpgBytes, jpgHeaderLength, seed, value, i, len) {
    let maxIndex = jpgBytes.length - jpgHeaderLength - 4;
    let pxMin = maxIndex / len * i;
    let pxMax = maxIndex / len * (i + 1);
    let delta = pxMax - pxMin;
    let pxIndex = pxMin + delta * (seed / 1024);
    if (pxIndex > maxIndex) {
        pxIndex = maxIndex;
    }
    var index = Math.floor(jpgHeaderLength + pxIndex);
    jpgBytes[index] = Math.floor(value);
}

//----------------------------------------------------------------------------
function getJpegHeaderSize(jpgBytes): number {
    var result = 417;
    for (let i = 0, len = jpgBytes.length; i < len; i++) {
        if (jpgBytes[i] === 255 && jpgBytes[i + 1] === 218) {
            result = i + 2;
            break;
        }
    }
    return result;
}
