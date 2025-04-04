export class HttpException extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundException extends HttpException {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class BadRequestException extends HttpException {
  constructor(message = 'Bad request') {
    super(400, message);
  }
}

export class ConflictException extends HttpException {
  constructor(message = 'Conflict') {
    super(409, message);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(input: string | Error = 'Internal server error') {
    const message = input instanceof Error ? input.message : input;
    super(500, message);
  }
}
