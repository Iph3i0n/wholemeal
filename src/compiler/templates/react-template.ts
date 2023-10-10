import Template from "./template";
import * as Js from "../../writer/mod";

export default class ReactTemplate extends Template {
  get Wrapper() {
    return [
      new Js.Import("React", "react", true),
      ...super.Wrapper,
      new Js.Export(
        new Js.Declare(
          "const",
          this.Component.Metadata.FunctionName,
          new Js.Function(
            [new Js.Reference("props")],
            "arrow",
            undefined,
            new Js.Block(
              new Js.Declare(
                "const",
                "ref",
                new Js.Operator(
                  new Js.Access("inner_ref", new Js.Reference("props")),
                  "||",
                  new Js.Call(
                    new Js.Access("useRef", new Js.Reference("React"))
                  )
                )
              ),
              ...this.Component.Metadata.Attr.map(
                (a) =>
                  new Js.Call(
                    new Js.Access("useEffect", new Js.Reference("React")),
                    new Js.Function(
                      [],
                      "arrow",
                      undefined,
                      new Js.Block(
                        new Js.Declare(
                          "const",
                          "r",
                          new Js.Access("current", new Js.Reference("ref"))
                        ),
                        new Js.If(
                          new Js.Modifier(new Js.Reference("r"), "!"),
                          new Js.Return()
                        ),
                        new Js.Assign(
                          new Js.Access(a.Name, new Js.Reference("r")),
                          new Js.Access(a.Name, new Js.Reference("props"))
                        )
                      )
                    ),
                    new Js.Array(
                      new Js.Access("current", new Js.Reference("ref")),
                      new Js.Access(a.Name, new Js.Reference("props"))
                    )
                  )
              ),
              ...this.Component.Metadata.Events.map(
                (a) =>
                  new Js.Call(
                    new Js.Access("useEffect", new Js.Reference("React")),
                    new Js.Function(
                      [],
                      "arrow",
                      undefined,
                      new Js.Block(
                        new Js.Declare(
                          "const",
                          "r",
                          new Js.Access("current", new Js.Reference("ref"))
                        ),
                        new Js.If(
                          new Js.Modifier(new Js.Reference("r"), "!"),
                          new Js.Return()
                        ),
                        new Js.If(
                          new Js.Access(
                            a.HandlerName,
                            new Js.Reference("props")
                          ),
                          new Js.Block(
                            new Js.Call(
                              new Js.Access(
                                "addEventListener",
                                new Js.Reference("r")
                              ),
                              new Js.String(a.Name),
                              new Js.Access(
                                a.HandlerName,
                                new Js.Reference("props")
                              )
                            ),
                            new Js.Return(
                              new Js.Function(
                                [],
                                "arrow",
                                undefined,
                                new Js.Block(
                                  new Js.Call(
                                    new Js.Access(
                                      "removeEventListener",
                                      new Js.Reference("r")
                                    ),
                                    new Js.String(a.Name),
                                    new Js.Access(
                                      a.HandlerName,
                                      new Js.Reference("props")
                                    )
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    ),
                    new Js.Array(
                      new Js.Access("current", new Js.Reference("ref")),
                      new Js.Access(a.HandlerName, new Js.Reference("props"))
                    )
                  )
              ),
              new Js.Declare("const", "final", new Js.Reference("props")),
              new Js.Assign(
                new Js.Access("ref", new Js.Reference("props")),
                new Js.Reference("ref")
              ),
              new Js.Assign(
                new Js.Access("class", new Js.Reference("props")),
                new Js.Access("className", new Js.Reference("props"))
              ),
              new Js.Return(
                new Js.Call(
                  new Js.Access("createElement", new Js.Reference("React")),
                  new Js.String(this.Component.Metadata.Name),
                  new Js.Reference("props")
                )
              )
            )
          )
        ),
        false
      ),
    ];
  }
}
