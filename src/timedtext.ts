// This file abstracts over the https://video.google.com/timedtext API

import fetch from 'node-fetch';
import * as xml2json from 'xml2json';

import { Context } from 'feedbackfruits-knowledge-engine';
import * as Config from './config';
import * as Helpers from './helpers';

export type CaptionResponse = {
  transcript: {
    text: Array<{ start: string, dur: string, $t?: string }>
  }
};

export type Caption = {
  "@id": string,
  "@type": string | string[],
  text: string,
  language: string,
  startsAfter: string,
  duration: string,
};

const YTRegex = /^https:\/\/www\.youtube\.com\/watch\?v=([\w|-]+)$/;

export function generateCaptionId(videoURL: string, caption: Caption): string {
  const videoId = videoURL.match(YTRegex)[1];
  const { language } = caption;
  const base = `https://video.google.com/timedtext?v=${videoId}&lang=${language}`;
  const unique = new Buffer(`${caption.startsAfter}-${caption.duration}`).toString('base64');

  return `${base}#${unique}`;
}

export function parseCaptionsList(str: string): any[] {
  return [];
}

// export async function getCaptions(videoURL: string) {
//   const videoId = videoURL.match(YTRegex)[1];
//   console.log(videoId);
//
//   const response = await fetch(`https://video.google.com/timedtext?&v=${videoId}&type=list`);
//   return response.text();
// }


// This doesn't work because API keys are not allowed to get captions unless it is on behalf of the content owner
export async function getCaptionsForLanguage(videoURL: string, language: string) {
  const videoId = videoURL.match(YTRegex)[1];
  console.log(videoId);

  const response = await fetch(`https://video.google.com/timedtext?&lang=${language}&v=${videoId}`);
  return await parseCaptions(videoURL, await response.text(), language);
}


export function parseCaptions(videoURL: string, captionsString: string, language: string): Array<Caption>  {
  const json: CaptionResponse = <any>xml2json.toJson(captionsString, { object: true, trim: false });
  return json.transcript.text.map(caption => {
    const text = '$t' in caption ? Helpers.trimNewlines(Helpers.unescapeHtml(caption['$t'])) : '';
    const partialCaption = {
      "@id": null,
      "@type": null,
      startsAfter: `P${caption.start}S`,
      duration: `P${caption.dur}S`,
      text,
      language
    };

    const id = generateCaptionId(videoURL, partialCaption);

    return { ...partialCaption, "@id": id, "@type": "VideoCaption" };
  });
}
