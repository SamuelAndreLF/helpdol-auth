// Compartilhamento HelpDol — tenta gerar PDF e abrir o menu nativo do celular
// (WhatsApp, e-mail, SMS, etc.). Se não der, compartilha o link; se não, copia.
(function () {
  function carregarHtml2pdf(cb) {
    if (window.html2pdf) { cb(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    s.onload = cb;
    s.onerror = function () { cb(); };
    document.head.appendChild(s);
  }

  async function compartilharLink() {
    var titulo = document.title;
    var texto = window.HELPDOL_SHARE_TEXT || document.title;
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, text: texto, url: location.href });
        return;
      } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(location.href);
      alert('Link copiado! Agora é só colar no WhatsApp, e-mail ou SMS.');
    } catch (e) {
      prompt('Copie o link para enviar:', location.href);
    }
  }

  window.helpdolCompartilhar = function () {
    var alvo = document.querySelector(window.HELPDOL_PDF_TARGET || '.card');
    var nome = window.HELPDOL_PDF_NAME || 'helpdol.pdf';

    // Onde o navegador suporta compartilhar ARQUIVO, gera o PDF e compartilha.
    if (navigator.canShare && alvo) {
      carregarHtml2pdf(async function () {
        try {
          if (!window.html2pdf) throw new Error('no-lib');
          var blob = await html2pdf().set({
            margin: 6,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          }).from(alvo).outputPdf('blob');
          var file = new File([blob], nome, { type: 'application/pdf' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: document.title, text: window.HELPDOL_SHARE_TEXT || '' });
            return;
          }
          throw new Error('no-file-share');
        } catch (e) {
          if (e && e.name === 'AbortError') return;
          compartilharLink();
        }
      });
    } else {
      compartilharLink();
    }
  };
})();
