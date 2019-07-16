"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feedbackfruits_knowledge_engine_1 = require("feedbackfruits-knowledge-engine");
const Config = require("./config");
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
function isYoutubeDoc(doc) {
    return Config.YT_REGEX.test(doc['@id']);
}
exports.isYoutubeDoc = isYoutubeDoc;
function isOperableDoc(doc) {
    return isYoutubeDoc(doc) && !(feedbackfruits_knowledge_engine_1.Context.iris.$.caption in doc && doc[feedbackfruits_knowledge_engine_1.Context.iris.$.caption] != null);
}
exports.isOperableDoc = isOperableDoc;
