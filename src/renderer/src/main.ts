import "./assets/index.css";
import { drawRectangle } from "@renderer/features/engine/graphics";
import rootStore from "./store";
import { makeFrame, renderFrame } from "./features/engine/frame";

const { Engine } = rootStore;

Engine.start();

const frame = makeFrame(0, 0, 100, 100, 0xff0000);
renderFrame(frame);
