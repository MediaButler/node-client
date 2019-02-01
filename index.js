const axios = require('axios');
const url = require('url');
const events = require('events');
const emitter = new events.EventEmitter();

module.exports = class mbService {
    constructor({ serverUrl, machineId, clientId }) {
        if (!serverUrl) throw new Error('serverUrl not provided');
        if (!machineId) throw new Error('machineId not provided');
        if (!clientId) throw new Error('clientId not provided');
        if (serverUrl.slice(-1) != '/') serverUrl = `${serverUrl}/`;
        this.serverUrl = serverUrl;
        this.machineId = machineId;
        this.clientId = clientId;
        this.mburl = url.parse(serverUrl);
        this.getVersion().then((version) => { this.version = version; })
    }

    async loginPlexToken(authToken) {
        try {
            const req = await axios.post("https://auth.mediabutler.io/login", { authToken }, { headers: { 'MB-Client-Identifier': this.clientId } });
            const servers = {};
            req.data.servers.map((x) => { servers[x] = x; });
            if (!servers[this.machineId]) throw new Error('Server not found');
            this.token = servers[this.machineId];
            this.user = await this.getMyUser();
            this.setupSocket();
            return req.data;
        } catch (err) { throw err; }
    }

    async loginUserPass(username, password) {
        try {
            const req = await axios.post("https://auth.mediabutler.io/login", { username, password }, { headers: { 'MB-Client-Identifier': this.clientId } });
            const servers = {};
            req.data.servers.map((x) => { servers[x] = x; });
            if (!servers[this.machineId]) throw new Error('Server not found');
            this.token = servers[this.machineId];
            this.user = await this.getMyUser();
            this.setupSocket();
            return req.data;
        } catch (err) { throw err; }
    }

    async setupSocket() {
        if (!this.token) throw new Error('Not Logged In');
        const opt = { path: `${this.mburl.path}socket.io`, reconnection: true, reconnectionDelay: 1000, reconnectionDelayMax: (2070 * 1000), reconnectionAttempts: Infinity, pingInterval: 30000, pingTimeout: 1000 };
        this.notificationAgent = require('socket.io-client')(`${this.mburl.protocol}//${this.mburl.host}`, opt);
        this.notificationAgent.on('connect', async (socket) => { this.notificationAgent.emit('authenticate', { token: this.token }); emitter.emit('connected'); });
        this.notificationAgent.on('disconnect', async (socket) => { emitter.emit('disconected'); });
        this.notificationAgent.on('request', (data) => { emitter.emit('request', data); });
        this.notificationAgent.on('sonarr', (data) => { emitter.emit('sonarr', data); });
        this.notificationAgent.on('sonarr4k', (data) => { emitter.emit('sonarr4k', data); });
        this.notificationAgent.on('radarr', (data) => { emitter.emit('radarr', data); });
        this.notificationAgent.on('radarr4k', (data) => { emitter.emit('radarr4k', data); });
        this.notificationAgent.on('radarr3d', (data) => { emitter.emit('radarr3d', data); });
        this.notificationAgent.on('tautulli', (data) => { emitter.emit('tautulli', data); });
    }

    async getVersion() {
        try {
            const a = await axios.get(`${this.mburl.protocol}//${this.mburl.host}${this.mburl.path}version`, { headers: { 'MB-Client-Identifier': this.clientId } });
            return a.data;
        } catch (err) { throw err; }
    }

    // RULES
    async getAllRules() {
        try {
            const req = await this._get('rules');
            return req;
        } catch (err) { throw err; }
    }

    // REQUESTS
    async addRequest(request) {
        try {
            const req = await this._post('requests', request);
            return req;
        } catch (err) { throw err; }
    }

    async delRequest(id) {
        try {
            const req = await this._delete(`requests/${id}`);
            return req;
        } catch (err) { throw err; }
    }

    async approveRequest(id, args = {}) {
        try {
            const req = await this._post(`requests/${id}`, args);
            return req;
        } catch (err) { throw err; }
    }

    async getRequests() {
        try {
            const req = await this._get('requests');
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
            const params = { user };
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
            if (!this.user.permissions.includes('CAN_ADMIN')) throw new Error('Insufficent Permissions');
            const req = await this._get(`user/${username}`);
            return req;
        } catch (err) { throw err; }
    }

    async addPermission(username, permission) {
        try {
            if (!this.user.permissions.includes('CAN_ADMIN')) throw new Error('Insufficent Permissions');
            const user = await this.getUser(username);
            user.permissions.push(permission);
            const req = await this._put(`user/${username}`, user);
            return req;
        } catch (err) { throw err; }
    }

    async delPermission(username, permission) {
        try {
            if (!this.user.permissions.includes('CAN_ADMIN')) throw new Error('Insufficent Permissions');
            const user = await this.getUser(username);
            if (user.permissions.indexOf(permission) == -1) return;
            user.permissions.splice(user.permissions.indexOf(permission), 1);
            const req = await this._put(`user/${username}`, user);
            return req;
        } catch (err) { throw err; }
    }

    async _getPipe(command) {
        try {
            if (!this.token) throw new Error('Not Logged In');
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
            if (!this.token) throw new Error('Not Logged In');
            const a = await axios.delete(`${this._settings.mbUrl}${command}`, { data, headers: { 'Authorization': `Bearer ${this.token}`, 'MB-Client-Identifier': this.clientId } });
            return a;
        } catch (err) {
            if (err.response.status == 400 && err.response.data.name == 'NotFound') throw new Error('Plugin is not enabled');
            else throw err;
        }
    }
    async _put(command, args) {
        try {
            if (!this.token) throw new Error('Not Logged In');
            const a = await axios.put(`${this._settings.mbUrl}${command}`, args, { headers: { 'Authorization': `Bearer ${this.token}`, 'MB-Client-Identifier': this.clientId } });
            return a.data;
        } catch (err) {
            if (err.response.status == 400 && err.response.data.name == 'NotFound') throw new Error('Plugin is not enabled');
            else throw err;
        }
    }
    async _post(command, args) {
        try {
            if (!this.token) throw new Error('Not Logged In');
            const a = await axios.post(`${this._settings.mbUrl}${command}`, args, { headers: { 'Authorization': `Bearer ${this.token}`, 'MB-Client-Identifier': this.clientId } });
            return a.data;
        } catch (err) {
            if (err.response.status == 400 && err.response.data.name == 'NotFound') throw new Error('Plugin is not enabled');
            else throw err;
        }
    }
    async _get(command, args) {
        try {
            if (!this.token) throw new Error('Not Logged In');
            let params = '?';
            if (typeof (args) == 'object') {
                for (let key of Object.keys(args)) {
                    params += `${key}=${args[key]}&`;
                }
            }
            const a = await axios.get(`${this.mburl.protocol}//${this.mburl.host}${this.mburl.path}${command}${params}`, { headers: { 'Authorization': `Bearer ${this.token}`, 'MB-Client-Identifier': this.clientId } });
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