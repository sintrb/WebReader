/*
 * WebReader AngularJS Service
 * GitHub: https://github.com/sintrb/WebReader
 * E-Mail: sintrb@gmail.com
*/

angular.module('reader.service', [])
	.factory('readerService', function($http){
		var baseurl = "data/";
		var runHttpRequest = function(url, method){
			return $http({
				method: method?method:'GET',
				url:baseurl + url
			});
		};
		// URL
		// 1.get book info
		//    GET:baseurl+/book{book_id}/book.json
		// 2.get book part
		//    GET:baseurl+/book{book_id}/part{part_id}.json
		// 3.get book read process
		//    GET:baseurl+/book{book_id}/progress.json
		//     or
		//    GET:baseurl+/book{book_id}/part{part_id}/progress.json
		// 4.post book read process
		//   GET/POST:baseurl+/book{book_id}/part{part_id}/progress/{content_id}
		return {
			getBook : function(book_id){
				return runHttpRequest("book"+book_id+"/" + "book.json");
			},
			getPart : function(book_id, part_id){
				return runHttpRequest("book"+book_id+"/" + "part"+part_id+".json");
			},
			getProgress : function(book_id){
				return runHttpRequest("book"+book_id+"/progress.json", "GET");
			},
			postProgress : function(book_id, part_id, content_id){
				return runHttpRequest("book"+book_id+"/" + "part"+part_id+"/progress/"+content_id, "POST");
			},
		}
	})