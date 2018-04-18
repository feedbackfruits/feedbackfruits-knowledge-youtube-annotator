import { Doc, Helpers, Context } from 'feedbackfruits-knowledge-engine';

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

const YTRegex = /^(https:\/\/www\.youtube\.com\/watch\?v=[\w|-]+)$/;
export function isYoutubeDoc(doc: Doc): boolean {
  return YTRegex.test(doc['@id']);
}

export function isOperableDoc(doc: Doc): boolean {
  return isYoutubeDoc(doc) && !(Context.iris.$.caption in doc && doc[Context.iris.$.caption] != null);
}
