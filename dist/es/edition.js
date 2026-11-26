import {chapters as original} from '../chapters.js';
import {text} from './text.js';
import {sources} from './sources.js';
import {t} from './ui.js';
export {plateName} from '../chapters.js';
export {t};
export const lang='es-419';
export const bookTitle='Historia ilustrada del baile de salsa';
const credit={label:'Una experiencia interactiva de Salsa Vida',url:'https://www.salsavida.com/es/'};
export const bookCopy={
  front:{titleLines:['HISTORIA ILUSTRADA DEL','Baile de','Salsa'],subtitle:'De las costas de Cuba a los escenarios del mundo',credit,button:'Abrir el libro'},
  contents:{title:'Índice del libro',label:'ÍNDICE DESPLEGABLE'},
  back:{copy:['La salsa nació del encuentro entre culturas. Creció cuando músicos y bailarines hicieron suyas nuevas tradiciones. Y sigue cambiando cada vez que alguien sale a bailar.','La historia continúa contigo.'],credit,share:{label:'Compartir este libro',url:'https://www.salsahistory.com/es/'},button:'Volver a empezar'},
  description:'Explora la historia de la música y el baile de salsa en un libro desplegable de 16 capítulos, desde sus raíces cubanas y su nacimiento en Nueva York hasta las pistas y los escenarios de todo el mundo.'
};
const references=entries=>entries.map(([title,publisher,url])=>{
  const local=sources[url];
  return local?[local[0],publisher,local[1]]:[title,publisher,url];
});
export const chapters=original.map((chapter,index)=>{
  const localized=text[chapter.id],folio=String(index+1).padStart(2,'0'),objects={};
  for(const [key,originalCard] of Object.entries(chapter.objects)){
    const card=localized.objects[key];
    objects[key]={...originalCard,title:card.title,copy:card.copy,sources:references(originalCard.sources)};
    if(originalCard.video)objects[key].video={...originalCard.video,title:card.videoTitle};
    if(originalCard.mapAlt){objects[key].mapAlt=card.mapAlt;objects[key].mapLabels=originalCard.mapLabels.map(t);}
  }
  return {...chapter,...localized,objects,sources:references(chapter.sources),
    pageLabel:'CAPÍTULO '+folio+' / '+original.length+' · '+localized.style,
    objectsLabel:'EN ESTA ESCENA · '+localized.title,
    footer:[localized.footerPlace,localized.style+' · '+folio],
    ...(localized.heard?{soundAnnouncement:localized.heard+'. '+t('Synthesized instrument illustration.')}:{}),
  };
});
