module.exports = class mediabutlerTv {
    constructor({ mbService }) {
        this.mbService = mbService;
    }

    async getShow(query) {
        try {
            const req = await this.mbService._get(`tv`, {query});
            return req;
        } catch (err) { throw err; }
    }

    async getActorsById(id) {
        try {
            const req = await this.mbService._get(`tv/${id}/actors`);
            return req;
        } catch (err) { throw err; }
    }

    async getEpisodesById(id) {
        try {
            const req = await this.mbService._get(`tv/${id}/episodes`);
            return req;
        } catch (err) { throw err; }
    }

    async getImagesById(id) {
        try {
            const req = await this.mbService._get(`tv/${id}/images`);
            return req;
        } catch (err) { throw err; }
    }

    async getShowById(id) {
        try {
            const req = await this.mbService._get(`tv/${id}`);
            return req;
        } catch (err) { throw err; }
    }
}