Marionette.Behavior = (function(_, Backbone) {
  function Behavior(options, view) {
  }
  
  _.extend(Behavior.prototype, Backbone.Events, {
    initialize: function() {},
  });

  Behavior.extend = Marionette.extend;

  return Behavior;
})(_, Backbone);