module.exports = class mediabutlerRadarr {
    constructor({ mbService }) {
        this.mbService = mbService;
    }

    async getMovies() {
        try {
            const req = await this.mbService._get('radarr');
            return req;
        } catch (err) { throw err; }
    }

    async getMovieId() {
        try {
            const req = await this.mbService._get(`radarr/${id}`);
            return req;
        } catch (err) { throw err; }
    }
    async getProfiles() {
        try {
            const req = await this.mbService._get(`radarr/profile`);
            return req;
        } catch (err) { throw err; }
    }

    async getRoots() {
        try {
            const req = await this.mbService._get('radarr/rootpath');
            return req;
        } catch (err) { throw err; }
    }

    async getCalendar() {
        try {
            const req = await this.mbService._get('radarr/calendar');
            return req;
        } catch (err) { throw err; }
    }

    async getHistory() {
        try {
            const req = await this.mbService._get('radarr/history');
            return req;
        } catch (err) { throw err; }
    }

    async getStatus() {
        try {
            const req = await this.mbService._get('radarr/status');
            return req;
        } catch (err) { throw err; }
    }

    async getMovieLookup(query) {
        try {
            const req = await this.mbService._get('radarr/lookup', {query});
            return req;
        } catch (err) { throw err; }
    }

    async getSearchEpisode() {
        try {
            const req = await this.mbService._get('radarr/search');
            return req;
        } catch (err) { throw err; }
    }

    async postSearchEpisode(item) {
        try {
            const req = await this.mbService._post('radarr/search', item);
            return req;
        } catch (err) { throw err; }
    }

    async getQueue() {
        try {
            const req = await this.mbService._get('radarr/queue');
            return req;
        } catch (err) { throw err; }
    }

    async postQueue(item) {
        try {
            const req = await this.mbService._post('radarr/queue', item);
            return req;
        } catch (err) { throw err; }
    }
}