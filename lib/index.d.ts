import { Doc, Captions } from 'feedbackfruits-knowledge-engine';
import { Operation } from 'memux';
export declare type SendFn = (operation: Operation<Doc>) => Promise<void>;
export default function init({ name }: {
    name: any;
}): Promise<void>;
export declare function getCaptionsForLanguage(videoURL: string, language: string): Promise<Captions.Caption[]>;
