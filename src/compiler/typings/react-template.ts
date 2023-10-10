import TypingsTemplate from "./template";
import * as Ts from "../../ts-writer";

export default class ReactTypingsTemplate extends TypingsTemplate {
  get Typings() {
    return [
      new Ts.Import("React", "react", true),
      ...super.Typings,
      new Ts.Type(
        "CustomElement",
        new Ts.Operator(
          new Ts.Reference("T"),
          "&",
          new Ts.AppyGeneric(
            new Ts.Reference("Partial"),
            new Ts.Operator(
              new Ts.AppyGeneric(
                new Ts.Access("HTMLAttributes", new Ts.Reference("React")),
                new Ts.Reference("T")
              ),
              "&",
              new Ts.Object(
                new Ts.Property(
                  "children",
                  new Ts.Access("ReactNode", new Ts.Reference("React")),
                  true
                )
              )
            )
          )
        ),
        "T"
      ),
      new Ts.Declare(
        new Ts.Global(
          new Ts.Namespace(
            "JSX",
            new Ts.Interface(
              "IntrinsicElements",
              new Ts.Property(
                this.Metadata.Name,
                new Ts.AppyGeneric(
                  new Ts.Reference("CustomElement"),
                  new Ts.Object(...this.Metadata.Attr.map((p) => p.Typings))
                )
              )
            )
          )
        )
      ),
      new Ts.Export(
        new Ts.Function(
          this.Metadata.FunctionName,
          new Ts.AppyGeneric(
            new Ts.Access("DOMElement", new Ts.Reference("React")),
            new Ts.Access("HTMLAttributes", new Ts.Reference("React")),
            new Ts.Reference(`${this.Metadata.FunctionName}Element`)
          ),
          [
            "props",
            new Ts.AppyGeneric(
              new Ts.Reference("CustomElement"),
              new Ts.Object(
                ...this.Metadata.Attr.map((a) => a.Typings),
                ...this.Metadata.Events.map((e) => e.Typings)
              )
            ),
          ]
        ),
        false
      ),
    ];
  }
}
