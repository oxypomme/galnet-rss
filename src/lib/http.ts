import { createLogger } from "./logger.ts";

const logger = createLogger("http");

export function createErrorResponse(
  message: string,
  startTime: number,
  req: Request,
) {
  const route = `${req.method} ${req.url}`;
  logger.error(route, { duration: Date.now() - startTime, status: 500 });
  return new Response(message, { status: 500 });
}

export function createSuccessResponse(
  content: string,
  type: string,
  startTime: number,
  req: Request,
) {
  const route = `${req.method} ${req.url}`;
  logger.info(route, { duration: Date.now() - startTime, status: 200 });
  return new Response(
    content,
    { headers: { "Content-Type": type } },
  );
}
