

$(document).ready(function () {
	//테이블 가로스크롤 마우스로 터치
	window.onload = function () {
		slider = document.querySelectorAll('.touch_scroll');
		for ( var i = 0; i < slider.length; i++ ) {
				touchScroll(slider[i]);
    }
	};

	function touchScroll(slider = "") {
		// const slider = document.querySelector($bind);
		let isDown = false;
		let startX;
		let scrollLeft;

		slider.addEventListener("mousedown", (e) => {
			 e.preventDefault();
			isDown = true;
			slider.classList.add("active");
			startX = e.pageX - slider.offsetLeft;
			scrollLeft = slider.scrollLeft;
			cancelMomentumTracking();
		}, { passive: false });

		slider.addEventListener("mouseleave", (e) => {
			 e.preventDefault();
			isDown = false;
			slider.classList.remove("active");
		}, { passive: false });

		slider.addEventListener("mouseup", (e) => {
			 e.preventDefault();
			isDown = false;
			slider.classList.remove("active");
			beginMomentumTracking();
		}, { passive: false });

		slider.addEventListener("mousemove", (e) => {
			 e.preventDefault();
			if (!isDown) return;
			e.preventDefault();
			const x = e.pageX - slider.offsetLeft;
			const walk = (x - startX) * 3; //scroll-fast
			var prevScrollLeft = slider.scrollLeft;
			slider.scrollLeft = scrollLeft - walk;
			velX = slider.scrollLeft - prevScrollLeft;
		}, { passive: false });

		slider.addEventListener("wheel", (e) => {
			 e.preventDefault();
			cancelMomentumTracking();
		}, { passive: false });

		var velX = 0;
		var momentumID;

		function beginMomentumTracking() {
			cancelMomentumTracking();
			momentumID = requestAnimationFrame(momentumLoop);
		}
		function cancelMomentumTracking() {
			cancelAnimationFrame(momentumID);
		}
		function momentumLoop() {
			slider.scrollLeft += velX;
			velX *= 0.95;
			if (Math.abs(velX) > 0.5) {
				momentumID = requestAnimationFrame(momentumLoop);
			}
		}
	}
});// 한페이지에 touch_scroll가 2개 이상 있을때 1개만 작동 하고 나머지는 작동을 안합니다.



 


document.addEventListener('DOMContentLoaded', function() {
    const testElements = document.querySelectorAll('.line1_text, .line2_text, .line3_text');

    testElements.forEach(function(element) {
        if (element.textContent.includes(' ')) {
            element.style.wordBreak = 'break-word'; // 띄어쓰기가 있으면 줄바꿈 유지
        } else {
            element.style.wordBreak = 'break-all'; // 띄어쓰기가 없으면 자동 줄바꿈
        }
    });
});//라인 자르기


document.addEventListener('DOMContentLoaded', function() {
    const testElements = document.querySelectorAll('.text_dynamic');

    testElements.forEach(function(element) {
        if (element.textContent.includes(' ')) {
            element.style.whiteSpace = 'pre-line'; // 띄어쓰기가 있으면 줄바꿈 유지
        } else {
            element.style.wordBreak = 'break-all'; // 띄어쓰기가 없으면 자동 줄바꿈
        }
    });
});//라인 자르기2


$(document).ready(function () {
	/*상품더보기 버튼*/
	$('.show_btn').on('click',function(){
		$('.detail_cont').toggleClass('show');
	});
});



$(document).ready(function () {
    // 모바일 메뉴
    $('.hd_menu_btn').on('click',function(){
        $('body').addClass('menu_on');
    });

    // 모바일 메뉴 닫기
    $('.close_btn_wr').on('click',function(){
        $('body').removeClass('menu_on');
    });

    // 검은색 배경 눌러도 메뉴 닫기
    $('.menu_bg').on('click',function(){
        $('body').removeClass('menu_on');
    });

    // 모바일 메뉴 내부
    $('.m_nav .nav_a').on('click',function(){
        // 2차메뉴가 있을경우
        if($(this).siblings('.nav_ul2').length){
            // 2차 메뉴가 열려있을경우
            if($(this).siblings('.nav_ul2').hasClass('on')){

            } else{
                $('.nav_ul2').slideUp();
                $('.nav_ul2').removeClass('on');
            }
            $(this).siblings('.nav_ul2').slideToggle().toggleClass('on');
        }
    });
});


