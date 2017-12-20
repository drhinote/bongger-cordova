angular.module('app.controllers', [])
  
.controller('walletCtrl', ['$scope', '$stateParams', '$state', 'storage', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state, storage) {
    if(!storage.pin) $state.go('login');
    $scope.transactions = [];
    $scope.refresh = () => {
        storage.refreshBalance().then(() => {
            $scope.balance = storage.balance();
            $scope.pending = storage.pending();
            $scope.transactions = storage.transactions();
            $scope.$apply();
        });
    };
    $scope.refresh();
    $scope.print = trans => {
        return (trans.received?'+':'-') + trans.amount.toFixed(8) + (trans.fee > 0?" (Fee: 1 BGR)":"");  
    };
    $scope.note = trans => { 
        var to = (storage.data.labels[trans.to] || trans.to);
        return (trans.received?'To me':('To ' + (to.length > 15?to.substring(0, 20) + '...':to)));
    };
}])
   
.controller('sendCtrl', ['$scope', '$stateParams', '$state', '$http', '$timeout', 'storage', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state, $http, $timeout, storage) {
    if(!storage.pin) $state.go('login');
    $scope.info = {};
    $scope.price = 0;
    $scope.storage = storage;
    
    $http({
        url: "https://api.coinmarketcap.com/v1/ticker/bongger/"
    }).then(res => {
        $scope.price = parseFloat(res.data[0].price_usd);
        if($scope.info.amount) {
            $scope.info.usd = $scope.price * $scope.info.amount;
        }
    });
   
    $scope.send = function() {
        if(!(!$scope.info.amount || !$scope.info.address)) {
            var amount = $scope.info.amount;
            var address = $scope.info.address;
            var value = $scope.info.usd;
            var label = $scope.info.newLabel;
            $scope.info.amount = $scope.info.usd = $scope.info.address = $scope.info.newLabel = undefined;
            storage.send(amount, value, address, label, message => {
                $scope.output = message;  
            });
        }
    }; 
    
    var scann = function (err, text) {
        if(text &&  $scope.info.amount) {
            QRScanner.destroy();
            $scope.info.address = text;
            if(!$scope.info.amount) $scope.info.amount = 1;
            $timeout(startScanner, 2000);
            $scope.$apply();
        } else if(text) {
            $scope.info.address = text;
        } 
    };
    var startScanner = () => {
        try {
            window.QRScanner_SCAN_INTERVAL = 600;
            if($stateParams.address.length > 1 && parseFloat($stateParams.amount) > 0) {
                $scope.info.amount = parseFloat($stateParams.amount);
                $scope.info.address = $stateParams.address;
                $scope.send();
            }
            QRScanner.scan(scann);
            QRScanner.show();
        } catch(e) {
            $scope.output = "Scanner disabled";
        } 
    }
    startScanner();
}])
   
.controller('receiveCtrl', ['$scope', '$stateParams', '$state', '$timeout', 'storage', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state, $timeout, storage) {
    if(!storage.pin) { $state.go('login'); } 

}])
      
.controller('loginCtrl', ['$scope', '$stateParams', '$state', 'storage', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state, storage) {
    $scope.password = {};
    $scope.storage = storage;
    $scope.$watch('password.pin', function(pin) {
        storage.load(pin);
        if($scope.storage.data && $scope.storage.data.success) {
            $state.go('home.wallet');
        }
    });
    
    $scope.reset = () => {
        $scope.showReset = true;  
    };
    
    $scope.hidePhrase = () => {
        $scope.showPhrase = undefined;
    };
    
    $scope.resetWallet = () => {
        storage.reset();
        $scope.cancel();
    }
    
    $scope.create = () => {
        storage.initWallet($scope.password.newPin);
        $scope.password.newPin = undefined;
        $scope.createNew = undefined;
        $scope.restoreExisting = undefined;
        $scope.showPhrase = true;
    };
    
    $scope.restore = () => {
        storage.initWallet($scope.password.newPin, $scope.password.phrase);
        $scope.password.newPin = undefined;
        $scope.createNew = undefined;
        $scope.restoreExisting = undefined;
    };
    
    $scope.showCreate = () => {
        $scope.createNew = true;  
    };
    $scope.showRestore = () => {
        $scope.restoreExisting = true;  
    };
    $scope.cancel = () => {
        $scope.showReset = undefined;
        $scope.password.newPin = undefined;
        $scope.password.phrase = undefined;
        $scope.createNew = undefined;
        $scope.restoreExisting = undefined;
    };
}])
   
.controller('helpCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
 