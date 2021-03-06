import test from 'ava';

import memux from 'memux';
import init from '../lib';
import { NAME, KAFKA_ADDRESS, OUTPUT_TOPIC, INPUT_TOPIC, PAGE_SIZE, START_PAGE } from '../lib/config';
import * as Engine from 'feedbackfruits-knowledge-engine';

test('it exists', t => {
  t.not(init, undefined);
});

const videoDoc = require('./support/compacted');
const captions = require('./support/captions');

function sortArray(docs) {
  return docs.sort((a, b) => {
    if (typeof a === "string" && typeof b === "string") return a.localeCompare(b);
    return a["@id"].localeCompare(b["@id"]);
  });
}

test('it works', async (t) => {
  try {
    // const quads = await Engine.Helpers.docToQuads(videoDoc);
    // console.log(quads);
    // return t.is(true, true);

    let _resolve, _reject;
    const resultPromise = new Promise((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;
    });

    const receive = (message) => {
      console.log('Received message!', message);
      if ([].concat(message.data["@type"]).find(type => type === "VideoObject")) _resolve(message);
    };

    const send = await memux({
      name: 'dummy-broker',
      url: KAFKA_ADDRESS,
      input: OUTPUT_TOPIC,
      output: INPUT_TOPIC,
      receive,
      options: {
        concurrency: 1
      }
    });

    await init({
      name: NAME,
    });

    await send({ action: 'write', key: videoDoc['@id'], data: videoDoc });

    const result = await resultPromise;
    console.log('Result data:', result.data);

    const sorted = { ...result.data, caption: sortArray(result.data.caption) };

    return t.deepEqual(sorted, {
      ...videoDoc,
      contentDuration: 'PT273.10999999999996S',
      contentLength: 3358,
      caption: [ "https://video.google.com/timedtext?v=pi3WWQ0q6Lc&lang=en" ]
    });
  } catch(e) {
    console.error(e);
    throw e;
  }
});
