export default class EventManager {
  #target: HTMLElement;
  #handlers: Record<string, (e: Event) => void> = {};

  static #ElementKey = "___EVENT_MANAGER___";

  // deno-lint-ignore no-explicit-any
  static Retrieve(target: any): EventManager | undefined {
    return target[EventManager.#ElementKey];
  }

  // deno-lint-ignore no-explicit-any
  #bind(target: any) {
    target[EventManager.#ElementKey] = this;
  }

  constructor(target: HTMLElement) {
    this.#target = target;
    const existing = EventManager.Retrieve(target);
    if (existing) existing.#clear();

    this.#bind(target);
  }

  Add(key: string, handler: (e: Event) => void) {
    if (this.#handlers[key])
      this.#target.removeEventListener(key, this.#handlers[key]);

    this.#target.addEventListener(key, handler);
    this.#handlers[key] = handler;
  }

  #clear() {
    for (const key in this.#handlers) {
      this.#target.removeEventListener(key, this.#handlers[key]);
      delete this.#handlers[key];
    }
  }
}
