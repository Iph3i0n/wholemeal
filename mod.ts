import { Runner } from "./types/runner.ts";
export {
  LoadedEvent,
  RenderEvent,
  ShouldRender,
  PropsEvent,
} from "./runner/events.ts";

export type IComponent = Runner.IComponent;

export function CreateRef<T extends HTMLElement>(): { current?: T } {
  return { current: undefined };
}
