import test from 'ava';
import * as YouTube from '../lib/youtube';

test('it exists', t => {
  t.not(YouTube, undefined);
});


// test('getCaptions: it converts text to concepts', async t => {
//   const result = await YouTube.getCaptions(videoURL);
//   // console.log(JSON.stringify(result));
//   return t.is(true, true);
// });
