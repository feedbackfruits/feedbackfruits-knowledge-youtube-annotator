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
    "@id": string;
    "@type": string | string[];
    relativeStartPosition: number;
    text: string;
    language: string;
    startsAfter: string;
    duration: string;
};
export declare function generateCaptionId(videoURL: string, caption: Caption): string;
export declare function parseCaptionsList(str: string): any[];
export declare function getCaptionsForLanguage(videoURL: string, language: string): Promise<Caption[]>;
export declare function parseCaptions(videoURL: string, captionsString: string, language: string): Array<Caption>;
