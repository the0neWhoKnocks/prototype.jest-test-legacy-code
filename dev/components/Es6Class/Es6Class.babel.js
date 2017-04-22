import template from './Es6Class.hbs';
import logger from '../../utils/logger.js';

export default class Es6Class {

  constructor(opts = {}){
    /**
     * The namespace of the Class.
     * @type {String}
     */
    this.namespace = 'exampleClass';
    /**
     * Each JS selector is prefixed per the Class so as
     * not to conflict with any other Classes on the page.
     * @type {String}
     */
    this.jsPrefix = '.js-'+ this.namespace;
    /**
     * Each CSS class is prefixed per the Class so as
     * not to conflict with any other styling on the page.
     * @type {String}
     */
    this.cssClassPrefix = 'example-class__';
    /**
     * Each CSS modifier is prefixed per the Class so as
     * not to conflict with any other styling on the page.
     * @type {String}
     */
    this.cssModifierPrefix = 'example-class--';
    /**
     * Namespace Events so that Class specific event bindings
     * can be enabled/disabled at once, and to aid in debugging.
     * @type {String}
     */
    this.eventSuffix = '.'+ this.namespace;
    /**
     * Prefix logging statements to easily differentiate between
     * other logging on the page.
     * @type {String}
     */
    this.LOG_PREFIX = '[ ExampleClass ] -';
    /**
     * A map of templates used by the Class.
     * @type {Object}
     */
    this.templates = {
      EXAMPLE_TEMPLATE: template,
    };
    /**
     * A map of JS selectors used to access the DOM.
     * @type {Object}
     */
    this.selectors = {
      NAV_ITEM: this.jsPrefix +'NavItem',
    };
    /**
     * A map of CSS modifiers used to alter the DOM.
     * @type {Object}
     */
    this.cssModifiers = {
      IS_HIDDEN: this.cssModifierPrefix +'is--hidden',
    };
    /**
     * A map of commonly used DOM elements.
     * @type {Object}
     */
    this.els = {
      // anything that may already be on the page
    };
    /**
     * A map of event types used by the Class.
     * @type {Object}
     */
    this.events = {
      CLICK: 'click'+ this.eventSuffix
    };
    /**
     * Random prop, nothing to see here, move along.
     * @type {boolean}
     */
    this.randomProp = true;
    /**
     * A map of urls.
     * @type {Object}
     */
    this.urls = {
      NAV_ITEM: 'http://example.com/api/v1/is/fake'
    };
    /**
     * How long to wait before displaying an error.
     * @type {Number}
     */
    this.errorWait = 1000;
    
    this.logger = logger;
    
    // override defaults with user opts
    Object.assign(this, opts);
    
    this.init();
  }

  /**
   * Initialize the Class by executing any methods required
   * to make it function.
   */
  init(){
    this.logger.log( this.LOG_PREFIX, 'Initializing' );
    
    // cache all elements that will be used by this Class
    this.els.$shell = $(this.templates.EXAMPLE_TEMPLATE({
      cssClassPrefix: this.cssClassPrefix,
      jsPrefix: this.jsPrefix.replace('.', ''),
      navURLs: [
        {
          url: 'http://example.com',
          label: 'Example'
        }
      ],
      props: {
        fu: this.randomProp,
        unimportant: true
      }
    }));
    this.els.$navItems = this.els.$shell.find( this.selectors.NAV_ITEM );
    this.addListeners();
  }
  
  /**
   * Adds listeners to component elements.
   */
  addListeners(){
    $('body').on(this.events.CLICK, this.selectors.NAV_ITEM, this.handleNavItemClick.bind(this));
  }
  
  /**
   * Handles the click of a nav item.
   *
   * @param {event} ev - Click event
   */
  handleNavItemClick(ev){
    $.ajax({
      url: this.urls.NAV_ITEM,
      data: {
        fu: 'bar'
      }
    })
    .done(this.handleNavItemSuccess.bind(this))
    .fail(this.handleNavItemFailure.bind(this));
  }
  
  /**
   * Handles the success response from the service.
   *
   * @param {object} resp - The JSON response from the service.
   */
  handleNavItemSuccess(resp){
    this.logger.log( JSON.parse(resp) );
  }
  
  /**
   * Handles the failure response from the service.
   *
   * @param {*} resp - Whatever the service or server gave us.
   */
  handleNavItemFailure(resp){
    setTimeout(function(){
      this.logger.error( resp );
    }.bind(this), this.errorWait);
  }
}
