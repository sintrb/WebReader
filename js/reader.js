/*
 * WebReader
 * GitHub: https://github.com/sintrb/WebReader
 * E-Mail: sintrb@gmail.com
*/

angular.module("reader",['reader.service'])
	.controller("ReaderController", ['$scope', 'readerService', '$timeout', function($scope, readerService, $timeout){

		$scope.fontsize = 16;	// pix

		// load a book by book_id
		// must adapter at readerService
		$scope.loadBook = function(book_id){
			readerService.getBook(book_id, function(book){
				if(book){
					$scope.book = book;
					$scope.loadPart(book_id, 0);
				}
			});
		}
		// load a part of a current book
		$scope.loadPart = function(part_no){
			readerService.getPart($scope.book.id, part_no, function(part){
				if(part){
					$scope.part = part;
					$scope.conts = part.conts;
					$scope.repage();
				}
			});
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
				fontsize: fontsize,
			}

			// if no content to refresh(only get style) or screen is too small
			// return
			if(!$scope.conts || lineheight>contheight)
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

			var pages = [];

			// create a page
			function newPage(){
				return {
					conts:[],
					curh:0,
					offh:0,
					noffh:0,
				};
			}

			// add content to page
			function addToPage(page, cont, h, offh, enty){
				if(page.curh>=bdheight){
					pages.push(page);
					var npage = newPage();
					npage.offh = page.noffh;
					page = npage;
				}

				var rh = bdheight-page.curh;
				page.conts.push(cont);
				page.curh += (h-offh);
				if(page.curh>bdheight){
					page.noffh = offh+rh;
					return addToPage(page, cont, h, offh+rh, enty);
				}
				return page;
			}

			var pg = newPage();

			// add all content
			$.each($scope.conts, function(index, val) {
					if(val.type="p"){
						var h = textHeight(val.text);
						if(h==NaN && h ==0)
							return;
						pg = addToPage(pg, val, h, 0, false);
					}
			});

			// add the last page to pages
			pages.push(pg);

			//
			$scope.pages = pages;
			$scope.page_count = pages.length;
			$scope.page_no = 0;
			$scope.curpage = $scope.pages[$scope.page_no];

			// remove it
			p.remove();

			// switch to content view
			$scope.showlist = false;
		}

		$scope.applyRepage = function(){
			var limittime = 300;
			if(!$scope.lastApplyRepageTime){
				$scope.repage();
			}
			else{
				function doRepage(){
					if((Date.now()-$scope.lastApplyRepageTime)>=limittime){
						$scope.repage();
					}
					// else, ignor this request
				}
				$timeout(doRepage, limittime*1.5);	// a little longer then limittime
			}

			$scope.lastApplyRepageTime = Date.now();
		}

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

		$scope.prePage = function(){
			if($scope.page_no>0){
				--$scope.page_no;
				$scope.curpage = $scope.pages[$scope.page_no];
			}
		}

		$scope.nxtPage = function(){
			if($scope.page_no<($scope.pages.length-1)){
				++$scope.page_no;
				$scope.curpage = $scope.pages[$scope.page_no];
			}
		}

		$scope.$watch('fontsize', $scope.applyRepage);

		$scope.repage();
		$scope.loadBook(1);
		$(window).resize(function(event) {
			$scope.$apply($scope.applyRepage);
		});
	}]);