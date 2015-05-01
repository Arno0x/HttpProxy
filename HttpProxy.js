/**
 * HttpProxy - for NodeJS
 *
 * @author Arno0x0x - https://twitter.com/Arno0x0x
 * @license GPLv3 - licence available here: http://www.gnu.org/copyleft/gpl.html
 * @link https://github.com/Arno0x/
 *
 * This script implements a VERY BASIC http proxy, handling connections between a client and an origin server.
 * Beware: this is not a reverse proxy for rather a standard foward proxy

 * As opposed to quite some HttpProxy for NodeJS scripts I could find on the web, this one supports :
 *  - HTTP connections
 *  - HTTPS connections through the CONNECT method
 *  - Forwarding data passed in the client request body following a POST request
 *  - Forwarding trafic to an upstream proxy
 * 
 *        (client) <---> (proxy) <---> (origin server)
 * or, with an upstream proxy:
 *        (client) <---> (proxy) <---> (upstream proxy) <---> (origin server)
 *
 * The whole configuration is made through the config.js file that must be present in the same directory
 * as this script.
 */


// Load the configuration file. It must be present in the same directory as this script
var config = require('./config.js');

// Load required NodeJS core modules
var http = require('http');
var net = require('net');

//========================================================================
// Debug function outputs the message to the console log only if
// debug is enabled in the config file
//========================================================================
function log (msg) {
  if (config.debug === false) return;

  console.log ('[DEBUG] '+msg);
}

//========================================================================
// Let's create an http server, which will be used as a proxy server.
// The callback function is attached to the 'request' event which fires as soon as
// a incoming request is to be treated
//========================================================================
var proxyServer = http.createServer(function (clientRequest, proxyResponse) {

  log('>>>>>>>> HTTP connection received from '+clientRequest.socket.remoteAddress+':'+clientRequest.socket.remotePort);

  // Parse the request URL to later extract various information we need
  var requestUrl = require('url').parse(clientRequest.url);

  // Check whether or not we're forwarding trafic to an upstream server or to the origin server
  var forwardToHost = (config.upstreamproxy.enable === true) ? config.upstreamproxy.host : requestUrl['hostname'];
  var forwardToPort = (config.upstreamproxy.enable === true) ? config.upstreamproxy.port : (requestUrl['port'] === null) ? 80 : requestUrl['port'];

  // Prepare the parameters that will be used for the request to the origin server
  var options = {
    hostname : forwardToHost,
    port : forwardToPort,
    method : clientRequest.method,
    headers : clientRequest.headers,
    path : clientRequest.url
  };

  log('Client request is '+clientRequest.method+' '+clientRequest.url);

  try {
    log('Forwarding request to '+forwardToHost+':'+forwardToPort);
    var proxyRequest = http.request(options);
  } catch (err) {
    console.log(err.message);
  }

  // Attach a callback function for 'response' event
  proxyRequest.on('response', function (serverResponse) {
    proxyResponse.writeHead(serverResponse.statusCode, serverResponse.headers);

    // From this response, callback as soon as 'data' event fires, meaning there's data to be read
    serverResponse.on('data', function (data) {
      proxyResponse.write(data);
    });

    serverResponse.on('end', function () {
      proxyResponse.end();
    });
  });

  //========================================================================
  // Handle client request body: there will be some data to pass on in case
  // of a POST request from the client
  //========================================================================
  proxyRequest.on('data', function (data) {
    proxyRequest.write(data);
  });

  proxyRequest.end();
});

//========================================================================
// Handling CONNECT method requests
//========================================================================
proxyServer.on('connect', function (clientRequest, clientSocket, head) {

  log('>>>>>>>> HTTPS (CONNECT) connection received from '+clientSocket.remoteAddress+':'+clientSocket.remotePort);
  log('Client request is '+clientRequest.method+' '+clientRequest.url);

  // Parse the client request URL to later extract the various information we need
  var connectTo = clientRequest.url.split(':');

  // Check whether or not we're forwarding trafic to an upstream server or to the origin server
  var forwardToHost = (config.upstreamproxy.enable === true) ? config.upstreamproxy.host : connectTo[0];
  var forwardToPort = (config.upstreamproxy.enable === true) ? config.upstreamproxy.port : connectTo[1];

  var socketParam = {
    host : forwardToHost,
    port : forwardToPort
  };

  log('Forwarding request to '+forwardToHost+':'+forwardToPort);

  var upStreamSocket = net.connect (socketParam, function () {
    
    // WARN !
    // The behavior is completely different whether we're using an upstream proxy server
    // or if we're connecting straight to the origin server

    // If we're using an upstream proxy, we need to forward the CONNECT request exactly
    // as received from the client
    if (config.upstreamproxy.enable === true) {
      upStreamSocket.write('CONNECT '+clientRequest.url+'\n\n');
      upStreamSocket.write(head);
    }
    // Else, if we're connecting to the origin server, the proxy replies that the tunneled
    // connection is established
    else {
      clientSocket.write('HTTP/'+clientRequest.httpVersion+' 200 Connection established\n\n');
      upStreamSocket.write(head);
    }   
  });

  // Acting as a simple TCP relay, basically:
  //  - when data is received on the upstream socket, forward it to the client
  //  - when data is received on the client socket, forward it to the upstream server or proxy
  clientSocket.on('data', function (data) {
    upStreamSocket.write(data);
  });

  upStreamSocket.on('data', function (data) {
    clientSocket.write(data);
  });

  clientSocket.on('error', function (error) {
    console.log(error);
    //console.log(error.stack);
  });

  upStreamSocket.on('error', function (error) {
    console.log(error);
    //console.log(error.stack);
  });

  clientSocket.on('close', function (had_error) {
    upStreamSocket.end();
  });

  upStreamSocket.on('close', function (had_error) {
    clientSocket.end();
  });
});

//========================================================================
// Start the proxy server
//========================================================================
proxyServer.listen(config.proxy.port, config.proxy.bindInterface);
console.log('HTTP Proxy listening on '+config.proxy.bindInterface+':'+config.proxy.port);