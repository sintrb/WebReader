/*
 * WebReader AngularJS Service
 * GitHub: https://github.com/sintrb/WebReader
 * E-Mail: sintrb@gmail.com
*/

angular.module('reader.service', [])
	.factory('readerService', function($http){
		var baseurl = "data/";
		var runHttpRequest = function(url){
			return $http({
				method:'GET',
				url:baseurl + url
			});
		};
		return {
			getBook : function(book_id){
				return runHttpRequest("book"+book_id+"/" + "book.json");
			},
			getPart : function(book_id, part_id){
				return runHttpRequest("book"+book_id+"/" + "part"+part_id+".json");
			}
		}
	})