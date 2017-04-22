lib.namespace('lib.utils.helpers');

Handlebars.registerHelper('print', function(text){
  return new Handlebars.SafeString(text);
});