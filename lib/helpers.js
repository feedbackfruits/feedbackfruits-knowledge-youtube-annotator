"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const ytdl = require('ytdl-core');
const xml2json = require("xml2json");
const feedbackfruits_knowledge_engine_1 = require("feedbackfruits-knowledge-engine");
const Context = require("feedbackfruits-knowledge-context");
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
function generateCaptionId(videoURL, caption) {
    return new Buffer(`${videoURL}-${caption.language}-${caption.startsAfter}-${caption.duration}`).toString('base64');
}
exports.generateCaptionId = generateCaptionId;
const YTRegex = /^(https:\/\/www\.youtube\.com\/watch\?v=[\w|-]+)$/;
function isYoutubeDoc(doc) {
    return YTRegex.test(doc['@id']);
}
exports.isYoutubeDoc = isYoutubeDoc;
function isOperableDoc(doc) {
    return isYoutubeDoc(doc) && !(feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(Context.graph.$.caption) in doc);
}
exports.isOperableDoc = isOperableDoc;
function getCaptions(videoURL) {
    return __awaiter(this, void 0, void 0, function* () {
        const info = yield ytdl.getInfo(videoURL);
        if (!info || !info.caption_tracks) {
            console.log('No info found...');
            return [];
        }
        ;
        const arr = info.caption_tracks.split(/\&|,/);
        return arr.reduce((memo, value) => {
            if (!value)
                return memo;
            const prev = memo[0];
            const [key, val] = value.split('=').map(x => x.trim());
            const curr = { [key]: decodeURIComponent(val) };
            if (key in prev)
                return [curr, ...memo];
            return [Object.assign({}, prev, curr), ...memo.slice(1)];
        }, [{}]);
    });
}
exports.getCaptions = getCaptions;
function getCaptionsForLanguage(videoURL, language) {
    return __awaiter(this, void 0, void 0, function* () {
        const captions = yield getCaptions(videoURL);
        const caption = captions.find(caption => {
            return caption && caption.v && caption.v.startsWith(`.${language}`);
        });
        if (!caption || !caption.u)
            return [];
        const captionURL = caption.u;
        const response = yield node_fetch_1.default(captionURL);
        const captionsString = yield response.text();
        return parseCaptions(videoURL, captionsString, language);
    });
}
exports.getCaptionsForLanguage = getCaptionsForLanguage;
function parseCaptions(videoURL, captionsString, language) {
    const json = xml2json.toJson(captionsString, { object: true, trim: false });
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
        return Object.assign({}, partialCaption, { id });
    });
}
exports.parseCaptions = parseCaptions;
