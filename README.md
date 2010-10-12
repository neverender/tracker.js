tracker.js
==========

The goal of tracker.js is to have a fully functional bittorent tracker backend. I'd also like to do a nice ui in the future.

Requirements
------------

* node.js
* Redis



I originally wanted to use memcache, so ip addresses wouldnt be stored on disk, but I couldn't find a non crappy node.js memcache client. So I settled with Redis. I might switch from Redis to nStore or something to make it simpler, I'm not sure. Or maybe have an adapter mechanism where you can use whatever you want. Just some ideas.

