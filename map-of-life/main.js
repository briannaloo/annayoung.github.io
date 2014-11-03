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
      interactivity: "pacovw_2012, the_geom, country, biome_1, biome_2, biome_3, biome_4, biome_5, biome_6, biome_7, biome_8, biome_9, biome_10, biome_11, biome_12, biome_13, biome_14"
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
      // tooltip info
      object.getElementById('country').textContent = data['country'].toUpperCase();
      var score = data['pacovw_2012'];
      if (score == -9) {
        object.getElementById('score').textContent = 'N/A';
      } else {  
        if (score >= 10)  // format numbers to either be x.x or xx
          object.getElementById('score').textContent = Math.round(score) + '%';
        else
          object.getElementById('score').textContent = Math.round(score * 10)/10 + '%';
      }

      var height_icon = 37;
      for (var biome = 1; biome < 15; biome++) {  // 14 biomes
        var protect = data['biome_' + biome];
        if (protect != -1) {
          var height_protect = height_icon * protect; // MAKE IT A DOUBLE!
          object.getElementById('biome' + biome + '-rect').setAttribute("height", height_protect + "");  
          object.getElementById('biome' + biome + '-path').setAttribute("fill", "#fff");  // doesn't carry over grey from other country  
        } else {  // not applicable
          object.getElementById('biome' + biome + '-path').setAttribute("fill", "#c9c9c9");  
          object.getElementById('biome' + biome + '-rect').setAttribute("height", "0"); // clear from previous
        }
      }
      /*$('#tool-tip').css({
         left:  e.pageX,
         top:   e.pageY - 60
      });*/
      //$(document).bind('mousemove', event);
    });

    sublayer_country.on('featureOut', function(e, pos, latlng, data) {
      //$(document).unbind('mousemove', event, false);

      // clear tooltip
      object.getElementById('country').textContent = "HOVER OVER A COUNTRY";
      object.getElementById('score').textContent = '';
      for (var biome = 1; biome < 15; biome++) {  // 14 biomes
        object.getElementById('biome' + biome + '-rect').setAttribute("height", "0");
        object.getElementById('biome' + biome + '-path').setAttribute("fill", "#fff");  
      }
    });

  });
}
window.onload = main;
