// Импорт стилей должен быть первым
import './style.css';
import './fonts/ys-display/fonts.css';

import { data as sourceData } from "./data/dataset_1.js";

import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";

// Исходные данные используемые в render()
const { data, ...indexes } = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    
    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);
    
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
    let state = collectState();
    let result = [...data];
    
    if (applySearching) {
        result = applySearching(result, state, action);
    }
    
    if (applyFiltering) {
        result = applyFiltering(result, state, action);
    }
    
    if (applySorting) {
        result = applySorting(result, state, action);
    }
    
    if (applyPagination) {
        result = applyPagination(result, state, action);
    }
    
    sampleTable.render(result);
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

const appRoot = document.querySelector('#app');
if (appRoot) {
    appRoot.appendChild(sampleTable.container);
}

render();