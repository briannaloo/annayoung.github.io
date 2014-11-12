// main.js, author: Anna Young

// code for info window and hover features

var species_text = {
  "Species1": ["Brown-Throated Barbet", 
    "The brown-throated barbet (Megalaima corvina) is a species of bird in the Ramphastidae family. It is endemic to Indonesia. Its natural habitats are subtropical or tropical moist lowland forests and subtropical or tropical moist montane forests.",
    "http://epi.yale.edu/visuals/biodiversity-map/barbet.png"
  ],
  "Species2": ["Smoky White-Toothed Shrew",
    "The Smoky White-toothed Shrew (Crocidura fumosa) is a species of mammal in the Soricidae family. It is endemic to Kenya. Its natural habitat is subtropical or tropical moist montane forests. It is threatened by habitat loss.",
    "http://epi.yale.edu/visuals/biodiversity-map/shrew.png"
  ],
  "Species3": ["White-Winged Cuckooshrike",
    "The white-winged cuckooshrike (Coracina ostenta) is a species of bird in the Campephagidae family. It is endemic to the Philippines. Its natural habitats are subtropical or tropical moist lowland forests and subtropical or tropical moist montane forests. It is threatened by habitat loss.",
    "http://epi.yale.edu/visuals/biodiversity-map/cuckooshrike.png"
  ],
  "Species4": ["Western Long-Beaked Echidna",
    "The western long-beaked echidna (Zaglossus bruijni) is one of the four extant echidnas and one of three species of Zaglossus that occur in New Guinea. It is present in the Bird's Head Peninsula and Foja Mountains of West Papua and Papua provinces, Indonesia, at elevations between 1,300 and 4,000 meters.",
    "http://epi.yale.edu/visuals/biodiversity-map/echidna.png"
  ],
  "Species5": ["Orlov's Treefrog",
    "Rhacophorus orlovi is a species of frog in the Rhacophoridae family found in Laos, Thailand, and Vietnam. Its natural habitats are subtropical or tropical moist lowland forests, rivers, freshwater marshes, and intermittent freshwater marshes. It is threatened by habitat loss.",
    "http://epi.yale.edu/visuals/biodiversity-map/treefrog.png"
  ]};
// picture names need to be Species1.png and Species2.png


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

var polygons = {};
var polygonsHighlighted = [];

function geometryHover(map, layer) {

  var style = {
    weight: 1,
    color: '#c9c9c9',
    opacity: 1,
    fillColor: '#FFFFFF',
    fillOpacity: 0
  };
  
  // fetch the geometry
  var sql = new cartodb.SQL({ user: 'epi', format: 'geojson' });
  sql.execute("select cartodb_id, ST_Simplify(the_geom, 0.1) as the_geom from (" + layer.getSQL() + ") as _wrap").done(function(geojson) {
    var features = geojson.features;
    for(var i = 0; i < features.length; ++i) {
      var f = geojson.features[i];
      var key = f.properties.cartodb_id;

      // generate geometry
      if (features[i].geometry != null) {
        var geo = L.GeoJSON.geometryToLayer(features[i].geometry);
        geo.setStyle(style);


        // add to polygons
        polygons[key] = polygons[key] ||  [];
        polygons[key].push(geo);
      }
    }
  });
};

function parksHover(layer) {
  var hidden = 1;
  $('#parks').click(function() {
    if (hidden) {
      layer.show();
      $('#switch').css("background-color", "rgb(252,169,35)");
      $('#switch-button').css("left", "18px");
      hidden = 0;
    } else {
      layer.hide();
      $('#switch').css("background-color", "#c9c9c9");
      $('#switch-button').css("left", "4px");
      hidden = 1;
    }
  });
}

function onEachFeature (feature, layer) {
    var name = feature.properties.name;
    var popupContent = '<div id="species-tooltip">\
      <a href="http://mol.org" target="_blank"><img id="mol-logo" src="http://mol.org/sites/all/themes/mol_beep_edition/logo.png"></a>\
      <div style="height: 15px; background-color: rgb(140, 191, 68); margin-top: 60px;"></div>\
      <p ><span id="species-text">' + species_text[name][0] + '</span><br><br>\
      <img src="' + species_text[name][2] + '" class="species-pic">\
      <span class="species-span">' + species_text[name][1] + '</span><br><br></p>\
      <div id="species-facts">\
      </div>\
      <div style="height: 40px; position: absolute; top: 670px; width: 100%"></div>\
    </div>';
    layer.bindPopup(popupContent);
};

function addMarker(map, coordinates, name) {
  var geojsonFeature = {
    "type": "Feature",
    "properties": {
      "name": name,

    },
    "geometry": {
      "type": "Point",
      "coordinates": coordinates
    }
  };

  var url = species_text[name][2];

  var species_icon = L.icon({
    iconUrl: url,
    iconSize: [50, 50],
    iconAnchor: [20, 0],
    popupAnchor: [0, 0]
  });

  L.geoJson(geojsonFeature, {
    pointToLayer: function(feature, latlng) {
      return L.marker(latlng, {icon: species_icon});
    },
    onEachFeature: onEachFeature
  }).addTo(map);


}

function main() {
  var map = new L.Map('map', { 
    zoomControl: true,
    legend: true,
    center: [30, 60],
    zoom: 2,
    scrollWheelZoom: true
  });

  // create layers
  cartodb.createLayer(map, {
    user_name: 'epi',
    type: 'cartodb',
    sublayers: [{
      sql: "SELECT * FROM pacovw_2014",
      cartocss: $('#pacovw').html().format('pacovw_2012'),
      interactivity: "pacovw_2012, the_geom, cartodb_id, country, biome_1, biome_2, biome_3, biome_4, biome_5, biome_6, biome_7, biome_8, biome_9, biome_10, biome_11, biome_12, biome_13, biome_14, share_1, share_2, share_3, share_4, share_5, share_6, share_7, share_8, share_9, share_10, share_11, share_12, share_13, share_14"
      },{
      sql: "SELECT * FROM wdpa",
      cartocss: "#wdpa{ polygon-fill: rgb(252,169,35);polygon-opacity: 0.7;}",
      }]

  }).done(function(layer) {
    // add the layers to map 
    map.addLayer(layer);
    sublayer_country = layer.getSubLayer(0);
    sublayer_country.setInteraction(true);
    sublayer_protected = layer.getSubLayer(1);
    sublayer_protected.setInteraction(false);
    sublayer_protected.hide();

    //create infowindow
    sublayer_country.infowindow.set('template', $('#infowindow_template').html());

    
    addMarker(map, [107.5, -6.75], "Species1");
    addMarker(map, [36.8, 1], "Species2");
    addMarker(map, [122, 13], "Species3");
    addMarker(map, [134.0833, -0.8667], "Species4");
    addMarker(map, [105.6667, 18.6667], "Species5");

    geometryHover(map, sublayer_country);

    parksHover(sublayer_protected);

    var v = cdb.vis.Overlay.create('search', map.viz, {});
    v.show();
    $('#map').append(v.render().el);

    //Make country Tool-tip follow the mouse.
    var event = function(e){
      $('#country-hover').css({
         left: e.pageX,
         top:   e.pageY
      });
    };
    $(document).bind('mousemove', event);

    var obj = document.getElementById("svg-object");  // access svg doc
    var object = obj.contentDocument;

    var biome_types = ["Tropical & Subtropical Moist Broadleaf Forests", 
    "Tropical & Subtropical Dry Broadleaf Forests",
    "Tropical & Subtropical Coniferous Forests",
    "Temperate Broadleaf and Mixed Forests",
    "Temperate Conifer Forests",
    "Boreal Forests and Taiga",
    "Tropical & Subtropical Grasslands, Savannas & Shrublands",
    "Temperate Grasslands, Savannas & Shrublands",
    "Flooded Grasslands & Savannas",
    "Montagne Grasslands & Shrublands",
    "Tundra",
    "Mediterranean Forests, Woodlands & Scrub",
    "Deserts and Xeric  Shrublands",
    "Mangrove"];
    object.getElementById("global_use").setAttributeNS( "http://www.w3.org/1999/xlink", "href", "#global_share1");


    var biome_x = [-1, -115, -75, -15, 47, 170, 212, 25, 85, 135, 70, 185, -70, -15, 80];
    var biome_y = [-1, 87, 50, 28, 25, 46, 85, 137, 184, 223, 245, 245, 223, 184, 137];
        // ^ because e.pageX gets the position within svg object not html
    var current_biome = 1;
    var previous_biome = 1;
    for (var biome = 1; biome < 15; biome++) {
      $(object.getElementById("biome" + biome + "-path")).hover(function(e) {
        var id = $(this).attr("id");
        id = id.slice(5, 5 + (id.length - 10));

        $('#biome-title').html(biome_types[parseInt(id)-1]);
        $('#biome-label').show();
        $('#biome-label').css({
           left: biome_x[id] - 50,
           top: biome_y[id]
          });
      }, function() {
        $('#biome-label').hide();
      });
      $(object.getElementById("biome" + biome + "-path")).click(function(e) {
          var id = $(this).attr("id");
          id = id.slice(5, 5 + (id.length - 10));

          // get rid of previous selected
          $(object.getElementById("biome" + current_biome + "-path")).attr("stroke", "none");
          $(object.getElementById("biome" + current_biome + "-path")).attr("stroke-width", "0");
          previous_biome = current_biome;
          current_biome = id;
          $(this).attr("stroke", "#08b900");
          $(this).attr("stroke-width", "3");
          // just using biome wasn't working

          //$('#biome-label').html(biome_types[parseInt(id)-1]);
          $('#biome-protection' + previous_biome).css("display", "none");
          $('#biome-protection' + current_biome).css("display", "inline");
          $('#biome-global' + previous_biome).css("display", "none");
          $('#biome-global' + current_biome).css("display", "inline");

          object.getElementById("global_use").setAttributeNS( "http://www.w3.org/1999/xlink", "href", "#global_share" + current_biome);
      
      });
    }

    function featureOver (e, pos, latlng, data) {
      $('#country-hover').show();

      /*var score = data['pacovw_2012'];
      if (score == -99) {
        score = "N/A"
      } else {  
        score =  (score * (100/17.0)).toPrecision(2);
        if (score >= 10)  // format numbers to either be x.x or xx
          score = Math.round(score) + '%';
        else
          score = Math.round(score * 10)/10 + '%';
      }*/
      $('#country').html(data['country'].toUpperCase());
    }

    function featureOut (e, pos, latlng, data) {
        $('#country-hover').hide();
    }

    function featureClick (e, pos, latlng, data) {
      var pol = polygonsHighlighted;
        for(var i = 0; i < pol.length; ++i) {
          map.removeLayer(pol[i]);
        }
        polygonsHighlighted = [];
      // highlight country
      var pol = polygons[data.cartodb_id] || [];
      for(var i = 0; i < pol.length; ++i) {
        var new_layer = pol[i];
        map.addLayer(new_layer);
        polygonsHighlighted.push(pol[i]);
      }

      object.getElementById('country').textContent = data['country'].toUpperCase();

      // fill in biomes
      var height_icon = 37;
      for (var biome = 1; biome < 15; biome++) {  // 14 biomes
        var protect = data['biome_' + biome];
        if (protect != -1) {
          var height_protect = height_icon * protect; // MAKE IT A DOUBLE!
          object.getElementById('biome' + biome + '-rect').setAttribute("height", height_protect + "");  
          object.getElementById('biome' + biome + '-path').setAttribute("opacity", "1");  // doesn't carry over grey from other country  
          $(object.getElementById('biome' + biome + '-obj')).find('path').attr("fill", "#d09b23");
          $(object.getElementById('biome' + biome + '-obj')).find('rect').attr("fill", "#d09b23");
        
          $('#biome-protection' + biome).html((protect*100).toPrecision(2) + "%");
        } else {  // not applicable
          object.getElementById('biome' + biome + '-path').setAttribute("opacity", "0.5");
          object.getElementById('biome' + biome + '-rect').setAttribute("height", "0"); // clear from previous
          $(object.getElementById('biome' + biome + '-obj')).find('path').attr("fill", "#B5B5B5");
          $(object.getElementById('biome' + biome + '-obj')).find('rect').attr("fill", "#B5B5B5");
        
          $('#biome-protection' + biome).html("N/A");
        }

        // global share
        var global = data['share_' + biome];
        if (global != -1) {
          var global_show = (global*100).toPrecision(2);
          if ((global*100) < 1) {
            global_show = (global*100).toFixed(2);
          }
          $('#biome-global' + biome).html(global_show + "%");
          // pie piece: fill in first quarter of circle
          var share = Number(global).toFixed(10);
          var angle = share * 360; // deg of 180 deg circle
          if (share > 0.25) // fill in first quarter properly no matter what
            angle = 0.25 * 360;
          var rad = (angle * Math.PI/180).toFixed(10);
          var x_diff = 350 - 151;
          var y = 146 - x_diff / (Math.tan(rad)).toFixed(10);
          if (angle > 1) {
            object.getElementById("global_share" + biome).setAttribute("points", "151,27 151,146 250," + y);

            // fill in second quarter of circle
            var x, x2, y2;
            if (share > 0.25) {
              var second_share = share - 0.25;
              if (second_share > 0.25)
                second_share = 0.25;
              var rad = (second_share * 360 * Math.PI/180).toFixed(10);
              var y_diff = 300 - 146;
              x = 151 + y_diff / (Math.tan(rad)).toFixed(10);
              object.getElementById("global_share" + biome).setAttribute("points", "151,27 151,146 " + x + ",300 250," + y);
            }

            // fill in third quarter of circle
            if (share > 0.5) {
              var third_share = share - 0.5;
              if (third_share > 0.25)
                third_share = 0.25;
              var rad = (third_share * 360 * Math.PI/180).toFixed(10);
              var x_diff = 151 - 50;
              y2 = 146 + (x_diff / (Math.tan(rad)).toFixed(10));
              object.getElementById("global_share" + biome).setAttribute("points", "151,27 151,146 50," + y2 + " " + x + ",300 250," + y);
            }
            //if (share > 0.75) won't ever happen with this data

          }
          else  // clear it so doesn't get previous country's data
            object.getElementById("global_share" + biome).setAttribute("points", "");


        }
        else {
          $('#biome-global' + biome).html("N/A");
          object.getElementById("global_share" + biome).setAttribute("points", "");
        }
      }
    };

    // show country name and score when hovering
    sublayer_country.on('featureOver', featureOver);
    sublayer_country.on('featureOut', featureOut);
    sublayer_country.on('featureClick', featureClick);

  });
}
window.onload = main;
