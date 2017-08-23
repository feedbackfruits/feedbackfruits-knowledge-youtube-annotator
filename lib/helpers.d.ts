import { Doc } from 'feedbackfruits-knowledge-engine';
export declare function unescapeHtml(safe: any): any;
export declare function isYoutubeDoc(doc: Doc): boolean;
export declare function isOperableDoc(doc: Doc): boolean;
export declare function getCaptions(videoURL: any): Promise<any>;
export declare function getCaptionsForLanguage(videoURL: any, language: any): Promise<any>;
export declare function parseCaptions(captionsString: any): any;
