// main.js, author: Anna Young

// code for info window and hover features

var species_text = {
  "Species1": ["Brown-Throated Barbet", 
    "The brown-throated barbet (Megalaima corvina) is a species of bird in the Ramphastidae family. It is endemic to Indonesia. Its natural habitats are subtropical or tropical moist lowland forests and subtropical or tropical moist montane forests.",
    "10,992 km<sup>2</sup>",  // expert range
    "2,652 km<sup>2</sup>", // refined range
    "20", // total validation points
    "20",  // validation points in refined range
    "http://ng-alpha.map-of-life.appspot.com/info/protect/Megalaima_corvina"
  ],
  "Species2": ["Smoky White-Toothed Shrew",
  "The Smoky White-toothed Shrew (Crocidura fumosa) is a species of mammal in the Soricidae family. It is endemic to Kenya. Its natural habitat is subtropical or tropical moist montane forests. It is threatened by habitat loss.",
  "12,012 km<sup>2</sup>",
  "2,197 km<sup>2</sup>",
  "9",
  "9",
  "http://ng-alpha.map-of-life.appspot.com/info/protect/Crocidura_fumosa"
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

    var biome_types = ["Tropical & <br>Subtropical Moist <br>Broadleaf Forests", 
    "Tropical & <br>Subtropical Dry <br>Broadleaf Forests",
    "Tropical & <br>Subtropical Coniferous Forests",
    "Temperate <br>Broadleaf and <br>Mixed Forests",
    "<br>Temperate <br>Conifer Forests<br>",
    "<br>Boreal <br>Forests and Taiga<br>",
    "Tropical & <br>Subtropical Grasslands,<br>Savannas & Shrublands",
    "Temperate Grasslands,<br> Savannas <br>& Shrublands",
    "Flooded <br>Grasslands &<br> Savannas",
    "Montagne <br>Grasslands & <br>Shrublands",
    "<br>Tundra<br><br>",
    "Mediterranean <br>Forests, Woodlands <br>& Scrub",
    "Deserts <br>and Xeric  <br>Shrublands",
    "<br>Mangrove<br><br>"];
    object.getElementById("global_use").setAttributeNS( "http://www.w3.org/1999/xlink", "href", "#global_share1");


    var current_biome = 1;
    var previous_biome = 1;
    for (var biome = 1; biome < 15; biome++) {
      $(object.getElementById("biome" + biome + "-path")).click(function() {
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

          $('#biome-label').html(biome_types[parseInt(id)-1]);
          $('#biome-protection' + previous_biome).hide();

          $('#biome-protection' + current_biome).css("display", "inline");
          $('#biome-protection' + previous_biome).css("display", "none");
          $('#biome-global' + previous_biome).css("display", "none");
          $('#biome-global' + current_biome).css("display", "inline");

          object.getElementById("global_use").setAttributeNS( "http://www.w3.org/1999/xlink", "href", "#global_share" + current_biome);
      });
    }

    // show country name and score when hovering
    sublayer_country.on('featureOver', function(e, pos, latlng, data) {
      if (data['country'] == "Species1" || data['country' == "Species2"]) {  // country = Species1 or Species2
        // clear tooltip
        //$('#tooltip-container').hide();
        $('#country-hover').hide();

        if ($('#species-tooltip').css("display") == "none") {  // only move it to mouse once
          $('#species-tooltip').css({
           left: e.pageX,
           top: e.pageY
          });
        }
        $('#species-tooltip').fadeIn(200);

        $('#species-text').html(species_text[data['country']][0]);
        $('.species-pic').attr("src", "./" + data['country'] + ".png");
        $('.species-span').html(species_text[data['country']][1]);
        $('#data1').html(species_text[data['country']][2]);
        $('#data2').html(species_text[data['country']][3]);
        $('#data3').html(species_text[data['country']][4]);
        $('#data4').html(species_text[data['country']][5]);
        //$('#frame').attr("src", species_text[data['country']][6]);

      }
      else {
        $('#species-tooltip').hide();
        $('#country-hover').show();

        var score = data['pacovw_2012'];
        if (score == -99) {
          score = "N/A"
        } else {  
          if (score >= 10)  // format numbers to either be x.x or xx
            score = Math.round(score) + '%';
          else
            score = Math.round(score * 10)/10 + '%';
        }
        $('#country').html(score + " " + data['country'].toUpperCase());
      }
    });
    sublayer_country.on('featureOut', function(e, pos, latlng, data) {
        $('#species-tooltip').hide();
        $('#country-hover').hide();
        //$('#tooltip-container').show();
    });

    //Retrieve data to the tooltip on countries: on click
    sublayer_country.on('featureClick', function(e, pos, latlng, data) {
      // tooltip info
      if (data['country'] != "Species1" && data['country'] != "Species2") {
         $('#species-tooltip').hide();
         //$('#tooltip-container').show();
         //$('#tool-tip').show();

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
              //if (share > 0.75) 
                // won't ever happen with this data

            }
            else  // clear it so doesn't get previous country's data
              object.getElementById("global_share" + biome).setAttribute("points", "");


          }
          else {
            $('#biome-global' + biome).html("N/A");
            object.getElementById("global_share" + biome).setAttribute("points", "");
          }
        }

        

      }
      /*else {  // country = Species1 or Species2
        // clear tooltip
        $('#tooltip-info').hide();

        object.getElementById('country').textContent = "";
        object.getElementById("global_share").setAttribute("points", "");
        for (var biome = 1; biome < 15; biome++) {  // 14 biomes
          object.getElementById('biome' + biome + '-path').setAttribute("opacity", "0.5");
            object.getElementById('biome' + biome + '-rect').setAttribute("height", "0"); // clear from previous
            $(object.getElementById('biome' + biome + '-obj')).find('path').attr("fill", "#B5B5B5");
            $(object.getElementById('biome' + biome + '-obj')).find('rect').attr("fill", "#B5B5B5");
        }

        if ($('#species-tooltip').css("display") == "none") {  // only move it to mouse once
          $('#species-tooltip').css({
           left: e.pageX,
           top: e.pageY
          });
        }
        $('#species-tooltip').fadeIn(200);

        $('#species-text').html(species_text[data['country']][0]);
        $('.species-pic').attr("src", "./" + data['country'] + ".png");
        $('.species-span').html(species_text[data['country']][1]);
        $('#data1').html(species_text[data['country']][2]);
        $('#data2').html(species_text[data['country']][3]);
        $('#data3').html(species_text[data['country']][4]);
        $('#data4').html(species_text[data['country']][5]);
        //$('#frame').attr("src", species_text[data['country']][6]);

      }*/
      
    });

    /*sublayer_country.on('featureOut', function(e, pos, latlng, data) {
      //$(document).unbind('mousemove', event, false);

      // clear tooltip
      $('#tooltip-info').hide();

      object.getElementById('country').textContent = "HOVER OVER A COUNTRY";
      
      for (var biome = 1; biome < 15; biome++) {  // 14 biomes
        object.getElementById('biome' + biome + '-rect').setAttribute("height", "0");
        object.getElementById('biome' + biome + '-path').setAttribute("opacity", "1"); 
        $(object.getElementById('biome' + biome + '-obj')).find('path').attr("fill", "#d09b23");
        $(object.getElementById('biome' + biome + '-obj')).find('rect').attr("fill", "#d09b23");
      
        object.getElementById("global_share" + biome).setAttribute("points", "");
      }
      $('#species-tooltip').hide();
    });*/

  });
}
window.onload = main;
