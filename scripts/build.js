import fs from "fs";
import fsp from "fs/promises";
import path from "path";

const cp = async (s, d) => {
  await fsp.mkdir(d, { recursive: true });
  for (const e of await fsp.readdir(s, { withFileTypes: true })) {
    const sp = path.join(s, e.name);
    const dp = path.join(d, e.name);
    e.isDirectory() ? await cp(sp, dp) : fs.copyFileSync(sp, dp);
  }
};

console.log("Building dist from src...");
await cp("src", "dist");
console.log("Build complete!");