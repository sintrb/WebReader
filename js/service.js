angular.module('reader.service', [])
	.factory('readerService', function($http){
		var baseurl = "/data/";
		var runHttpRequest = function(url){
			return $http({
				method:'GET',
				url:baseurl + url
			})
		};
		return {
			bookurl: "book1/",
			toc : function(){
				return runHttpRequest(this.bookurl + "toc.json");
			},
			cont : function(part_no){
				return runHttpRequest(this.bookurl + "content"+part_no+".json");
			}
		}
	})