import TestClass from './Es6Class.babel.js';

/**
 * Split views in your IDE, and have one view be the file you want to test
 * and the other view be your test file.
 */  
describe('Es6Class', () => {
  let sandbox, initStub, testClass;
  
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    
    /**
     * For methods that execute within a constructor you'll need to stub them
     * out on the prototype to ensure they don't execute.
     */
    initStub = sandbox.stub(TestClass.prototype, 'init');
    
    testClass = new TestClass();
  });
  
  afterEach(() => {
    sandbox.restore();
  });
  
  it("should be defined", () => {
    testClass.should.be.a.function;
  });
  
  describe('init', () => {
    /**
     * Since `init` was stubbed out above, we now need to restore it so it can
     * be tested here.
     */
    beforeEach(() => {
      initStub.restore();
    });
    
    it("should initialize the component", () => {    
      /**
       * Utility methods or methods that don't cause any sort of mutation on the
       * DOM can use spies. Methods that setup listeners, make network requests,
       * etc. should use stubs.
       */
      const logStub = sandbox.stub(testClass.logger, 'log');
      const templateStub = sandbox.stub(testClass.templates, 'EXAMPLE_TEMPLATE');
      const findSpy = sandbox.spy($.fn, 'find');
      const addListenersStub = sandbox.stub(testClass, 'addListeners');
      
      testClass.init();
      
      /**
       * For methods that get called with arguments, you need to use `calledWith`
       * and check that the arguments passed are the correct value or the 
       * correct type. For simple values like Booleans & Strings you check the 
       * exact value. For Objects, Arrays, & Functions you can just use sinon's 
       * `match` API to verify the type.
       */
      logStub.should.be.calledWith(testClass.LOG_PREFIX, sinon.match.string);
      templateStub.should.be.calledWith({
        cssClassPrefix: testClass.cssClassPrefix,
        jsPrefix: testClass.jsPrefix.replace('.', ''),
        navURLs: sinon.match.array,
        props: sinon.match({
          fu: testClass.randomProp
        })
      });
      findSpy.should.be.calledWith('.js-exampleClassNavItem');
      addListenersStub.should.be.called;
    });
  });
  
  describe('addListeners', () => {
    
    it("should add listeners to component elements", () => {    
      const onStub = sandbox.stub($.fn, 'on');
      sandbox.stub(testClass.handleNavItemClick, 'bind').returns('handleNavItemClick');
      
      testClass.addListeners();
      
      /**
       * Since handlers that use the `bind` event return an anoymous function we
       * can't check that the 3rd argument is the function on our Class. Instead
       * we stub out the bind of the handler to return the function name so we
       * can verify that the correct function is passed.
       */
      onStub.should.be.calledWith(testClass.events.CLICK, testClass.selectors.NAV_ITEM, 'handleNavItemClick');
    });
  });
  
  describe('handleNavItemClick', () => {
    let def, ajaxStub;
    
    beforeEach(() => {
      /**
       * For `ajax` requests you'll want to stub it out and return a Defer Object
       * that you can `resolve` or `reject` based on your test case. We're not
       * going to resolve or reject in this case because the code was setup
       * properly with handlers rather than anonymous functions.
       */
      def = $.Deferred();
      ajaxStub = sandbox.stub($, 'ajax', () => {
        return def;
      });
    });
    
    it("should get nav item data", () => {
      const doneSpy = sandbox.spy(def, 'done');
      const failSpy = sandbox.spy(def, 'fail');
      sandbox.stub(testClass.handleNavItemSuccess, 'bind').returns('handleNavItemSuccess');
      sandbox.stub(testClass.handleNavItemFailure, 'bind').returns('handleNavItemFailure');
      
      testClass.handleNavItemClick(null);
      
      ajaxStub.should.be.calledWith({
        url: testClass.urls.NAV_ITEM,
        data: {
          fu: 'bar'
        }
      });
      doneSpy.should.be.calledWith('handleNavItemSuccess');
      failSpy.should.be.calledWith('handleNavItemFailure');
    });
  });
  
  describe('handleNavItemSuccess', () => {
    let respMock;
    
    beforeEach(() => {
      respMock = '{"fu":"bar"}';
    });
    
    it("should handle the service response", () => {
      const logStub = sandbox.stub(testClass.logger, 'log');
      const parseSpy = sandbox.spy(window.JSON, 'parse');
      
      testClass.handleNavItemSuccess(respMock);
      
      logStub.should.be.calledWith({ fu: 'bar' });
      parseSpy.should.be.calledWith( respMock );
    });
  });
  
  describe('handleNavItemFailure', () => {
    let respMock;
    
    beforeEach(() => {
      /**
       * There are times when you need to fast-forward if `setTimeout` or 
       * `setInterval` are being used. This is when the `clock` API comes in use.
       * First you need to setup `useFakeTimers`, then just call `clock.tick` like below.
       */
      sandbox.clock = sinon.useFakeTimers();
      respMock = 'Something has gone horribly wrong';
    });
    
    afterEach(() => {
      sandbox.clock.restore();
    });
    
    it("should handle the service response", () => {
      const setTimeoutSpy = sandbox.spy(window, 'setTimeout');
      const errorStub = sandbox.stub(testClass.logger, 'error');
      
      testClass.handleNavItemFailure(respMock);
      sandbox.clock.tick(testClass.errorWait);
      
      setTimeoutSpy.should.be.calledWith(sinon.match.func, testClass.errorWait);
      errorStub.should.be.calledWith( respMock );
    });
  });
});