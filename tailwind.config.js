module.exports = {
  content: ["./views/**/*.ejs", "./public/**/*.js"],

  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography')
  ],
  daisyui: {
    themes: ["dim"], // or your preferred theme
  }
}
