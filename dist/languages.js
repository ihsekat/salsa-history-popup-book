export const languages = [
  {code:'en', tag:'en', name:'English', path:'/'},
  {code:'es', tag:'es', name:'Español', path:'/es/'},
  {code:'de', tag:'de', name:'Deutsch', path:'/de/'},
  {code:'fr', tag:'fr-FR', name:'Français', path:'/fr/'},
  {code:'ja', tag:'ja', name:'日本語', path:'/ja/'},
  {code:'it', tag:'it', name:'Italiano', path:'/it/'}
];

export function pageCountLabel(index, count, lang, t) {
  return lang === 'ja' ? '全' + count + 'ページ中' + index + 'ページ' : t('Page')+' '+index+' '+t('of')+' '+count;
}

export function chapterLabel(folio, total, lang, t) {
  if (lang==='ja') return '第'+Number(folio)+'章'+(total?'（全'+total+'章）':'');
  return t('CHAPTER')+' '+folio+(total?' / '+total:'');
}
