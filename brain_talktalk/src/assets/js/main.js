// fixed 포지션 변수 설정
$(window).on('load resize', function () {
    let wrap_wd_2 = $('.right_wrapper').outerWidth() / 2;
    $(':root').css('--wrap_wd_2', wrap_wd_2 + 'px');
});