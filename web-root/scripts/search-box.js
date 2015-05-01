(function() {
  var searchBox = {};
  var SEARCH_LIMIT = 20;
  var satData;
  
  function hideResults() {
    var sr = $('#search-results');
    sr.slideUp();
  }
  
  searchBox.hideResults = hideResults;
  
  searchBox.init = function(_satData) {
    satData = _satData;
    $('#search-results').on('click', '.search-result', function(evt) {
      var satId = $(this).data('sat-id');
      console.log(satId);
      selectSat(satId);
      hideResults();
    });
    
    $('#search').on('input', function() {
        var start = performance.now();

        var searchStr = $('#search').val().toUpperCase();
        var results = [];
        var resultBox = $('#search-results');
        resultBox.empty();
        if(searchStr.length === 0) {
          hideResults();
          return;
        }
        resultBox.slideDown();
        
        for(var i=0; i < satData.length; i++) {
          if(satData[i].OBJECT_NAME.indexOf(searchStr) !== -1) {
            results.push({
              strIndex : satData[i].OBJECT_NAME.indexOf(searchStr),
              sat : satData[i]
            });
            if(results.length > SEARCH_LIMIT) break;
          }
        }
        
        var html = '';
        for(var i=0; i < results.length; i++) {
          var sat = results[i].sat;
          html += '<div class="search-result" data-sat-id="' + sat.id + '">';
          html += sat.OBJECT_NAME.substring(0, results[i].strIndex);
          html += '<span class="search-hilight">';
          html += sat.OBJECT_NAME.substring(results[i].strIndex, results[i].strIndex + searchStr.length);
          html += '</span>';
          html += sat.OBJECT_NAME.substring(results[i].strIndex + searchStr.length);
          html += '<div class="search-result-intldes">' + sat.intlDes + '</div>';
          html += '</div>';
        }
        resultBox.append(html);
        
        console.log('search: ' + (performance.now() - start) + ' ms');
    });
  };
  
  
  
  window.searchBox = searchBox;
})();