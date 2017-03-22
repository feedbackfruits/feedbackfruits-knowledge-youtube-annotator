require('dotenv').load({ silent: true });

const {
  NAME = 'feedbackfruits-knowledge-youtube-annotator',
  CAYLEY_ADDRESS = 'http://cayley:64210',
  KAFKA_ADDRESS = 'tcp://kafka:9092',
  INPUT_TOPIC = 'quad_updates',
  OUTPUT_TOPIC = 'quad_update_requests',
  YOUTUBE_API_KEY
} = process.env;

const memux = require('memux');
const Cayley = require('cayley');
const { Observable: { empty } } = require('rxjs');
const PQueue = require('p-queue');
const ytdl = require('ytdl-core')
const fetch = require('node-fetch');

const { source, sink, send } = memux({
  name: NAME,
  url: KAFKA_ADDRESS,
  input: INPUT_TOPIC,
  output: OUTPUT_TOPIC
});

const cayley = Cayley(CAYLEY_ADDRESS);
const queue = new PQueue({
  concurrency: 2
});

function unescapeHtml(safe) {
  return safe
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

const done = {};

source.flatMap(({ action: { type, quad: { subject, object } }, progress }) => {
  return queue.add(() => {
    if (!progress) debugger;
    const regex = /^<(https:\/\/www\.youtube\.com\/watch\?v=\w+)>$/;

    const subjectMatch = subject.match(regex);
    const objectMatch = object.match(regex);

    const url = subjectMatch ? subjectMatch[1] : (objectMatch ? objectMatch[1] : null);

    if (!url) return Promise.resolve();
    if (url in done) return Promise.resolve();

    done[url] = true;

    return ytdl.getInfo(url).then(info => {

      const arr = info.caption_tracks.split(/\&|,/);

      const capts = arr.reduce((memo, value) => {
        const prev = memo[0];
        const [key, val] = value.split('=');
        const curr = { [key]: decodeURIComponent(val) };

        if (key in prev) return [curr, ...memo];
        return [ Object.assign({}, prev, curr), ...memo.slice(1) ];
      }, [{}]);

      const capt = capts.find(capt => capt.v.startsWith('.en'));
      const url = capt.u;
      return fetch(url);
    }).then(response => response.text()).then(data => {
      const text = unescapeHtml(unescapeHtml(data.replace(/<.*>/g, ' ')));
      return send({ type: 'write', quad: { subject: `<${url}>`, predicate: '<http://schema.org/text>', object: text } });
    });
  }).then(() => progress)
}).subscribe(sink);
