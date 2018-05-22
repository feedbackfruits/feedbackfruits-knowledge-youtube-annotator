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
const xml2json = require("xml2json");
const Helpers = require("./helpers");
const YTRegex = /^https:\/\/www\.youtube\.com\/watch\?v=([\w|-]+)$/;
function generateCaptionId(videoURL, caption) {
    const videoId = videoURL.match(YTRegex)[1];
    const { language } = caption;
    const base = `https://video.google.com/timedtext?v=${videoId}&lang=${language}`;
    const unique = new Buffer(`${caption.startsAfter}-${caption.duration}`).toString('base64');
    return `${base}#${unique}`;
}
exports.generateCaptionId = generateCaptionId;
function parseCaptionsList(str) {
    return [];
}
exports.parseCaptionsList = parseCaptionsList;
function getCaptionsForLanguage(videoURL, language) {
    return __awaiter(this, void 0, void 0, function* () {
        const videoId = videoURL.match(YTRegex)[1];
        console.log(videoId);
        const response = yield node_fetch_1.default(`https://video.google.com/timedtext?&lang=${language}&v=${videoId}`);
        return yield parseCaptions(videoURL, yield response.text(), language);
    });
}
exports.getCaptionsForLanguage = getCaptionsForLanguage;
function parseCaptions(videoURL, captionsString, language) {
    const json = xml2json.toJson(captionsString, { object: true, trim: false });
    return json.transcript.text.map(caption => {
        const text = '$t' in caption ? Helpers.trimNewlines(Helpers.unescapeHtml(caption['$t'])) : '';
        const partialCaption = {
            "@id": null,
            "@type": null,
            startsAfter: `PT${caption.start}S`,
            duration: `PT${caption.dur}S`,
            text,
            language
        };
        const id = generateCaptionId(videoURL, partialCaption);
        return Object.assign({}, partialCaption, { "@id": id, "@type": "VideoCaption" });
    });
}
exports.parseCaptions = parseCaptions;
