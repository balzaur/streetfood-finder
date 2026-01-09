const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch the monorepo packages
config.watchFolders = [workspaceRoot];

// 2. Force Metro to resolve modules correctly in pnpm workspaces
config.resolver = {
  ...config.resolver,

  // Tell Metro where to look for node_modules
  nodeModulesPaths: [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ],

  // Critical: Don't use hierarchical lookup with pnpm
  disableHierarchicalLookup: false,

  // Resolve symlinked packages (critical for pnpm)
  unstable_enableSymlinks: true,
  unstable_enablePackageExports: true,
};

// 3. Ensure Metro can find source files in the workspace
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;
