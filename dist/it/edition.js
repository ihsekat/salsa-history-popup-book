import {localizeEdition} from '../localized-edition.js';
import {text} from './text.js';
import {cover,labels} from './ui.js';
import {sources} from './sources.js';
export {plateName} from '../chapters.js';

export const {bookCopy,chapters,t,lang,bookTitle} = localizeEdition({
  code:"it", lang:"it", bookTitle:"Storia illustrata del ballo salsa",
  titleLines:["STORIA ILLUSTRATA DEL", "ballo", "salsa"],
  text,cover,labels,sources
});
