# MediaButler Client

[![](https://img.shields.io/discord/379374148436230144.svg)](https://discord.gg/nH9t5sm)
[![](https://img.shields.io/npm/dt/mediabutler-client.svg)](https://www.npmjs.com/package/mediabutler-client)
[![](https://img.shields.io/npm/v/mediabutler-client.svg)](https://www.npmjs.com/package/mediabutler-client)
[![](https://img.shields.io/snyk/vulnerabilities/npm/mediabutler-client.svg?style=flat)](https://snyk.io/vuln/search?q=mediabutler-client&type=npm)

A Node.js client-side implementation of the [MediaButler Server](https://github.com/MediaButler/Server)

NOTE: This is a code implementation of the client and does not include any front end capabilities.

## How to use

 - Start your project by running `npm init`
 - Include this as a dependancy with `npm install mediabutler-client --save`
 - Include the client inside your code with `const mediabutler = require('mediabutler-client');`
 - Connect to the service with `const service = new mediabutler({ serverUrl: '', machineId: '', clientId: '' });`

