import { sortMap } from "../lib/sort.js";

export function initSorting(columns) {
    return (query, state, action) => {
        let field = null;
        let order = null;

        if (action && action.name === 'sort') {
            // Обновляем значение кнопки
            action.dataset.value = sortMap[action.dataset.value];
            field = action.dataset.field;
            order = action.dataset.value;

            // Сбрасываем другие кнопки
            columns.forEach(column => {
                if (column.dataset.field !== action.dataset.field) {
                    column.dataset.value = 'none';
                }
            });
        } else {
            // Находим активную сортировку
            columns.forEach(column => {
                if (column.dataset.value !== 'none') {
                    field = column.dataset.field;
                    order = column.dataset.value;
                }
            });
        }

        // Преобразуем 'up' в 'asc', 'down' в 'desc' для запроса
        let queryOrder = null;
        if (order === 'up') {
            queryOrder = 'asc';
        } else if (order === 'down') {
            queryOrder = 'desc';
        }
        
        const sort = (field && queryOrder) ? `${field}:${queryOrder}` : null;
        
        return sort ? Object.assign({}, query, { sort }) : query;
    };
}