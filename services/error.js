class APIError extends Error {
  constructor({ type, message, data }) {
    super(message);
    this.name = this.constructor.name;
    this.error = message;
    this.type = type;
    this.data = data;
    Error.captureStackTrace(this, this.constructor.name);
  }
}

class TextError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.error = message;
    Error.captureStackTrace(this, this.constructor.name);
  }
}

module.exports = { APIError, TextError };
