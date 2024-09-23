export class UnknownError extends Error {
    constructor(
        message: string,
        public readonly error: unknown,
    ) {
        super(message);
    }
}
