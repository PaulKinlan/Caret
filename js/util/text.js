define(function() {
  
  return {
    load: function(name, parentRequire, onLoad, config) { 
      fetch(`${name}`)
        .then(response => response.text())
        .then(text => onLoad(text))
      return;
    }
  };
  
});