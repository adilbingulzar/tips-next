// Collects every English text the website can show, for translation.
//
//   npm run texts
//
// Writes backend/database/seeders/data/ui-texts.json ("texts": the English
// texts; "translations": bundled translations, kept as they are). The backend
// command `php artisan tiqs:sync-ui-texts` adds new texts to the database,
// where admins translate them (Admin › Translations).
//
// Found are: the first argument of t("…"), and capitalised string literals in
// components and server actions (labels, hints and messages that shared
// components translate). The admin area is English only and is skipped.
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const src = join(root, "src");
const output = join(root, "..", "backend", "database", "seeders", "data", "ui-texts.json");
const skip = [/\/admin\//, /\/lib\/admin-/, /\/actions\/admin\.ts$/, /\.d\.ts$/];

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : /\.(tsx|ts)$/.test(name) ? [path] : [];
  });
}

const unescape = (text) => text.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, "\\");
const texts = new Set();

for (const file of files(src)) {
  const path = relative(src, file);
  if (skip.some((pattern) => pattern.test(`/${path}`))) {
    continue;
  }
  const code = readFileSync(file, "utf8");

  for (const match of code.matchAll(/(?<![\w.])t\(\s*"((?:[^"\\]|\\.)+)"/g)) {
    texts.add(unescape(match[1]));
  }

  // <EmptyState>Plain text</EmptyState> is translated by the component itself.
  for (const match of code.matchAll(/<EmptyState>([^<{}]+)<\/EmptyState>/g)) {
    texts.add(match[1].trim());
  }

  // Only components and server actions hold texts outside t(): library code holds URLs, keys and the like.
  if (!/^(app|components)\//.test(path)) {
    continue;
  }
  for (const match of code.matchAll(/"((?:[^"\\]|\\.){0,300})"/g)) {
    const text = unescape(match[1]);
    if (text.length < 2 || /^M[\d.]/.test(text)) {
      continue;
    }
    const line = code.slice(code.lastIndexOf("\n", match.index) + 1, code.indexOf("\n", match.index));
    if (/^\s*(import|export \* from)|className=|from "|require\(|import\(/.test(line)) {
      continue;
    }
    // A text starts with a capital (or a symbol like ← or +), has a lower-case letter, and is not a path, key, colour or class list.
    if (!/^[A-Z←+“(]/.test(text) || !/[a-z]/.test(text) || /^[A-Z][a-z]+[A-Z]\w*$/.test(text) || /[/_=#<>@]|^\w+-\w+$|\.(png|jpg|webp|svg|csv)$/i.test(text)) {
      continue;
    }
    texts.add(text);
  }
}

let existing = { texts: [], translations: {} };
try {
  existing = JSON.parse(readFileSync(output, "utf8"));
} catch {
  // first run
}

// Texts the website shows that come from the API.
const fromApi = JSON.parse(readFileSync(join(src, "i18n", "api-texts.json"), "utf8"));
for (const text of fromApi) {
  texts.add(text);
}

const sorted = [...texts].sort((a, b) => a.localeCompare(b, "en"));
writeFileSync(output, `${JSON.stringify({ texts: sorted, translations: existing.translations ?? {} }, null, 2)}\n`);

const missing = Object.fromEntries(Object.entries(existing.translations ?? {}).map(([locale, list]) => [locale, sorted.filter((text) => !(text in list)).length]));
console.log(`${sorted.length} texts written to ${relative(join(root, ".."), output)}. Without bundled translation: ${JSON.stringify(missing)}`);
