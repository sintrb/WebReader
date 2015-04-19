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
			getBook : function(book_id, cbk){
				runHttpRequest("book"+book_id+"/" + "toc.json").success(function(toc){
					// warp the douban book json to general book json
					var parts = [];
					$.each(toc.toc, function(index, val) {
						parts.push({
							part_no: val.part_no,
							level: val.level,
							title: val.title
						});
					});

					// book json
					/*
					book = {
						id: 4,	// book id
						parts: [
							{
								title: 'Part 0',	// book part title
								part_no: 0,	// book part number
								lever: 0,	// book part level
							}
						]
					}
					*/

					cbk({
						id: book_id,
						parts: parts
					});
				}).error(function() {
					cbk(null);
				});
			},
			getPart : function(book_id, part_no, cbk){
				runHttpRequest("book"+book_id+"/" + "content"+part_no+".json").success(function(part){
					// warp the douban book json to general book json
					var conts = [];
					$.each(part.contents, function(index, val) {
						if(val.type="paragraph" && typeof(val.data.text)!="undefined"){
							conts.push({
								type: "p",
								format: {
									id: val.id,
									align:val.data.format.p_align,
									quote:val.data.format.p_quote,
									bold:val.data.format.p_bold,
								},
								text: val.data.text,
							});
						}
						else{
							console.log(val);
						}
					});
					// book part json
					/*
					part = {
						title: 'Part 3',	// part title
						part_no: 2,	// part number
						conts: [
							{
								id:1234,	// content id
								type:'p',	// a paragraph
								format:{	// format
									align:'left',	// text align, 'left' 'right' 'center'
									quote:true,	// is quote
									bold:true,	// is bold
								},
								text:'hello, this is a test paragraph',	// paragraph text
							}
						]
					}
					*/

					cbk({
						title: part.title,
						part_no: part_no,
						conts: conts,
					});
				}).error(function() {
					cbk(null);
				});
			}
		}
	})