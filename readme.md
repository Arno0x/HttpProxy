HttpProxy for NodeJS
============

Author: Arno0x0x - [@Arno0x0x](http://twitter.com/Arno0x0x)

HttpProxy is well, a forward HTTP Proxy written in Javascript and based on NodeJS libraries and runtime.

HttpProxy is **NOT** a reverse proxy.

I wrote this script :

1. As an exercise to learn NodeJS environment and features. Can you imagine writing a fully functionnal proxy (*ok, no caching nor advanced features, but still...*) in just a few hundred lines ? :)

2. Fulfill the gap in existing Http proxies written with NodeJs that I found and that were all missing something

This script is distributed under the terms of the [GPLv3 licence](http://www.gnu.org/copyleft/gpl.html).


Dependencies
----------------

HttpProxy requires [NodeJS](https://nodejs.org) to run it and that's pretty much it. The script is based only on NodeJS core modules so no additionnal module is required.

Features
-----------

HttpProxy feature are pretty basic:

- Supports HTTP and HTTPS (*through the CONNECT method*) connection

- Supports an optionnal upstream proxy

- Provides some basic logging debug features, easily extensible

Installation
------------

Simply copy the HttpProxy.js and the config.js in the same directory. Edit the config.js to tune the proxy settings.

How does it work ?
-----------------

Simply run the script via NodeJS binary:

    # node HttpProxy.js


Configuration
--------------
Edit the config.js file to match your needs. The comments in the config file are pretty self explanatory.

Todo
--------
This script has not been thoroughly tested so I'm sure there are bugs, security concerns, feature requests etc... Feel free to contact me on my twitter page.