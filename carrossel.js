/* ==========================================================
   CARROSSEL DE IMAGENS
   Uso: um elemento com a classe "carrossel" contendo
        .carrossel-trilho > .carrossel-slide
   Recursos: botões, indicadores, setas do teclado, arrastar
   no celular, troca automática (pausa ao passar o mouse/foco)
   e respeito à preferência "reduzir movimento".
========================================================== */

(function () {
    'use strict';

    var INTERVALO_MS = 5000;     // tempo entre trocas automáticas
    var LIMITE_ARRASTE_PX = 50;  // distância mínima para contar como arraste

    function iniciarCarrossel(raiz) {
        var trilho = raiz.querySelector('.carrossel-trilho');
        var slides = raiz.querySelectorAll('.carrossel-slide');
        var btnAnterior = raiz.querySelector('.carrossel-anterior');
        var btnProximo = raiz.querySelector('.carrossel-proximo');
        var areaPontos = raiz.querySelector('.carrossel-pontos');

        if (!trilho || slides.length === 0) return;

        var total = slides.length;
        var atual = 0;
        var timer = null;
        var pausado = false;
        var reduzirMovimento = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // ---- indicadores ----
        var pontos = [];
        if (areaPontos) {
            slides.forEach(function (_, i) {
                var ponto = document.createElement('button');
                ponto.type = 'button';
                ponto.className = 'carrossel-ponto';
                ponto.setAttribute('aria-label', 'Ir para a imagem ' + (i + 1));
                ponto.addEventListener('click', function () {
                    irPara(i);
                    reiniciarTimer();
                });
                areaPontos.appendChild(ponto);
                pontos.push(ponto);
            });
        }

        // ---- navegação ----
        function irPara(indice) {
            atual = (indice + total) % total;   // volta ao início/fim
            trilho.style.transform = 'translateX(-' + (atual * 100) + '%)';

            slides.forEach(function (slide, i) {
                slide.setAttribute('aria-hidden', i === atual ? 'false' : 'true');
            });
            pontos.forEach(function (ponto, i) {
                ponto.setAttribute('aria-current', i === atual ? 'true' : 'false');
            });
        }

        function mudarSlide(direcao) {
            irPara(atual + direcao);
        }

        // ---- troca automática ----
        function iniciarTimer() {
            if (reduzirMovimento || total < 2) return;
            pararTimer();
            timer = setInterval(function () {
                if (!pausado && !document.hidden) mudarSlide(1);
            }, INTERVALO_MS);
        }

        function pararTimer() {
            if (timer) clearInterval(timer);
            timer = null;
        }

        function reiniciarTimer() {
            iniciarTimer();
        }

        // ---- eventos ----
        if (btnAnterior) btnAnterior.addEventListener('click', function () {
            mudarSlide(-1);
            reiniciarTimer();
        });

        if (btnProximo) btnProximo.addEventListener('click', function () {
            mudarSlide(1);
            reiniciarTimer();
        });

        // pausa enquanto o usuário interage
        raiz.addEventListener('mouseenter', function () { pausado = true; });
        raiz.addEventListener('mouseleave', function () { pausado = false; });
        raiz.addEventListener('focusin', function () { pausado = true; });
        raiz.addEventListener('focusout', function () { pausado = false; });

        // setas do teclado
        raiz.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') { mudarSlide(-1); reiniciarTimer(); }
            if (e.key === 'ArrowRight') { mudarSlide(1); reiniciarTimer(); }
        });

        // arrastar com o dedo (celular/tablet)
        var inicioX = null;
        raiz.addEventListener('touchstart', function (e) {
            inicioX = e.touches[0].clientX;
        }, { passive: true });

        raiz.addEventListener('touchend', function (e) {
            if (inicioX === null) return;
            var diferenca = e.changedTouches[0].clientX - inicioX;
            if (Math.abs(diferenca) > LIMITE_ARRASTE_PX) {
                mudarSlide(diferenca < 0 ? 1 : -1);
                reiniciarTimer();
            }
            inicioX = null;
        }, { passive: true });

        irPara(0);
        iniciarTimer();
    }

    document.querySelectorAll('.carrossel').forEach(iniciarCarrossel);
})();
