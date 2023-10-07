export {
  LoadedEvent,
  RenderEvent,
  ShouldRender,
  PropsEvent,
  BeforeRenderEvent,
} from "./runner/events";

export { ComponentBase } from "./runner/component";

export function CreateRef<T extends HTMLElement>(): { current?: T } {
  return { current: undefined };
}
