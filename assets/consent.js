/* Tuna — consentimento de cookies e Pixel do Meta.
   O pixel só é carregado depois de o visitante carregar em "Aceitar" (RGPD / Lei 41/2004).
   A escolha fica guardada 6 meses; depois volta a ser pedida.
   Para medir um evento noutro sítio: tunaTrack('Lead') — só envia se houver consentimento.
   Para reabrir o banner: qualquer elemento com o atributo data-cookie-settings. */
(function(){
  var PIXEL_ID = '1785489899399335';
  var KEY = 'tuna-consent';
  var MAX_AGE = 1000 * 60 * 60 * 24 * 182;

  var TEXT = {
    pt: {
      title: 'Cookies',
      body: 'Usamos cookies para perceber o que interessa a quem nos visita e mostrar-lhe conteúdo mais útil. Só os ativamos se aceitar.',
      more: 'Política de Privacidade',
      accept: 'Aceitar',
      reject: 'Recusar'
    },
    en: {
      title: 'Cookies',
      body: 'We use cookies to understand what our visitors care about and show them more useful content. We only turn them on if you accept.',
      more: 'Privacy Policy',
      accept: 'Accept',
      reject: 'Decline'
    }
  };

  function readChoice(){
    try{
      var raw = localStorage.getItem(KEY);
      if(!raw) return null;
      var c = JSON.parse(raw);
      if(!c || !c.at || Date.now() - c.at > MAX_AGE) return null;
      return c.value === 'granted' || c.value === 'denied' ? c.value : null;
    }catch(e){ return null; }
  }
  function saveChoice(value){
    try{ localStorage.setItem(KEY, JSON.stringify({value: value, at: Date.now()})); }catch(e){}
  }

  var pixelLoaded = false;
  function loadPixel(){
    if(pixelLoaded) return;
    pixelLoaded = true;
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');
    var view = document.documentElement.getAttribute('data-track-view');
    if(view) fbq('track', 'ViewContent', {content_name: view});
  }

  window.tunaTrack = function(event, params){
    if(readChoice() === 'granted' && window.fbq) fbq('track', event, params || {});
  };

  function lang(){
    var l = (document.documentElement.lang || 'pt').slice(0, 2);
    return TEXT[l] ? l : 'pt';
  }

  // Barra a toda a largura, colada ao fundo (estilo pedido pela May a 04/11/2026).
  var css = '' +
    '.tuna-cookie{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#262626;color:#fffaef;' +
    'padding:16px 24px;box-shadow:0 -10px 30px -10px rgba(0,0,0,.3);font-family:Poppins,sans-serif;animation:tunaCookieIn .35s ease both;}' +
    '@keyframes tunaCookieIn{from{opacity:0;transform:translateY(100%);}to{opacity:1;transform:none;}}' +
    '@media (prefers-reduced-motion:reduce){.tuna-cookie{animation:none;}}' +
    '.tuna-cookie .tc-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:24px;}' +
    '.tuna-cookie p{margin:0;flex:1;font-size:14px;line-height:1.55;color:rgba(255,250,239,.9);}' +
    '.tuna-cookie p a{color:#ffc13a;text-decoration:underline;text-underline-offset:2px;white-space:nowrap;}' +
    '.tuna-cookie .tc-actions{display:flex;align-items:center;gap:18px;flex-shrink:0;}' +
    '.tuna-cookie button{padding:10px 24px;border-radius:999px;font-family:Poppins,sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s,color .2s,border-color .2s;}' +
    '.tuna-cookie .tc-accept{background:#ffc13a;color:#262626;border:1px solid #ffc13a;}' +
    '.tuna-cookie .tc-accept:hover{background:#ffd06a;border-color:#ffd06a;}' +
    '.tuna-cookie .tc-reject{background:none;border:0;padding:10px 4px;color:rgba(255,250,239,.75);font-weight:500;text-decoration:underline;text-underline-offset:3px;}' +
    '.tuna-cookie .tc-reject:hover{color:#fffaef;}' +
    '.tuna-cookie button:focus-visible{outline:2px solid #1fbfbf;outline-offset:2px;}' +
    '@media (max-width:720px){.tuna-cookie{padding:16px;}.tuna-cookie .tc-inner{flex-direction:column;align-items:stretch;gap:14px;}' +
    '.tuna-cookie p{font-size:13px;}.tuna-cookie .tc-actions{justify-content:flex-end;}.tuna-cookie .tc-accept{flex:1;}}';

  function showBanner(){
    if(document.querySelector('.tuna-cookie')) return;
    if(!document.getElementById('tuna-cookie-css')){
      var st = document.createElement('style');
      st.id = 'tuna-cookie-css';
      st.textContent = css;
      document.head.appendChild(st);
    }
    var t = TEXT[lang()];
    var box = document.createElement('div');
    box.className = 'tuna-cookie';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', t.title);
    box.innerHTML =
      '<div class="tc-inner">' +
        '<p>' + t.body + ' <a href="/politica-de-privacidade.html#cookies">' + t.more + '</a></p>' +
        '<div class="tc-actions">' +
          '<button type="button" class="tc-reject">' + t.reject + '</button>' +
          '<button type="button" class="tc-accept">' + t.accept + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(box);
    box.querySelector('.tc-accept').addEventListener('click', function(){
      saveChoice('granted'); box.remove(); loadPixel();
    });
    box.querySelector('.tc-reject').addEventListener('click', function(){
      var was = readChoice() === 'granted';
      saveChoice('denied'); box.remove();
      // Se a pessoa retirar o consentimento, recarrega para o pixel deixar de correr nesta página.
      if(was) location.reload();
    });
  }

  // Cliques no WhatsApp contam como contacto.
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href*="wa.me/"]');
    if(a) window.tunaTrack('Contact', {content_name: 'WhatsApp'});
    var s = e.target.closest && e.target.closest('[data-cookie-settings]');
    if(s){ e.preventDefault(); showBanner(); }
  });

  function init(){
    var c = readChoice();
    if(c === 'granted') loadPixel();
    else if(c === null) showBanner();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
