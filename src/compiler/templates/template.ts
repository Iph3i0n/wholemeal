import Component from "../../xml/component";
import * as Js from "../../writer/mod";
import Path from "path";

export default class Template {
  readonly #data: Component;
  readonly #location: string;

  constructor(data: Component, location: string) {
    this.#data = data;
    this.#location = location;
  }

  get Component() {
    return this.#data;
  }

  get Wrapper() {
    return [
      new Js.Import(
        "ComponentWrapper",
        Path.resolve(__dirname, "..", "..", "runner", "component-wrapper"),
        true
      ),
      new Js.Export(
        new Js.Class(
          this.#data.Metadata.FunctionName + "Element",
          "ComponentWrapper",
          new Js.Function(
            [new Js.Reference("self")],
            "method",
            "Initialiser",
            new Js.Block(
              new Js.Return(
                new Js.Call(
                  new Js.Access(
                    "then",
                    new Js.Call(
                      new Js.Reference("import"),
                      new Js.String(`${this.#location}?actual=true`)
                    )
                  ),
                  new Js.Function(
                    [new Js.Reference("r")],
                    "arrow",
                    undefined,
                    new Js.Block(
                      new Js.Return(
                        new Js.New(
                          new Js.Call(
                            new Js.Access(
                              this.#data.Metadata.FunctionName,
                              new Js.Reference("r")
                            ),
                            new Js.Reference("self")
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        ),
        false
      ),
      new Js.Call(
        new Js.Access("define", new Js.Reference("customElements")),
        new Js.String(this.#data.Metadata.Name),
        new Js.Reference(this.#data.Metadata.FunctionName + "Element")
      ),
    ];
  }

  get Module() {
    const base = this.#data.Metadata.Base?.Name ?? "ComponentBase";

    return [
      !this.#data.Metadata.Base
        ? new Js.Import(
            "ComponentBase",
            Path.resolve(__dirname, "../../runner/component.js"),
            false
          )
        : "",
      new Js.Import(
        [
          "LoadedEvent",
          "RenderEvent",
          "ShouldRender",
          "PropsEvent",
          "CreateRef",
          "BeforeRenderEvent",
        ],
        Path.resolve(__dirname, "../../mod.js"),
        false
      ),
      this.#data.Metadata.ScriptImports,
      this.#data.ScriptImports,
      new Js.Export(
        new Js.Class(
          this.#data.Metadata.FunctionName,
          base,
          new Js.Function(
            [],
            "method",
            "aria",
            new Js.Block(new Js.Return(new Js.Json(this.#data.Metadata.Aria))),
            ["get"]
          ),
          new Js.Function(
            [],
            "method",
            "observedAttributes",
            new Js.Block(
              new Js.Return(
                new Js.Array(
                  ...this.#data.Metadata.Attr.map((a) => new Js.Json(a.Name))
                )
              )
            ),
            ["static", "get"]
          ),
          ...this.#data.Metadata.Attr.flatMap((a) => [
            new Js.Assign(
              new Js.Reference("#" + a.JsName),
              new Js.Reference("null")
            ),
            new Js.Function(
              [],
              "method",
              a.Name,
              new Js.Block(
                ...(a.Type === "boolean"
                  ? [
                      new Js.If(
                        new Js.Comparison(
                          new Js.Access(
                            "#" + a.JsName,
                            new Js.Reference("this")
                          ),
                          "not_equals",
                          new Js.Reference("null")
                        ),
                        new Js.Return(
                          new Js.Operator(
                            new Js.Modifier(
                              new Js.Access(
                                "#" + a.JsName,
                                new Js.Reference("this")
                              ),
                              "!!"
                            ),
                            "||",
                            new Js.Comparison(
                              new Js.Access(
                                "#" + a.JsName,
                                new Js.Reference("this")
                              ),
                              "equals",
                              new Js.String("")
                            )
                          )
                        )
                      ),
                      new Js.Declare(
                        "const",
                        "a_value",
                        new Js.Call(
                          new Js.Access(
                            "getAttribute",
                            new Js.Reference("this")
                          ),
                          new Js.Json(a.Name)
                        )
                      ),
                      new Js.If(
                        new Js.Comparison(
                          new Js.Reference("a_value"),
                          "not_equals",
                          new Js.Reference("null")
                        ),
                        new Js.Return(
                          new Js.Operator(
                            new Js.Modifier(new Js.Reference("a_value"), "!!"),
                            "||",
                            new Js.Comparison(
                              new Js.Reference("a_value"),
                              "equals",
                              new Js.String("")
                            )
                          )
                        )
                      ),
                      new Js.Return(new Js.Boolean(false)),
                    ]
                  : [
                      new Js.Return(
                        new Js.Operator(
                          new Js.Operator(
                            new Js.Access(
                              "#" + a.JsName,
                              new Js.Reference("this")
                            ),
                            "??",
                            new Js.Call(
                              new Js.Access(
                                "getAttribute",
                                new Js.Reference("this")
                              ),
                              new Js.Json(a.Name)
                            )
                          ),
                          "??",
                          a.Default
                            ? new Js.String(a.Default)
                            : new Js.Reference("undefined")
                        )
                      ),
                    ])
              ),
              ["get"]
            ),
            new Js.Function(
              [new Js.Reference("value")],
              "method",
              a.Name,
              new Js.Block(
                new Js.Assign(
                  new Js.Access("#" + a.JsName, new Js.Reference("this")),
                  new Js.Reference("value")
                )
              ),
              ["set"]
            ),
          ]),
          new Js.Function(
            [],
            "method",
            "start",
            new Js.Block(
              new Js.Declare("const", "self", new Js.Reference("this")),
              new Js.Declare(
                "const",
                "handle",
                new Js.Function(
                  [new Js.Reference("handler")],
                  "arrow",
                  undefined,
                  new Js.Function(
                    [new Js.Reference("e")],
                    "arrow",
                    undefined,
                    new Js.Block(
                      new Js.Await(
                        new Js.Call(
                          new Js.Reference("handler"),
                          new Js.Reference("e")
                        )
                      ),
                      new Js.Call(
                        new Js.Access(
                          "dispatchEvent",
                          new Js.Reference("this")
                        ),
                        new Js.New(
                          new Js.Call(new Js.Reference("ShouldRender"))
                        )
                      )
                    ),
                    ["async"]
                  )
                )
              ),
              new Js.Reference(this.#data.ScriptMain),
              new Js.Return(
                new Js.Object({
                  html: this.#data.Html,
                  css: this.#data.Css.JavaScript,
                })
              )
            ),
            ["async"]
          )
        ),
        false
      ),
    ];
  }
}
