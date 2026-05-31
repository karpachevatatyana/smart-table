import { sortMap } from "../lib/sort.js";

export function initSorting(columns) {
    return (query, state, action) => {
        let field = null;
        let order = null;

        if (action && action.name === 'sort') {
            action.dataset.value = sortMap[action.dataset.value];
            field = action.dataset.field;
            order = action.dataset.value;

            columns.forEach(column => {
                if (column.dataset.field !== action.dataset.field) {
                    column.dataset.value = 'none';
                }
            });
        } else {
            columns.forEach(column => {
                if (column.dataset.value !== 'none') {
                    field = column.dataset.field;
                    order = column.dataset.value;
                }
            });
        }

        let apiOrder = null;
        if (order === 'up') apiOrder = 'asc';
        if (order === 'down') apiOrder = 'desc';
        
        const sort = (field && apiOrder) ? `${field}:${apiOrder}` : null;

        return sort ? Object.assign({}, query, { sort }) : query;
    };
}