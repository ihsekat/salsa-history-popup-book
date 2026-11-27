const pickers = document.querySelectorAll('.language-picker');

function closeOthers(target) {
  for (const picker of pickers) {
    if (picker.open && !picker.contains(target)) picker.open = false;
  }
}
document.addEventListener('pointerdown', event => closeOthers(event.target));
document.addEventListener('focusin', event => closeOthers(event.target));

for (const picker of pickers) {
  const trigger = picker.querySelector('summary');
  const links = [...picker.querySelectorAll('a')];
  picker.addEventListener('keydown', event => {
    if (event.key === 'Escape' && picker.open) {
      event.preventDefault();
      picker.open = false;
      trigger.focus();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const index = links.indexOf(document.activeElement);
      const next = event.key === 'ArrowDown' ? index+1 : (index < 0 ? links.length-1 : index-1);
      picker.open = true;
      links[(next + links.length) % links.length].focus();
    }
  });
}

function syncArticleLinks() {
  const hash = window.location.hash;
  const target = document.getElementById(hash.slice(1));
  for (const link of document.querySelectorAll('#reading-language a')) {
    link.hash = target?.closest('#reading-edition') ? hash : '#reading-edition';
  }
}
syncArticleLinks();
window.addEventListener('hashchange', syncArticleLinks);
