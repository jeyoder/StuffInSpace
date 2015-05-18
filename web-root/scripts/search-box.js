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
        var initStart = performance.now();
        var searchStr = $('#search').val().toUpperCase();
        var resultBox = $('#search-results');
        
        resultBox.empty();
        if(searchStr.length === 0) {
          hideResults();
          return;
        }
        
        resultBox.slideDown();
        var searchStart = performance.now();
    
        var results = [];
        for(var i=0; i < satData.length; i++) {
          if(satData[i].OBJECT_NAME.indexOf(searchStr) !== -1) {
            results.push({
              isIntlDes : false, 
              strIndex : satData[i].OBJECT_NAME.indexOf(searchStr),
              sat : satData[i]
            });
          }
          
          if(satData[i].intlDes.indexOf(searchStr) !== -1) {
            results.push({
              isIntlDes : true, 
              strIndex : satData[i].intlDes.indexOf(searchStr),
              sat : satData[i]
            });
          }
          
         if(results.length > SEARCH_LIMIT) break;
        }
        var resultStart = performance.now();
        
        var html = '';
        for(var i=0; i < results.length; i++) {
          var sat = results[i].sat;
          html += '<div class="search-result" data-sat-id="' + sat.id + '">';
          if(results[i].isIntlDes) {
            html += sat.OBJECT_NAME;
          } else {
            html += sat.OBJECT_NAME.substring(0, results[i].strIndex);
            html += '<span class="search-hilight">';
            html += sat.OBJECT_NAME.substring(results[i].strIndex, results[i].strIndex + searchStr.length);
            html += '</span>';
            html += sat.OBJECT_NAME.substring(results[i].strIndex + searchStr.length);
          }
          html += '<div class="search-result-intldes">';
          if(results[i].isIntlDes) {
            html += sat.intlDes.substring(0, results[i].strIndex);
            html += '<span class="search-hilight">';
            html += sat.intlDes.substring(results[i].strIndex, results[i].strIndex + searchStr.length);
            html += '</span>';
            html += sat.intlDes.substring(results[i].strIndex + searchStr.length);
          } else {
            html += sat.intlDes;
          }
          html += '</div></div>';
        }
      //  resultBox.append(html);
        resultBox[0].innerHTML = html;
       if(html === 'unicorn') alert('!'); 
        var now = performance.now();
        console.log('searchInit: ' + (searchStart - initStart) + ' ms Search: ' + (resultStart - searchStart) + ' ms Results: ' + (now - resultStart) + ' ms (got ' + results.length + ' results)');
    });
  };
  
  
  
  window.searchBox = searchBox;
})();