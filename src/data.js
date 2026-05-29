const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

let sellers;
let customers;
let lastResult;
let lastQuery;

const mapRecords = (data) => data.map(item => ({
    id: item.receipt_id,
    date: item.date,
    seller: sellers[item.seller_id],
    customer: customers[item.customer_id],
    total: item.total_amount
}));

export function initData(sourceData) {
    // Преобразуем данные для локального использования
    let localRecords = [];
    let localSellers = [];
    let localCustomers = [];
    let sellersMap = {};
    let customersMap = {};
    
    if (sourceData && sourceData.purchase_records) {
        // Маппинг продавцов
        sourceData.sellers?.forEach(seller => {
            sellersMap[seller.id] = `${seller.first_name} ${seller.last_name}`;
        });
        localSellers = Object.values(sellersMap);
        
        // Маппинг покупателей
        sourceData.customers?.forEach(customer => {
            customersMap[customer.id] = `${customer.first_name} ${customer.last_name}`;
        });
        localCustomers = Object.values(customersMap);
        
        // Преобразуем записи
        localRecords = sourceData.purchase_records.map(record => ({
            id: record.receipt_id,
            date: record.date,
            seller: sellersMap[record.seller_id],
            customer: customersMap[record.customer_id],
            total: record.total_amount
        }));
    }
    
    const getIndexes = async () => {
        if (localSellers.length && localCustomers.length) {
            return { sellers: localSellers, customers: localCustomers };
        }
        
        if (!sellers || !customers) {
            [sellers, customers] = await Promise.all([
                fetch(`${BASE_URL}/sellers`).then(res => res.json()),
                fetch(`${BASE_URL}/customers`).then(res => res.json()),
            ]);
        }

        return { sellers, customers };
    }

    const getRecords = async (query, isUpdated = false) => {
        // Для локальных данных
        if (localRecords.length) {
            let filtered = [...localRecords];
            
            // Фильтрация по дате (частичное совпадение)
            if (query && query.date && query.date !== '') {
                filtered = filtered.filter(item => 
                    item.date.includes(query.date)
                );
            }
            
            // Фильтрация по покупателю (частичное совпадение)
            if (query && query.customer && query.customer !== '') {
                filtered = filtered.filter(item => 
                    item.customer.toLowerCase().includes(query.customer.toLowerCase())
                );
            }
            
            // Фильтрация по продавцу (точное совпадение)
            if (query && query.seller && query.seller !== '') {
                filtered = filtered.filter(item => 
                    item.seller === query.seller
                );
            }
            
            // Поиск (по всем текстовым полям)
            if (query && query.search && query.search !== '') {
                const searchTerm = query.search.toLowerCase();
                filtered = filtered.filter(item => 
                    item.date.includes(searchTerm) ||
                    item.customer.toLowerCase().includes(searchTerm) ||
                    item.seller.toLowerCase().includes(searchTerm)
                );
            }
            
            // Фильтрация по сумме от
            if (query && query.totalFrom && query.totalFrom !== '') {
                const from = parseFloat(query.totalFrom);
                if (!isNaN(from)) {
                    filtered = filtered.filter(item => item.total >= from);
                }
            }
            
            // Фильтрация по сумме до
            if (query && query.totalTo && query.totalTo !== '') {
                const to = parseFloat(query.totalTo);
                if (!isNaN(to)) {
                    filtered = filtered.filter(item => item.total <= to);
                }
            }
            
            // Сортировка
            if (query && query.sort) {
                const [field, order] = query.sort.split(':');
                filtered.sort((a, b) => {
                    let aVal = a[field];
                    let bVal = b[field];
                    
                    if (field === 'date') {
                        aVal = new Date(aVal);
                        bVal = new Date(bVal);
                    }
                    
                    if (order === 'asc') {
                        return aVal > bVal ? 1 : -1;
                    } else {
                        return aVal < bVal ? 1 : -1;
                    }
                });
            }
            
            // Пагинация
            const limit = query && query.limit ? parseInt(query.limit) : 10;
            const page = query && query.page ? parseInt(query.page) : 1;
            const start = (page - 1) * limit;
            const paginated = filtered.slice(start, start + limit);
            
            return {
                total: filtered.length,
                items: paginated
            };
        }
        
        // Для API
        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();

        if (lastQuery === nextQuery && !isUpdated) {
            return lastResult;
        }

        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        const records = await response.json();

        lastQuery = nextQuery;
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };

        return lastResult;
    };

    return {
        getIndexes,
        getRecords
    };
}