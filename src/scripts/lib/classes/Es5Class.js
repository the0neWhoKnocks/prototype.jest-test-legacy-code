lib.namespace('lib.classes.Es5Class');

lib.load('lib.utils.logger');
lib.load('templates.Es5Class');

lib.classes.Es5Class = Class.extend({
  init: function(opts){
    var $ = lib.load('jQuery');
    
    opts = opts || {};
    this.template = Handlebars.templates.Es5Class;
    
    lib.utils.logger.log(opts.msg || 'Es5 class initializing');
  }
});