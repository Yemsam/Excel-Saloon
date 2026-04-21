(() => {
  const cacheBust = '20260419';
  const headerPath = 'global-header.html';
  const footerPath = 'global-footer.html';
  const sourceLanguage = 'es';
  const translationHostId = 'google_translate_element';
  const translationScriptId = 'google-translate-script';
  const rtlLanguages = new Set(['ar', 'fa', 'he', 'ur']);

  const translationLanguages = [
    'af', 'ar', 'az', 'bg', 'bn', 'bs', 'ca', 'cs', 'da', 'de', 'el', 'en', 'es', 'et',
    'fa', 'fi', 'fr', 'gu', 'he', 'hi', 'hr', 'hu', 'id', 'it', 'ja', 'ka', 'kk', 'km',
    'ko', 'lt', 'lv', 'mk', 'ml', 'mn', 'mr', 'ms', 'nb', 'nl', 'pl', 'pt', 'ro', 'ru',
    'si', 'sk', 'sl', 'sr', 'sv', 'ta', 'te', 'th', 'tr', 'uk', 'ur', 'vi', 'zh-CN', 'zh-TW'
  ].join(',');
  const supportedTranslationLanguages = new Set(translationLanguages.split(','));

  const pageName = () => (window.location.pathname.split('/').pop() || 'index.html').split('?')[0];

  const normalizeLanguage = (value) => {
    const input = String(value || '').trim().toLowerCase().replace(/_/g, '-');
    if (!input) {
      return sourceLanguage;
    }

    if (input.startsWith('zh')) {
      if (input.includes('tw') || input.includes('hk') || input.includes('mo')) {
        return 'zh-TW';
      }

      return 'zh-CN';
    }

    if (input.startsWith('pt')) {
      return 'pt';
    }

    if (input.startsWith('nb') || input.startsWith('no')) {
      return 'nb';
    }

    const candidate = supportedTranslationLanguages.has(input) ? input : input.split('-')[0];
    return supportedTranslationLanguages.has(candidate) ? candidate : sourceLanguage;
  };

  const detectBrowserLanguage = () => {
    const preferredLanguages = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language || sourceLanguage];

    for (const language of preferredLanguages) {
      const normalized = normalizeLanguage(language);
      if (normalized) {
        return normalized;
      }
    }

    return sourceLanguage;
  };

  const setDocumentLanguage = (language) => {
    document.documentElement.lang = language;
    document.documentElement.dir = rtlLanguages.has(language.split('-')[0]) ? 'rtl' : 'ltr';
  };

  const setTranslationCookie = (language) => {
    if (language === sourceLanguage) {
      document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      return;
    }

    document.cookie = `googtrans=/${sourceLanguage}/${language}; path=/; SameSite=Lax`;
  };

  const ensureTranslateHost = () => {
    if (document.getElementById(translationHostId)) {
      return;
    }

    const host = document.createElement('div');
    host.id = translationHostId;
    host.className = 'translate-host';
    host.setAttribute('aria-hidden', 'true');
    document.body.appendChild(host);
  };

  const loadTranslationWidget = () => {
    if (document.getElementById(translationScriptId)) {
      return;
    }

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) {
        return;
      }

      new window.google.translate.TranslateElement(
        {
          pageLanguage: sourceLanguage,
          autoDisplay: false,
          includedLanguages: translationLanguages
        },
        translationHostId
      );
    };

    const script = document.createElement('script');
    script.id = translationScriptId;
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  };

  const initLocalization = () => {
    const language = detectBrowserLanguage();
    setDocumentLanguage(language);
    setTranslationCookie(language);
    ensureTranslateHost();
    loadTranslationWidget();
  };

  const injectFragment = async (target, path) => {
    if (!target) {
      return null;
    }

    try {
      const response = await fetch(`${path}?v=${cacheBust}`);
      if (!response.ok) {
        return null;
      }

      const html = await response.text();
      target.outerHTML = html;
      return true;
    } catch {
      return null;
    }
  };

  const setActiveNav = () => {
    const current = pageName();
    document.querySelectorAll('[data-nav-link]').forEach((link) => {
      const href = (link.getAttribute('href') || '').split('?')[0];
      if (href === current) {
        link.classList.add('active');
      }
    });
  };

  const bindHeader = () => {
    const header = document.querySelector('.header-shell');
    const toggle = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    const closeButton = document.querySelector('[data-menu-close]');

    const closeMenu = () => {
      mobileMenu?.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    toggle?.addEventListener('click', () => {
      const isOpen = mobileMenu?.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    closeButton?.addEventListener('click', closeMenu);
    mobileMenu?.addEventListener('click', (event) => {
      if (event.target === mobileMenu) {
        closeMenu();
      }
    });

    mobileMenu?.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    const syncState = () => {
      header?.classList.toggle('scrolled', window.scrollY > 24);
    };

    syncState();
    window.addEventListener('scroll', syncState, { passive: true });
  };

  const ensureFloatingWhatsapp = () => {
    if (document.querySelector('.floating-whatsapp')) {
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'floating-whatsapp';
    wrapper.innerHTML = `
      <a class="whatsapp-button" href="https://wa.me/31651080577" target="_blank" rel="noopener noreferrer" aria-label="¿Necesitas una cita? Chatea por WhatsApp">
        <span class="whatsapp-tooltip">¿Necesitas una cita?</span>
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M16 5.5C10.2 5.5 5.5 9.95 5.5 15.44c0 1.97.62 3.8 1.7 5.34L6 26.5l5.92-1.53a10.8 10.8 0 0 0 4.08.79c5.8 0 10.5-4.45 10.5-9.94S21.8 5.5 16 5.5Z" stroke="#ffffff" stroke-width="1.6" stroke-linejoin="round"/>
          <path d="M13.4 11.8c-.2-.42-.4-.45-.58-.46h-.5c-.17 0-.44.06-.67.29-.23.23-.87.84-.87 2.06s.89 2.4 1.01 2.57c.12.17 1.69 2.61 4.08 3.56 1.99.79 2.4.63 2.83.59.43-.04 1.39-.57 1.59-1.13.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28-.23-.12-1.39-.68-1.6-.76-.21-.08-.36-.12-.5.12-.14.23-.55.76-.67.92-.12.17-.25.19-.48.06-.23-.12-.97-.36-1.85-1.17-.69-.62-1.16-1.39-1.3-1.63-.14-.23-.01-.36.11-.48.11-.11.23-.3.35-.45.12-.16.16-.27.24-.45.08-.17.04-.32-.02-.44-.06-.12-.5-1.3-.69-1.78Z" fill="#ffffff"/>
        </svg>
      </a>
    `;

    document.body.appendChild(wrapper);
  };

  const setupReveal = () => {
    const reveals = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      reveals.forEach((element) => element.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    reveals.forEach((element) => observer.observe(element));
  };

  const init = async () => {
    const headerTarget = document.querySelector('[data-global-header]');
    const footerTarget = document.querySelector('[data-global-footer]');

    await injectFragment(headerTarget, headerPath);
    await injectFragment(footerTarget, footerPath);

    initLocalization();
    setActiveNav();
    bindHeader();
    ensureFloatingWhatsapp();
    setupReveal();
  };

  document.addEventListener('DOMContentLoaded', init);
})();
