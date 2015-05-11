describe('main', function () {
  'use strict';

  var $rootScope, $state;

  beforeEach(module('app'));
  beforeEach(module('app/main/main.html'));

  beforeEach(inject(function (_$rootScope_, _$state_) {
    $rootScope = _$rootScope_;
    $state = _$state_;
  }));

  describe('main tests', function () {
    it('should test routes', function () {
      $state.go('main');
      $state.transition.then(function () {
        expect($state.current.name).to.equal('main');
      });
      $rootScope.$digest();
    });
  });
});
