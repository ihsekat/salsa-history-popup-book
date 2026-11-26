# Salsa History Popup Book

An interactive, illustrated history of salsa dance by Takeshi Young of Salsa Vida. Open the cover and turn through 16 pop-up scenes, or read the entire book as one illustrated article with JavaScript turned off. The pop-up format was inspired by [The Folded Atlas](https://rosy-wisdom-dw86.here.now/) by [John Lindquist](https://x.com/johnlindquist).

[Open the book](https://www.salsahistory.com/) · [About the project](https://www.salsahistory.com/about/)

## Run it locally

The checked-in `dist/` directory is a complete static site. With Python 3 installed, run this from the repository root and open [localhost:8000](http://localhost:8000/).

```sh
python3 -m http.server 8000 --directory dist
```

## Make your own pop-up book

Choose **Use this template** on GitHub to create your own repository. The site runs at the root of a domain. The JavaScript, images, font and page-turn sound are included.

1. Start with one spread. Find its chapter ID in `dist/chapters.js`. The exported `chapters` array controls the order. Chapter copy, object cards and citations are in that file, `dist/history.js`, `dist/orlando-chapter.js` and `dist/references.js`.
2. Follow the same ID in `dist/sets.js` to find its 3D scene. Edit the paper props there or in the scene module it calls. Keep the interactive prop IDs paired with their object cards. Add replacement illustrations in `dist/art/` and update the printed spread image used by `plateName()`.
3. Customize the covers, book title, credits and share URL. Start with `bookCopy` in `dist/chapters.js`, the files in `templates/`, and `scripts/build-reading-edition.mjs`. Replace the original domain in site-specific settings and tests before publishing. Review the About, Privacy and Terms pages to match your own project and services.
4. Rebuild the HTML and run the tests using a current Node.js LTS release. No npm dependencies are needed. Then serve `dist/` as above, open your chapter by its anchor, turn the page, and check the reading edition with JavaScript off.

```sh
npm run build
npm test
```

Deploy the **contents** of `dist/` to the root of a static host. Point your domain there. The build generates the homepage, static information pages, sitemap and robots.txt. The book also includes artwork source files in `artwork/`; the browser loads the finished artwork from `dist/art/`.

## License and attribution

© 2026 Salsa Vida. The original code, text and illustrations are available under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). The [full license](LICENSE) is included. You may share the book, adapt it and use it commercially. Credit Takeshi Young / Salsa Vida, link to the license, and indicate any changes. Link your credit to [the original book](https://www.salsahistory.com/) (preferred) or [Salsa Vida](https://www.salsavida.com/).

A sample credit for a new book follows. Adjust the last sentence to describe your actual changes.

> Adapted from [Illustrated History of Salsa Dance](https://www.salsahistory.com/) by Takeshi Young / Salsa Vida ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)). Chapter text and illustrations have been changed.

### Third-party credits

- Three.js uses the [MIT License](dist/THREE-LICENSE.txt).
- Young Serif uses the [SIL Open Font License](dist/art/FONT-LICENSE.txt).
- The page-turn recording adapts [“Page turned” by Beussa](https://freesound.org/people/Beussa/sounds/749880/), released under CC0.
- The Cuban coastline uses [Natural Earth public-domain map data](https://www.naturalearthdata.com/about/terms-of-use/).
- Linked sources and embedded YouTube recordings remain subject to their respective rights. The project license covers the original contributions to this book. Third-party marks and personal likeness rights remain with their holders.
