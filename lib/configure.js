module.exports = class mediabutlerConfigure {
    constructor({ mbService }) {
        this.mbService = mbService;
    }

    async getSettings(section) {
        try {
            const req = await this.mbService._get(`configure/${section}/`);
            return req;
        } catch (err) { throw err; }
    }

    async testSettings(section, data) {
        try {
            const req = await this.mbService._put(`configure/${section}/`, data);
            return req;
        } catch (err) { throw err; }
    }

    async saveSettings(section, data) {
        try {
            const req = await this.mbService._get(`configure/${section}/`, data);
            return req;
        } catch (err) { throw err; }
    }

}