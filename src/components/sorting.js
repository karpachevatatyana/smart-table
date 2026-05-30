import { sortMap } from "../lib/sort.js";

export function initSorting(columns) {
    return (query, state, action) => {
        let field = null;
        let order = null;

        if (action && action.name === 'sort') {
            action.dataset.value = sortMap[action.dataset.value];

            columns.forEach(column => {
                if (column !== action) {
                    column.dataset.value = 'none';
                }
            });
        }

        columns.forEach(column => {
            if (column.dataset.value !== 'none') {
                field = column.dataset.field;
                order = column.dataset.value;
            }
        });

        if (!field || !order || order === 'none') {
            return query;
        }

        const apiOrder = order === 'up' ? 'asc' : 'desc';

        return {
            ...query,
            sort: `${field}:${apiOrder}`
        };
    };
}