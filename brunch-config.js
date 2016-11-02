module.exports = {
   npm: {
     globals: {
      $: 'jquery',
      jQuery: 'jquery'
  }},
  // See http://brunch.io for documentation.
  files: {
    javascripts: {
      joinTo: {
        'js/app.js': /^app/,
        'js/vendor.js': /(^node_modules|^vendor)/ 
      },
      order: {
        before: /.*jquery.*/
      }
    },
    stylesheets: { joinTo: 'app.css' },
    templates: { joinTo: 'app.js' }
  },
  plugins: {
    sass: {
      options: {
        includePaths: [
          'node_modules/bootstrap-sass/assets/stylesheets/',
          'vendor/'
        ]
      }
    }
  }
}
