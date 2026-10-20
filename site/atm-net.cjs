'use strict';
// ATM Software Labs: shared network footer strip markup (v1). Pair with atm-net.css.
const SITES = [
  ['labs', 'https://labs.trujillomingorance.com/', 'ATM Labs'],
  ['invest', 'https://invest.trujillomingorance.com/', 'INVEST'],
  ['charts', 'https://charts.trujillomingorance.com/', 'Markets Briefing'],
  ['ai', 'https://ai.trujillomingorance.com/', 'Trujillo AI'],
  ['guides', 'https://guides.trujillomingorance.com/', '{guides}'],
  ['tools', 'https://tools.trujillomingorance.com/', 'Tools'],
  ['rewrite', 'https://rewrite.trujillomingorance.com/', 'Rewrite']
];
const T = {
  es: { nav: 'Sitios de ATM Software Labs', priv: 'Privacidad', terms: 'Términos', guides: 'Guías' },
  en: { nav: 'ATM Software Labs sites', priv: 'Privacy', terms: 'Terms', guides: 'Guides' },
  ca: { nav: 'Llocs d’ATM Software Labs', priv: 'Privacitat', terms: 'Termes', guides: 'Guies' }
};
// Pass priv === false to omit the © / legal line on sites whose own footer already carries it.
function atmNet(cur, lang, priv, terms) {
  const t = T[lang] || T.es;
  const cp = (k) => (k === cur ? ' aria-current="page"' : '');
  const li = SITES.map(([k, u, n]) => '<li><a href="' + u + '"' + cp(k) + '>' + n.replace('{guides}', t.guides) + '</a></li>').join('');
  return '<div class="atm-net"><div class="atm-net__in">' +
    '<a class="atm-net__brand" href="https://trujillomingorance.com/"' + cp('apex') + '>ATM Software Labs</a>' +
    '<nav aria-label="' + t.nav + '"><ul class="atm-net__sites">' + li + '</ul></nav>' +
    (priv === false ? '' : '<p class="atm-net__legal">© 2026 ATM Software Labs · Alberto Trujillo Mingorance · <a href="' + priv + '">' + t.priv + '</a> · <a href="' + terms + '">' + t.terms + '</a></p>') +
    '</div></div>';
}
module.exports = { atmNet, SITES };
