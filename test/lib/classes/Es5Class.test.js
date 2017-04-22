describe('Es5Class', function(){
  testCtx.load([
    'lib.classes.Es5Class',
    'templates.Es5Class'
  ]);
  
  var sandbox, initStub, testClass, markup;
  
  beforeEach(function(){
    sandbox = sinon.sandbox.create();
    
    /**
     * For methods that execute within a constructor you'll need to stub them
     * out on the prototype to ensure they don't execute.
     */
    initStub = sandbox.stub(lib.classes.Es5Class.prototype, 'init');
    
    testClass = new lib.classes.Es5Class();
    document.body.innerHTML = testCtx.unescapeScriptTags(Handlebars.templates.Es5Class({
      data: {
        msg: 'World'
      }
    }));
  });
  
  afterEach(function(){
    sandbox.restore();
  });
  
  it("should be defined", function(){
    testClass.should.be.an.instanceof(lib.classes.Es5Class);
    window.fu.should.equal('bar'); // testing that var was added via script tag from template
    expect( document.querySelector('#es5Module').textContent ).to.match(/Hello World/);
  });
  
  describe('init', function(){
    /**
     * Since `init` was stubbed out above, we now need to restore it so it can
     * be tested here.
     */
    beforeEach(function(){
      initStub.restore();
    });
    
    it("should initialize the component", function(){
      var logStub = sandbox.stub(lib.utils.logger, 'log');
      var opts = {
        msg: 'log test'
      };
      
      testClass.init(opts);
      
      logStub.should.be.calledWith(opts.msg);
      
      testClass.init();
      
      logStub.should.be.calledWith('Es5 class initializing');
    });
  });
});