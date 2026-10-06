/* =========================================================
   도시브랜드연구소 메인페이지 - 인터랙션 / 애니메이션
   ========================================================= */
(function () {
    'use strict';

    var root = document.documentElement;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var $ = function (s, c) { return (c || document).querySelector(s); };
    var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

    /* 모션 줄이기 설정이면 효과 없이 원래 화면 그대로 보여줌 */
    if (reduce) return;
    root.classList.add('js-fx');

    /* ---------------------------------------------------------
       1. 스크롤 등장 효과 대상 등록
       --------------------------------------------------------- */
    var watch = [];

    function mark(el, cls, delay) {
        if (!el) return;
        el.classList.add(cls);
        el.style.setProperty('--d', (delay || 0) + 's');
        watch.push(el);
    }

    // 같은 부모 안에서 순서대로 시간차(stagger)를 주며 등록
    function group(selector, cls, step, base) {
        var count = {};
        $$(selector).forEach(function (el, i) {
            var p = el.parentNode;
            var key = p.__fxKey || (p.__fxKey = 'k' + Math.random());
            count[key] = (count[key] || 0) + 1;
            mark(el, cls, (base || 0) + (count[key] - 1) * step);
        });
    }

    group('.contents_01 h1', 'fx-reveal', 0.15);
    group('.contents_02_text > p', 'fx-reveal', 0.15);
    group('.contents_03_text > p, .contents_03_text > .sub_text', 'fx-reveal', 0.15);
    group('.contents_04_text > p', 'fx-reveal', 0.15);
    group('.contents_05_text > p', 'fx-reveal', 0.18);
    group('.contents_06_text > p', 'fx-reveal', 0.15);

    // 선 그려지기
    mark($('.line'), 'fx-line', 0.5);
    mark($('.line_02'), 'fx-line-v', 0.1);

    // 서비스 3카드 : 이미지 와이프 + 텍스트 등장
    $$('.service_box').forEach(function (box, i) {
        mark(box, 'fx-trigger', i * 0.2);
        var t = $('.service_text', box);
        t.classList.add('fx-reveal');
        t.style.setProperty('--d', (0.7 + i * 0.2) + 's');
        box.__textEl = t;
    });

    // 동그라미 3개 : 바깥쪽에서 가운데로 모이며 등장
    var circleFrom = {
        circle_smm:        ['0px', '-90px'],
        circle_creative:   ['-110px', '70px'],
        circle_influencer: ['110px', '70px']
    };
    Object.keys(circleFrom).forEach(function (name, i) {
        var el = $('.' + name);
        if (!el) return;
        el.style.setProperty('--tx', circleFrom[name][0]);
        el.style.setProperty('--ty', circleFrom[name][1]);
        mark(el, 'fx-circle', i * 0.2);
    });

    // 도시 로고 : 위 줄 → 아래 줄, 왼쪽부터 차례로
    ['.city_logo_top', '.city_logo_btm'].forEach(function (row, r) {
        $$('.city_logo', $(row)).forEach(function (el, i) {
            mark(el, 'fx-reveal', r * 0.35 + i * 0.09);
        });
    });
    mark($('.btn'), 'fx-fade', 0.9);

    // 푸터
    group('.footer_address, .footer_article', 'fx-reveal', 0.2);

    // service_text 는 box 가 보일 때 같이 보이게 연결
    var io = null;
    function show(el) {
        el.classList.add('in');
        if (el.__textEl) el.__textEl.classList.add('in');
    }
    if ('IntersectionObserver' in window) {
        io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
        watch.forEach(function (el) { io.observe(el); });
    } else {
        watch.forEach(show);
    }

    /* ---------------------------------------------------------
       2. 메인 제목 : 글자 하나씩 등장
       --------------------------------------------------------- */
    var title = $('.main_title .contents_title_xlarge');
    if (title) {
        var text = title.textContent;
        title.setAttribute('aria-label', text);
        title.textContent = '';
        for (var i = 0; i < text.length; i++) {
            var s = document.createElement('span');
            s.className = 'fx-char';
            s.setAttribute('aria-hidden', 'true');
            s.style.setProperty('--i', i);
            s.textContent = text.charAt(i);
            title.appendChild(s);
        }
    }

    // SCROLL 안내
    var mainBg = $('.main_bg');
    if (mainBg) {
        var hint = document.createElement('div');
        hint.className = 'fx-scroll-hint';
        hint.innerHTML = '<span>SCROLL</span><i></i>';
        mainBg.appendChild(hint);
    }

    /* ---------------------------------------------------------
       3. 숫자 카운트업 (7년간 / 105개)
       --------------------------------------------------------- */
    var counters = [];
    $$('.contents_02_text .contents_title_large .type_03').forEach(function (el) {
        var m = el.textContent.trim().match(/^(\d+)(.*)$/);
        if (!m) return;
        var end = parseInt(m[1], 10), suffix = m[2];
        el.classList.add('fx-count');
        el.textContent = end + suffix;                // 최종 폭을 먼저 재서 고정 (흔들림 방지)
        el.style.minWidth = el.offsetWidth + 'px';
        el.textContent = '0' + suffix;
        counters.push({ el: el, end: end, suffix: suffix });
    });

    function runCounter(c) {
        var dur = 2400, t0 = null;
        function step(t) {
            if (t0 === null) t0 = t;
            var p = Math.min((t - t0) / dur, 1);
            var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);    // easeOutExpo
            c.el.textContent = Math.round(c.end * eased) + c.suffix;
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    if (counters.length && 'IntersectionObserver' in window) {
        var cio = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    var c = counters.filter(function (x) { return x.el === e.target; })[0];
                    setTimeout(function () { runCounter(c); }, 300);
                    cio.unobserve(e.target);
                }
            });
        }, { threshold: 0.6 });
        counters.forEach(function (c) { cio.observe(c.el); });
    } else {
        counters.forEach(function (c) { c.el.textContent = c.end + c.suffix; });
    }

    /* ---------------------------------------------------------
       4. 스크롤 / 마우스 기반 모션 (헤더, 진행바, 패럴랙스, 커서, 자석버튼)
       --------------------------------------------------------- */
    var header = $('header');
    var progress = document.createElement('div');
    progress.className = 'fx-progress';
    document.body.appendChild(progress);

    var heroImg = $('.hero_bg_img');
    var heroText = $('.main_title');
    var serviceImgs = $$('.service [class^="service_img_"]');
    var btn = $('.btn');

    var lastY = window.pageYOffset, scrollDirty = true;
    var mouse = { x: 0, y: 0 }, ease = { x: 0, y: 0 };       // 히어로 마우스 패럴랙스(-1 ~ 1)
    var cur = { x: -100, y: -100, tx: -100, ty: -100 };       // 커스텀 커서
    var magnet = { x: 0, y: 0 };

    window.addEventListener('scroll', function () { scrollDirty = true; }, { passive: true });
    window.addEventListener('resize', function () { scrollDirty = true; });

    function onScroll() {
        var y = window.pageYOffset;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.scale = (max > 0 ? y / max : 0) + ' 1';

        // 헤더 : 내리면 숨기고, 올리면 보이기
        if (header) {
            header.classList.toggle('is-scrolled', y > 40);
            if (y > 200 && y > lastY + 4) header.classList.add('is-hidden');
            else if (y < lastY - 4 || y < 100) header.classList.remove('is-hidden');
        }
        lastY = y;

        // 서비스 이미지 패럴랙스
        var vh = window.innerHeight;
        serviceImgs.forEach(function (img) {
            var r = img.getBoundingClientRect();
            if (r.bottom < -200 || r.top > vh + 200) return;
            var offset = (r.top + r.height / 2 - vh / 2) * -0.09;
            img.style.setProperty('--py', offset.toFixed(1) + 'px');
        });

        // 히어로 : 스크롤하면 텍스트가 살짝 올라가며 옅어짐
        if (heroText && y < window.innerHeight * 1.2) {
            heroText.style.translate = '0 ' + (-y * 0.18).toFixed(1) + 'px';
            heroText.style.opacity = Math.max(0, 1 - y / 750).toFixed(2);
        }
    }

    window.addEventListener('mousemove', function (e) {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
        cur.tx = e.clientX; cur.ty = e.clientY;
    }, { passive: true });

    /* 커스텀 커서 */
    var cursor = null;
    if (finePointer) {
        cursor = document.createElement('div');
        cursor.className = 'fx-cursor';
        cursor.innerHTML = '<span>DRAG</span>';
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', function () { cursor.classList.add('show'); }, { once: true });
        document.addEventListener('mouseleave', function () { cursor.classList.remove('show'); });
        document.addEventListener('mouseenter', function () { cursor.classList.add('show'); });
        document.addEventListener('mouseover', function (e) {
            var t = e.target;
            var drag = t.closest && t.closest('.project');
            var link = !drag && t.closest && t.closest('a, button, .city_logo, .fx-circle, .footer_sns img, .btn');
            cursor.classList.toggle('is-drag', !!drag);
            cursor.classList.toggle('is-link', !!link);
        });
    }

    /* 문의 버튼 자석 효과 */
    if (btn && finePointer) {
        btn.addEventListener('mousemove', function (e) {
            var r = btn.getBoundingClientRect();
            magnet.x = (e.clientX - (r.left + r.width / 2)) * 0.35;
            magnet.y = (e.clientY - (r.top + r.height / 2)) * 0.5;
            btn.style.setProperty('--bx', magnet.x.toFixed(1) + 'px');
            btn.style.setProperty('--by', magnet.y.toFixed(1) + 'px');
        });
        btn.addEventListener('mouseleave', function () {
            btn.style.setProperty('--bx', '0px');
            btn.style.setProperty('--by', '0px');
        });
    }

    /* 매 프레임 : 부드러운 보간(lerp) */
    function tick() {
        if (scrollDirty) { scrollDirty = false; onScroll(); }

        if (heroImg && window.pageYOffset < window.innerHeight * 1.3) {
            ease.x += (mouse.x - ease.x) * 0.06;
            ease.y += (mouse.y - ease.y) * 0.06;
            var py = window.pageYOffset * 0.25;
            heroImg.style.translate = (-ease.x * 24).toFixed(1) + 'px ' + (-ease.y * 16 + py).toFixed(1) + 'px';
        }

        if (cursor) {
            cur.x += (cur.tx - cur.x) * 0.18;
            cur.y += (cur.ty - cur.y) * 0.18;
            cursor.style.transform = 'translate3d(' + cur.x.toFixed(1) + 'px,' + cur.y.toFixed(1) + 'px,0)';
        }
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
})();
