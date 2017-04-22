module.exports = {
  error: function(){
    console.error.apply(arguments);
  },
  log: function(){
    console.log.apply(arguments);
  }
};