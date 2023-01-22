export {
  LoadedEvent,
  RenderEvent,
  ShouldRender,
  PropsEvent,
  BeforeRenderEvent,
} from "./runner/events.ts";

export { ComponentBase } from "./runner/component.ts";

export function CreateRef<T extends HTMLElement>(): { current?: T } {
  return { current: undefined };
}
