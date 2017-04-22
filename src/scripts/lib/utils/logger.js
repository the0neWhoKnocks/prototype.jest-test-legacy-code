lib.namespace('lib.utils.logger');

lib.utils.logger = {
  error: function(){
    console.error.apply(arguments);
  },
  log: function(){
    console.log.apply(arguments);
  }
};