module.exports = class mediabutlerTrakt {
    constructor({ mbService }) {
        this.mbService = mbService;
    }

    async getUrl() {
        try {
            const req = await this.mbService._get('trakt');
            return req;
        } catch (err) { throw err; }
    }

    async authenticate(code) {
        try {
            const req = await this.mbService._post('trakt', {code});
            return req;
        } catch (err) { throw err; }
    }
}