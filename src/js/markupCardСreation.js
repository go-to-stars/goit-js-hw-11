export function markupCardСreation(
  href,
  src,
  alt,
  likes,
  views,
  comments,
  downloads
) {
  return `<li class="gallery-item"><a class="gallery-link link" href="${href}" onclick="event.preventDefault()"><div class="gallery-item-card"><div class="gallery-item-thumb"><img class="gallery-img" src="${src}" alt="${alt}" loading="lazy"/></div><div class="gallery-caption"><p class="gallery-caption-item"><b>Likes</b>${likes}</p><p class="gallery-caption-item"><b>Views</b>${views}</p><p class="gallery-caption-item"><b>Comments</b>${comments}</p><p class="gallery-caption-item"><b>Downloads</b>${downloads}</p></div></div></a></li>`;
} // створення заготовки розмітки 1-єї картки малюнку 