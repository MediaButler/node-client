module.exports = class mediabutlerRadarr4k {
    constructor({ mbService }) {
        this.mbService = mbService;
    }

    async getMovies() {
        try {
            const req = await this.mbService._get('radarr4k');
            return req;
        } catch (err) { throw err; }
    }

    async getMovieId() {
        try {
            const req = await this.mbService._get(`radarr4k/${id}`);
            return req;
        } catch (err) { throw err; }
    }

    async getProfiles() {
        try {
            const req = await this.mbService._get(`radarr4k/profile`);
            return req;
        } catch (err) { throw err; }
    }

    async getRoots() {
        try {
            const req = await this.mbService._get('radarr4k/rootpath');
            return req;
        } catch (err) { throw err; }
    }

    async getCalendar() {
        try {
            const req = await this.mbService._get('radarr4k/calendar');
            return req;
        } catch (err) { throw err; }
    }

    async getHistory() {
        try {
            const req = await this.mbService._get('radarr4k/history');
            return req;
        } catch (err) { throw err; }
    }

    async getStatus() {
        try {
            const req = await this.mbService._get('radarr4k/status');
            return req;
        } catch (err) { throw err; }
    }

    async getMovieLookup(query) {
        try {
            const req = await this.mbService._get('radarr4k/lookup', {query});
            return req;
        } catch (err) { throw err; }
    }

    async getSearchEpisode() {
        try {
            const req = await this.mbService._get('radarr4k/search');
            return req;
        } catch (err) { throw err; }
    }

    async postSearchEpisode(item) {
        try {
            const req = await this.mbService._post('radarr4k/search', item);
            return req;
        } catch (err) { throw err; }
    }

    async getQueue() {
        try {
            const req = await this.mbService._get('radarr4k/queue');
            return req;
        } catch (err) { throw err; }
    }

    async postQueue(item) {
        try {
            const req = await this.mbService._post('radarr4k/queue', item);
            return req;
        } catch (err) { throw err; }
    }
}