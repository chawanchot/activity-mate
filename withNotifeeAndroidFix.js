const { withProjectBuildGradle } = require("@expo/config-plugins");
const generateCode = require("@expo/config-plugins/build/utils/generateCode");

// https://github.com/invertase/notifee/issues/350
const notifeeAndroidWorkaroundCode = `
    maven {
      url "$rootDir/../node_modules/@notifee/react-native/android/libs"
    }
`;

module.exports = (expoConfig) => {
  return withProjectBuildGradle(expoConfig, async (config) => {
    const { contents } = generateCode.mergeContents({
      src: config.modResults.contents,
      newSrc: notifeeAndroidWorkaroundCode,
      tag: "NotifeeAndroidWorkaround",
      anchor: /maven\s*\{[^\}]*https:\/\/www\.jitpack\.io[^\}]*\}/,
      comment: "//",
      offset: 1,
    });

    config.modResults.contents = contents;
    return config;
  });
};
