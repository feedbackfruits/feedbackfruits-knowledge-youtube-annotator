import * as google from 'googleapis';
import * as Config from './config';

const YTRegex = /^https:\/\/www\.youtube\.com\/watch\?v=([\w|-]+)$/;

const youtube = google.youtube({
  version: 'v3',
  auth: Config.YOUTUBE_API_KEY
});

export async function getCaptions(videoURL) {
  const videoId = videoURL.match(YTRegex)[1];
  console.log(videoId);

  const captionsList = await new Promise<any>((resolve, reject) => {
    youtube.captions.list({ part: 'id,snippet', videoId }, (err, res) => {
      if (err) return reject(err);
      return resolve(res.data);
    });
  });

  console.log(captionsList.items)

  return captionsList.items;

}


// This doesn't work because API keys are not allowed to get captions unless it is on behalf of the content owner
export async function getCaptionsForLanguage(videoURL, language): Promise<string> {
  const captionsList = await getCaptions(videoURL);

  const captionId = captionsList.find(item => {
    return item.snippet.language === 'en' && item.snippet.trackKind === 'standard'
  }).id;

  console.log('captionId:', captionId);

  const captionsResponse = await new Promise<string>((resolve, reject) => {
    youtube.captions.download({ id: captionId }, (err, res) => {
      if (err) return reject(err);
      return resolve(res.data);
    });
  });

  return new Buffer(captionsResponse, 'base64').toString();
}
