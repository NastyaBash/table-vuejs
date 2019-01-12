Vue.component('table-component', {
    template: '#table-template',
    props: {
        data: Array,
        columns: Object,
        filterKey: String,
        elementsPerPage: Number
    },
    data: function () {
        var sortOrders = {}
        for (var key in this.columns) {
            if (this.columns.hasOwnProperty(key)) {
                sortOrders[key] = 1;
            }
        }
        return {
            sortKey: '',
            sortOrders: sortOrders,
            currentPage: 1,
            elementsShown: this.data.length,
            numPages: this.data.length / this.elementsPerPage
        }
    },
    computed: {
        filteredData () {
            var sortKey = this.sortKey
            var filterKey = this.filterKey && this.filterKey.toLowerCase();
            var order = this.sortOrders[sortKey] || 1
            var data = this.data
            if (filterKey) {
                data = data.filter(function (row) {
                    return Object.keys(row).some(function (key) {
                        return String(row[key]).toLowerCase().indexOf(filterKey) > -1
                    })
                })
            }
            if (sortKey) {
                data = data.slice().sort(function (a, b) {
                    a = a[sortKey]
                    b = b[sortKey]
                    if(Number(a) && Number(b)){
                        return Number(a) - Number(b)
                    }
                    return (a === b ? 0 : a > b ? 1 : -1) * order
                })
            }
        
            var start = (this.currentPage-1) * this.elementsPerPage;
            var end = start + this.elementsPerPage;
            this.numPages = Math.ceil(data.length / this.elementsPerPage);
            this.elementsShown = data.length;
            return data.slice(start, end);
        },
        showingData() {
            var start = (this.currentPage-1) * this.elementsPerPage;
            var end = start + this.elementsPerPage;

            if(this.numPages <= 1) {
                return this.elementsShown
            }
            else if(end > this.elementsShown){
                return start + '-' + Number(start + this.filteredData.length);
            }
            return start + '-' + end;
        }

    },
    methods: {
        sortBy(key) {
            this.sortKey = key
            this.sortOrders[key] = this.sortOrders[key] * -1
        },
        change_page(page) {
            this.currentPage = page;
        },
        num_pages(dataLength) {
            return Math.ceil(dataLength / this.elementsPerPage)
        },
        
    }
})


var demo = new Vue({
    el: '#app',
    data: {
        searchQuery: '',
        tableColumns: [],
        tableData: [],
        loading: true,
        elementsPerPage: 8
    },
    mounted () {
        const proxyurl = 'https://cors-anywhere.herokuapp.com/';
        const url = 'https://trello-attachments.s3.amazonaws.com/5bf4237bf2b66a484144e3c7/5bf4237bf2b66a484144e3d2/3f9201692cd610dcdb8bde658aaed59b/initialData.json';

        fetch(proxyurl + url)
        .then(response => response.text())
        .then(res => {
            let parsed = JSON.parse(res.replace(/\,(?!\s*[\{\"\w])/g, ''));
            this.tableData = parsed.items;
            this.tableColumns = parsed.titles;
        }) 
        .catch(error => console.log(error))
        .finally(() => this.loading = false)
    }
})