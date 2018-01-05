import fetch from 'node-fetch';
const ytdl = require('ytdl-core');
import * as xml2json from 'xml2json';
import * as uuid from 'node-uuid';
import { Doc, Helpers } from 'feedbackfruits-knowledge-engine';
import * as Context from 'feedbackfruits-knowledge-context';

export type CaptionResponse = {
  transcript: {
    text: Array<{ start: string, dur: string, $t?: string }>
  }
};

export type Caption = {
  id: string,
  text: string,
  language: string,
  startsAfter: string,
  duration: string,
};

export function unescapeHtml(safe) {
  return safe
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function trimNewlines(str: string) {
  return str.replace('\n', ' ').trim();
}

export function generateCaptionId(videoURL: string, caption: Caption): string {
  return new Buffer(`${videoURL}-${caption.language}-${caption.startsAfter}-${caption.duration}`).toString('base64');
}

const YTRegex = /^(https:\/\/www\.youtube\.com\/watch\?v=[\w|-]+)$/;
export function isYoutubeDoc(doc: Doc): boolean {
  return YTRegex.test(doc['@id']);
}

export function isOperableDoc(doc: Doc): boolean {
  return isYoutubeDoc(doc) && !(Helpers.decodeIRI(Context.graph.$.caption) in doc);
}

export async function getCaptions(videoURL) {
  const info = await ytdl.getInfo(videoURL);

  if (!info || !info.caption_tracks) {
    console.log('No info found...');
    return [];
  };

  // console.log('Found caption tracks:', info.caption_tracks);
  const arr = info.caption_tracks.split(/\&|,/);

  return arr.reduce((memo, value) => {
    if (!value) return memo;
    const prev = memo[0];
    const [key, val] = value.split('=').map(x => x.trim());
    const curr = { [key]: decodeURIComponent(val) };

    if (key in prev) return [curr, ...memo];
    return [ Object.assign({}, prev, curr), ...memo.slice(1) ];
  }, [{}]);
}

export async function getCaptionsForLanguage(videoURL, language): Promise<Array<Caption>> {
  // console.log(`Getting ${language} captions for ${videoURL}`);
  const captions = await getCaptions(videoURL);
  // console.log('Found captions:', captions);
  const caption = captions.find(caption => {
    return caption && caption.v && caption.v.startsWith(`.${language}`);
  });

  // console.log('Found caption that matches language:', caption);
  if (!caption || !caption.u) return [];

  const captionURL = caption.u;
  // console.log('Fetching caption from:', captionURL)
  const response = await fetch(captionURL);
  // console.log('Got caption response:', response);
  const captionsString = await response.text();
  // console.log('Caption response:', captionsString);
  return parseCaptions(videoURL, captionsString, language);
}

export function parseCaptions(videoURL: string, captionsString: string, language: string): Array<Caption>  {
  const json: CaptionResponse = <any>xml2json.toJson(captionsString, { object: true, trim: false });
  return json.transcript.text.map(caption => {
    const text = '$t' in caption ? trimNewlines(unescapeHtml(caption['$t'])) : '';
    const partialCaption = {
      id: null,
      startsAfter: `P${caption.start}S`,
      duration: `P${caption.dur}S`,
      text,
      language
    };

    const id = generateCaptionId(videoURL, partialCaption);

    return { ...partialCaption, id };
  });
}
