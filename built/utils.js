"use strict";
function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}
exports.clamp = clamp;
function makeSeed(length) {
    if (length === void 0) { length = 6; }
    var consonants = ['b', 'd', 'f', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w'];
    var vowels = ['a', 'e', 'i', 'o', 'u'];
    // make sure it's an even number
    length += length + length % 2;
    var seed = "";
    for (var i = 0; i < length / 2; ++i) {
        seed += consonants[Math.floor(Math.random() * consonants.length)];
        seed += vowels[Math.floor(Math.random() * vowels.length)];
    }
    return seed;
}
exports.makeSeed = makeSeed;
//# sourceMappingURL=utils.js.map