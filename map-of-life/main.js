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
    sublayers: [{
      sql: "SELECT * FROM pacovw_latest",
      cartocss: $('#pacovw').html().format('pacovw_2012'),
      interactivity: "pacovw_2012, the_geom, country, biome_1, biome_2, biome_3, biome_4, biome_5, biome_6, biome_7, biome_8, biome_9, biome_10, biome_11, biome_12, biome_13, biome_14, share_1, share_2, share_3, share_4, share_5, share_6, share_7, share_8, share_9, share_10, share_11, share_12, share_13, share_14"
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
    /*var event = function(e){
      $('#tool-tip').css({
         left: e.pageX,
         top:   e.pageY - 140
      });
    };
    $(document).bind('mousemove', event);*/

    var obj = document.getElementById("svg-object");  // access svg doc
    var object = obj.contentDocument;

    var biome_types = ["Tropical & <br>Subtropical Moist <br>Broadleaf Forests", 
    "Tropical & <br>Subtropical Dry <br>Broadleaf Forests",
    "Tropical & <br>Subtropical Coniferous Forests",
    "Temperate <br>Broadleaf and <br>Mixed Forests",
    "Temperate <br>Conifer Forests<br><br>",
    "Boreal <br>Forests and Taiga<br><br>",
    "Tropical & <br>Subtropical Grasslands,<br>Savannas & Shrublands",
    "Temperate <br>Grasslands, Savannas <br>& Shrublands",
    "Flooded <br>Grasslands &<br> Savannas",
    "Montagne <br>Grasslands & <br>Shrublands",
    "Tundra<br><br><br>",
    "Mediterranean <br>Forests, Woodlands <br>& Scrub",
    "Deserts <br>and Xeric  <br>Shrublands",
    "Mangrove<br><br><br>"];

    var current_biome = 1;
    for (var biome = 1; biome < 15; biome++) {
      $(object.getElementById("biome" + biome + "-path")).click(function() {
          var id = $(this).attr("id");
          id = id.slice(5, 5 + (id.length - 10));

          // get rid of previous selected
          $(object.getElementById("biome" + current_biome + "-path")).attr("stroke", "none");
          $(object.getElementById("biome" + current_biome + "-path")).attr("stroke-width", "0");
          current_biome = id;
          $(this).attr("stroke", "#08b900");
          $(this).attr("stroke-width", "3");
          // just using biome wasn't working

          $('#biome-label').html(biome_types[parseInt(id)-1]);
      });
    }

    //Retrieve data to the tooltip on countries
    sublayer_country.on('featureOver', function(e, pos, latlng, data) {
      // tooltip info
      if (data['country'] != "Species1") {
        //$(object.getElementById("svg-container")).show();
         $('#species1-tooltip').hide();
         $('#biome-specifics').show();

         var protection = data['biome_' + current_biome];
         if (protection != -1)
          $('#biome-protection').html((protection*100));
        else
          $('#biome-protection').html("N/A");


        var score = data['pacovw_2012'];
        if (score == -99) {
          //object.getElementById('score').textContent = 'N/A';
          score = "N/A"
        } else {  
          if (score >= 10)  // format numbers to either be x.x or xx
            score = Math.round(score) + '%';
            //object.getElementById('score').textContent = Math.round(score) + '%';
          else
            score = Math.round(score * 10)/10 + '%';
            //object.getElementById('score').textContent = Math.round(score * 10)/10 + '%';
        }
        object.getElementById('country').textContent = score + ": " + data['country'].toUpperCase();
        

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
          } else {  // not applicable
            object.getElementById('biome' + biome + '-path').setAttribute("opacity", "0.5");
            object.getElementById('biome' + biome + '-rect').setAttribute("height", "0"); // clear from previous
            $(object.getElementById('biome' + biome + '-obj')).find('path').attr("fill", "#B5B5B5");
            $(object.getElementById('biome' + biome + '-obj')).find('rect').attr("fill", "#B5B5B5");
          }
        }

        // global share for selected biome
        if (data['share_' + current_biome] != -1) {
          $('#biome-global').html((data['share_' + current_biome]*100).toPrecision(3));

          console.log('current_biome ' + current_biome);
          var data = Number(data['share_' + current_biome]).toFixed(10);
          console.log('data ' + data);
          var angle = data * 360; // deg of 180 deg circle
          console.log('angle ' + angle);
          var rad = (angle * Math.PI/180).toFixed(10);
          console.log('rad ' + rad);
          var x_diff = 250 - 151;
          console.log((Math.tan(rad)).toFixed(10));
          var y = 146 - x_diff / (Math.tan(rad)).toFixed(10);
          console.log('y ' + y);
          if (angle > 1) {
            object.getElementById("global_share").setAttribute("points", "151,27 151,146 250," + y);
          }
        }
        else {
          $('#biome-global').html("N/A");
          object.getElementById("global_share").setAttribute("points", "");
        }

      }
      else {  // country = Species1
        // clear tooltip
        //$(object.getElementById("svg-container")).hide();
        $('#biome-specifics').hide();

        object.getElementById('country').textContent = "";
        //object.getElementById('score').textContent = '';
        object.getElementById("global_share").setAttribute("points", "");
        for (var biome = 1; biome < 15; biome++) {  // 14 biomes
          object.getElementById('biome' + biome + '-path').setAttribute("opacity", "0.5");
            object.getElementById('biome' + biome + '-rect').setAttribute("height", "0"); // clear from previous
            $(object.getElementById('biome' + biome + '-obj')).find('path').attr("fill", "#B5B5B5");
            $(object.getElementById('biome' + biome + '-obj')).find('rect').attr("fill", "#B5B5B5");
        }

        if ($('#species1-tooltip').css("display") == "none") {  // only move it to mouse once
          $('#species1-tooltip').css({
           left: e.pageX,
           top: e.pageY
          });
        }
        $('#species1-tooltip').fadeIn(200);

      }
    });

    sublayer_country.on('featureOut', function(e, pos, latlng, data) {
      //$(document).unbind('mousemove', event, false);

      // clear tooltip
      //$(object.getElementById("svg-container")).hide();
      $('#biome-specifics').hide();

      object.getElementById('country').textContent = "HOVER OVER A COUNTRY";
      //object.getElementById('score').textContent = '';
      object.getElementById("global_share").setAttribute("points", "");
      for (var biome = 1; biome < 15; biome++) {  // 14 biomes
        object.getElementById('biome' + biome + '-rect').setAttribute("height", "0");
        object.getElementById('biome' + biome + '-path').setAttribute("opacity", "1"); 
        $(object.getElementById('biome' + biome + '-obj')).find('path').attr("fill", "#d09b23");
        $(object.getElementById('biome' + biome + '-obj')).find('rect').attr("fill", "#d09b23");
      }
      $('#species1-tooltip').hide();
    });

  });
}
window.onload = main;
