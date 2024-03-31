
/* MAIN */

type Bundle = {
  outputPath: string,
  outputSize: number,
  metafilePath: string,
  analyzerPath: string,
  bundlePath: string
};

type Dependency = {
  name: string, // The name in package.json
  version: string, // The version installed in node_modules
  size?: number // The bundle size of the package, minified
};

type Options = {
  enabled: boolean
};

/* EXPORT */

export type {Bundle, Dependency, Options};
