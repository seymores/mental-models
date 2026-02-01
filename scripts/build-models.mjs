import fs from "node:fs";
import path from "node:path";

const inputRoot =
  process.env.MMODEL_INPUT_DIR || "/Users/ping/Projects/mental-models-data";
const outputPath = path.resolve("public/models-latest.json");

const sources = [
  { file: "people.md", category: "People" },
  { file: "process.md", category: "Process" },
  { file: "product.md", category: "Product" },
];

const sectionMap = new Map([
  ["Principle", "principle"],
  ["Core Concept", "coreConcept"],
  ["One Best Example", "example"],
  ["Try This Now", "tryThis"],
  ["Related Mental Models", "related"],
]);

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeText = (value) =>
  value
    .replace(/\s+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const parseSource = (source) => {
  const filePath = path.join(inputRoot, source.file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing source file: ${filePath}`);
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  const models = [];
  let current = null;
  let sectionKey = null;
  let buffer = [];

  const flushSection = () => {
    if (!current || !sectionKey) return;
    if (sectionKey === "related") return;
    const content = normalizeText(buffer.join("\n"));
    if (content) {
      current[sectionKey] = content;
    }
    buffer = [];
  };

  const finishModel = () => {
    if (!current) return;
    flushSection();
    current.principle ||= "";
    current.coreConcept ||= "";
    current.example ||= "";
    current.tryThis ||= "";
    current.related ||= [];
    models.push(current);
    current = null;
    sectionKey = null;
    buffer = [];
  };

  for (const line of lines) {
    const modelMatch = line.match(/^##\s+\d+\.\s+(.+?)\s*$/);
    if (modelMatch) {
      finishModel();
      const title = modelMatch[1].trim();
      current = {
        id: `${source.category.toLowerCase()}-${slugify(title)}`,
        title,
        category: source.category,
      };
      sectionKey = null;
      buffer = [];
      continue;
    }

    if (!current) continue;

    const sectionMatch = line.match(/^\*\*(.+?)\*\*\s*$/);
    if (sectionMatch) {
      flushSection();
      const label = sectionMatch[1].trim();
      sectionKey = sectionMap.get(label) || null;
      if (sectionKey === "related") {
        current.related = current.related || [];
      }
      buffer = [];
      continue;
    }

    if (!sectionKey) continue;

    if (sectionKey === "related") {
      const bullet = line.match(/^\s*-\s+(.*)$/);
      if (bullet) {
        const raw = bullet[1].trim().replace(/\*\*/g, "");
        const name = raw.split(" - ")[0].trim();
        if (name) current.related.push(name);
      }
      continue;
    }

    buffer.push(line);
  }

  finishModel();
  return models;
};

const allModels = sources.flatMap(parseSource);
const payload = {
  generatedAt: new Date().toISOString(),
  count: allModels.length,
  models: allModels,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
console.log(`Wrote ${allModels.length} models to ${outputPath}`);
