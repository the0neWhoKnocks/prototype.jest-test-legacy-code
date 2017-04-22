var emptyFn = function(){};
var lib = {
  namespace: function(name){
    var parts = name.split('.');
    var namespace = window;
    var part;
    
    for (var i = 0, L = parts.length; i < L; i++) {
      var sourceObject = {};
      if (i === L - 1 && arguments.length > 1) {
        if (_(arguments[1]).isFunction()) {
          sourceObject = arguments[1].call();
        } else {
          sourceObject = arguments[1];
        }
      }
      part = parts[i];

      if( i === L-1 && arguments[2] ){ // allows for overriding the existing object
        namespace[part] = sourceObject;
      }else{
        namespace[part] = namespace[part] || sourceObject;
      }

      namespace = namespace[part];
    }

    if (arguments.length > 1) {
      if (_(arguments[1]).isFunction()) {
        namespace = arguments[1].call();
      } else {
        namespace = arguments[1];
      }
    }

    return namespace;
  },
  load: emptyFn
};