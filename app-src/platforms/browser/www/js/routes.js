angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    

      .state('home.wallet', {
    url: '/wallet',
    views: {
      'tab3': {
        templateUrl: 'templates/wallet.html',
        controller: 'walletCtrl'
      }
    }
  })

  .state('home.send', {
    url: '/send',
	params: {
		address: "",
		amount: ""		
},
    views: {
      'tab1': {
        templateUrl: 'templates/send.html',
        controller: 'sendCtrl'
      }
    }
  })

  .state('home.receive', {
    url: '/receive',
    views: {
      'tab2': {
        templateUrl: 'templates/receive.html',
        controller: 'receiveCtrl'
      }
    }
  })

  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    abstract:true
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('home.help', {
    url: '/help',
    views: {
      'tab4': {
        templateUrl: 'templates/help.html',
        controller: 'helpCtrl'
      }
    }
  })

$urlRouterProvider.otherwise('/login')


});