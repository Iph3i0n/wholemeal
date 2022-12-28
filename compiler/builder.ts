export type CompilerString = {
  type: "string";
  data: string;
};

export type CompilerComputed = {
  type: "computed";
  data: string;
};

export type CompilerFunctionCall = {
  type: "call";
  definition: CompilerProperty;
  args: Array<CompilerProperty>;
};

export type CompilerMaths = {
  type: "maths";
  data: Array<CompilerProperty | string>;
};

export type CompilerObject = {
  type: "object";
  data: Record<string, CompilerProperty>;
};

export type CompilerAccessor = {
  type: "access";
  data: CompilerProperty;
  name: string;
};

export type CompilerArray = { type: "array"; data: Array<CompilerProperty> };

export type CompilerProperty =
  | CompilerArray
  | CompilerString
  | CompilerComputed
  | CompilerObject
  | CompilerFunctionCall
  | CompilerMaths
  | CompilerAccessor
  | CompilerFunction;

export type CompilerIf = {
  type: "if";
  check: CompilerProperty;
  data: Array<CompilerLine>;
};

export type CompilerFor = {
  type: "for";
  key: string;
  value: CompilerProperty;
  accessor: string;
  data: Array<CompilerLine>;
};

export type CompilerInsert = {
  type: "insert";
  data: CompilerProperty;
};

export type CompilerSpreadInsert = {
  type: "spread-insert";
  data: CompilerProperty;
};

export type CompilerDeclare = {
  type: "declare";
  access: "const" | "let";
  name: string;
  value: CompilerProperty;
};

export type CompilerLine =
  | CompilerDeclare
  | CompilerInsert
  | CompilerSpreadInsert
  | CompilerIf
  | CompilerFor;

export type CompilerFunction = {
  type: "function";
  args?: string;
  data: Array<CompilerLine>;
};

function BuildInsert(data: CompilerInsert) {
  return `result.push(${BuildProperty(data.data)})`;
}

function BuildInsertSpread(data: CompilerSpreadInsert) {
  return `result.push(...${BuildProperty(data.data)})`;
}

function BuildDeclaration(data: CompilerDeclare) {
  return `${data.access} ${data.name} = ${BuildProperty(data.value)}`;
}

function Execute(data: string, args: string) {
  return `(${data})(${args})`;
}

function BuildFunctionCall(data: CompilerFunctionCall): string {
  return Execute(
    BuildProperty(data.definition),
    data.args.map(BuildProperty).join(",")
  );
}

function BuildAccessor(data: CompilerAccessor): string {
  return BuildProperty(data.data) + "." + data.name;
}

function BuildMaths(data: CompilerMaths): string {
  return data.data
    .map((d) => (typeof d === "string" ? d : BuildProperty(d)))
    .join(" ");
}

function BuildProperty(data: CompilerProperty): string {
  switch (data.type) {
    case "string":
      return `\`${data.data.replaceAll("`", "\\`")}\``;
    case "computed":
      return data.data;
    case "call":
      return BuildFunctionCall(data);
    case "array":
      return BuildArray(data);
    case "object":
      return BuildObject(data);
    case "maths":
      return BuildMaths(data);
    case "access":
      return BuildAccessor(data);
    case "function":
      return BuildFunction(data);
  }
}

function BuildObject(data: CompilerObject): string {
  const internals = Object.keys(data.data)
    .map((k) => [BuildProperty(data.data[k]), k] as const)
    .map(([d, k]) => `${k}:${d}`)
    .join(",");
  return `{${internals}}`;
}

function BuildArray(data: CompilerArray): string {
  return `[${data.data.map(BuildProperty).join(",")}]`;
}

function BuildFor(data: CompilerFor): string {
  return `for (const ${data.key} ${data.accessor} ${BuildProperty(
    data.value
  )}){${BuildLines(data.data)}}`;
}

function BuildIf(data: CompilerIf): string {
  return `if (${BuildProperty(data.check)}){${BuildLines(data.data)}}`;
}

function BuildLines(data: Array<CompilerLine>): string {
  const result: Array<string> = [];
  for (const item of data)
    switch (item.type) {
      case "for":
        result.push(BuildFor(item));
        break;
      case "if":
        result.push(BuildIf(item));
        break;
      case "insert":
        result.push(BuildInsert(item));
        break;
      case "spread-insert":
        result.push(BuildInsertSpread(item));
        break;
      case "declare":
        result.push(BuildDeclaration(item));
        break;
    }

  return result.join(";");
}

export function BuildFunction(data: CompilerFunction): string {
  return `((${data.args ?? ""}) => { const result = []; ${BuildLines(
    data.data
  )}; return result; })`;
}
