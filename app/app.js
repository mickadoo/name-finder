'use strict';

var env = {};

if(window){
  Object.assign(env, window.__env);
}

// Declare app
angular.module('namePicker', [])

.constant('__env', env)

.controller('mainCtrl', ['$scope', '$http', '__env', function($scope, $http, __env) {

  $scope.sentences = [];
  $scope.words = [];
  $scope.newVariants = [];
  $scope.selectedVariants = [];
  $scope.wordSynonyms = [];
  $scope.pendingLookups = [];

  $scope.addSentence = function() {
    if (!inArray($scope.newSentence, $scope.sentences)) {
      $scope.sentences.push($scope.newSentence);
    } else {
      alert('Duplicate sentence');
    }
    $scope.newSentence = '';
  };

  $scope.addWord = function() {
    var newWord = $scope.newWord;
    var key = $scope.words.push([newWord]) - 1;
    $scope.selectedVariants[key] = newWord; // select new word
    $scope.pendingLookups[key] = true;
    $scope.getVariants(newWord).then(function(variants) {
      $scope.wordSynonyms[key] = variants;
      $scope.pendingLookups[key] = false;
    });
    $scope.newWord = '';
  };

  $scope.getVariants = function(word) {
    return new Promise(function(resolve, reject) {
      var key = __env.ALTERVISTA_KEY;
      var url = "http://thesaurus.altervista.org/thesaurus/v1?word=" +
        word +
        "&language=en_US&output=json&key=" +
        key;

      $http.get(url).then(
        function(result) {
          var response = result.data.response;
          var synonyms = [];
          for (var i = 0, len = response.length; i < len; i++) {
            synonyms = synonyms.concat(response[i].list.synonyms.split('|'));
          }
          resolve(synonyms.unique());
        },
        function () {
          resolve([]);
        }
      );
    });
  };

  $scope.addVariant = function(key, newVariant) {
    if (!inArray(newVariant, $scope.words[key])) {
      $scope.words[key].push(newVariant);
      $scope.selectedVariants[key] = newVariant; // select new word
      $scope.pendingLookups[key] = true;
      $scope.getVariants(newVariant).then(function(variants) {
        $scope.wordSynonyms[key] = $scope.wordSynonyms[key].concat(variants).unique();
        $scope.pendingLookups[key] = false;
      });
    } else {
      alert('Duplicate word variant');
    }
    $scope.newVariants[key] = '';
  };

  function inArray(value, array) {
    return -1 !== array.indexOf(value);
  }
}])

.filter('replaceWords', function() {
  var token, pluralToken;

  return function(sentence, selectedVariants) {
    for (var key in selectedVariants) {
      var replacement = selectedVariants[key].toString();
      token = '<' + (parseInt(key) + 1) + '>';
      pluralToken = '<' + (parseInt(key) + 1) + ':pl>';
      sentence = sentence.replace(token, replacement);
      sentence = sentence.replace(pluralToken, pluralize(replacement));
    }
    return sentence;
  };
});

Array.prototype.unique = function() {
  var a = this.concat();
  for(var i=0; i<a.length; ++i) {
    for(var j=i+1; j<a.length; ++j) {
      if(a[i] === a[j])
        a.splice(j--, 1);
    }
  }

  return a;
};
