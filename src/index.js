import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import PicturesSearchService from './js/search-service.js'; // дефолтний імпорт сласу PicturesSearchService
import { markupCardСreation } from './js/markupCardСreation.js'; // іменований імпорт функції markupСreation
import './css/styles.css'; // імпорт файлу стилів

import { Notify } from 'notiflix/build/notiflix-notify-aio'; // імпорт бібліотеки notiflix

const picturesSearchService = new PicturesSearchService();

const refs = {
  body: document.querySelector('body'),
  searchForm: document.querySelector('#search-form'),
  preamble: document.querySelector('.preamble'),
  imagesList: document.querySelector('.gallery'),
  loader: document.querySelector('.loader'),
  guard: document.querySelector('.guard'),
};

let maxNumberPage = 0;
let numberPage = 0;
let scrollTrackingPermission = true;
let endPage = false;

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (scrollTrackingPermission) {
          onLoadMore();
          scrollTrackingPermission = false;
        } // синхронізація з виконанням функції "onLoadMore()" (якщо функція викликана, то до завершення її роботи - немає дозволу на  повторний виклик функції "onLoadMore()")
      } // якщо, проскролюючи, наблизились на відстань "rootMargin" до "<div class="guard">" то виконуєм вміст "if"
    });
  },
  { rootMargin: '100px' } // відстань до "<div class="guard">"
); // спостарігач за скролом

refs.searchForm.addEventListener('submit', onSearch);

async function onSearch(e) {
  e.preventDefault(); // блокування дій браузера за замовчуванням

  picturesSearchService.query = e.currentTarget.elements.query.value.trim(); //передача вмісту "input" в екземпляр "picturesSearchService"

  if (picturesSearchService.query === '') {
    refs.loader.classList.add('visually-hidden'); // приховати іконку-спіннер
    refs.imagesList.innerHTML = ''; // очистити галерею

    return Notify.failure(
      'Sorry, the search field cannot be empty. Please try again.'
    );
  } // якщо вміст "input" пустий, то вийти з функції та вивести повідомлення і очистити галерею

  refs.loader.classList.remove('visually-hidden'); // показати іконку-спіннер
  refs.preamble.classList.add('visually-hidden'); // приховати преамбулу

  picturesSearchService.resetPageNumber(); // обнулення лічильника сторінок (до 1)

  try {
    await picturesSearchService
      .fetchPictures()
      .then(data => {
        maxNumberPage = Math.ceil(data.totalHits / 40); // округлення до більшого цілого максимальної кількості сторінок галереї
        // maxNumberPage = Math.floor(data.totalHits / 40); // округлення до меншого цілого максимальної кількості сторінок галереї

        if (data.totalHits > 0) {
          const { height: cardHeight } = document
            .querySelector('.gallery')
            .getBoundingClientRect();
          window.scrollBy({
            top: cardHeight * -1,
            // behavior: "smooth",
          }); // прокрутка на початок сторінки

          numberPage = 1; // поточний номер сторінки 1
          refs.imagesList.innerHTML = ''; // очистити галерею

          appendHitsMarkup(data.hits); // додати розмітку
          // refs.loadMoreBtn.classList.remove("visually-hidden"); // показати кнопку "Load more"

          refs.loader.classList.add('visually-hidden'); // приховати іконку-спіннер

          Notify.success(`Hooray! We found ${data.totalHits} images.`); // повідомлення про успішне завантаження

          endPage = false; // завантаження останньої сторінки (ні)

          observer.observe(refs.guard); // старт спостарігача за скролом

          scrollTrackingPermission = true; // дозволити відслідковування скролу
        } else {
          refs.imagesList.innerHTML = ''; // очистити галерею
          refs.loader.classList.add('visually-hidden'); // приховати іконку-спіннер
          refs.preamble.classList.remove('visually-hidden'); // показати преамбулу
          scrollTrackingPermission = false; // заборонити відслідковування скролу

          Notify.failure(
            'Sorry, there are no images matching your search query. Please try again.'
          ); // повідомлення про відсутність малюнків за запитом
        } // якщо у відповіді прийшов порожній масив
      })
      .catch(error => {
        refs.loader.classList.add('visually-hidden'); // приховати іконку-спіннер
        refs.preamble.classList.remove('visually-hidden'); // показати преамбулу
        scrollTrackingPermission = false; // заборонити відслідковування скролу

        Notify.failure(
          'Oops, sorry, there were problems with the download. Please try again.'
        );
        console.log(error);
      });
  } catch {
    error => {
      refs.loader.classList.add('visually-hidden'); // приховати іконку-спіннер
      refs.preamble.classList.remove('visually-hidden'); // показати преамбулу
      scrollTrackingPermission = false; // заборонити відслідковування скролу

      Notify.failure(
        'Oops, sorry, there were problems with the download. Please try again.'
      );
      console.log(error);
    };
  }
} // фукція стартового пошуку картинок

async function onLoadMore() {
  if (!endPage) {
    if (numberPage < maxNumberPage) {
      refs.loader.classList.remove('visually-hidden'); // показати іконку-спіннер

      try {
        await picturesSearchService
          .fetchPictures()
          .then(data => {
            appendHitsMarkup(data.hits);
            Notify.success(`Hooray! We found ${data.totalHits} images.`);

            refs.loader.classList.add('visually-hidden'); // приховати іконку-спіннер
            scrollTrackingPermission = true; // дозволити відслідковування скролу
            numberPage += 1;
          })
          .catch(error => {
            refs.loader.classList.add('visually-hidden'); // приховати іконку-спіннер
            refs.preamble.classList.remove('visually-hidden'); // показати преамбулу
            scrollTrackingPermission = false; // заборонити відслідковування скролу

            Notify.failure(
              'Oops, sorry, there were problems with the download. Please try again.'
            );
            console.log(error);
          });
      } catch {
        error => {
          refs.loader.classList.add('visually-hidden'); // приховати іконку-спіннер
          refs.preamble.classList.remove('visually-hidden'); // показати преамбулу
          scrollTrackingPermission = false; // заборонити відслідковування скролу

          Notify.failure(
            'Oops, sorry, there were problems with the download. Please try again.'
          );
          console.log(error);
        };
      }
    } else {
      Notify.info("We're sorry, but you've reached the end of search results.");
      observer.unobserve(refs.guard);
      endPage = true;
      scrollTrackingPermission = false; // заборонити відслідковування скролу
    }
  } // якщо завантажена остання сторінка, то пошук сторінок робити не потрібно, зупинити спостерігача за скролом
} // фукція довантаження нових сторінок в поточному пошуці

function appendHitsMarkup(hits) {
  refs.imagesList.insertAdjacentHTML('beforeend', onMarkup(hits));

  const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt', // підпис малюнку
    captionPosition: 'bottom', // місце виведення підпису малюнку
    captionDelay: 250, // затримка виведення підпису малюнку
  }).refresh(); // робота з галереєю через бібліотеку "lightbox"
} // функція додавання розмітки в DOM за одну операцію та активації бібліотеки "lightbox" в цій ромітці та при повторному додаванні розмітки (refresh())

function onMarkup(hits) {
  return hits
    .map(
      el =>
        markupCardСreation(
          `${el.largeImageURL}`,
          `${el.webformatURL}`,
          `${el.tags}`,
          `${el.likes}`,
          `${el.views}`,
          `${el.comments}`,
          `${el.downloads}`
        ) // виклик функції markupСreation
    )
    .join('');
} // cтворення рядка розмітки галереї
