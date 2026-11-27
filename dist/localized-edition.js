import {chapterLabel} from './languages.js';
import {chapters as original, bookCopy as englishBook} from './chapters.js';

export function localizeEdition({code,bookTitle,lang,titleLines,text,labels,cover,sources}) {
  const t = key => labels[key] ?? key;
  const credit = {label:cover.credit, url:'https://www.salsavida.com/'+code+'/'};
  const bookCopy = {
    front:{titleLines, subtitle:cover.subtitle, credit, button:t('Open the book')},
    contents:{title:t('Inside the book'),label:t('FOLD-OUT CONTENTS')},
    back:{copy:[cover.back0,cover.back1],credit,share:{label:t('Share this book'),url:'https://www.salsahistory.com/'+code+'/'},button:t('Start again')},
    description:cover.description,noScript:cover.noScript,
    navigation:englishBook.navigation.map(t),accessibility:englishBook.accessibility.map(t)
  };
  const references = entries => entries.map(([title,publisher,url]) => {
    const translated = sources[url];
    return translated ? [translated[0],publisher,translated[1]] : [title,publisher,url];
  });
  const chapters = original.map((chapter,index) => {
    const local = text[chapter.id];
    const objects = {};
    for (const [key,card] of Object.entries(chapter.objects)) {
      const {videoTitle,...copy} = local.objects[key];
      objects[key] = {...card,...copy,sources:references(card.sources)};
      if (card.video) objects[key].video = {...card.video,title:videoTitle};
      if (card.mapLabels) objects[key].mapLabels = card.mapLabels.map(t);
    }
    const folio = String(index+1).padStart(2,'0');
    return {...chapter,...local,objects,sources:references(chapter.sources),
      pageLabel:chapterLabel(folio,original.length,lang,t)+' · '+local.style,
      objectsLabel:t('FROM THE SPREAD')+' · '+local.title,
      footer:[local.footerPlace,local.style+' · '+folio],
      ...(local.heard ? {soundAnnouncement:local.heard+' '+t('Synthesized instrument illustration.')} : {})
    };
  });
  return {bookCopy,chapters,t,lang,bookTitle};
}
