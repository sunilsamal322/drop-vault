import { randomUUID } from "node:crypto";
import { pinoHttp } from "pino-http";

const requestLogger = pinoHttp({
  autoLogging: true,
  genReqId(req, res) {
    const requestId = randomUUID();
    req.id = requestId;
    res.setHeader("X-Request-Id", requestId);
    return requestId;
  },
});

export default requestLogger;
