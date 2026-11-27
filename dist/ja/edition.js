import {localizeEdition} from '../localized-edition.js';
import {text} from './text.js';
import {cover,labels} from './ui.js';
import {sources} from './sources.js';
export {plateName} from '../chapters.js';

export const {bookCopy,chapters,t,lang,bookTitle} = localizeEdition({
  code:"ja", lang:"ja", bookTitle:"絵でたどるサルサダンスの歴史",
  titleLines:["絵でたどる", "サルサダンス", "の歴史"],
  text,cover,labels,sources
});
