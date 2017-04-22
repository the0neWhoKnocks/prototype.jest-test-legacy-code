module.exports = function(documentCtx, windowCtx){

  Object.defineProperty(documentCtx, 'referrer', {
    writable: true,
    value: documentCtx.referrer
  });

  // ===========================================================================

  Object.defineProperty(windowCtx.navigator, 'userAgent', (function(_value){
    return {
      get: function _get() {
        return _value;
      },
      set: function _set(v) {
        _value = v;
      }
    };
  })(windowCtx.navigator.userAgent));

  // ===========================================================================

  Object.defineProperty(windowCtx.location, 'ancestorOrigins', {
    writable: true,
    value: {}
  });
  Object.defineProperty(windowCtx.location, 'assign', {
    writable: true,
    value: function(){}
  });
  Object.defineProperty(windowCtx.location, 'hash', {
    writable: true,
    value: windowCtx.location.hash
  });
  Object.defineProperty(windowCtx.location, 'host', {
    writable: true,
    value: windowCtx.location.host
  });
  Object.defineProperty(windowCtx.location, 'href', {
    writable: true,
    value: windowCtx.location.href
  });
  Object.defineProperty(windowCtx.location, 'origin', {
    writable: true,
    value: windowCtx.location.origin
  });
  Object.defineProperty(windowCtx.location, 'pathname', {
    writable: true,
    value: windowCtx.location.pathname
  });
  Object.defineProperty(windowCtx.location, 'port', {
    writable: true,
    value: windowCtx.location.port
  });
  Object.defineProperty(windowCtx.location, 'protocol', {
    writable: true,
    value: windowCtx.location.protocol
  });
  Object.defineProperty(windowCtx.location, 'reload', {
    writable: true,
    value: function(){}
  });
  Object.defineProperty(windowCtx.location, 'replace', {
    writable: true,
    value: function(){}
  });
  Object.defineProperty(windowCtx.location, 'search', {
    writable: true,
    value: windowCtx.location.search
  });
  Object.defineProperty(windowCtx, 'location', {
    set: function(url){
      var pathname = url.match(/^https?:\/\/[^/]+\/([^?#]+)/);
      var port = url.match(/(:[^/]+)/);

      // if the URL doesn't start with a `http`, `https`, or `//`, append it to the current origin
      if( !/^(?:https?:)?\/\//.test(url) ){
        url = windowCtx.location.origin + '/' + url;
      }
      // if the URL starts with just `//` then prepend the current protocol
      if( /^\/\//.test(url) ){
        url = windowCtx.location.protocol + url;
      }

      windowCtx.location.hash = ( url.split('#')[1] )
        ? `#${url.split('#')[1]}`
        : '';
      windowCtx.location.host = url.match(/:\/\/([^/]+)/)[1];
      windowCtx.location.hostname = url.match(/:\/\/([^/]+)/)[1];
      windowCtx.location.href = url;
      windowCtx.location.origin = url.match(/^(https?:\/\/[^/]+)/)[1];
      windowCtx.location.pathname = pathname ? '/' + pathname[1] : '/';
      windowCtx.location.port = port ? port[1] : '';
      windowCtx.location.protocol = url.match(/^https?/)[0] + ':';
      windowCtx.location.search = ( url.split('#')[0].split('?')[1] )
        ? `?${ url.split('#')[0].split('?')[1] }`
        : '';
    }
  });

  // ===========================================================================

  var storage = {
    _data: {},
    setItem: function(id, val){
      return this._data[id] = String(val);
    },
    getItem: function(id){
      return this._data.hasOwnProperty(id)
        ? this._data[id]
        : undefined;
    },
    removeItem: function(id){
      return delete this._data[id];
    },
    clear: function(){
      return this._data = {};
    }
  };
  var storageGetterSetters = {
    get: function(id){
      return this._data[id];
    },
    set: function(id, val){
      this._data[id] = val;
    }
  };

  if( !windowCtx.localStorage ){
    windowCtx.localStorage = storage;
    Object.defineProperty(windowCtx, 'localStorage', storageGetterSetters);
  }else{
    console.warn('[WARN] This polyfill can be removed since localStorage is now supported');
  }

  if( !windowCtx.sessionStorage ){
    windowCtx.sessionStorage = storage;
    Object.defineProperty(windowCtx, 'sessionStorage', storageGetterSetters);
  }else{
    console.warn('[WARN] This polyfill can be removed since sessionStorage is now supported');
  }

  // ===========================================================================

  if( !documentCtx.queryCommandSupported ){
    documentCtx.queryCommandSupported = function(str){
      switch( str ){
        case 'copy': return true;
      }
    };
  }else{
    console.warn('[WARN] This polyfill can be removed since queryCommandSupported is now supported');
  }

  if( !documentCtx.execCommand ){
    documentCtx.execCommand = function(){};
  }else{
    console.warn('[WARN] This polyfill can be removed since execCommand is now supported');
  }

  // ===========================================================================

  // patch up any missing style props for Modernizr
  var origCreateElement = documentCtx.createElement;
  documentCtx.createElement = function(localName){
    var el = origCreateElement.call(documentCtx, localName);

    el.style.transition = '';

    return el;
  };
};