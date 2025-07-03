var burger = $('.menu-trigger');

burger.each(function(index){
  var $this = $(this);
  
  $this.on('click', function(e){
    e.preventDefault();
    $(this).toggleClass('active-' + (index+7));
    $('body').toggleClass('menu-open'); // 메뉴 열기 토글
  });
});

// 오버레이 클릭 시 메뉴 닫기
$('.menu-overlay').on('click', function() {
    $('.menu-trigger').removeClass(function (index, className) {
        return (className.match(/(^|\s)active-\S+/g) || []).join(' ');
    });
    $('body').removeClass('menu-open');
});