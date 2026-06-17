import { pinoHttp } from "pino-http";

const requestLogger = pinoHttp({
  autoLogging: true,
});

export default requestLogger;
