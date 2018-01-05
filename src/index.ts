import fetch from 'node-fetch';

import { Annotator, Doc, Helpers, Config as _Config } from 'feedbackfruits-knowledge-engine';
import { Operation } from 'memux';

import * as Config from './config';
import * as Context from 'feedbackfruits-knowledge-context';

import { unescapeHtml, getCaptionsForLanguage, isOperableDoc } from './helpers';

export type SendFn = (operation: Operation<Doc>) => Promise<void>;

export default async function init({ name }) {
  const receive = (send: SendFn) => async (operation: Operation<Doc>) => {
    console.log('Received operation:', operation);
    const { action, data: doc } = operation;
    console.log('Doc is operable?', isOperableDoc(doc));
    if (!(action === 'write') || !isOperableDoc(doc)) return;

    const annotatedDoc = await annotate(doc);
    if (isOperableDoc(annotatedDoc)) return;

    return send({ action: 'write', key: annotatedDoc['@id'], data: annotatedDoc });
  }

  return await Annotator({
    name,
    receive,
    customConfig: Config as any as typeof _Config.Base
  });

}

async function annotate(doc: Doc): Promise<Doc> {
  // console.log('Annotating doc:', doc);
  const captions = await getCaptionsForLanguage(doc['@id'], 'en');
  // console.log('Got captions:', captions);
  if (captions.length === 0) return doc;
  // console.log(`Setting ${Helpers.decodeIRI(Context.text)} to captions`);
  return {
    ...doc,
    [Helpers.decodeIRI(Context.graph.$.caption)]: captions
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
