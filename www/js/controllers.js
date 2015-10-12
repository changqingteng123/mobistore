'use strict';

angular.module('mobistore.controllers', [])
  .controller('ClientCtrl', ['$rootScope', '$scope', '$location', '$timeout', '$ionicHistory', 'Util', 'clientSrv', 
                             function($rootScope, $scope, $location, $timeout, $ionicHistory, Util, clientSrv) {
	  var platform = ionic.Platform.platform();
	  var isWebView = ionic.Platform.isWebView();
	  
	  $scope.client = {mobile: '16612345678', password: '123456'};
	  $scope.signon = function() {
		  clientSrv.signon($scope.client, platform);
	  }
	  
	  $scope.$on('$viewContentLoaded', function(event) {
	      
	  });
	  
  }])
  .controller('TabCtrl', ['$rootScope', '$scope', '$location', '$timeout', '$ionicHistory', 'Util', 'HomeOpt', 
                          function($rootScope, $scope, $location, $timeout, $ionicHistory, Util, HomeOpt) {
	  
	  $scope.toHome = function() {
		  $ionicHistory.nextViewOptions({ historyRoot: true });
		  $location.path('/tab/home');
	  }
  }])

  .controller('HomeCtrl', ['$rootScope', '$scope', '$state', '$location', '$timeout', '$ionicHistory', '$ionicModal', '$ionicPopover', 'Util', 'StringUtil', 'HomeOpt', 'ProductMdl', 'ProductOpt', 'SearchOpt', 
                           function($rootScope, $scope, $state, $location, $timeout, $ionicHistory, $ionicModal, $ionicPopover, Util, StringUtil, HomeOpt, ProductMdl, ProductOpt, SearchOpt) {
	  $rootScope.fromHome = true;
	  
	  $scope.$on('$ionicView.enter', function( scopes, states ) {
		  if ($scope.loaded) {
			  return;
		  }
		  
	 	  HomeOpt.opt({act: 'index'},function(json) {
//			  console.log(json);
			  $scope.categories = json.categories;
			  $scope.adverts = json.adverts;
			  $scope.products = json.products;	
			  $rootScope.shoppingcartItemNumb = json.shoppingcartItemNumb;
			  
			  if(json.code == 1) {
				  $scope.loaded = true;
			  }
		  });
	   });
	  
//	  window.addEventListener("orientationchange", function() {
//		　　$scope.resize();
//	  }, false);
//	  
//	  $scope.resize = function() {
//		  $scope.platform = ionic.Platform.platform();
//	    var width = Util.getScreenSize().w;
//	    var height = width * 0.57;
//	    
//	    if (ionic.Platform.isAndroid()window.devicePixelRatio) {
//	    	height = height / window.devicePixelRatio;
//	    	width = width / window.devicePixelRatio;
//	    }
//
//	    $scope.styleSlideHeight = {'height':height + 'px', 'width': width + 'px'};
//	  };
//	  $scope.resize();
 	  
	  $scope.menuShow = false;$scope.categories
	  $scope.showMenu = function() {
	      $scope.menuShow = !$scope.menuShow;
	  };
	
	  $scope.showCategory = function(item) {
		  console.log(item.id);
		  $rootScope.fromWhereToProducts = 'category';
		  $rootScope.categoryId = item.id;
		  $location.path('/tab/products');
		  $scope.menuShow = false;
	  };
	  
	  $scope.searchProducts = function() {
		  $rootScope.fromWhereToProducts = 'homebar';
		  $location.path('/tab/products');
	  };
	  $scope.showProdcut = function(id) {
		  $rootScope.showProductFromHome = true;
		  $location.path('/tab/product/'+ id);
	  };
  }])
  
  .controller('ProductsCtrl', ['$rootScope', '$scope', '$state', '$location', '$ionicModal', '$timeout', 'Util', 'StringUtil', 'CategoryOpt', 'ProductMdl', 'SearchOpt', 
                             function($rootScope, $scope,  $state, $location, $ionicModal, $timeout, Util, StringUtil, CategoryOpt, ProductMdl, SearchOpt) {
	  
	  $scope.inputData = {};
	  $scope.resultLoadKeywordsData = [];
	  $scope.showLoadKeywordsResult = false;
	  
	  $scope.$on('$ionicView.enter', function( scopes, states ) {
		  $scope.loadData(); // 初始化默认的列表数据 
	  });
	  
	  if (!$scope.modalLoaded) {
		  $ionicModal.fromTemplateUrl('templates/search/search.html', {
		    scope: $scope,
		    animation: 'slide-in'
		  }).then(function(modal) {
		    $rootScope.modal = modal;
		    $scope.modalLoaded = true;
		  });
	  }
	  
	  $scope.loadData = function() {
		  if (!$rootScope.fromHome) { // 浏览器刷新
			  $scope.search();
		  }
		  
		  if ($rootScope.fromWhereToProducts === 'homebar') { // from home search bar
			  $rootScope.fromWhereToProducts = '';
			  $scope.openModal();
		  } else if ($rootScope.fromWhereToProducts === 'category') { // from category
			  if (!$scope.tags) {
				  $scope.tags = {};
			  }
			  
			  if ($scope.tags.fromWhereToProducts != $rootScope.fromWhereToProducts // 来源不一样
					  || $scope.tags.categoryId != $rootScope.categoryId) { // 分类不一样
				  
				  $scope.tags.fromWhereToProducts = $rootScope.fromWhereToProducts;
				  $scope.tags.categoryId = $rootScope.categoryId;
				  
				  CategoryOpt.opt({act:'listProduct', categoryId: $scope.categoryId}).$promise.then(function(json) {
					  console.log(json);
					  $scope.products = json.data;
					  
					  $scope.loaded = true;
				  });
			  }
		  } else {
			  if (!$scope.loaded) {
			 	  SearchOpt.opt({act: 'search', keywords: ''},function(json) {
			 		  console.log(json);
					  $scope.products = json.data;
					  
					  $scope.loaded = true;
				  });
			  }
		  }
	  };
	  
	  $scope.resetLoadKeywords = function() {
		  $scope.inputData = {};
		  $scope.resultLoadKeywordsData = [];
		  $scope.showLoadKeywordsResult = false;
	  };
	  $scope.loadKeywords = function(keywords) {
		  console.log(keywords);
		  
		  keywords = StringUtil.trim(keywords);
		  if (StringUtil.isEmpty(keywords)) {
			  $scope.resultLoadKeywordsData = [];
			  $scope.showLoadKeywordsResult = false;
			  return;
		  }
	 	  SearchOpt.opt({act: 'getMatchedKeywords', keywords: keywords},function(json) {
			  $scope.resultLoadKeywordsData = json.data;
			  $scope.showLoadKeywordsResult = true;
		  });
	  };

	  $scope.search = function(keywords) {
		  $rootScope.fromWhereToProducts = 'search';
		  
		  if (StringUtil.isEmpty(keywords)) {
			  keywords = $scope.inputData.keywords;
		  }
		  
		  $rootScope.keywords = keywords;
		  console.log(keywords);
		  
		  $scope.showLoadKeywordsResult = false;
		  $scope.closeModal();
	 	  SearchOpt.opt({act: 'search', keywords: keywords},function(json) {
	 		  console.log(json);
			  $scope.products = json.data;
			  
			  $scope.loaded = true;
		  });
	 	  return false;
	  };
	  
	  $scope.keywordsChange = function() {
		  $scope.loadKeywords($scope.inputData.keywords)
	  };
	  
	  $scope.showProdcut = function(id) {
		  $location.path('/tab/product/'+ id);
	  };
	  
	  $scope.openModal = function() {
		  $scope.inputData = {};
		  $rootScope.modal.show();
		  
	 	  SearchOpt.opt({act: 'history'},function(json) {
			  console.log(json);
			  $scope.hots = json.hots;
			  $scope.histories = json.histories;
		  });
	  };
	  
	  $scope.cancelModal = function() {
		  $rootScope.modal.hide();
		  
		  if (!$scope.loaded) {
			  SearchOpt.opt({act: 'search', keywords: $rootScope.keywords},function(json) {
		 		  console.log(json);
				  $scope.products = json.data;
				  
				  $scope.loaded = true;
			  });
		  }
	  };
	  $scope.$on('$destroy', function() {
		  if ($rootScope.modal) {
			  $rootScope.modal.remove();
		  }
	  });
  }])
  
  .controller('ProductCtrl', ['$rootScope', '$scope', '$state', '$location', '$ionicNavBarDelegate', '$ionicHistory', 'Util', 'StringUtil', 'ClientOpt', 'ProductMdl', 'ProductOpt', 'ShoppingcartOpt',
                              function($rootScope, $scope, $state, $location, $ionicNavBarDelegate, $ionicHistory, Util, StringUtil, ClientOpt, ProductMdl, ProductOpt, ShoppingcartOpt) {

	  $scope.shopping = {qty: 1};
	  var productId = $state.params.productId;
	  
	  $scope.$on('$ionicView.enter', function( scopes, states ) {
		  ProductOpt.opt({act:'get', productId: productId}).$promise.then(function(json) {
//			  console.log(json);
			  
			  $scope.product = json.data;
			  $scope.collectCls = json.isCollected? 'ion-android-favorite': 'ion-android-favorite-outline';
			  
			  console.log($ionicHistory.backView());
			  
			  if ($rootScope.showProductFromHome || $ionicHistory.backView() == null) {
				  $scope.myBackButtonShow = true;
				  $rootScope.showProductFromHome = false;
			  }
		  }); 
	  });
	  
	  $scope.toProducts = function(product) {
		  $scope.myBackButtonShow = false;
		  $ionicHistory.nextViewOptions({ historyRoot: true });
		  $location.path('/tab/products');
	  };
	  
	  $scope.collect = function(product) {
    	  console.log(product.id + '-' + $scope.isCollected);
    	  
    	  ProductOpt.opt({act:'collect', productId: product.id}).$promise.then(function(json) {
    		  console.log(json);
    		  if (json.code == 1) {
    			  $scope.collectCls = json.data? 'ion-android-favorite': 'ion-android-favorite-outline';
    		  }
    	  });
      };
      
      $scope.reduceQty = function() {
    	  if (angular.isString($scope.shopping.qty)) {
    		  $scope.shopping.qty = parseInt(StringUtil.trim($scope.shopping.qty))
    	  }

    	  if ($scope.shopping.qty > 1) {
    		  $scope.shopping.qty -= 1;
    	  }
      };
      $scope.addQty = function() {
    	  if (angular.isString($scope.shopping.qty)) {
    		  $scope.shopping.qty = parseInt(StringUtil.trim($scope.shopping.qty))
    	  }
    	  if ($scope.shopping.qty < $scope.product.qty) {
    		  $scope.shopping.qty += 1;
    	  }
      };
	  
	  $scope.addToShoppingcart = function(product) {
    	  console.log(product.id);
    	  
    	  ShoppingcartOpt.opt({act:'addto', productId: product.id, qty: $scope.shopping.qty}).$promise.then(function(json) {
    		  console.log(json);
    		  
    		  $rootScope.shoppingcartItemNumb = json.data.items.length;
    		  
    	  });
      };
	  
	  $scope.buy = function(product) {
    	  console.log(product.id);
    	  
    	  ShoppingcartOpt.opt({act:'buy', productId: product.id}).$promise.then(function(json) {
    		  console.log(json);
    	  });
      };
      $scope.toShoppingcart = function(product) {
    	  $rootScope.hideTabs = false;
    	  $location.path('/tab/shoppingcart');
      };
	  
//	    // 查找
//	    ProductMdl.get({ id: '1'}).$promise.then(function(p1) {
//	        console.log(p1);
//	        
//	        // 新增
//	        p1.id = '';
//	        ProductMdl.save(p1).$promise.then(function(p2) {
//	        	console.log(p2);
//	        	
//	        	// 更新
//	        	p2.name += '=';
//	        	ProductMdl.save(p2).$promise.then(function(p3) {
//		        	console.log(p3);
//		        	
//		        	// 查询
//		        	ProductMdl.query({'startIndex': 0},function (ls) {
//		      	      console.log(ls);
//		      	      	
//		      	      	// 信息
//			      	  	ProductOpt.opt({act: 'doSomething', 'param': 'test'},function(json) {
//			      	  		console.log(json);
//				      	});
//		      	  	});
//		        });
//	        });
//	        
//	    });

  }])
  .controller('ShoppingcartCtrl', ['$rootScope', '$scope', '$timeout', '$location', '$ionicModal', '$ionicPopover', 'StringUtil', 'ShoppingcartOpt', 'OrderOpt',  
                                   function($rootScope, $scope, $timeout, $location, $ionicModal, $ionicPopover, StringUtil, ShoppingcartOpt, OrderOpt) {
	  $scope.isEmpty = false;
	  
	  $scope.$on('$ionicView.enter', function( scopes, states ) {
		  ShoppingcartOpt.opt({act: 'info'},function(json) {
//		  		console.log(json);
		  		
		  		$scope.cart = json.data;
		  		$scope.isEmpty = $scope.cart.totalAmount == 0;
		  		if (json.data.addresses.length > 0) {
		  			$scope.address = json.data.addresses[0];
		  		}
		  });
	   });
	  
	  $scope.showProdcut = function(productId) {
		  $location.path('/tab/product/'+ productId);
	  };
	  
	  $scope.qtyChange = function(item) {
//			console.log(item);	
		  $timeout.cancel($scope.promise)
			$scope.promise = $timeout(function() {
				if (StringUtil.isEmpty(StringUtil.trim(item.qty))) {
					return;
				}
				ShoppingcartOpt.opt({act: 'changeQty', itemId: item.id, itemQty: item.qty}, function(json) {
			  		console.log(json);
			  		
			  		$scope.cart = json.data;
			  		$scope.isEmpty = $scope.cart.totalAmount == 0;
				});
			}, 3000);
	  };
	  
	  $scope.clear = function() {
		  ShoppingcartOpt.opt({act:'clear'}).$promise.then(function(json) {
    		  console.log(json);
    		  $scope.cart = json.data;
    		  $scope.isEmpty = $scope.cart.totalAmount == 0;
    		  $rootScope.shoppingcartItemNumb = 0;
    	  });	
	  };
	  $scope.checkout = function() {
		  var request = {act:'checkout'};
		  request = angular.extend(request, $scope.address);
		  
		  if ($rootScope.shoppingcartItemNumb > 0) {
			  ShoppingcartOpt.opt(request).$promise.then(function(json) {
	    		  console.log(json);
	    		  
	    		  $rootScope.shoppingcartItemNumb = 0;
	    		  var orderId = json.orderId
	    		  $rootScope.fromCart = true;
	    		  $location.path('/tab/order/' + orderId);
	    	  });
		  }
	  };
  }])

  .controller('MineCtrl', ['$state', '$rootScope', '$scope', '$location', 'ClientOpt', 
                           function($state, $rootScope, $scope, $location, ClientOpt) {
	  
	  $scope.$on('$ionicView.enter', function( scopes, states ) {
		  ClientOpt.opt({act: 'info', platform: ionic.Platform.platform()},function(json) {
		  		console.log(json);
		  		
		  		$scope.info = json;
		  });
	   });
	  
	  $scope.editProfile = function() {
		  $rootScope.client = $scope.info.client;
		  $location.path('/tab/profile');
	  };
	  
	  $scope.gotoMkt = function(url) {
		  console.log($scope.info.rateUrl);
	  };
	  
	  $scope.showOrders = function(orderFilter) {
		  $rootScope.fromCart = false;
		  
		  $rootScope.orderFilter = orderFilter;
		  $location.path('/tab/orders');
	  };
	  
	  $scope.showAddress = function() {
		  $location.path('/tab/addresses');
	  };
	  
  }])
  .controller('ProfileCtrl', ['$state', '$rootScope', '$scope', '$location', '$ionicPopup', 'StringUtil', 'ClientOpt', 
                           function($state, $rootScope, $scope, $location, $ionicPopup, StringUtil, ClientOpt) {
	  if (!$rootScope.client) {
		  ClientOpt.opt({act: 'info', platform: ionic.Platform.platform()},function(json) {
		  		console.log(json);
		  		$rootScope.client = json.client;
		  });
	  }
	  
	  $scope.save = function() {
		  $rootScope.client.mobile = StringUtil.trim($rootScope.client.mobile);
		  $rootScope.client.nickName = StringUtil.trim($rootScope.client.nickName);
		  
		  if (StringUtil.isEmpty($rootScope.client.mobile) || StringUtil.isEmpty($rootScope.client.nickName)) {
			  var alertPopup = $ionicPopup.alert({
				     title: '用户名和姓名不能为空!',
				     okText: '确定',
				     okType: 'button-light'
			  });
			  return;
		  }
		  
		  var request = {act: 'save', mobile: $rootScope.client.mobile, nickName: $rootScope.client.nickName};
		  ClientOpt.opt(request, function(json) {
		  		console.log(json);
		  		$location.path('/tab/mine');
		  });
	  };
	  
	  $scope.$on('$ionicView.enter', function( scopes, states ) {
		  
	  });
  }])
  .controller('OrdersCtrl', ['$state', '$rootScope', '$scope', '$location', 'OrderOpt', 
                             function($state, $rootScope, $scope, $location, OrderOpt) {
	  console.log($rootScope.orderFilter);
	  
	  $scope.$on('$ionicView.enter', function( scopes, states ) {
		  OrderOpt.opt({act: 'list', filter: $rootScope.orderFilter},function(json) {
		  		console.log(json);
		  		
		  		$scope.orders = json.data;
		  });
	   });
	  
	  $scope.showOrder = function(id) {
		  $rootScope.fromCart = false;
		  $location.path('/tab/order/'+ id);
	  };
  }])
  .controller('OrderCtrl', ['$rootScope', '$scope', '$state', '$ionicHistory', '$location', '$ionicModal', 'OrderOpt', 'AddressOpt',
                            function($rootScope, $scope, $state, $ionicHistory, $location, $ionicModal, OrderOpt, AddressOpt) {
	  $scope.tab = 1;
	  var orderId = $state.params.orderId;
	  
	  $scope.$on('$ionicView.enter', function( scopes, states ) {
		  OrderOpt.opt({act: 'info', orderId: orderId},function(json) {
		  		console.log(json);
		  		
		  		$scope.order = json.data;
		  });
	   });
	  
	  $scope.show = function(tab) {
			$scope.tab = tab;	
	  };
	  $scope.toMine = function(tab) {
		  $ionicHistory.nextViewOptions({
			  historyRoot: true
		  });
		  $location.path('/tab/mine');	
	  };
	  
	  $scope.pay = function() {
		  console.log($scope.order);	
	  };
	  $scope.cancel = function() {
		  console.log($scope.order);
		  
		  OrderOpt.opt({act: 'cancel', orderId: $scope.order.id}, 
			function(json) {
			  console.log(json);
			  
			  $location.path('/tab/orders');
		  });
	  };
	  
	  
	  $scope.select = function(item) {
		  console.log(item);
		  OrderOpt.opt({act: 'changeRecipient', orderId: $scope.order.id, recipientId: item.id}, 
			function(json) {
			  console.log(json);
			  
			  $scope.order = json.data;
		  });

		  $scope.cancelModal();
	  };
	  
	  if (!$scope.modalLoaded) {
		  $ionicModal.fromTemplateUrl('templates/client/address-selection.html', {
		    scope: $scope,
		    
		  }).then(function(modal) {
		    $rootScope.modal = modal;
		    $scope.modalLoaded = true;
		  });
	  }
	  $scope.openModal = function() {
		  $rootScope.modal.show();

		  AddressOpt.opt({act: 'list'}, 
			function(json) {
			  console.log(json);
			  $scope.addresses = json.data;
		  });
	  };
	  
	  $scope.cancelModal = function() {
		  $rootScope.modal.hide();
	  };
	  $scope.$on('$destroy', function() {
		  if ($rootScope.modal) {
			  $rootScope.modal.remove();
		  }
	  });
  }])
   .controller('AddressesCtrl', ['$state', '$rootScope', '$scope', '$location', 'AddressOpt', 
                             function($state, $rootScope, $scope, $location, AddressOpt) {
	  console.log($rootScope.orderFilter);
	  
	  $scope.$on('$ionicView.enter', function( scopes, states ) {
		  AddressOpt.opt({act: 'list'},function(json) {
		  		console.log(json);
		  		
		  		$scope.addresses = json.data;
		  });
	   });
	  $scope.add = function() {
		  $rootScope.fromCart = false;
		  $location.path('/tab/address/null');
	  };
	  $scope.edit = function(id) {
		  $rootScope.fromCart = false;
		  $location.path('/tab/address/'+ id);
	  };
  }])
  .controller('AddressCtrl', ['$state', '$rootScope', '$scope', '$location', '$ionicModal', '$ionicPopup', 'StringUtil', 'AddressOpt', 
                             function($state, $rootScope, $scope, $location, $ionicModal, $ionicPopup, StringUtil, AddressOpt) {
	  
	  var productId = $state.params.addressId;
	  
	  $scope.$on('$ionicView.enter', function( scopes, states ) {
		  if (StringUtil.isEmpty(productId)) {
			  $scope.address = {};
			  return;
		  }
		  AddressOpt.opt({act: 'get', id: productId},function(json) {
		  		console.log(json);
		  		
		  		$scope.address = json.data;
		  });
	   });
	  
	  $scope.select = function(item) {
		  console.log(item);
		  $scope.address[item.levelname] = item.areaname;
		  $scope.address[item.levelname + 'Id'] = item.id;
		  
		  if (item.level == 1) {
			  $scope.address['city'] = null;
			  $scope.address['region'] = null;
		  } else if (item.level == 2) {
			  $scope.address['region'] = null;
		  } else if (item.level == 3) {
			  
		  }

		  $scope.cancelModal();
	  };
	  
	  if (!$scope.modalLoaded) {
		  $ionicModal.fromTemplateUrl('templates/client/area-selection.html', {
		    scope: $scope,
		    
		  }).then(function(modal) {
		    $rootScope.modal = modal;
		    $scope.modalLoaded = true;
		  });
	  }
	  $scope.openModal = function(type) {
		  if ( (type == 'city' && StringUtil.isEmpty($scope.address.provice) ) 
				  || (type == 'region' && StringUtil.isEmpty($scope.address.city) ) ) {
			  return;
		  }
		  
		  $rootScope.modal.show();

		  AddressOpt.opt({
		  		act: 'getArea', type: type, 
				proviceId: $scope.address.proviceId, 
				cityId: $scope.address.cityId
			}, 
			function(json) {
			  console.log(json);
			  $scope.areas = json.data;
			  
			  $scope.area = $scope.address[type];
		  });
	  };
	  
	  $scope.cancelModal = function() {
		  $rootScope.modal.hide();
	  };
	  $scope.$on('$destroy', function() {
		  if ($rootScope.modal) {
			  $rootScope.modal.remove();
		  }
	  });
	  
	  $scope.save = function() {
		  $scope.address.name = StringUtil.trim($scope.address.name);
		  $scope.address.phone = StringUtil.trim($scope.address.phone);
		  $scope.address.provice = StringUtil.trim($scope.address.provice);
		  $scope.address.city = StringUtil.trim($scope.address.city);
		  $scope.address.region = StringUtil.trim($scope.address.region);
		  $scope.address.street = StringUtil.trim($scope.address.street);
		  
		  if (StringUtil.isEmpty($scope.address.name) || StringUtil.isEmpty($scope.address.phone)
				  || StringUtil.isEmpty($scope.address.provice) || StringUtil.isEmpty($scope.address.city)
				  || StringUtil.isEmpty($scope.address.street)) {
			  var alertPopup = $ionicPopup.alert({
				     title: '请填写必要的资料!',
				     okText: '确定',
				     okType: 'button-light'
			  });
			  return;
		  }
		  
		  var request = {act: 'save'};
		  request = angular.extend(request, $scope.address);
		  AddressOpt.opt(request, function(json) {
		  		console.log(json);
		  		$location.path('/tab/addresses');
		  });
	  };
	  
	  $scope.remove = function() {
		  AddressOpt.opt({act: 'remove', addressId: $scope.address.id}, function(json) {
		  		console.log(json);
		  		$location.path('/tab/addresses');
		  });
	  }
	  
  }])
  .controller('MsgCtrl', ['$scope', '$state', '$location', 
                          function($scope, $state, $location) {
	  var error = $state.params.error;
	  
	  if (error == -200) {
		  $scope.msg = {
    			  title: '服务请求错误',
    			  descr: '请联系系统管理人员！'
    	  };
	  } else {
		  $scope.msg = {
    			  title: '未知错误',
    			  descr: '请联系系统管理人员！'
    	  };
	  }
	  
	  $scope.backTo = function() {
		  $location.path('/tab/home');
	  }
	  
  }]);
