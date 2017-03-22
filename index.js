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
const getSubtitles = require('@joegesualdo/get-youtube-subtitles-node');
const google = require('googleapis');


const youtube = google.youtube({
  version: 'v3',
  auth: YOUTUBE_API_KEY
});


const { source, sink, send } = memux({
  name: NAME,
  url: KAFKA_ADDRESS,
  input: INPUT_TOPIC,
  output: OUTPUT_TOPIC
});

const cayley = Cayley(CAYLEY_ADDRESS);
const queue = new PQueue({
  concurrency: 32
});

source.flatMap(({ action: { type, quad: { subject, object } }, progress }) => {
  if (!progress) debugger;
  const regex = /^<(https:\/\/www\.youtube\.com\/watch\?v=\w+)>$/;

  const subjectMatch = subject.match(regex);
  const objectMatch = object.match(regex);

  const url = subjectMatch ? subjectMatch[1] : (objectMatch ? objectMatch[1] : null);

  if (!url) return Promise.resolve(progress);

  return queue.add(() => {
    return new Promise((resolve, reject) => {
      youtube.captions.list({ part: 'id,snippet', videoId: 'JU67TL2L1CA' }, (err, response) => {
        if (err) return reject(err);

        const captionId = response.items.find(item => {
          return item.snippet.language === 'en' && item.snippet.trackKind === 'standard'
        }).id;

        youtube.captions.download({ id: captionId }, (err, response) => {
          debugger;
          if (err) return reject(err);


        });

        return resolve();
      });

    });

    // debugger;
    // return ytdl.getInfo(url).then(info => {
    //   debugger;
    //   // send()
    // });
  }).then(() => progress)
}).subscribe(sink);
