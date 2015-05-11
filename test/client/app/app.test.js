describe('app', function () {
  'use strict';

  beforeEach(module('app'));

  describe('app tests', function () {
    it('should recognize our angular module', function () {
      expect(angular.module('app')).to.exist;
    });
  });
});
