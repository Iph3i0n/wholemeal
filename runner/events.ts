export class LoadedEvent extends Event {
  constructor() {
    super(LoadedEvent.Key, { bubbles: false });
  }

  static get Key() {
    return "loaded";
  }
}

export class BeforeRenderEvent extends Event {
  constructor() {
    super(BeforeRenderEvent.Key, { bubbles: false });
  }

  static get Key() {
    return "before-render";
  }
}

export class RenderEvent extends Event {
  constructor() {
    super(RenderEvent.Key, { bubbles: false });
  }

  static get Key() {
    return "rerendered";
  }
}

export class ShouldRender extends Event {
  constructor() {
    super(ShouldRender.Key, { bubbles: false });
  }

  static get Key() {
    return "should_render";
  }
}

export class PropsEvent extends Event {
  #key: string;
  #value: string;
  #old: string;

  constructor(key: string, old: string, value: string) {
    super(PropsEvent.Key, { bubbles: false });
    this.#key = key;
    this.#value = value;
    this.#old = old;
  }

  static get Key() {
    return "props_changed";
  }

  get Key() {
    return this.#key;
  }

  get Value() {
    return this.#value;
  }

  get Old() {
    return this.#old;
  }
}
