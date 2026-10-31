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
      body: 'Usamos cookies do Meta para medir as visitas e mostrar a nossa publicidade a quem já visitou o site. Só são ativados se aceitar.',
      more: 'Saber mais',
      accept: 'Aceitar',
      reject: 'Recusar'
    },
    en: {
      title: 'Cookies',
      body: 'We use Meta cookies to measure visits and show our ads to people who have visited the site. They are only enabled if you accept.',
      more: 'Learn more',
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

  var css = '' +
    '.tuna-cookie{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:460px;margin-left:auto;' +
    'background:#fffaef;color:#262626;border:1px solid rgba(3,127,140,.22);border-radius:20px;padding:22px 24px;' +
    'box-shadow:0 24px 60px -24px rgba(2,64,89,.45);font-family:Poppins,sans-serif;animation:tunaCookieIn .35s ease both;}' +
    '@keyframes tunaCookieIn{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;}}' +
    '@media (prefers-reduced-motion:reduce){.tuna-cookie{animation:none;}}' +
    '.tuna-cookie .tc-title{margin:0 0 8px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;font-weight:600;color:#037f8c;}' +
    '.tuna-cookie p{margin:0 0 18px;font-size:14px;line-height:1.6;color:rgba(38,38,38,.8);}' +
    '.tuna-cookie p a{color:#037f8c;text-decoration:underline;}' +
    '.tuna-cookie .tc-actions{display:flex;gap:10px;}' +
    '.tuna-cookie button{flex:1;padding:12px 18px;border-radius:999px;font-family:Poppins,sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s,color .2s;}' +
    '.tuna-cookie .tc-accept{background:#037f8c;color:#fff;border:1px solid #037f8c;}' +
    '.tuna-cookie .tc-accept:hover{background:#024059;border-color:#024059;}' +
    '.tuna-cookie .tc-reject{background:transparent;color:#024059;border:1px solid rgba(2,64,89,.4);}' +
    '.tuna-cookie .tc-reject:hover{background:rgba(2,64,89,.06);}' +
    '.tuna-cookie button:focus-visible{outline:2px solid #ffc13a;outline-offset:2px;}';

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
      '<div class="tc-title">' + t.title + '</div>' +
      '<p>' + t.body + ' <a href="/politica-de-privacidade.html#cookies">' + t.more + '</a></p>' +
      '<div class="tc-actions">' +
        '<button type="button" class="tc-reject">' + t.reject + '</button>' +
        '<button type="button" class="tc-accept">' + t.accept + '</button>' +
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
