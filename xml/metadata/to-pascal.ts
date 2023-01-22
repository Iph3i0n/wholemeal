export default function ToPascal(data: string) {
  return data.replace(/(^\w|-\w)/g, (item) =>
    item.replace(/-/, "").toUpperCase()
  );
}
