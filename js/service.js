/*
 * WebReader AngularJS Service
 * GitHub: https://github.com/sintrb/WebReader
 * E-Mail: sintrb@gmail.com
*/

angular.module('reader.service', [])
	.factory('readerService', function($http){
		var baseurl = "data/";
		var runHttpRequest = function(url, method, data){
			return $http({
				method: method?method:'GET',
				url:baseurl + url,
				data:data?data:null
			});
		};
		// URL
		// 0.get setting info
		//    GET:baseurl+/setting.json
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
		// 5.post setting info
		//   POST:baseurl+/setting.json
		// 6.get books
		//   GET:baseurl+/books.json

		return {
			getSetting : function(book_id){
				return runHttpRequest("setting.json?_="+Date.now());
			},
			getBook : function(book_id){
				return runHttpRequest("book"+book_id+"/" + "book.json");
			},
			getPart : function(book_id, part_id){
				return runHttpRequest("book"+book_id+"/" + "part"+part_id+".json");
			},
			getProgress : function(book_id){
				return runHttpRequest("book"+book_id+"/progress.json?_="+Date.now(), "GET");
			},
			postProgress : function(book_id, part_id, content_id){
				return runHttpRequest("book"+book_id+"/" + "part"+part_id+"/progress/"+content_id, "POST");
			},
			postSetting : function(setting){
				return runHttpRequest("setting.json", "POST", setting);
			},
			getBooks : function(setting){
				return runHttpRequest("books.json");
			},
		}
	})