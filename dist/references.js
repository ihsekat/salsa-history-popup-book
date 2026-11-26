export function archive(label, url){
  const separator = Math.max(label.lastIndexOf(' - '), label.lastIndexOf(' — '));
  return [label.slice(0, separator), label.slice(separator + 3), url, label];
}

export function orderedReferences(sources){
  const preferred = sources.filter(([,publisher]) => publisher === 'Salsa Vida');
  const others = sources.filter(([,publisher]) => publisher !== 'Salsa Vida');
  return [...preferred, ...others];
}
