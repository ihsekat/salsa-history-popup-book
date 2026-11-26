import {archive} from './references.js';
import {expansion} from './history.js';
import {orlandoChapter} from './orlando-chapter.js';

export const bookCopy = {
  front: {
    titleLines: ["ILLUSTRATED HISTORY OF", "Salsa", "Dance"],
    subtitle: "From the shores of Cuba to the world stage",
    credit: {
      label: "An interactive experience by Salsa Vida",
      url: "https://www.salsavida.com/",
    },
    button: "Open the book",
  },
  contents: {
    title: "Inside the book",
    label: "FOLD-OUT CONTENTS",
  },
  back: {
    copy: [
      "Salsa began with cultures crossing paths. It grew as musicians and dancers made new traditions their own, and it keeps evolving every time someone steps onto the dance floor.",
      "The story continues with you.",
    ],
    credit: {
      label: "An interactive experience by Salsa Vida",
      url: "https://www.salsavida.com/",
    },
    share: {
      label: "Share this book",
      url: "https://www.salsahistory.com/",
    },
    button: "Start again",
  },
  description: "Explore the history of salsa music and dance in a 16-chapter interactive illustrated pop-up book, from its Cuban roots and New York origins to dance floors and stages around the world.",
  noScript: "This illustrated book explores 16 chapters of salsa history, from its Caribbean roots and the rise of salsa in New York to its international styles, festivals, championships and the Super Bowl halftime stage. JavaScript is required for interactive page turns and object panels.",
  navigation: [
    "Chapters",
    "Reset view",
    "Turn paper sounds on",
    "Turn paper sounds off",
    "Previous page",
    "Next page",
    "Close to front cover",
    "Close book",
    "Close",
    "Turn the page slowly",
    "DRAG TO TURN · PINCH TO ZOOM",
    "TURN THE PAGES",
  ],
  accessibility: [
    "Book tools",
    "Chapter introduction",
    "Explore objects on this page",
    "Turn the pages",
    "Open Illustrated History of Salsa Dance",
    "Illustrated edition of the pop-up book",
    "An open pop-up book. Select glowing objects to read their stories. Drag its pages to turn them. Drag the surrounding table to rotate. Use the left and right arrow keys to turn pages, A and D to rotate, and W and S to tilt. Pinch or use the plus and minus keys to zoom. R resets the view.",
    "Select a glowing object to read its story. Drag the paper to turn. Drag the table to rotate. Arrow keys turn pages. A and D rotate. W and S tilt. Pinch or use the plus and minus keys to zoom. R resets the view.",
    "View reset.",
    "Sound playback is unavailable.",
    "Front cover.",
    "Back cover. Start again.",
    "Front cover. Open the book.",
  ],
};

const son = {
  id: "son",
  title: "Cuban Son: The Sound That Became Salsa",
  style: "THE AFRO-CUBAN FUSION",
  place: "Oriente and Havana, Cuba · Late 1800s–1930s",
  pageLabel: "CHAPTER 05 / 16 · THE AFRO-CUBAN FUSION",
  objectsLabel: "FROM THE SPREAD · Cuban Son: The Sound That Became Salsa",
  line: "In Cuba, musicians fused European song and strings with African-derived percussion and singing, alongside Indigenous Caribbean instruments. Son cubano emerged as one of the clearest expressions of this blend. Its rhythms, melodies and partner dancing became a direct foundation of salsa.",
  footer: ["Cuba", "THE AFRO-CUBAN FUSION · 05"],
  lettering: ["Oriente"],
  alt: "A paper couple dances in a tiled Cuban courtyard. A seated tres player, an arcaded veranda, palms and folded green hills rise from the pages.",
  sound: "Play the tres",
  heard: "A phrase on the tres",
  soundAnnouncement: "A phrase on the tres. Synthesized instrument illustration.",
  copy: [
    "In Cuba, Africans and their descendants formed mutual-aid societies called cabildos. These gatherings helped Cubans of Yoruba descent pass down the songs, dances and batá drum rhythms they used to honor their deities, the orishas.",
    "In parts of mainland North America, colonial laws barred enslaved people from playing drums. In Cuba, generations of musicians kept African drumming traditions alive, giving drums a more prominent role in the island’s music.",
    "Son took shape in eastern Cuba around the turn of the twentieth century. Musicians combined Spanish-language songs and string accompaniment with African-derived rhythms and call-and-response singing. Claves, bongos, maracas and the tres helped define its sound. The dancers, meanwhile, developed their own ways of moving together to the music.",
    "Son spread to Havana, where groups such as the Sexteto Habanero popularized it. Trumpets joined the ensemble, and later bands such as Arsenio Rodríguez’s expanded the sound with piano and congas. Radio, records and touring musicians carried son abroad. Many of the ingredients of modern salsa were now in place.",
  ],
  sources: [
    archive("Son Cubano - Salsa Vida", "https://www.salsavida.com/salsa-dance-terms/son-cubano/"),
    archive("An Introduction to the Son - Smithsonian Folkways", "https://folkways-media.si.edu/docs/folkways/artwork/ARH07006.pdf"),
    archive("The practice of Cuban Son - UNESCO", "https://ich.unesco.org/en/RL/the-practice-of-cuban-son-02299?RL=02299"),
    archive("History of Salsa Dance — Salsa Vida", "https://www.salsavida.com/articles/history-of-salsa-dance/"),
    archive("Latin Jazz Glossary — Smithsonian National Museum of American History", "https://www.americanhistory.si.edu/explore/projects/smithsonian-jazz/collections-and-archives/latin-jazz/glossary"),
    archive("Havana, Cuba, ca. 1957: Rhythms and Songs for the Orishas - Smithsonian Folkways", "https://folkways-media.si.edu/docs/folkways/artwork/SFW40489.pdf"),
    archive("The Superpower of Singing: Music and the Struggle Against Slavery - National Park Service", "https://www.nps.gov/articles/000/the-superpower-of-singing-music-and-the-struggle-against-slavery.htm"),
    archive("Slave Codes — South Carolina Encyclopedia", "https://www.scencyclopedia.org/sce/entries/slave-codes/"),
    archive("Jazz Origins in New Orleans — National Park Service", "https://www.nps.gov/jazz/learn/historyculture/history_early.htm"),
  ],
  objects: {
    duo: {
      title: "The son dancers",
      flat: [0.4, 0.55, 0.1, 0.3],
      copy: [
        "Son was both a musical genre and a partner dance. Couples learned to shift their weight together, often using contratiempo timing that emphasizes the space around the music’s main accents. Son’s close partnership, turns and rhythmic expression helped shape later Cuban dances and the mambo tradition. Son is still danced in Cuba and beyond today.",
      ],
      sources: [
        archive("Son Cubano - Salsa Vida", "https://www.salsavida.com/salsa-dance-terms/son-cubano/"),
        archive("The practice of Cuban Son - UNESCO", "https://ich.unesco.org/en/RL/the-practice-of-cuban-son-02299?RL=02299"),
      ],
    },
    player: {
      title: "The Cuban tres",
      flat: [0.74, 0.59, 0.1, 0.2],
      video: {"id": "MPZC9F8G-Fw", "title": "“Guantanamera” on the Cuban tres"},
      copy: [
        "The Cuban tres has three pairs of strings. A tresero often plays a guajeo, a short, syncopated pattern that repeats against the bass and percussion while the singer moves freely above it. In this rendition of “Guantanamera,” listen for the bright, doubled sound as the player picks out the tune. Salsa pianists later took up the tresero’s role, weaving repeating patterns through the rhythm section.",
      ],
      sources: [
        archive("Son Cubano - Salsa Vida", "https://www.salsavida.com/salsa-dance-terms/son-cubano/"),
        archive("An Introduction to the Son - Smithsonian Folkways", "https://folkways-media.si.edu/docs/folkways/artwork/ARH07006.pdf"),
        archive("Guajeo on tres cubano - Music in Global America", "https://scalar.usc.edu/works/music-in-global-america/guajeo-on-tres-cubano"),
      ],
    },
    prop: {
      title: "The Oriente sign",
      flat: [0.83, 0.72, 0.11, 0.13],
      copy: [
        "Oriente was the historic province in eastern Cuba associated with early son. Musicians carried the sound from rural gatherings to the city of Santiago de Cuba and eventually Havana. The migration of musicians and the spread of records helped turn a regional tradition into one of Cuba’s most important musical exports.",
      ],
      sources: [
        archive("Son Cubano - Salsa Vida", "https://www.salsavida.com/salsa-dance-terms/son-cubano/"),
        archive("An Introduction to the Son - Smithsonian Folkways", "https://folkways-media.si.edu/docs/folkways/artwork/ARH07006.pdf"),
      ],
    },
  },
};

const palladium = {
  id: "palladium",
  title: "The Palladium: New York’s Mambo Era",
  style: "THE GOLDEN AGE OF MAMBO",
  place: "Midtown Manhattan, New York · 1947–1966",
  pageLabel: "CHAPTER 07 / 16 · THE GOLDEN AGE OF MAMBO",
  objectsLabel: "FROM THE SPREAD · The Palladium: New York’s Mambo Era",
  line: "In the 1950s, mambo took the United States by storm, and New York’s Palladium Ballroom was its epicenter. The era’s greatest Latin bands and dancers shared one floor, creating an exciting new style of partner dancing that would become the foundation of modern salsa.",
  footer: ["Midtown Manhattan", "THE GOLDEN AGE OF MAMBO · 07"],
  lettering: [
    "PALLADIUM",
    "BALLROOM",
    "MACHITO · TITO PUENTE · TITO RODRÍGUEZ",
  ],
  alt: "Two mambo dancers open out on a parquet floor. A live band plays by the Palladium marquee, and dance teacher Frank “Killer Joe” Piro stands beside the floor.",
  sound: "Play the timbales",
  heard: "A phrase on the timbales",
  soundAnnouncement: "A phrase on the timbales. Synthesized instrument illustration.",
  copy: [
    "New York became a meeting place for Cuban, Puerto Rican and other musicians. At Broadway and 53rd Street, the Palladium offered live Latin music four nights a week. The three kings of the ballroom, Machito, Tito Puente and Tito Rodríguez, drove dancers to new heights with their orchestras, often sharing the bill and competing to win over the crowd.",
    "The Palladium brought people together across racial and cultural lines. Latino, Black, Italian, Irish, Jewish and other New Yorkers danced to the same bands. Mambo dancers combined Cuban son and rumba with influences from swing, jazz, tap and other dance traditions. The result was an increasingly inventive style, full of turns, shines, showmanship and musical improvisation.",
    "Wednesday nights featured a lesson by “Killer Joe” Piro, amateur competitions and professional shows. Stars such as Cuban Pete and Millie Donay, Augie and Margo, and the Mambo Aces helped raise the standard of the dance. When the Palladium closed in 1966, the mambo craze was fading, but its music and movement lived on in the salsa scene taking shape in New York.",
  ],
  sources: [
    archive("Mambo - Salsa Vida", "https://www.salsavida.com/salsa-dance-terms/mambo/"),
    archive("Palladium Ballroom - Palladium Mambo", "https://www.palladium-mambo.com/ballroom.shtml"),
    archive("Aníbal/Andy Vázquez - Palladium Mambo", "https://www.palladium-mambo.com/vazquez-a/vazquez-a.shtml"),
    archive("History of Salsa Dance — Salsa Vida", "https://www.salsavida.com/articles/history-of-salsa-dance/"),
    archive("Palladium — Juliet McMains, Routledge Encyclopedia of Modernism", "https://www.rem.routledge.com/articles/palladium"),
    archive("Eddie Palmieri interview — National Endowment for the Arts", "https://www.arts.gov/stories/podcast/eddie-palmieri"),
  ],
  objects: {
    duo: {
      title: "The mambo dancers",
      flat: [0.41, 0.57, 0.21, 0.29],
      copy: [
        "Some of the Palladium’s most influential dancers were Cuban Pete and Millie Donay, Augie and Margo, and the Mambo Aces, Aníbal “Andy” Vázquez and Joe Centeno. They combined partnerwork with intricate solo steps, later called shines, and brought their own flavor to the dance. The Mambo Aces took their act to television in 1957.",
      ],
      sources: [
        archive("Mambo - Salsa Vida", "https://www.salsavida.com/salsa-dance-terms/mambo/"),
        archive("Aníbal/Andy Vázquez - Palladium Mambo", "https://www.palladium-mambo.com/vazquez-a/vazquez-a.shtml"),
        archive("Palladium Ballroom - Palladium Mambo", "https://www.palladium-mambo.com/ballroom.shtml"),
        archive("History of Salsa Dance — Salsa Vida", "https://www.salsavida.com/articles/history-of-salsa-dance/"),
        archive("Palladium — Juliet McMains, Routledge Encyclopedia of Modernism", "https://www.rem.routledge.com/articles/palladium"),
      ],
    },
    player: {
      title: "Live music",
      flat: [0.69, 0.46, 0.1, 0.19],
      copy: [
        "Dancers at the Palladium might hear two orchestras in a single night. Machito, Tito Puente and Tito Rodríguez each led one of the ballroom’s “Big Three” bands. From the floor you could hear the brass section punch out a phrase and a timbalero answer it with a roll. Drummer and bandleader Puente played for the Wednesday mambo contests, too. A 1956 photograph shows his band playing while the judges watch the dancers.",
      ],
      sources: [
        archive("Mambo - Salsa Vida", "https://www.salsavida.com/salsa-dance-terms/mambo/"),
        archive("Tito Puente - Salsa Vida", "https://www.salsavida.com/artists/tito-puente/"),
        archive("Salsa Instruments: A Complete Guide with Audio Examples - Salsa Vida", "https://www.salsavida.com/articles/salsa-instruments/#timbales"),
        archive("Palladium Ballroom - Palladium Mambo", "https://www.palladium-mambo.com/ballroom.shtml"),
        archive("Phil Newsum Photograph Collection, 1950s–1960s - The Bronx County Historical Society", "https://digital.bronxhistoricalsociety.org/phnewsum"),
      ],
    },
    piro: {
      title: "Frank “Killer Joe” Piro",
      copy: [
        "On Wednesdays, Frank “Killer Joe” Piro taught a dance lesson from nine to ten, then took the microphone to host the amateur contest and the professional show. A newcomer could spend an hour learning from Piro and stay to see what experienced dancers did with the same floor.",
      ],
      sources: [
        archive("Palladium Ballroom - Palladium Mambo", "https://www.palladium-mambo.com/ballroom.shtml"),
        archive("Pachanga (1961), John A. Lucchese - Library of Dance", "https://www.libraryofdance.org/manuals/1961-Lucchese-Pachanga.pdf"),
        archive("You Start to Smile - The New Yorker", "https://www.newyorker.com/magazine/1965/07/10/you-start-to-smile"),
      ],
    },
  },
};

export const chapters = [
  expansion.landfall,
  expansion.taino,
  expansion.spain,
  expansion.africa,
  son,
  expansion["cuban-dances"],
  palladium,
  expansion.fania,
  expansion.stadium,
  expansion.eddie,
  expansion["los-angeles"],
  expansion.cali,
  expansion["puerto-rico"],
  expansion["congress-world"],
  orlandoChapter,
  expansion.halftime,
];

const plates={
  son:'1',palladium:'2',spain:'spanish-danza',africa:'drum-and-chorus',
  stadium:'yankee-all-stars',eddie:'paper-mambo', 'los-angeles':'09-johnny-vazquez',
  'puerto-rico':'10-puerto-rico','congress-world':'11-congress-map',
  championship:'orlando-championship',halftime:'13-halftime'
};
export function plateName(id){return 'spread-'+(plates[id]||id)+'.webp';}
