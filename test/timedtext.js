import test from 'ava';
import * as TimedText from '../lib/timedtext';

const videoURL = 'https://www.youtube.com/watch?v=pi3WWQ0q6Lc';
const captions = require('./support/captions');

test('it exists', t => {
  t.not(TimedText, undefined);
});

test('getCaptionsForLanguage: it get the captions for a specific language', async t => {
  const result = await TimedText.getCaptionsForLanguage(videoURL, 'en');
  console.log(JSON.stringify(result.map(x => x["@id"])));
  // The id changes everytime, so this is a bit hacky
  return t.deepEqual(result, captions);
});
