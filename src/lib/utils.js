export function cloneTemplate(templateId) {
    const template = document.getElementById(templateId);

    const clone = template.content.firstElementChild.cloneNode(true);

    const elements = Array.from(clone.querySelectorAll('[data-name]')).reduce((acc, el) => {
        acc[el.dataset.name] = el;
        return acc;
    }, {});

    return {
        container: clone,
        elements: elements
    };
}

export function processFormData(formData) {
    return Array.from(formData.entries()).reduce((result, [key, value]) => {
        result[key] = value;
        return result;
    }, {});
}

export const makeIndex = (arr, field, val) => arr.reduce((acc, cur) => ({
    ...acc,
    [cur[field]]: val(cur)
}), {});

export function getPages(currentPage, maxPage, limit) {
    currentPage = Math.max(1, Math.min(maxPage, currentPage));
    limit = Math.min(maxPage, limit);

    let start = Math.max(1, currentPage - Math.floor(limit / 2));
    let end = start + limit - 1;

    if (end > maxPage) {
        end = maxPage;
        start = Math.max(1, end - limit + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return pages;
}