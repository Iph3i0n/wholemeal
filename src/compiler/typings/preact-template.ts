import * as Ts from "../../ts-writer";
import TypingsTemplate from "./template";

export default class PreactTypingsTemplate extends TypingsTemplate {
  get Typings() {
    return [
      ...super.Typings,
      new Ts.Declare(
        new Ts.Module(
          "preact/src/jsx",
          new Ts.Namespace(
            "JSXInternal",
            new Ts.Create(
              "import",
              "HTMLAttributes",
              new Ts.Access("HTMLAttributes", new Ts.Reference("JSXInternal"))
            ),
            new Ts.Interface(
              "IntrinsicElements",

              new Ts.Property(
                this.Metadata.Name,
                new Ts.Operator(
                  new Ts.Object(...this.Metadata.Attr.map((a) => a.Typings)),
                  "&",
                  new Ts.AppyGeneric(
                    new Ts.Reference("HTMLAttributes"),
                    new Ts.Reference("HTMLElement")
                  )
                )
              )
            )
          )
        )
      ),
    ];
  }
}
