const Writer = Symbol();

export default abstract class BaseWriter {
  get Symbol() {
    return Writer;
  }

  abstract toString(): string;
}
