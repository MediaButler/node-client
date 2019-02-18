module.exports = class mediabutlerSonarr {
    constructor({ mbService }) {
        this.mbService = mbService;
    }

    async getShows() {
        try {
            const req = await this.mbService._get('sonarr');
            return req;
        } catch (err) { throw err; }
    }

    async getShowById(id) {
        try {
            const req = await this.mbService._get(`sonarr/${id}`);
            return req;
        } catch (err) { throw err; }
    }

    async getCalendar() {
        try {
            const req = await this.mbService._get(`sonarr/calendar`);
            return req;
        } catch (err) { throw err; }
    }

    async getProfiles() {
        try {
            const req = await this.mbService._get(`sonarr/profile`);
            return req;
        } catch (err) { throw err; }
    }

    async getRoots() {
        try {
            const req = await this.mbService._get('sonarr/rootpath');
            return req;
        } catch (err) { throw err; }
    }

    async getHistory() {
        try {
            const req = await this.mbService._get(`sonarr/history`);
            return req;
        } catch (err) { throw err; }
    }

    async getStatus() {
        try {
            const req = await this.mbService._get(`sonarr/status`);
            return req;
        } catch (err) { throw err; }
    }

    async getShowLookup(query) {
        try {
            const req = await this.mbService._get(`sonarr/lookup`, {query});
            return req;
        } catch (err) { throw err; }
    }

    async getSearchEpisode() {
        try {
            const req = await this.mbService._get(`sonarr/search`);
            return req;
        } catch (err) { throw err; }
    }

    async postSearchEpisode(item) {
        try {
            const req = await this.mbService._post(`sonarr/search`, item);
            return req;
        } catch (err) { throw err; }
    }

    async getQueue() {
        try {
            const req = await this.mbService._get(`sonarr/queue`);
            return req;
        } catch (err) { throw err; }
    }

    async postQueue(item) {
        try {
            const req = await this.mbService._post(`sonarr/queue`, item);
            return req;
        } catch (err) { throw err; }
    }
}