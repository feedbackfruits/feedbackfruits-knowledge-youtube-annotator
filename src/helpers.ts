import fetch from 'node-fetch';
const ytdl = require('ytdl-core');
import { Doc, Helpers } from 'feedbackfruits-knowledge-engine';
import * as Context from 'feedbackfruits-knowledge-context';

export function unescapeHtml(safe) {
  return safe
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

const YTRegex = /^(https:\/\/www\.youtube\.com\/watch\?v=[\w|-]+)$/;
export function isYoutubeDoc(doc: Doc): boolean {
  return YTRegex.test(doc['@id']);
}

export function isOperableDoc(doc: Doc): boolean {
  return isYoutubeDoc(doc) && !(Helpers.decodeIRI(Context.text) in doc);
}

export async function getCaptions(videoURL) {
  const info = await ytdl.getInfo(videoURL);

  if (!info || !info.caption_tracks) {
    console.log('No info found...');
    return [];
  };

  console.log('Found caption tracks:', info.caption_tracks);
  const arr = info.caption_tracks.split(/\&|,/);

  return arr.reduce((memo, value) => {
    if (!value) return memo;
    const prev = memo[0];
    const [key, val] = value.split('=');
    const curr = { [key]: decodeURIComponent(val) };

    if (key in prev) return [curr, ...memo];
    return [ Object.assign({}, prev, curr), ...memo.slice(1) ];
  }, [{}]);
}

export async function getCaptionsForLanguage(videoURL, language) {
  // console.log(`Getting ${language} captions for ${videoURL}`);
  const captions = await getCaptions(videoURL);
  // console.log('Found captions:', captions);
  const caption = captions.find(caption => {
    return caption && caption.v && caption.v.startsWith(`.${language}`);
  });

  // console.log('Found caption that matches language:', caption);
  if (!caption || !caption.u) return;

  const captionURL = caption.u;
  // console.log('Fetching caption from:', captionURL)
  const response = await fetch(captionURL);
  // console.log('Got caption response:', response);
  const captionsString = await response.text();
  // console.log('Caption response:', captionsString);
  return parseCaptions(captionsString);
}

export function parseCaptions(captionsString) {
  const text = unescapeHtml(unescapeHtml(captionsString.replace(/<.*>/g, ' ')));
  return text.trim();
}
