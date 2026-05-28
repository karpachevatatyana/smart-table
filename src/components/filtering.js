export function initFiltering(elements) {
    const updateIndexes = (indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            const select = elements[elementName];

            if (!select) return;

            const options = Object.values(indexes[elementName]).map((name) => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                return option;
            });

            select.append(...options);
        });
    };

    const applyFiltering = (query, state, action) => {
        if (action && action.name === 'clear') {
            const parent = action.closest('.filter-wrapper');

            if (parent) {
                const input = parent.querySelector('input');

                if (input) {
                    input.value = '';

                    const field = action.dataset?.field;

                    if (field) {
                        state[field] = '';
                    }
                }
            }
        }

        const filter = {};

        Object.keys(elements).forEach((key) => {
            const el = elements[key];

            if (!el) return;

            if (
                ['INPUT', 'SELECT'].includes(el.tagName) &&
                el.value
            ) {
                // ❗ ВАЖНО: убрали filter[...] — часто не поддерживается API
                filter[el.name] = el.value;
            }
        });

        return Object.keys(filter).length
            ? Object.assign({}, query, filter)
            : query;
    };

    return {
        updateIndexes,
        applyFiltering
    };
}