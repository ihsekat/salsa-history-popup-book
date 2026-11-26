const slugs = {
  landfall: 'cuba-and-the-roots-of-salsa',
  taino: 'taino-music-and-instruments',
  spain: 'spanish-influences-in-cuba',
  africa: 'african-roots-of-salsa',
  son: 'son-cubano',
  'cuban-dances': 'cuban-music-and-dance',
  palladium: 'palladium-ballroom-and-mambo',
  fania: 'fania-records-and-salsa',
  stadium: 'fania-all-stars-at-yankee-stadium',
  eddie: 'eddie-torres-and-new-york-on2',
  'los-angeles': 'los-angeles-style-salsa',
  cali: 'salsa-in-cali-colombia',
  'puerto-rico': 'puerto-rico-salsa-congress',
  'congress-world': 'international-salsa-festivals',
  championship: 'world-salsa-championships',
  halftime: 'salsa-at-the-super-bowl',
};

export function chapterPath(id) {
  if (!slugs[id]) throw new Error('Missing chapter URL for ' + id);
  return '/chapters/' + slugs[id] + '/';
}
