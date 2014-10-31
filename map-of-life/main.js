// main.js, author: Anna Young

// code for info window and hover features

//Formats the columns for us into css
String.prototype.format = (function (i, safe, arg) {
  function format() {
      var str = this,
          len = arguments.length + 1;

      for (i = 0; i < len; arg = arguments[i++]) {
          safe = typeof arg === 'object' ? JSON.stringify(arg) : arg;
          str = str.replace(RegExp('\\{' + (i - 1) + '\\}', 'g'), safe);
      }
      return str;
  }
  return format;
})();

var chemicals = ["aldrin", "chlordane", "ddt", "dieldrin", "endrin", "heptachlor", "hexachlorobenzene", "mirex", "toxaphene", "pcb", "dioxin_furan"];

function main() {
  var map = new L.Map('map', { 
    zoomControl: true,
    legend: true,
    center: [30, 15],
    zoom: 2,
    scrollWheelZoom: true
  });

  // create layers
  cartodb.createLayer(map, {
    user_name: 'annasyoung',
    type: 'cartodb',
    sublayers: [/*{
      sql: "SELECT * FROM bathymetry_layers",
      cartocss: "#bathymetry_layers{ polygon-fill: #A7C6E4;polygon-opacity: 0.2;line-color: #FFF;line-width: 0;line-opacity: 1;}"
      },*/{
      sql: "SELECT * FROM pacovw_2014",
      cartocss: $('#pacovw').html().format('pacovw_2012'),
      interactivity: "pacovw_2012, the_geom, country"
      }]

  }).done(function(layer) {
    // add the layers to map 
    map.addLayer(layer);
    sublayer_country = layer.getSubLayer(0);
    sublayer_country.setInteraction(true);

    var v = cdb.vis.Overlay.create('search', map.viz, {});
    v.show();
    $('#map').append(v.render().el);

    //Make Tool-tip follow the mouse.
   /* var event = function(e){
      $('#tool-tip').css({
         left:  e.pageX,
         top:   e.pageY - 60
      });
    };*/
    var obj = document.getElementById("svg-object");  // access svg doc
    var object = obj.contentDocument;
    //Retrieve data to the tooltip on countries
    sublayer_country.on('featureOver', function(e, pos, latlng, data) {
      object.getElementById('country').textContent = data['country'].toUpperCase();
      var score = data['pacovw_2012'];
      if (score == -9999)
        object.getElementById('score').textContent = 'N/A';
      else {  
        if (score >= 10)  // only want 2 numbers
          object.getElementById('score').textContent = Math.round(score) + '%';
        else
          object.getElementById('score').textContent = Math.round(score * 10)/10 + '%';
      }
      /*$('#tool-tip').css({
         left:  e.pageX,
         top:   e.pageY - 60
      });*/
      //$(document).bind('mousemove', event);
    });

    sublayer_country.on('featureOut', function(e, pos, latlng, data) {
      //$(document).unbind('mousemove', event, false);
      object.getElementById('country').textContent = "HOVER OVER A COUNTRY";
    });

  });
}
window.onload = main;
