import axios from 'axios';
// const axios = require("axios/dist/browser/axios.cjs"); // browser
// const axios = require('axios/dist/node/axios.cjs'); // node

const BASE_URL = 'https://pixabay.com/api/'; // базовий URL
const API_KEY = '36631917-353b26ef8ccbf147215af965d'; // ключ користувача
const requestParams = new URLSearchParams({
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  per_page: 40,
}); // параметри запиту

export default class PicturesSearchService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }

  async fetchPictures() {
    const url = `${BASE_URL}?key=${API_KEY}&q=${this.searchQuery}&${requestParams}&page=${this.page}`;
    const responce = await axios(url);
    this.incrementPageNumber();

    return responce.data;
  } // асинхронна фукція fetchPictures() очікує та повертає, за допомогою бібліотеки "axios", проміс отриманих даних

  incrementPageNumber() {
    this.page += 1;
  } // функція інкрименту на 1 номеру сторінки

  resetPageNumber() {
    this.page = 1;
  } // функція обнулення до 1 номеру сторінки

  get query() {
    return this.searchQuery;
  } // геттер, повертає запит (введений в поле вводу "input")

  set query(newQuery) {
    this.searchQuery = newQuery;
  } // сеттер, змінює зміст запиту
}
