import { ConsoleStream, Logger } from "@onjara/optic";
import { JsonFormatter } from "@onjara/optic/formatters";

export function createLogger(name?: string) {
  const logger = new Logger(name);
  logger.addStream(new ConsoleStream()
    .withFormat(new JsonFormatter()));

  return logger;
}
