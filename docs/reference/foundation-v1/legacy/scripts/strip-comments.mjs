import { globSync, readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";

const KEEP = /^\s*(eslint|@ts-|prettier-|c8 |v8 |istanbul |#!|<reference)/;

function collectCommentRanges(text, fileName) {
  const source = ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith("x") ? ts.ScriptKind.TSX : undefined,
  );

  const found = new Map();

  const record = (ranges) => {
    for (const range of ranges ?? []) {
      const body = text
        .slice(range.pos, range.end)
        .replace(/^\/\/+/, "")
        .replace(/^\/\*+/, "")
        .replace(/\*+\/$/, "");

      if (KEEP.test(body)) continue;
      found.set(`${range.pos}:${range.end}`, [range.pos, range.end]);
    }
  };

  const visit = (node) => {
    record(ts.getLeadingCommentRanges(text, node.getFullStart()));
    record(ts.getTrailingCommentRanges(text, node.getEnd()));

    for (const child of node.getChildren(source)) visit(child);
  };

  visit(source);
  record(ts.getLeadingCommentRanges(text, 0));

  return [...found.values()].sort((a, b) => a[0] - b[0]);
}

function stripJsxComments(text) {
  return text.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}[ \t]*\n?/g, "");
}

function removeRanges(text, ranges) {
  let output = "";
  let cursor = 0;

  for (const [start, end] of ranges) {
    if (start < cursor) continue;
    output += text.slice(cursor, start);
    cursor = end;
  }

  return output + text.slice(cursor);
}

function tidy(text) {
  return text
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/(\{|\()\n\n+/g, "$1\n")
    .replace(/\n\n+(\s*(\}|\)))/g, "\n$1")
    .replace(/^\n+/, "")
    .replace(/\n*$/, "\n");
}

function parseErrorCount(text, fileName) {
  const source = ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith("x") ? ts.ScriptKind.TSX : undefined,
  );

  return source.parseDiagnostics?.length ?? 0;
}

const files = [
  ...globSync("{src,scripts,e2e}/**/*.{ts,tsx,mts,mjs}"),
  "next.config.ts",
  "vitest.config.mts",
  "vitest.setup.ts",
  "playwright.config.ts",
  "eslint.config.mjs",
];

let changed = 0;
const failures = [];

for (const file of files) {
  let text;

  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  const baseline = parseErrorCount(text, file);
  let next = stripJsxComments(text);
  next = removeRanges(next, collectCommentRanges(next, file));
  next = tidy(next);

  if (next === text) continue;

  if (parseErrorCount(next, file) > baseline) {
    failures.push(file);
    continue;
  }

  writeFileSync(file, next);
  changed += 1;
}

console.log(`stripped comments from ${changed} file(s)`);

if (failures.length > 0) {
  console.error("skipped, parsing would have broken:");
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}
