angular.module('app.directives', ['ngClickCopy'])
.directive("ngScopeElement", function () {
  return {
    restrict: "A",
    compile: function compile(tElement, tAttrs, transclude) {
      return {
          pre: function preLink(scope, iElement, iAttrs, controller) {
            scope[iAttrs.ngScopeElement] = iElement;
          }
        };
    }
  };
})
.directive('qrcode', ['storage', function(storage){
    return {
        template: '<div align="center" class="white"><br><div ng-scope-element="list" align="center"></div><br>{{ address }}<br><button style="color:#05B921;" class="button button-positive button-block" ng-click-copy="{{ address }}">Copy to Clipboard</button></div',
        link: function(scope, element) {
            if(storage.data) {
                var address = storage.getAddress();
                scope.address = address.getAddress();
                scope.qrcode = new QRCode(scope.list[0], {
                    text: scope.address,
                    height: 192,
                    width: 192
                });
            }
      }  
    };
}]);