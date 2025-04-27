module.exports = {
  plugins: [
    require('autoprefixer'),
    require('./postcss/forced-colors.js'),   // ➊ our custom plug-in
    require('tailwindcss'),
  ]
}; 