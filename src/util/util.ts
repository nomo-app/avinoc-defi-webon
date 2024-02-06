import React, { useEffect } from "react";

export function arrayBufferToBase64(buffer: any) {
  let binary = "";
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export const randomString = (length = 8) => {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
};

export async function fetchWithRetryEtherScan(args: {
  url: string;
}): Promise<Array<any> | string> {
  // first try without an api key
  const res1: Array<any> | string = (await (await fetch(args.url)).json())
    .result;
  if (Array.isArray(res1)) {
    return res1;
  }

  return (await (await fetch(args.url)).json()).result;
}

export function textShortener(text: string, length: number): string {
  return text.slice(0, length) + "..." + text.slice(text.length - length);
}

export function usePeriodReRender(intervalMillis: number) {
  const [tick, setTick] = React.useState<number>(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prevTick) => prevTick + 1);
    }, intervalMillis);
    return () => clearInterval(interval);
  }, []);
  return tick;
}
