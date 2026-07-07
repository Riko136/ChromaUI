import { TextEncoder, TextDecoder } from "node:util";
import "@testing-library/jest-dom";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;


window.PointerEvent ??= MouseEvent;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false, 
    media: query,
    onchange: null,
    addListener: jest.fn(), 
    removeListener: jest.fn(), 
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

