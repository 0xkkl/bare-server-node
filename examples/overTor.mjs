import http from 'node:http';
import { SocksProxyAgent } from 'socks-proxy-agent';
import createBareServer from '../dist/createServer.js';

// TOR daemon listens on port 9050 by default
const socksProxyAgent = new SocksProxyAgent(
	`socks://127.0.0.1:${process.env.TOR_PORT || '9050'}`
);

const httpServer = http.createServer();

const bareServer = createBareServer('/', {
	httpAgent: socksProxyAgent,
	httpsAgent: socksProxyAgent,
});

httpServer.on('request', (req, res) => {
	if (bareServer.shouldRoute(req)) {
		bareServer.routeRequest(req, res);
	} else {
		res.writeHead(400);
		res.end('Not found.');
	}
});

httpServer.on('upgrade', (req, socket, head) => {
	if (bareServer.shouldRoute(req)) {
		bareServer.routeUpgrade(req, socket, head);
	} else {
		socket.end();
	}
});

httpServer.on('listening', () => {
	console.log('HTTP server listening');
});

httpServer.listen({
	port: 8080,
});
