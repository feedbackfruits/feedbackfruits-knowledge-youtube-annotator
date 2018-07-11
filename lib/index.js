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
const iso8601 = require("duration-iso-8601");
const feedbackfruits_knowledge_engine_1 = require("feedbackfruits-knowledge-engine");
const Config = require("./config");
const helpers_1 = require("./helpers");
const frame = {
    "@context": feedbackfruits_knowledge_engine_1.Context.context,
    "@type": feedbackfruits_knowledge_engine_1.Context.iris.$.Resource
};
function init({ name }) {
    return __awaiter(this, void 0, void 0, function* () {
        const receive = (send) => (operation) => __awaiter(this, void 0, void 0, function* () {
            console.log('Received operation:', operation);
            const { action, data: doc } = operation;
            const framed = yield feedbackfruits_knowledge_engine_1.Doc.frame([doc], frame);
            if (framed.length === 0)
                return;
            yield Promise.all(framed.map((doc) => __awaiter(this, void 0, void 0, function* () {
                console.log('Doc is operable?', helpers_1.isOperableDoc(doc));
                if (!(action === 'write') || !helpers_1.isOperableDoc(doc))
                    return;
                const annotatedDoc = yield annotate(doc);
                if (helpers_1.isOperableDoc(annotatedDoc))
                    return;
                console.log('Sending annotated doc:', annotatedDoc);
                try {
                    const result = yield send({ action: 'write', key: annotatedDoc['@id'], data: annotatedDoc });
                    return result;
                }
                catch (e) {
                    console.log('ERROR!');
                    console.error(e);
                    throw e;
                }
            })));
            return;
        });
        return yield feedbackfruits_knowledge_engine_1.Annotator({
            name,
            receive,
            customConfig: Config
        });
    });
}
exports.default = init;
const YTRegex = /^https:\/\/www\.youtube\.com\/watch\?v=([\w|-]+)$/;
function getCaptionsForLanguage(videoURL, language) {
    return __awaiter(this, void 0, void 0, function* () {
        const videoId = videoURL.match(YTRegex)[1];
        const url = `https://video.google.com/timedtext?v=${videoId}&lang=${language}`;
        return feedbackfruits_knowledge_engine_1.Captions.getCaptions(url);
    });
}
exports.getCaptionsForLanguage = getCaptionsForLanguage;
function annotate(doc) {
    return __awaiter(this, void 0, void 0, function* () {
        const captions = yield getCaptionsForLanguage(doc['@id'], 'en');
        if (captions.length === 0)
            return doc;
        const lastCaption = captions[captions.length - 1];
        const lastCaptionStart = iso8601.convertToSecond(lastCaption.startsAfter);
        const lastCaptionDuration = iso8601.convertToSecond(lastCaption.startsAfter);
        const totalDuration = `PT${lastCaptionStart + lastCaptionDuration}S`;
        const captionLength = lastCaption.relativeStartPosition + lastCaption.text.length;
        return Object.assign({}, doc, { [feedbackfruits_knowledge_engine_1.Context.iris.$.contentDuration]: totalDuration, [feedbackfruits_knowledge_engine_1.Context.iris.$.contentLength]: captionLength, [feedbackfruits_knowledge_engine_1.Context.iris.$.caption]: captions });
    });
}
if (require.main === module) {
    console.log("Running as script.");
    init({
        name: Config.NAME,
    }).catch(console.error);
}
