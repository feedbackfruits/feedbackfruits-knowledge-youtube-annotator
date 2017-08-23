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
const YTRegex = /^(https:\/\/www\.youtube\.com\/watch\?v=[\w|-]+)$/;
function isYoutubeDoc(doc) {
    return YTRegex.test(doc['@id']);
}
exports.isYoutubeDoc = isYoutubeDoc;
function isOperableDoc(doc) {
    return isYoutubeDoc(doc) && !(feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(Context.text) in doc);
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
        console.log('Found caption tracks:', info.caption_tracks);
        const arr = info.caption_tracks.split(/\&|,/);
        return arr.reduce((memo, value) => {
            if (!value)
                return memo;
            const prev = memo[0];
            const [key, val] = value.split('=');
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
            return;
        const captionURL = caption.u;
        const response = yield node_fetch_1.default(captionURL);
        const captionsString = yield response.text();
        return parseCaptions(captionsString);
    });
}
exports.getCaptionsForLanguage = getCaptionsForLanguage;
function parseCaptions(captionsString) {
    const text = unescapeHtml(unescapeHtml(captionsString.replace(/<.*>/g, ' ')));
    return text.trim();
}
exports.parseCaptions = parseCaptions;
