import { cloneTemplate } from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях
 */
export function initTable(settings, onAction) {
    const { tableTemplate, rowTemplate, before, after } = settings;
    const root = cloneTemplate(tableTemplate);

    // ===== BEFORE (search/header/filter) =====
    if (before && before.length) {
        [...before].reverse().forEach(subName => {
            root[subName] = cloneTemplate(subName);
            root.container.prepend(root[subName].container);
        });
    }

    // ===== AFTER (pagination) =====
    if (after && after.length) {
        after.forEach(subName => {
            root[subName] = cloneTemplate(subName);
            root.container.append(root[subName].container);
        });
    }

    // ===== EVENTS =====
    root.container.addEventListener('change', () => {
        onAction();
    });

    root.container.addEventListener('reset', () => {
        setTimeout(() => onAction(), 0);
    });

    root.container.addEventListener('submit', (e) => {
        e.preventDefault();
        onAction(e.submitter);
    });

    // ===== RENDER =====
    const render = (data = []) => {
        if (!root.elements || !root.elements.rows) return;

        const nextRows = data.map(item => {
            const row = cloneTemplate(rowTemplate);

            Object.keys(item).forEach(key => {
                if (row.elements[key]) {
                    row.elements[key].textContent = item[key];
                }
            });

            return row.container;
        });

        root.elements.rows.replaceChildren(...nextRows);
    };

    return {
        ...root,
        render
    };
}