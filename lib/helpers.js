"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feedbackfruits_knowledge_engine_1 = require("feedbackfruits-knowledge-engine");
function unescapeHtml(safe) {
    return safe
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}
exports.unescapeHtml = unescapeHtml;
function trimNewlines(str) {
    return str.replace('\n', ' ').trim();
}
exports.trimNewlines = trimNewlines;
const YTRegex = /^(https:\/\/www\.youtube\.com\/watch\?v=[\w|-]+)$/;
function isYoutubeDoc(doc) {
    return YTRegex.test(doc['@id']);
}
exports.isYoutubeDoc = isYoutubeDoc;
function isOperableDoc(doc) {
    return isYoutubeDoc(doc) && !(feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(feedbackfruits_knowledge_engine_1.Context.iris.$.caption) in doc);
}
exports.isOperableDoc = isOperableDoc;
