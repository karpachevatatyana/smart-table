// Импорт стилей должен быть первым
import './style.css'
import './fonts/ys-display/fonts.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
// @todo: подключение
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";

// Исходные данные используемые в render()
const {data, ...indexes} = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    
    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);
    
    // Проверяем, что числа валидны
    const validRowsPerPage = isNaN(rowsPerPage) ? 10 : rowsPerPage;
    const validPage = isNaN(page) ? 1 : page;
    
    return {
        ...state,
        rowsPerPage: validRowsPerPage,
        page: validPage
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
function render(action) {
    let state = collectState(); // состояние полей из таблицы
    let result = [...data]; // копируем для последующего изменения
    
    // Применяем поиск
    if (applySearching) {
        result = applySearching(result, state, action);
    }
    
    // Применяем фильтрацию
    if (applyFiltering) {
        result = applyFiltering(result, state, action);
    }
    
    // Применяем сортировку
    if (applySorting) {
        result = applySorting(result, state, action);
    }
    
    // Применяем пагинацию
    if (applyPagination) {
        result = applyPagination(result, state, action);
    }
    
    sampleTable.render(result)
}

// Инициализация таблицы
const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

// Инициализация модулей
let applyPagination, applySorting, applyFiltering, applySearching;

// Проверяем, что элементы существуют перед инициализацией
if (sampleTable.pagination && sampleTable.pagination.elements) {
    applyPagination = initPagination(
        sampleTable.pagination.elements,
        (el, page, isCurrent) => {
            const input = el.querySelector('input');
            const label = el.querySelector('span');
            if (input && label) {
                input.value = page;
                input.checked = isCurrent;
                label.textContent = page;
            }
            return el;
        }
    );
}

if (sampleTable.header && sampleTable.header.elements) {
    const sortButtons = [];
    if (sampleTable.header.elements.sortByDate) sortButtons.push(sampleTable.header.elements.sortByDate);
    if (sampleTable.header.elements.sortByTotal) sortButtons.push(sampleTable.header.elements.sortByTotal);
    if (sortButtons.length) {
        applySorting = initSorting(sortButtons);
    }
}

if (sampleTable.filter && sampleTable.filter.elements) {
    applyFiltering = initFiltering(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });
}

applySearching = initSearching('search');

// Добавляем таблицу на страницу
const appRoot = document.querySelector('#app');
if (appRoot) {
    appRoot.appendChild(sampleTable.container);
}

// Запускаем рендер
render();