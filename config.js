/**
 * This is the config file for the HttpProxy.js script.
 *
 * @author Arno0x0x - https://twitter.com/Arno0x0x
 * @license GPLv3 - licence available here: http://www.gnu.org/copyleft/gpl.html
 * @link https://github.com/Arno0x/
*/

var config = {}

config.proxy = {};
config.upstreamproxy = {};

//----------------------------------------
// Enabling/disabling debug logs. Logs are sent to the console
config.debug = false;

//----------------------------------------
// Proxy server parameters

// Proxy listening TCP port
config.proxy.port = 8080;

// Proxy binding interface
config.proxy.bindInterface = '127.0.0.1';

//----------------------------------------
// Upstream proxy server parameters

// Do we want to use an upstream proxy server ? If 'false', then all other parameters are ignored
// If you plan to use an upstream proxy, set it to 'true'  and set the 2 other parameters below
config.upstreamproxy.enable = false;

// Upstream proxy server hostname, or even IP address
config.upstreamproxy.host = '192.168.0.9'

// Upstream proxy server listening TCP port
config.upstreamproxy.port = 8080;

module.exports = config;