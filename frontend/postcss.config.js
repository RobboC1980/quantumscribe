module.exports = {
  plugins: [
    require('autoprefixer'),
    require('./postcss/forced-colors.js')(),   // ➊ Use the plugin as a function
    require('tailwindcss'),
  ]
}; 