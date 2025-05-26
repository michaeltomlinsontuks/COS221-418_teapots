class ProductHandler {
    constructor() {
        this.products = [];
        this.brands = [];
        this.categories = [];
        this.companies = [];
    }

    async initialize() {
        await this.loadBrands();
        await this.loadCategories();
        await this.loadCompanies();
    }

    async loadBrands() {
        const response = await this.sendRequest({
            type: "getbrands",
            api_key: getLoginCookie().api_key
        });
        if (response.status === "success") {
            this.brands = response.data;
        }
    }

    async loadCategories() {
        const response = await this.sendRequest({
            type: "getcategories", 
            api_key: getLoginCookie().api_key
        });
        if (response.status === "success") {
            this.categories = response.data;
        }
    }

    async loadCompanies() {
        const response = await this.sendRequest({
            type: "getcompanies",
            api_key: getLoginCookie().api_key
        });
        if (response.status === "success") {
            this.companies = response.data;
        }
    }

    async sendRequest(data) {
        const requestHeaderData = getLocalCredentials();
        const response = await fetch(requestHeaderData.host, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(requestHeaderData.username + ':' + requestHeaderData.password)
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    }
}