/**
 * Node's ESM loader requires file extensions, but the app source uses the
 * extensionless relative imports the Next.js bundler expects. When a relative
 * specifier fails to resolve, retry it with a `.ts` suffix so `node --test`
 * can exercise the real source files unmodified.
 */
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (error) {
    if (specifier.startsWith(".")) {
      for (const suffix of [".ts", ".tsx", "/index.ts"]) {
        try {
          return await next(specifier + suffix, context);
        } catch {
          // Try the next candidate.
        }
      }
    }
    throw error;
  }
}
