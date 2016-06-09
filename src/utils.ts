
export function clamp(v: number, a: number, b: number): number {
    return Math.max(a, Math.min(b, v));
}

export function clampParams(params: any): any {
    return {
        seed: clamp((params.seed || 0), 0, 1024),
        amount: clamp(params.amount || 0, 0, 1024)
    };
}
