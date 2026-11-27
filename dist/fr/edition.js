import {localizeEdition} from '../localized-edition.js';
import {text} from './text.js';
import {cover,labels} from './ui.js';
import {sources} from './sources.js';
export {plateName} from '../chapters.js';

export const {bookCopy,chapters,t,lang,bookTitle} = localizeEdition({
  code:"fr", lang:"fr-FR", bookTitle:"Histoire illustrée de la danse salsa",
  titleLines:["HISTOIRE ILLUSTRÉE DE LA", "danse", "salsa"],
  text,cover,labels,sources
});
