
export function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
}

export function makeSeed(length: number = 8): string {
    const consonants: string[] = ['b', 'd', 'f', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w'];
    const vowels: string[] = ['a', 'e', 'i', 'o', 'u'];

    length = length + (length % 2);

    var seed = "";

    for (let i = 0; i < length / 2; ++i) {
        seed += consonants[Math.floor(Math.random() * consonants.length)];
        seed += vowels[Math.floor(Math.random() * vowels.length)];
    }

    return seed;
}
