export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const notFound = (what: string) => new HttpError(404, `${what} não encontrado`);
export const badRequest = (message: string) => new HttpError(400, message);
