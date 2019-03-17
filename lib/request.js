module.exports = class mediabutlerRequest {
    constructor({ mbService }) {
        this.mbService = mbService;
    }

    async getRequests() {
        try {
            const req = await this.mbService._get('requests');
            return req;
        } catch (err) { throw err; }
    }

    async getRequest(id) {
        try {
            const req = await this.mbService._get(`requests/${id}`);
            return req;
        } catch (err) { throw err; }
    }

    async postRequest(request) {
        try {
            const req = await this.mbService._post('requests', request);
            return req;
        } catch (err) { throw err; }
    }

    async approveRequest(id, opts) {
        try {
            const req = await this.mbService._post(`requests/${id}`, opts);
            return req;
        } catch (err) { throw err; }
    }

    async updateRequest(id, request) {
        try {
            const req = await this.mbService._put(`requests/${id}`, request);
            return req;
        } catch (err) { throw err; }
    }

    async deleteRequest(id) {
        try {
            const req = await this.mbService._delete(`requests/${id}`);
            return req;
        } catch (err) { throw err; }
    }
}