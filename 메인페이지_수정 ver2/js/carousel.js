$(document).ready(function() {
    var owl = $('.owl-carousel');
    var SPEED = 4000;   // 한 칸 이동하는 시간(ms) → 숫자가 클수록 느려짐

    owl.owlCarousel({
        margin: 10,
        loop: true,
        nav: false,
        dots: false,
        autoplay: false,   // Owl 기본 자동재생은 쓰지 않고 아래에서 직접 이어서 움직입니다
        responsive: {
            0: { items: 1 },
            600: { items: 2 },
            1400: { items: 5.5 }
        }
    });

    // 한 칸 이동이 끝나자마자(translated) 바로 다음 칸으로 → 멈춤 없이 계속 흐름
    owl.on('translated.owl.carousel', function() {
        owl.trigger('next.owl.carousel', [SPEED]);
    });

    // 처음 시작
    owl.trigger('next.owl.carousel', [SPEED]);
});
