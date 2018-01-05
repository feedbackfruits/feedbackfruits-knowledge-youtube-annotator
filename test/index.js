import test from 'ava';

import memux from 'memux';
import init from '../lib';
import { NAME, KAFKA_ADDRESS, OUTPUT_TOPIC, INPUT_TOPIC, PAGE_SIZE, START_PAGE } from '../lib/config';

test('it exists', t => {
  t.not(init, undefined);
});

const videoDoc = {
  "@id": "https://www.youtube.com/watch?v=pi3WWQ0q6Lc",
  "http://schema.org/sourceOrganization": [
    "KhanAcademy"
  ],
  "http://schema.org/about": [
    "<http://dbpedia.org/resource/Divisor>",
    "<http://dbpedia.org/resource/Elementary_arithmetic>",
    "<http://dbpedia.org/resource/Integer>",
    "<http://dbpedia.org/resource/Greatest_common_divisor>",
    "<http://dbpedia.org/resource/Integer>",
    "<http://dbpedia.org/resource/Divisor>",
    "<http://dbpedia.org/resource/Greatest_common_divisor>",
    "<http://dbpedia.org/resource/Elementary_arithmetic>",
    "<http://dbpedia.org/resource/Integer>",
    "<http://dbpedia.org/resource/Greatest_common_divisor>",
    "<http://dbpedia.org/resource/Divisor>",
    "<http://dbpedia.org/resource/Elementary_arithmetic>"
  ],
  "http://schema.org/license": [
    "<http://creativecommons.org/licenses/by-nc-sa/3.0>"
  ],
  "http://schema.org/name": [
    "Multiplying positive and negative fractions"
  ],
  "http://schema.org/description": [
    "See examples of multiplying and dividing fractions with negative numbers."
  ],
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
    "<https://knowledge.express/Resource>",
    "<http://schema.org/VideoObject>"
  ],
  "https://knowledge.express/topic": [
    "<https://www.khanacademy.org/video/multiplying-negative-and-positive-fractions>"
  ],
  "http://schema.org/image": [
    "<https://cdn.kastatic.org/googleusercontent/vkR4iP2PXl0SGkwmmpX-7N9mKNP7RWX8ilHMuROW745BJBvmp_eElCItbyPY-tweaVYgddFoNaaHpXSanPm92ZUS>"
  ]
};

const captions = require('./support/captions');

function filterObj(obj, prop) {
  const newObj = { ...obj };
  delete newObj[prop];
  return newObj;
}

test('it works', async (t) => {
  try {
    let _resolve, _reject;
    const resultPromise = new Promise((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;
    });

    const receive = (message) => {
      console.log('Received message!', message);
      _resolve(message);
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

    return t.deepEqual(result, {
      action: 'write',
      data: {
        ...videoDoc,
        ['https://knowledge.express/caption']: captions
      },
      key: 'https://www.youtube.com/watch?v=pi3WWQ0q6Lc',
      label: NAME,
    });
  } catch(e) {
    console.error(e);
    throw e;
  }
});
