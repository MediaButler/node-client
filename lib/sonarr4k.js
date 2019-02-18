module.exports = class mediabutlerSonarr4k {
    constructor({ mbService }) {
        this.mbService = mbService;
    }

    async getShows() {
        try {
            const req = await this.mbService._get('sonarr4k');
            return req;
        } catch (err) { throw err; }
    }

    async getShowById(id) {
        try {
            const req = await this.mbService._get(`sonarr4k/${id}`);
            return req;
        } catch (err) { throw err; }
    }

    async getProfiles() {
        try {
            const req = await this.mbService._get(`sonarr4k/profile`);
            return req;
        } catch (err) { throw err; }
    }

    async getRoots() {
        try {
            const req = await this.mbService._get('sonarr4k/rootpath');
            return req;
        } catch (err) { throw err; }
    }

    async getCalendar() {
        try {
            const req = await this.mbService._get(`sonarr4k/calendar`);
            return req;
        } catch (err) { throw err; }
    }

    async getHistory() {
        try {
            const req = await this.mbService._get(`sonarr4k/history`);
            return req;
        } catch (err) { throw err; }
    }

    async getStatus() {
        try {
            const req = await this.mbService._get(`sonarr4k/status`);
            return req;
        } catch (err) { throw err; }
    }

    async getShowLookup(query) {
        try {
            const req = await this.mbService._get(`sonarr4k/lookup`, {query});
            return req;
        } catch (err) { throw err; }
    }

    async getSearchEpisode() {
        try {
            const req = await this.mbService._get(`sonarr4k/search`);
            return req;
        } catch (err) { throw err; }
    }

    async postSearchEpisode(item) {
        try {
            const req = await this.mbService._post(`sonarr4k/search`, item);
            return req;
        } catch (err) { throw err; }
    }

    async getQueue() {
        try {
            const req = await this.mbService._get(`sonarr4k/queue`);
            return req;
        } catch (err) { throw err; }
    }

    async postQueue(item) {
        try {
            const req = await this.mbService._post(`sonarr4k/queue`, item);
            return req;
        } catch (err) { throw err; }
    }
}