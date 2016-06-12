import seedrandom = require('seedrandom');
import utils = require('./utils');

//----------------------------------------------------------------------------
export function validateParams(params: any): any {
    return {
        seed: params.seed || utils.makeSeed(),
        amount: utils.clamp(Number(params.amount) || 1, 1, 1024)
    };
}

//----------------------------------------------------------------------------
export function glitchJpg(buffer: Uint8Array, params: any) {
    params = validateParams(params);
    let offset = getJpegHeaderOffset(buffer);
    let rng = seedrandom.xor4096("" + params.seed);
    for (let i = 0; i < params.amount; ++i) {
        glitchByte(buffer, offset, i, params.amount, rng);
    }
}

//----------------------------------------------------------------------------
function glitchByte(buffer: Uint8Array, offset: number, curr: number, total: number, rng: prng) {
    let maxIndex = buffer.length - offset - 4;
    let index = Math.floor(Math.random() * maxIndex);
    buffer[index] = Math.floor(Math.random() * 20);
}

//----------------------------------------------------------------------------
function getJpegHeaderOffset(buffer: Uint8Array): number {
    // TODO: Use a jpg lib
    var result = 417;
    for (let i = 0, len = buffer.length; i < len; i++) {
        if (buffer[i] === 255 && buffer[i + 1] === 218) {
            result = i + 2;
            break;
        }
    }
    return result;
}
