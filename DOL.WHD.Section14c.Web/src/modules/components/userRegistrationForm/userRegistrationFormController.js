'use strict';

import some from 'lodash/some';

module.exports = function(ngModule) {
  ngModule.controller('userRegistrationFormController', function(
    $window,
    $scope,
    $location,
    stateService,
    apiService
  ) {
    'ngInject';
    'use strict';

    var vm = this;
    vm.stateService = stateService;
    vm.showFacts = false;
    vm.restForm = function() {
      if(vm.userRegistrationForm) {
       vm.userRegistrationForm.$setPristine();
      }

      $scope.formVals = {
        firstName: '',
        lastName: '',
        email: '',
        pass: '',
        confirmPass: ''
      };

    };
    vm.restForm();
    vm.passwordStength = {
      strong: false,
      score: 0
    };
    vm.resetErrors = function() {
      vm.generalRegistrationError = false;
      vm.showEinHelp = false;
      vm.einError = false;
      vm.einRequired = false;
      vm.firstNameRequired = false;
      vm.lastNameRequired = false;
      vm.emailAddressError = false;
      vm.emailAddressRequired = false;
      vm.showPasswordHelp = false;
      vm.passwordRequired = false;
      vm.invalidEin = false;
      vm.passwordsDontMatch = false;
      vm.passwordComplexity = false;
      vm.accountCreated = false;
      vm.emailVerified = false;
      vm.emailVerificationError = false;
    };
    vm.resetErrors();

    vm.resetPasswordComplexity = function() {
      vm.passwordLength = false;
      vm.passwordUpper = false;
      vm.passwordLower = false;
      vm.passwordSpecial = false;
      vm.passwordNumber = false;
      vm.passwordStength = {
        strong: false,
        score: 0
      };

    };
    vm.resetPasswordComplexity();

    vm.toggleEinHelp = function() {
      vm.showEinHelp = !vm.showEinHelp;
    };

    $scope.toggleFacts = function ()  {
      vm.showFacts = !vm.showFacts;
    };

    $scope.$watch('formVals.pass', function(value) {
      vm.passwordLength = value.length > 7;
      vm.passwordUpper = value.match(new RegExp('^(?=.*[A-Z])')) ? true : false;
      vm.passwordLower = value.match(new RegExp('^(?=.*[a-z])')) ? true : false;
      vm.passwordSpecial = value.match(new RegExp('^(?=.*[-+_!@#$%^&*.,?])'))
        ? true
        : false;
      vm.passwordNumber = value.match(new RegExp('^(?=.*[0-9])'))
        ? true
        : false;

        apiService.checkPasswordComplexity(value).then(function(result){
          vm.passwordStrength = {
            strong: true,
            score: result.data.score
          };
        }).catch(function(error) {
          vm.passwordStrength = {
            strong: false,
            score: error.data.score
          };

        })
    });

    $scope.inputType = 'password';
    vm.emailVerificationUrl = $location.absUrl();
    vm.emailVerificationCode = $location.search().code;
    vm.emailVerificationUserId = $location.search().userId;
    vm.isEmailVerificationRequest =
      vm.emailVerificationCode !== undefined &&
      vm.emailVerificationCode !== undefined;

    if (vm.isEmailVerificationRequest) {
      $location.search('code', null);
      $location.search('userId', null);
      vm.resetErrors();
      apiService
        .emailVerification(
          vm.emailVerificationUserId,
          vm.emailVerificationCode,
          $scope.verifyResponse
        )
        .then(
          function() {
            vm.emailVerified = true;
          },
          function() {
            vm.emailVerificationError = true;
          }
        );
    }

    $scope.onSubmitClick = function() {
      vm.resetErrors();
      vm.registeredEmail = '';
      vm.submittingForm = true;
      if(!$scope.formVals.firstName) {
        vm.firstNameRequired = true;
      }
      if(!$scope.formVals.lastName) {
        vm.lastNameRequired = true;
      }
      if(!$scope.formVals.email) {
        vm.emailAddressRequired = true;
      }
      if(vm.passwordStrength.score < 3) {
        vm.passwordComplexity = true;
      }

      if(vm.lastNameRequired || vm.lastNameRequired || vm.emailAddressRequired || vm.passwordComplexity) {

        vm.submittingForm = false;
        return;
      }
      /* eslint-disable complexity */
      apiService
        .userRegister(
          $scope.formVals.firstName,
          $scope.formVals.lastName,
          $scope.formVals.email,
          $scope.formVals.pass,
          $scope.formVals.confirmPass,
          vm.emailVerificationUrl
        )
        .then(
          function() {
            vm.registeredEmail = $scope.formVals.email;
            vm.restForm();
            vm.accountCreated = true;
            vm.submittingForm = false;
            $window.scrollTo(0, 0);
          },
          function(error) {
            console.log(error)
            if (error && error.data) {
              $scope.registerErrors = apiService.parseErrors(error.data);
              if (
                $scope.registerErrors.indexOf('EIN is already registered') > -1
              ) {
                vm.einError = true;
              }
              if (
                some($scope.registerErrors, function(error) {
                  return error.indexOf('is already taken') > -1;
                })
              ) {
                vm.emailAddressError = true;
              }
              if (
                $scope.registerErrors.indexOf('The Email field is required.') >
                -1
              ) {
                vm.emailAddressRequired = true;
              }
              if (
                $scope.registerErrors.indexOf(
                  'The Password field is required.'
                ) > -1
              ) {
                vm.passwordRequired = true;
              }
              if (
                $scope.registerErrors.indexOf('The EIN field is required.') > -1
              ) {
                vm.einRequired = true;
              }
              if (
                some($scope.registerErrors, function(error) {
                  return error.indexOf('The field EIN must match') > -1;
                })
              ) {
                vm.invalidEin = true;
              }
              if (
                $scope.registerErrors.indexOf(
                  'The password and confirmation password do not match.'
                ) > -1
              ) {
                vm.passwordsDontMatch = true;
              }
              if ($scope.registerErrors.indexOf('Password does not meet complexity requirements.') > -1) {
                vm.passwordComplexity = true;
              }
              if ($scope.registerErrors.indexOf('Model State is not valid') > -1) {
                vm.passwordComplexity = true;
                $scope.passwordStrength = {
                  strong: false,
                  score: error.data.score
                };
              }

              if($scope.registerErrors.length === 0) {
                vm.generalRegistrationError = true;
              }
              if($scope.registerErrors.length === 0) {
                vm.generalRegistrationError = true;
              }
            } else {
              vm.generalRegistrationError = true;
            }

            vm.submittingForm = false;
          }
        );
      /* eslint-enable complexity */
    };

    $scope.regResponse = null;
    $scope.regWidgetId = null;
    $scope.setRegResponse = function(response) {
      $scope.regResponse = response;
    };
    $scope.createRegWidget = function(widgetId) {
      $scope.regWidgetId = widgetId;
    };
    $scope.hideShowPassword = function() {
      if ($scope.inputType === 'password') $scope.inputType = 'text';
      else $scope.inputType = 'password';
    };
  });
};
