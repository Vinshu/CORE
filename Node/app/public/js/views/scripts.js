// scripts.js

$('document').ready(function(){
    minHieight();
});
$(window).resize(function(){
    minHieight();
});


function minHieight(){
    
    var wH = $(window).height();
    var navbarHeight = $('#navbar').height();
    
    $('.main-wrapper').attr('style', 'margin-top:'+ navbarHeight +  'px');
    $('.menuContent').attr('style', 'min-height:'+ (wH - navbarHeight)+ 'px');
}


$('.left-menu > ul > li').on('click', function(){
//    $('.left-menu ul li').siblings().removeClass('subMenuOpen');
//    $(this).parent('li').toggleClass('subMenuOpen');
    $(this).siblings().find('ul').hide('slow');
    $(this).find('ul').toggle('slow');
});


