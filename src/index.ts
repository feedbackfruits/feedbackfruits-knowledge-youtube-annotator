import fetch from 'node-fetch';

import { Annotator, Doc, Helpers, Config as _Config, Context } from 'feedbackfruits-knowledge-engine';
import { Operation } from 'memux';

import * as Config from './config';

import * as TimedText from './timedtext';
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

async function annotate(doc: Doc): Promise<Doc> {
  // console.log('Annotating doc:', doc);
  const captions = await TimedText.getCaptionsForLanguage(doc['@id'], 'en');
  // console.log('Got captions:', captions);
  if (captions.length === 0) return doc;
  // console.log(`Setting ${Helpers.decodeIRI(Context.text)} to captions`);
  return {
    ...doc,
    [Context.iris.$.caption]: captions
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
