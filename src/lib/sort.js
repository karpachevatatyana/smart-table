const sortUp = field => (a, b) => {
    if (a[field] > b[field]) return 1;
    if (a[field] < b[field]) return -1;
    return 0;
};

const sortDown = field => (a, b) => {
    if (a[field] < b[field]) return 1;
    if (a[field] > b[field]) return -1;
    return 0;
};

const sortFn = {
    up: sortUp,
    down: sortDown
};

export const sortMap = {
    none: 'up',
    up: 'down',
    down: 'none'
};

export function sortCollection(arr, field, order) {
    if (field && order !== 'none' && sortFn[order]) {
        return arr.toSorted(sortFn[order](field));
    }

    return arr;
}