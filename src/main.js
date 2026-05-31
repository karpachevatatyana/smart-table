import "./fonts/ys-display/fonts.css";
import "./style.css";

import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";
import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";

const api = initData();

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

async function render(action) {
    let state = collectState();
    let query = {};
    
    if (applySearching) {
        query = applySearching(query, state, action);
    }
    
    if (applyFiltering) {
        query = applyFiltering(query, state, action);
    }
    
    if (applySorting) {
        query = applySorting(query, state, action);
    }
    
    if (applyPagination) {
        query = applyPagination(query, state, action);
    }
    
    const { total, items } = await api.getRecords(query);
    
    if (updatePagination) {
        updatePagination(total, query);
    }
    
    sampleTable.render(items);
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

let applyPagination, applySorting, applyFiltering, applySearching, updatePagination, updateIndexes;

if (sampleTable.pagination && sampleTable.pagination.elements) {
    const paginationModule = initPagination(
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
    applyPagination = paginationModule.applyPagination;
    updatePagination = paginationModule.updatePagination;
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
    const filteringModule = initFiltering(sampleTable.filter.elements);
    applyFiltering = filteringModule.applyFiltering;
    updateIndexes = filteringModule.updateIndexes;
}

applySearching = initSearching('search');

const appRoot = document.querySelector('#app');
if (appRoot) {
    appRoot.appendChild(sampleTable.container);
}

async function init() {
    const indexes = await api.getIndexes();
    
    if (updateIndexes) {
        updateIndexes(sampleTable.filter.elements, {
            searchBySeller: indexes.sellers
        });
    }
}

init().then(() => render());