import { readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const directory = join(process.cwd(), "public", "frames");
const output = join(directory, "manifest.json");
const files = (await readdir(directory))
  .filter((file) => /\.(webp|jpg|jpeg|png)$/i.test(file))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

await writeFile(output, JSON.stringify({ frames: files }, null, 2) + "\n");
console.log(`Wrote ${files.length} frames to ${output}`);
