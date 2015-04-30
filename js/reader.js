/*
 * WebReader
 * GitHub: https://github.com/sintrb/WebReader
 * E-Mail: sintrb@gmail.com
*/

var s = function(angular, $, _){
angular.module("reader",['reader.service'])
	.controller("ReaderController", ['$scope', 'readerService', '$timeout', function($scope, readerService, $timeout){
		
		$scope.fontsize = 18;	// pix

		$scope.operating = false;
		$scope.operaterror = function(err, tm){
			$scope.operating = err;
			$timeout(function(){
				$scope.operating = false;
			}, tm?tm:20000);
		}

		// load setting
		$scope.loadSetting = function(){
			readerService.getSetting().success(function(setting){
				$scope.setting = setting;
				$scope.fontsize = setting.fontsize;
			});
		}

		// load a book by book_id
		$scope.loadBook = function(book_id){
			if($scope.operating)
				return;
			$scope.operating = true;
			readerService.getBook(book_id).success(function(book){
				if(book && book.id){
					$scope.book = book;

					$scope.curpage = null;
					$scope.part = null;
					$scope.contents = null;
					$scope.showlist = true;

					$scope.listbooks = false;

					// $scope.operating = false;

					readerService.getProgress(book_id).success(function(progress){
						$scope.operating = false;
						if(progress && progress.book_id){
							$scope.loadPart(progress.part_id, progress.content_id);
						}
						else if($scope.book.parts.length==1){
							$scope.loadPart($scope.book.parts[0].id);
						}
					}).error(function() {
						$scope.loadPart($scope.book.parts[0].id);
						$scope.operating = false;
					});
				}
				else{
					$scope.operaterror(book && book.msg ? book.msg: "Get Book Failed!");
				}
			}).error(function(data, status) {
				$scope.operaterror("Oh, Error ! "+(status?status:''));
				$scope.operating = false;
			});
		}
		// load a part of a current book
		$scope.loadPart = function(part_id, switch_to_content_id){
			if($scope.part && part_id==$scope.part.id){
				$scope.showlist = false;
				return;
			}
			if($scope.operating)
				return;
			$scope.operating = true;
			readerService.getPart($scope.book.id, part_id).success(function(part){
				if(part){
					$scope.part = part;
					$scope.contents = part.contents;
					$scope.repage();
					$scope.page_no = 0;
					if(switch_to_content_id>0){
						$.each($scope.pages, function(index, val) {
							var cnt = val.getCurContent();
							if(cnt && cnt.id==switch_to_content_id){
								$scope.page_no = index;
							}
						});
					}
					else if(switch_to_content_id<0){
						$scope.page_no = $scope.pages.length-1;
					}
					$scope.curpage = $scope.pages[$scope.page_no];
					$scope.procUpdated = false;
					$scope.operating = false;
				}
				else{
					$scope.operaterror(book && book.msg ? book.msg: "Get Book Failed!");
				}
			}).error(function(data, status) {
				$scope.operaterror("Oh, Error ! "+(status?status:''));
				$scope.operating = false;
			});
		}

		$scope.loadBooks = function(){
			if($scope.operating)
				return;
			$scope.operating = true;
			readerService.getBooks().success(function(books){
				$scope.books = books;
				$scope.listbooks = true;
				$scope.operating = false;
			}).error(function(data, status) {
				$scope.operaterror("Oh, Error ! "+(status?status:''));
				$scope.operating = false;
			});
		}

		$scope.pTextStyle = function(c){
			return {
			'width':c._size.w+'px', 
			'font-style':c.format.italic?'italic':'normal', 
			'font-weight':c.format.bold?'bold':'normal', 
			'text-indent':typeof(c.format.indent)=='undefined'?'2em':c.format.indent+'em', 
			'font-size':typeof(c.format.size)=='undefined'?'1rem':c.format.size+'rem', 
			'line-height':c._format&&c._format.lineheight?c._format.lineheight+'pix':$scope.style.lineheight+'rem'};
		}

		// page the article, calculate page....
		// it's a shit function, but is the core
		$scope.repage = function(){
			var fontsize = $scope.fontsize;	// pix
			var textindent = 2;	// rem
			var lineheight = 1.5; // rem
			var headheight = 1.5;	// rem
			var footheight = 1.5;	// rem
			var screenwidth = $(window).width();	// pix
			var screenheight = $(window).height();	// pix

			$(document.documentElement).css("font-size", fontsize+"px");

			$("#screen").width(screenwidth);
			$("#screen").height(screenwidth);	

			var lineheightpix = fontsize*lineheight;

			var minmargin = 5;	// pix
			var minmarginx = minmargin;	// pix
			var minmarginy = 0;	// pix

			var pageheight = screenheight;
			var pagewidth = screenwidth;

			
			var allcontheight = pageheight-fontsize*headheight-fontsize*footheight-1;

			var linecount = Math.floor((allcontheight-minmarginy*2)/lineheightpix);
			var rowcount = Math.floor((pagewidth-minmarginx*2)/fontsize);

			var contheight = linecount*lineheightpix;
			var contwidth = rowcount*fontsize;

			var contmarginy = (allcontheight - contheight)/2;
			var contmarginx = (pagewidth - contwidth)/2;

			var bdheight = contheight;
			var bdwidth = contwidth;

			var pwidth = bdwidth - 2*contmarginx;
			
			var bookmargin = 5;
			var bookmwidth = (pagewidth-contmarginx*2)/3-bookmargin*2;
			var bookhegiht = bookmwidth*1.5;

			$scope.style = {
				screenheight: screenheight,
				screenwidth: screenwidth,

				pageheight: pageheight,
				pagewidth: pagewidth,
				bdheight: bdheight,
				bdwidth: bdwidth,
				contheight: contheight,
				contwidth: contwidth,
				contmarginy: contmarginy,
				contmarginx: contmarginx,
				pwidth: pwidth,
				lineheight: lineheight,
				lineheightpix: lineheightpix,
				fontsize: fontsize,

				bookmargin:bookmargin,
				bookmwidth:bookmwidth,
				bookhegiht:bookhegiht,
				booknametop:bookhegiht-lineheightpix*2,
			}

			// if no content to refresh(only get style) or screen is too small
			// return
			if(!$scope.contents || lineheight>contheight)
				return;
			

			var p = $("<p></p>")
			p.hide();
			p.appendTo(document.body);

			p.css("width", bdwidth+"px");

			p.css("text-indent",textindent+"em");
			p.css("line-height", lineheight + "rem");
			p.css("min-height", lineheight+"rem");
			p.css("font-size", fontsize+"px");
			p.css("word-wrap","break-word");
			p.css("text-align","left");

			function textHeight(txt){
				p.text(txt);
				return p.height();
			}

			function contentSize(cont){
				if(cont.type=='text'){
					var _sz = cont._size;
					cont._size = {w:contwidth};
					var sty = $scope.pTextStyle(cont);
					cont._size = _sz;
					for(var k in sty){
						p.css(k, sty[k]);
					}
					p.text(cont.text);
					return {
						w: contwidth,
						h: p.height()
					};
				}
				else if(cont.type=='image'){
					var rk = cont.format.width/cont.format.height;
					var sk = contwidth/contheight;

					var nw = 0, nh = 0;

					if(rk>sk){
						nw = contwidth-2*fontsize;
						nh = nw/rk;
					}
					else{
						nh = contheight-2*fontsize;
						nw = nh*rk;
					}

					nh = Math.floor(nh/lineheightpix)*lineheightpix;
					nw = nh*rk;

					return {
						w: nw,
						h: nh,
					};
				}

				else{
					return null;
				}
			}

			var pages = [];

			// create a page
			function newPage(){
				return {
					contents:[],
					curh:0,
					offh:0,
					noffh:0,
					maxh:bdheight,

					getCurContent: function(){
						if(this.offh>0 && this.contents.length>1){
							return this.contents[1];
						}
						else if(this.contents.length>0){
							return this.contents[0];
						}
						else{
							return null;
						}
					}
				};
			}

			// add content to page
			function addToPage(page, cont, offh){
				// console.log(cont);
				var rh = page.maxh-page.curh;

				if(page.curh>=page.maxh || (cont.single && rh<cont._size.h)){
					pages.push(page);
					var npage = newPage();
					npage.offh = page.noffh;
					page = npage;
					rh = npage.maxh;
				}

				page.contents.push(cont);
				page.curh += (cont._size.h-offh);
				if(page.curh>page.maxh){
					page.noffh = offh+rh;
					return addToPage(page, cont, offh+rh);
				}
				return page;
			}

			var pg = newPage();

			// add all content
			$.each($scope.contents, function(index, val) {
				if(val._size = contentSize(val))
					pg = addToPage(pg, val, 0);
			});

			// add the last page to pages
			pages.push(pg);

			//
			$scope.pages = pages;
			$scope.page_count = pages.length;

			// remove it
			p.remove();

			// switch to content view
			$scope.showlist = false;
		}

		function throttle(fn, tm) {
			var cxt = {
				count:0
			}
			function warpfn(){
				++cxt.count;
				setTimeout(function(){
					--cxt.count;
					if(!cxt.lasttime || (Date.now()-cxt.lasttime)>=tm || cxt.count==0){
						fn();
						cxt.lasttime = Date.now();
					}
				}, tm);
			}
			return warpfn;
		}

		$scope.applyRepage = throttle(function(){
			$scope.$apply(function(){
				$scope.repage();
			});
		}, 1000);

		$scope.saveSetting = throttle(function(){
			$scope.$apply(function(){
				readerService.postSetting($scope.setting).success(function(){});
			});
		}, 2000);

		// font ++
		$scope.fontBiger = function(){
			if($scope.fontsize<36)
				$scope.fontsize += 2;
		}
		// font --
		$scope.fontSmaller = function(){
			if($scope.fontsize>10)
				$scope.fontsize -= 2;
		}

		$scope.procUpdated = false;
		$scope.prePage = function(){
			if($scope.operating)
				return;
			if($scope.page_no>0){
				--$scope.page_no;
				$scope.curpage = $scope.pages[$scope.page_no];
				$scope.procUpdated = true;
			}
			else{
				var partix = -1;
				$.each($scope.book.parts, function(index, val) {
					if(val.id == $scope.part.id)
						partix = index;
				});
				if(partix>0){
					$scope.loadPart($scope.book.parts[partix-1].id, -1);
				}
				else{
					$scope.showlist = true;
				}
			}
		}

		$scope.nxtPage = function(){
			if($scope.operating)
				return;
			if($scope.page_no<($scope.pages.length-1)){
				++$scope.page_no;
				$scope.curpage = $scope.pages[$scope.page_no];
				$scope.procUpdated = true;
			}
			else{
				var partix = -1;
				$.each($scope.book.parts, function(index, val) {
					if(val.id == $scope.part.id)
						partix = index;
				});
				if(partix>=0 && partix<($scope.book.parts.length-1)){
					$scope.loadPart($scope.book.parts[partix+1].id);
				}
				else{
					// $scope.showlist = true;
					$scope.operaterror("Over!", 2000);
				}
			}
		}

		$scope.saveProcess = throttle(function(){
			$scope.$apply(function(){
				if(!$scope.procUpdated)
					return;
				var cnt = $scope.curpage?$scope.curpage.getCurContent():null;
				if(cnt){
					readerService.postProgress($scope.book.id, $scope.part.id, cnt.id);
				}
				$scope.procUpdated = false;
			});
		}, 2000);

		$scope.$watch('fontsize', function(){
			if(!$scope.setting || $scope.setting.fontsize == $scope.fontsize)
				return;
			$scope.setting.fontsize = $scope.fontsize;
			$scope.applyRepage();
			$scope.saveSetting();
		});
		$scope.$watch('procUpdated', $scope.saveProcess);

		$scope.repage();
		$scope.loadSetting();

		var r = /bookid=([^&]+)/.exec(window.location.href);
		if(r){
			$scope.loadBook(r[1]);
		}
		else{
			// $scope.loadBook(1);
			$scope.loadBooks();
		}
		$(window).resize(function(event) {
			$scope.$apply($scope.applyRepage);
		});
	}]);
}(angular, jQuery, _);