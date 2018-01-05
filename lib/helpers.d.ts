import { Doc } from 'feedbackfruits-knowledge-engine';
export declare type CaptionResponse = {
    transcript: {
        text: Array<{
            start: string;
            dur: string;
            $t?: string;
        }>;
    };
};
export declare type Caption = {
    id: string;
    text: string;
    language: string;
    startsAfter: string;
    duration: string;
};
export declare function unescapeHtml(safe: any): any;
export declare function trimNewlines(str: string): string;
export declare function generateCaptionId(videoURL: string, caption: Caption): string;
export declare function isYoutubeDoc(doc: Doc): boolean;
export declare function isOperableDoc(doc: Doc): boolean;
export declare function getCaptions(videoURL: any): Promise<any>;
export declare function getCaptionsForLanguage(videoURL: any, language: any): Promise<Array<Caption>>;
export declare function parseCaptions(videoURL: string, captionsString: string, language: string): Array<Caption>;
