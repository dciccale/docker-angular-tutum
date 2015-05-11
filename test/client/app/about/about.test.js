describe('about', function () {
  'use strict';

  var $rootScope, $state;

  beforeEach(module('app'));
  beforeEach(module('app/about/about.html'));

  beforeEach(inject(function (_$rootScope_, _$state_) {
    $rootScope = _$rootScope_;
    $state = _$state_;
  }));

  describe('about tests', function () {
    it('should test routes', function () {
      $state.go('about');
      $state.transition.then(function () {
        expect($state.current.name).to.equal('about');
      });
      $rootScope.$digest();
    });
  });
});
