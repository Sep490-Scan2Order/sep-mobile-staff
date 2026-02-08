const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
const { withNativeWind } = require('nativewind/metro');
const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.sourceExts.push('cjs');
defaultConfig.resolver.sourceExts.push('mjs'); // thêm để Metro hiểu .mjs
defaultConfig.resolver.unstable_enablePackageExports = true;

const config = {
    resolver: {
        // ép Metro load .mjs thay vì legacy-esm
        resolveRequest: (context, moduleName, platform) => {
            if (moduleName === 'react-redux') {
                return {
                    type: 'sourceFile',
                    filePath: path.resolve(__dirname, 'node_modules/react-redux/dist/react-redux.mjs'),
                };
            }
            return context.resolveRequest(context, moduleName, platform);
        },
    },
    transformer: {
        experimentalImportSupport: true,
    },
};
module.exports = withNativeWind(
    mergeConfig(defaultConfig, config),
    { input: './global.css' }
);