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
const google = require("googleapis");
const Config = require("./config");
const YTRegex = /^https:\/\/www\.youtube\.com\/watch\?v=([\w|-]+)$/;
const youtube = google.youtube({
    version: 'v3',
    auth: Config.YOUTUBE_API_KEY
});
function getCaptions(videoURL) {
    return __awaiter(this, void 0, void 0, function* () {
        const videoId = videoURL.match(YTRegex)[1];
        console.log(videoId);
        const captionsList = yield new Promise((resolve, reject) => {
            youtube.captions.list({ part: 'id,snippet', videoId }, (err, res) => {
                if (err)
                    return reject(err);
                return resolve(res.data);
            });
        });
        console.log(captionsList.items);
        return captionsList.items;
    });
}
exports.getCaptions = getCaptions;
function getCaptionsForLanguage(videoURL, language) {
    return __awaiter(this, void 0, void 0, function* () {
        const captionsList = yield getCaptions(videoURL);
        const captionId = captionsList.find(item => {
            return item.snippet.language === 'en' && item.snippet.trackKind === 'standard';
        }).id;
        console.log('captionId:', captionId);
        const captionsResponse = yield new Promise((resolve, reject) => {
            youtube.captions.download({ id: captionId }, (err, res) => {
                if (err)
                    return reject(err);
                return resolve(res.data);
            });
        });
        return new Buffer(captionsResponse, 'base64').toString();
    });
}
exports.getCaptionsForLanguage = getCaptionsForLanguage;
