const axios = require('axios');
const url = require('url');
const events = require('events');
const mediabutlerLidarr = require('./lib/lidarr');
const mediabutlerMovie = require('./lib/movie');
const mediabutlerPlex = require('./lib/plex');
const mediabutlerRadarr = require('./lib/radarr');
const mediabutlerRadarr3d = require('./lib/radarr3d');
const mediabutlerRadarr4k = require('./lib/radarr4k');
const mediabutlerRequest = require('./lib/request');
const mediabutlerSonarr = require('./lib/sonarr');
const mediabutlerSonarr4k = require('./lib/sonarr4k');
const mediabutlerTautulli = require('./lib/tautulli');
const mediabutlerTrakt = require('./lib/trakt');
const mediabutlerTv = require('./lib/tv');
const mediabutlerUser = require('./lib/user');
const apiTarget = '1.1.9';

module.exports = class mbService {
    constructor({ serverUrl, machineId, clientId }) {
        this.emitter = new events.EventEmitter();
        if (!serverUrl) throw new Error('serverUrl not provided');
        if (!machineId) throw new Error('machineId not provided');
        if (!clientId) throw new Error('clientId not provided');
        if (serverUrl.slice(-1) != '/') serverUrl = `${serverUrl}/`;
        this.serverUrl = serverUrl;
        this.machineId = machineId;
        this.clientId = clientId;
        this.mburl = url.parse(serverUrl);
        this.lidarr = new mediabutlerLidarr({mbService: this});
        this.movie = new mediabutlerMovie({mbService: this});
        this.plex = new mediabutlerPlex({mbService: this});
        this.radarr = new mediabutlerRadarr({mbService: this});
        this.radarr3d = new mediabutlerRadarr3d({mbService: this});
        this.radarr4k = new mediabutlerRadarr4k({mbService: this});
        this.request = new mediabutlerRequest({mbService: this});
        this.sonarr = new mediabutlerSonarr({mbService: this});
        this.sonarr4k = new mediabutlerSonarr4k({mbService: this});
        this.tautulli = new mediabutlerTautulli({mbService: this});
        this.trakt = new mediabutlerTrakt({mbService: this});
        this.tv = new mediabutlerTv({mbService: this});
        this.user = new mediabutlerUser({mbService: this});
    }

    async loginPlexToken(authToken) {
        try {
            const req = await axios.post("https://auth.mediabutler.io/login", { authToken }, { headers: { 'MB-Client-Identifier': this.clientId } });
            const servers = {};
            req.data.servers.map((x) => { servers[x.machineId] = x; });
            if (!servers[this.machineId]) throw new Error('Server not found');
            this.token = servers[this.machineId].token;
            this.version = await this.getVersion();
            this.loggedInUser = await this.user.getMyUser();
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
            this.version = await this.getVersion();
            this.loggedInUser = await this.user.getMyUser();
            this.setupSocket();
            return req.data;
        } catch (err) { throw err; }
    }

    async setupSocket() {
        if (!this.token) throw new Error('Not Logged In');
        const opt = { path: `${this.mburl.path}socket.io`, reconnection: true, reconnectionDelay: 1000, reconnectionDelayMax: (2070 * 1000), reconnectionAttempts: Infinity, pingInterval: 30000, pingTimeout: 1000 };
        this.notificationAgent = require('socket.io-client')(`${this.mburl.protocol}//${this.mburl.host}`, opt);
        this.notificationAgent.on('connect', async (socket) => { this.notificationAgent.emit('authenticate', { token: this.token }); this.emitter.emit('connected'); });
        this.notificationAgent.on('disconnect', async (socket) => { this.emitter.emit('disconnected'); });
        this.notificationAgent.on('request', (data) => { this.emitter.emit('request', data); });
        this.notificationAgent.on('sonarr', (data) => { this.emitter.emit('sonarr', data); });
        this.notificationAgent.on('sonarr4k', (data) => { this.emitter.emit('sonarr4k', data); });
        this.notificationAgent.on('radarr', (data) => { this.emitter.emit('radarr', data); });
        this.notificationAgent.on('radarr4k', (data) => { this.emitter.emit('radarr4k', data); });
        this.notificationAgent.on('radarr3d', (data) => { this.emitter.emit('radarr3d', data); });
        this.notificationAgent.on('tautulli', (data) => { this.emitter.emit('tautulli', data); });
    }

    async getVersion() {
        try {
            const a = await axios.get(`${this.mburl.protocol}//${this.mburl.host}${this.mburl.path}version`, { headers: { 'MB-Client-Identifier': this.clientId } });
            return a.data;
        } catch (err) { throw err; }
    }

    async addPermission(username, permission) {
        try {
            if (!this.loggedInUser.permissions.includes('CAN_ADMIN')) throw new Error('Insufficent Permissions');
            const user = await this.user.getUser(username);
            user.permissions.push(permission);
            const req = await this._put(`user/${username}`, user);
            return req;
        } catch (err) { throw err; }
    }

    async delPermission(username, permission) {
        try {
            if (!this.loggedInUser.permissions.includes('CAN_ADMIN')) throw new Error('Insufficent Permissions');
            const user = await this.user.getUser(username);
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
            const a = await axios({ method: 'get', responseType: 'stream', url: `${this.mburl.protocol}//${this.mburl.host}${this.mburl.path}${command}`, headers: { 'Authorization': `Bearer ${this.mbToken}`, 'MB-Client-Identifier': this.clientId } });
            return a.data;
        } catch (err) { throw err; }
    }
    async _delete(command, data = {}) {
        try {
            if (!this.token) throw new Error('Not Logged In');
            console.log(this.mburl)
            const a = await axios.delete(`${this.mburl.protocol}//${this.mburl.host}${this.mburl.path}${command}`, { data, headers: { 'Authorization': `Bearer ${this.token}`, 'MB-Client-Identifier': this.clientId } });
            return a;
        } catch (err) { throw err; }
    }
    async _put(command, args) {
        try {
            if (!this.token) throw new Error('Not Logged In');
            const a = await axios.put(`${this.mburl.protocol}//${this.mburl.host}${this.mburl.path}${command}`, args, { headers: { 'Authorization': `Bearer ${this.token}`, 'MB-Client-Identifier': this.clientId } });
            return a.data;
        } catch (err) { throw err; }
    }
    async _post(command, args) {
        try {
            if (!this.token) throw new Error('Not Logged In');
            const a = await axios.post(`${this.mburl.protocol}//${this.mburl.host}${this.mburl.path}${command}`, args, { headers: { 'Authorization': `Bearer ${this.token}`, 'MB-Client-Identifier': this.clientId } });
            return a.data;
        } catch (err) { throw err; }
    }

    async _get(command, args = false) {
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
        } catch (err) { throw err; }
    }

    destroy() {
        if (this.notificationAgent) this.notificationAgent.disconnect();
    }
}