require('dotenv').config();

const {
  NAME = 'feedbackfruits-knowledge-youtube-annotator',
  CAYLEY_ADDRESS = 'http://cayley:64210',
  KAFKA_ADDRESS = 'tcp://kafka:9092',
  INPUT_TOPIC = 'updates',
  OUTPUT_TOPIC = 'update_requests',
  YOUTUBE_API_KEY
} = process.env;

export {
  NAME,
  CAYLEY_ADDRESS,
  KAFKA_ADDRESS,
  INPUT_TOPIC,
  OUTPUT_TOPIC,
  YOUTUBE_API_KEY,
}
