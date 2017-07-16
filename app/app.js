'use strict';

// Declare app
angular.module('namePicker', [])

.controller('mainCtrl', ['$scope', function($scope) {

  $scope.sentences = [];
  $scope.words = [];
  $scope.newVariants = [];
  $scope.selectedVariants = [];

  $scope.addSentence = function() {
    if (!inArray($scope.newSentence, $scope.sentences)) {
      $scope.sentences.push($scope.newSentence);
    } else {
      // alert('Duplicate sentence');
    }
    $scope.newSentence = '';
  };

  $scope.addWord = function() {
    var key = $scope.words.push([$scope.newWord]);
    $scope.selectedVariants[key - 1] = $scope.newWord; // select new word
    $scope.newWord = '';
  };

  $scope.addVariant = function(key) {
    var newVariant = $scope.newVariants[key];
    if (!inArray(newVariant, $scope.words[key])) {
      $scope.words[key].push(newVariant);
      $scope.selectedVariants[key] = newVariant; // select new word
    } else {
      // alert('Duplicate word variant');
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
      token = '<' + (parseInt(key) + 1) + '>';
      pluralToken = '<' + (parseInt(key) + 1) + ':pl>';
      sentence = sentence.replace(token, selectedVariants[key]);
      sentence = sentence.replace(pluralToken, pluralize(selectedVariants[key]));
    }
    return sentence;
  };
});
