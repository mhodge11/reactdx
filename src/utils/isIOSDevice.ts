import { hasNavigator } from "./hasNavigator.ts";

let safeIsIOSDevice: boolean;

try {
  safeIsIOSDevice =
    hasNavigator && /iP(ad|hone|od)/.test(navigator.platform ?? "");
} catch {
  safeIsIOSDevice = false;
}

export const isIOSDevice = safeIsIOSDevice;
