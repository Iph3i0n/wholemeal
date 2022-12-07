export type Property = {
  id: string;
  value: string;
};

export type FunctionCall = {
  name: string;
  args: Iterable<string>;
}

export type AtStatement = {
  type: "at-statement";
  variant: string;
  value: string;
};

export type AtBlock = {
  type: "at-block";
  variant: string;
  query: string;
  children: Iterable<Block>;
};

export type Rule = {
  type: "rule";
  selector: string;
  children: Iterable<Property | FunctionCall>;
};

export type For = {
  type: "for";
  accessor: "of" | "in";
  subject: string;
  key: string;
  children: Iterable<Block>;
};

export type If = {
  type: "if";
  check: string;
  children: Iterable<Block>;
};

export type Use = {
  type: "use";
  subject: string;
  key: string;
  children: Iterable<Block>;
};

export type Block = AtStatement | AtBlock | Rule | For | If | Use;
