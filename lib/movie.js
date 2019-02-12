module.exports = class mediabutlerMovie {
    constructor({ mbService }) {
        this.mbService = mbService;
    }

    async getMovie() {
        try {
            const req = await this.mbService._get('movie');
            return req;
        } catch (err) { throw err; }
    }

    async getMovieById(id) {
        try {
            const req = await this.mbService._get(`movie/${id}`);
            return req;
        } catch (err) { throw err; }
    }
}