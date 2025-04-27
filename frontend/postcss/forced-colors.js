// PostCSS plugin to replace -ms-high-contrast with forced-colors
const MAP = {
  '(-ms-high-contrast: active)': '(forced-colors: active)',
  '(-ms-high-contrast: none)'  : '(forced-colors: none)',
};

// Define the plugin properly using CommonJS format
const postcssPlugin = () => {
  return {
    postcssPlugin: 'postcss-forced-colors',
    AtRule(atRule) {
      if (atRule.name !== 'media') return;
      Object.entries(MAP).forEach(([legacy, modern]) => {
        if (atRule.params.includes(legacy))
          atRule.params = atRule.params.replace(legacy, modern);
      });
    }
  };
};

postcssPlugin.postcss = true;
module.exports = postcssPlugin; 