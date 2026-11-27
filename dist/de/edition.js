import {localizeEdition} from '../localized-edition.js';
import {text} from './text.js';
import {cover,labels} from './ui.js';
import {sources} from './sources.js';
export {plateName} from '../chapters.js';

export const {bookCopy,chapters,t,lang,bookTitle} = localizeEdition({
  code:"de", lang:"de", bookTitle:"Die illustrierte Geschichte des Salsa-Tanzes",
  titleLines:["DIE ILLUSTRIERTE GESCHICHTE DES", "Salsa-", "Tanzes"],
  text,cover,labels,sources
});
