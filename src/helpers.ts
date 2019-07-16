import { Doc, Helpers, Context } from 'feedbackfruits-knowledge-engine';
import * as Config from './config';

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

export function isYoutubeDoc(doc: Doc): boolean {
  return Config.YT_REGEX.test(doc['@id']);
}

export function isOperableDoc(doc: Doc): boolean {
  return isYoutubeDoc(doc) && !(Context.iris.$.caption in doc && doc[Context.iris.$.caption] != null);
}
