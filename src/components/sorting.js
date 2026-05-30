import { sortMap } from "../lib/sort.js";

export function initSorting(columns) {

    return (query, state, action) => {

        if (action && action.name === 'sort') {

            action.dataset.value =
                sortMap[action.dataset.value];

            columns.forEach(column => {
                if (column !== action) {
                    column.dataset.value = 'none';
                }
            });
        }

        let field = null;
        let order = null;

        columns.forEach(column => {
            if (column.dataset.value !== 'none') {
                field = column.dataset.field;
                order = column.dataset.value;
            }
        });

        if (!field || !order) {
            return query;
        }

        const apiOrder =
            order === 'up'
                ? 'asc'
                : order === 'down'
                    ? 'desc'
                    : null;

        if (!apiOrder) {
            return query;
        }

        return Object.assign({}, query, {
            sort: field,
            order: apiOrder
        });
    };
}