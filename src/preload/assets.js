import { readFile } from "node:fs/promises";
import path from "path";

const ASSETS_DIR = path.join(__dirname, "../resources");

export function getAsset(_path) {
    return readFile(path.join(ASSETS_DIR, _path));
}
