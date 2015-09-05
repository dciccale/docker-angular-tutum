describe('main', function () {
  'use strict';

  var $rootScope, $scope;

  beforeEach(module('app'));
  beforeEach(module('app/main/main.html'));

  beforeEach(inject(function (_$rootScope_, $controller) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $controller('MainCtrl', {$scope: $scope});
    $scope.$digest();
  }));

  describe('main tests', function () {
    it('should have two lists with 3 items each', function () {
      expect($scope.list1.length).to.equal(3);
      expect($scope.list2.length).to.equal(3);
    });
  });
});
