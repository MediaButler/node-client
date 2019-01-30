const axios = require('axios');
const url = require('url');
const events = require('events');
const emitter = new events.EventEmitter();

module.exports = class mbService {
    constructor(settings, guild = false, startup = false) {
        this._settings = settings;
        this.clientId = 'fc5e13ca-e0ab-4d15-8dbd-9cf915ee6c0a';
        if (guild) this.guild = guild;
        if (!settings.mbUrl) throw new Error('URL not set');
        if (!settings.mbToken) throw new Error('APIKey not set');
        if (settings.mbUrl.slice(-1) != '/') settings.mbUrl = `${settings.mbUrl}/`;
        this.mburl = url.parse(settings.mbUrl);
        this.logChannel = false;
        if (settings.logChannel) this.logChannel = settings.logChannel;
        this.getMyUser().then((user) => {
            this.user = user;
        });
        if (startup) {
            this.notificationAgent = require('socket.io-client')(`${this.mburl.protocol}//${this.mburl.host}`, { path: `${this.mburl.path}socket.io`, reconnection: true, reconnectionDelay: 1000, reconnectionDelayMax: (2070 * 1000), reconnectionAttempts: Infinity, pingInterval: 30000, pingTimeout: 1000 });
            this.notificationAgent.on('connect', async (socket) => {
                this.notificationAgent.emit('authenticate', { token: settings.mbToken });

            });
            this.notificationAgent.on('disconnect', async (socket) => {
            });
            this.notificationAgent.on('request', (data) => { this.requestMessage(data); });
            this.notificationAgent.on('sonarr', (data) => { this.tvshowMessage(data); });
            this.notificationAgent.on('sonarr4k', (data) => { this.tvshowMessage(data, true); });
            this.notificationAgent.on('radarr', (data) => { this.movieMessage(data); });
            this.notificationAgent.on('radarr4k', (data) => { this.movieMessage(data, true); });
            this.notificationAgent.on('radarr3d', (data) => { this.movieMessage(data, false, true); });
            //this.notificationAgent.on('plex', (data) => { this.plexMessage(data); });
            this.notificationAgent.on('tautulli', (data) => { this.tautulliMessage(data); });
        }
    }

    async _checkPlugins(plugins = []) {
        this.enabledPlugins = new Array();
        this.disabledPlugins = new Array();
        if (plugins.length == 0) return setTimeout(() => { this._checkPlugins(plugins) }, 5000);
        for (let i = 0; i < plugins.length; i++) {
            try {
                const r = await this._get(plugins[i]);
                this.enabledPlugins.push(plugins[i]);
            } catch (err) {
                if (err.response && err.response.status == 400 && err.response.data.name == 'NotEnabled') {
                    this.disabledPlugins.push(plugins[i]);
                } else { this.enabledPlugins.push(plugins[i]); }
            }
        }
    }

    async getVersion() {
        const req = await this._get('version');
        return req;
    }

    // RULES
    async getAllRules() {
        const req = await this._get('rules');
        return req;
    }

    // REQUESTS
    async addRequest(request) {
        const req = await this._post('requests', request);
        return req;
    }

    async delRequest(id) {
        const req = await this._delete(`requests/${id}`, { confirmed: true });
        return req;
    }

    async approveRequest(id, args = {}) {
        try {
            const req = await this._post(`requests/${id}`, args);
            return req;
        } catch (err) { throw err; }
    }

    async getRequests() {
        const requests = await this._get('requests');
        return requests;
    }

    async addAllowApprove(username, types) {
        const data = { username, types };
        const req = await this._post('requests/allowapprove', data);
    }

    async getAllowApprove() {
        try {
            const req = await this._get('requests/allowapprove');
            return req;
        } catch (err) { throw err; }
    }

    async getAllowApproveForUsername(username) {
        try {
            const req = await this._get(`requests/allowapprove/${username}`);
            return req;
        } catch (err) { throw err; }
    }

    async updateAllowApprove(username, types, shouldReplace = false) {
        try {
            const req = await this._put(`requests/allowapprove/${username}`, { types, replace: shouldReplace });
            return req;
        } catch (err) { throw err; }
    }

    async deleteAllowApprove(username) {
        try {
            const req = await this._delete(`requests/allowapprove/${username}`);
            return req;
        } catch (err) { throw err; }
    }

    async addAutoApprove(username, types) {
        const data = { username, types };
        const req = await this._post('requests/autoapprove', data);
    }

    async getAutoApprove() {
        try {
            const req = await this._get('requests/autoapprove');
            return req;
        } catch (err) { throw err; }
    }

    async getAutoApprove(username) {
        try {
            const req = await this._get(`requests/autoapprove/${username}`);
            return req;
        } catch (err) { throw err; }
    }

    async updateAutoApprove(username, types, shouldReplace = false) {
        try {
            const req = await this._put(`requests/autoapprove/${username}`, { types, replace: shouldReplace });
            return req;
        } catch (err) { throw err; }
    }

    async deleteAutoApprove(username) {
        try {
            const req = await this._delete(`requests/autoapprove/${username}`);
            return req;
        } catch (err) { throw err; }
    }

    async getCalendarSonarr() {
        try {
            const req = await this._get('sonarr/calendar');
            return req;
        } catch (err) { throw err; }
    }

    async getCalendarRadarr() {
        try {
            const req = await this._get('radarr/calendar');
            return req;
        } catch (err) { throw err; }
    }

    async getNowPlaying() {
        try {
            const req = await this._get('tautulli/activity');
            return req;
        } catch (err) { throw err; }
    }

    async searchAudio(terms) {
        try {
            const req = await this._get(`plex/search/audio?query=${encodeURIComponent(terms)}`);
            return req;
        } catch (err) { throw err; }
    }

    async getTautulliHistory(user) {
        try {
            const params = {user};
            const req = await this._get('tautulli/history', params);
            return req.response;
        } catch (err) { throw err; }
    }

    async getTraktUrl() {
        try {
            const req = await this._get('trakt');
            return req;
        } catch (err) { throw err; }
    }

    async setTraktToken(code) {
        try {
            const req = await this._post('trakt', { code });
            return req;
        } catch (err) { throw err; }
    }

    async getMyUser() {
        try {
            const req = await this._get('user/@me');
            return req;
        } catch (err) { throw err; }
    }

    async getUser(username) {
        try {
            const req = await this._get(`user/${username}`);
            return req;
        } catch (err) { throw err; }
    }

    async addPermission(username, permission) {
        try {
            const user = await this.getUser(username);
            user.permissions.push(permission);
            const req = await this._put(`user/${username}`, user);
            return req;
        } catch (err) { throw err; }
    }

    async delPermission(username, permission) {
        try {
            const user = await this.getUser(username);
            if (user.permissions.indexOf(permission) == -1) return;
            user.permissions.splice(user.permissions.indexOf(permission), 1);
            const req = await this._put(`user/${username}`, user);
            return req;
        } catch (err) { throw err; }
    }

    async _getPipe(command) {
        try {
            if (command.startsWith('/')) command = command.substring(1, command.length);
            const a = await axios({ method: 'get', responseType: 'stream', url: `${this._settings.mbUrl}${command}`, headers: { 'Authorization': `Bearer ${this._settings.mbToken}`, 'MB-Client-Identifier': this.clientId } });
            return a.data;
        } catch (err) {
            if (err.response && err.response.status == 400 && err.response.data.name == 'NotFound') throw new Error('Plugin is not enabled');
            else throw err;
        }
    }

    async _delete(command, data = {}) {
        try {
            const a = await axios.delete(`${this._settings.mbUrl}${command}`, { data, headers: { 'Authorization': `Bearer ${this._settings.mbToken}`, 'MB-Client-Identifier': this.clientId } });
            return a;
        } catch (err) {
            if (err.response.status == 400 && err.response.data.name == 'NotFound') throw new Error('Plugin is not enabled');
            else throw err;
        }
    }
    async _put(command, args) {
        try {
            const a = await axios.put(`${this._settings.mbUrl}${command}`, args, { headers: { 'Authorization': `Bearer ${this._settings.mbToken}`, 'MB-Client-Identifier': this.clientId } });
            return a.data;
        } catch (err) {
            if (err.response.status == 400 && err.response.data.name == 'NotFound') throw new Error('Plugin is not enabled');
            else throw err;
        }
    }
    async _post(command, args) {
        try {
            const a = await axios.post(`${this._settings.mbUrl}${command}`, args, { headers: { 'Authorization': `Bearer ${this._settings.mbToken}`, 'MB-Client-Identifier': this.clientId } });
            return a.data;
        } catch (err) {
            if (err.response.status == 400 && err.response.data.name == 'NotFound') throw new Error('Plugin is not enabled');
            else throw err;
        }
    }
    async _get(command, args) {
        try {
            let params = '?';
			if (typeof (args) == 'object') {
				for (let key of Object.keys(args)) {
					params += `${key}=${args[key]}&`;
				}
            }
            const a = await axios.get(`${this.mburl.protocol}//${this.mburl.host}${this.mburl.path}${command}${params}`, { headers: { 'Authorization': `Bearer ${this._settings.mbToken}`, 'MB-Client-Identifier': this.clientId } });
            return a.data;
        } catch (err) {
            if (err.response && err.response.status == 400 && err.response.data.name == 'NotFound') throw new Error('Plugin is not enabled');
            else throw err;
        }
    }

    destroy() {
        if (this.notificationAgent) this.notificationAgent.disconnect();
    }
}