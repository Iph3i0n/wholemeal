import { ComponentBase } from "./component";

export default abstract class ComponentWrapper extends HTMLElement {
  #instance: Promise<ComponentBase> | undefined;

  constructor() {
    super();
  }

  abstract readonly Initialiser: (
    self: ComponentWrapper
  ) => Promise<ComponentBase>;

  connectedCallback() {
    this.style.display = "none";
    this.#instance = this.Initialiser(this);

    this.#instance.then((i) => {
      try {
        this.style.removeProperty("display");
        i.connectedCallback();
      } catch (err) {
        console.error(err);
        debugger;
      }
    });
  }

  disconnectedCallback() {
    this.#instance?.then((i) => i.disconnectedCallback());
  }

  adoptedCallback() {
    this.#instance?.then((i) => i.adoptedCallback());
  }

  attributeChangedCallback(name: string, old: string, next: string) {
    this.#instance?.then((i) => i.attributeChangedCallback(name, old, next));
  }
}
