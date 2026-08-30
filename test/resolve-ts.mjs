import { register } from "node:module";
import { pathToFileURL } from "node:url";

// Registers ./ts-hooks.mjs so `node --test` can resolve the app's
// extensionless relative imports. See that file for the details.
register("./ts-hooks.mjs", pathToFileURL(import.meta.filename));
