import fetch from 'node-fetch';
import * as iso8601 from 'duration-iso-8601';

import { Annotator, Doc, Helpers, Config as _Config, Context, Captions } from 'feedbackfruits-knowledge-engine';
import { Operation } from 'memux';

import * as Config from './config';

import { unescapeHtml, isOperableDoc } from './helpers';

export type SendFn = (operation: Operation<Doc>) => Promise<void>;

const frame = {
  "@context": Context.context,
  "@type": Context.iris.$.Resource
};

export default async function init({ name }) {
  const receive = (send: SendFn) => async (operation: Operation<Doc>) => {
    console.log('Received operation:', operation);
    const { action, data: doc } = operation;
    const framed = await Doc.frame([ doc ], frame)
    if (framed.length === 0) return; // Empty output ==> input 'rejected' by frame, not usable for this engine

    await Promise.all(framed.map(async doc => {
      console.log('Doc is operable?', isOperableDoc(doc));
      if (!(action === 'write') || !isOperableDoc(doc)) return;

      const annotatedDoc = await annotate(doc);
      if (isOperableDoc(annotatedDoc)) return;
      console.log('Sending annotated doc:', annotatedDoc);

      try {
        const result = await send({ action: 'write', key: annotatedDoc['@id'], data: annotatedDoc });
        return result;
      } catch(e) {
        console.log('ERROR!');
        console.error(e);
        throw e;
      }
    }));

    return;

  }

  return await Annotator({
    name,
    receive,
    customConfig: Config as any as typeof _Config.Base
  });

}

export async function getCaptionsForLanguage(videoURL: string, language: string) {
  const videoId = videoURL.match(Config.YT_REGEX)[1];
  const url = `https://video.google.com/timedtext?v=${videoId}&lang=${language}`;
  return Captions.getCaptions(url);
}

async function annotate(doc: Doc): Promise<Doc> {
  // console.log('Annotating doc:', doc);
  const videoId = doc["@id"].match(Config.YT_REGEX)[1];
  const language = "en";
  const captionUrl = `https://video.google.com/timedtext?v=${videoId}&lang=${language}`;
  const captions = await Captions.getCaptions(captionUrl);
  console.log('Got captions:', captions);
  if (captions.length === 0) return doc;

  const metadata = Captions.toMetadata(captions);
  console.log('Returned metadata:', metadata);

  return {
    ...doc,
    [Context.iris.$.contentDuration]: metadata.totalDuration,
    [Context.iris.$.contentLength]: metadata.totalLength,
    [Context.iris.$.caption]: [ captionUrl ]
  };
}

// Start the server when executed directly
declare const require: any;
if (require.main === module) {
  console.log("Running as script.");
  init({
    name: Config.NAME,
  }).catch(console.error);
}
