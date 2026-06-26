import { TextEncoder, TextDecoder } from "node:util";
import "@testing-library/jest-dom";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;


window.PointerEvent ??= MouseEvent;

