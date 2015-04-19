String.prototype.getWidth = function(fontSize){
    var span = document.getElementById("__getwidth");
    if (span == null) {
        span = document.createElement("span");
        span.id = "__getwidth";
        document.body.appendChild(span);
        span.style.visibility = "hidden";
        span.style.whiteSpace = "nowrap";
    }
    span.innerText = this;
    if(typeof(fontsize)!="undefined")
    	span.style.fontSize = fontSize + "px";

    return span.offsetWidth;
}

angular.module("reader",['reader.service'])
	.controller("ReaderController", ['$scope', 'readerService', function($scope, readerService){

		readerService.toc().success(function(toc){
			$scope.toc = toc;
		});

		$scope.load = function(part_no){
			readerService.cont(part_no).success(function(cont){
				$scope.cont = cont;
				$scope.conts = cont.contents;
				$scope.dopage();
			});
		}
		// page the article
		$scope.dopage = function(){
			var fontsize = 16;	// pix
			var textindent = 2;	// rem
			var lineheight = 1.5; // rem
			var headheight = 1.5;	// rem
			var footheight = 1.5;	// rem
			var screenwidth = $(window).width();	// pix
			var screenheight = $(window).height();	// pix

			$("#screen").width(screenwidth);
			$("#screen").height(screenwidth);	

			$(document.children).css("font-size", fontsize+"px");

			var lineheightpix = fontsize*lineheight;

			console.log("W:"+screenwidth+" H:"+screenheight);

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
			
			for(var k in $scope.style){
				console.log("style."+k+"="+$scope.style[k]);
			}

			if(!$scope.conts)
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
			function newPage(){
				return {
					conts:[],
					curh:0,
					offh:0,
					noffh:0,
				};
			}

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
			$.each($scope.conts, function(index, val) {
					if(val.type="paragraph" && typeof(val.data.text)!="undefined"){
						var h = textHeight(val.data.text);
						if(h==NaN && h ==0)
							return;
						console.log(h+" "+val.data.text);
						pg = addToPage(pg, val, h, 0, false);
					}
			});

			pages.push(pg);
			$scope.pages = pages;
			$scope.page_count = pages.length;
			$scope.page_no = 0;
			$scope.curpage = $scope.pages[$scope.page_no];

			console.log($scope.page_count+" "+ $scope.pages);
			p.remove();

			$scope.showlist = false;
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

		$scope.load(0);
		// $scope.dopage();
		// $scope.showlist = true;
	}]);