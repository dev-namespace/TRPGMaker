export type UVW = {
    u: number;
    v: number;
    w: number;
};

export type XY = {
    x: number;
    y: number;
};

export function uv(u: number, v: number, w: number = 0) {
    return { u, v, w };
}

export function xy(x: number, y: number) {
    return { x, y };
}

export function rcl(r: number, c: number, l: number) {
    return { r, c, l };
}
