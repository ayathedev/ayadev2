declare module 'gifshot' {
  interface GifshotOptions {
    images?: (string | HTMLCanvasElement | HTMLImageElement)[];
    video?: string[] | string | HTMLVideoElement;
    gifWidth?: number;
    gifHeight?: number;
    interval?: number;
    numFrames?: number;
    frameDuration?: number;
    sampleInterval?: number;
    numWorkers?: number;
    fontSize?: string;
    fontColor?: string;
    fontFamily?: string;
    fontWeight?: string;
    textAlign?: string;
    textBaseline?: string;
    watermark?: string;
    text?: string;
    progressCallback?: (captureProgress: number) => void;
    completeCallback?: (obj: { error: boolean; errorCode?: string; errorMsg?: string; image: string }) => void;
  }

  interface Gifshot {
    createGIF(
      options: GifshotOptions,
      callback: (obj: { error: boolean; errorCode?: string; errorMsg?: string; image: string }) => void
    ): void;
    isSupported(): boolean;
    isAnimatedGIFSupported(): boolean;
    isVideoSupported(): boolean;
  }

  const gifshot: Gifshot;
  export default gifshot;
}
