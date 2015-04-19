angular.module("reader",['reader.service'])
	.controller("ReaderController", ['$scope', 'readerService', function($scope, readerService){

		$scope.page = 1;

		readerService.toc().success(function(toc){
			$scope.toc = toc;
		});

		$scope.load = function(part_no){
			readerService.cont(part_no).success(function(cont){
				$scope.cont = cont;
				$scope.conts = [];
				$.each(cont.contents, function(index, val){
					console.log(val.type);
					console.log(val);
					if(val.type="paragraph")
						$scope.conts.push(val)
				});
			});
		}
		$scope.load(0);

	}]);