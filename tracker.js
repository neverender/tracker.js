var Connect = require('connect');
var Bencode = require('bencode');
var sys = require('sys');
var peer = require('./peer.js');
var client = require("./vendor/redis-node-client/lib/redis-client").createClient();
var url = require('url');

var server = Connect.createServer(
  // Connect.logger(),
    Connect.staticProvider(__dirname + '/public'),
    
    function(req, res) {
        
        if(req.headers['x-forwarded-for'] == null) {
            ip_address = req.socket.remoteAddress;
        } else {
            ip_address = req.headers['x-forwarded-for'];
        }

        this.url = url.parse(req.url, true);

        peer_id = this.url['query']['peer_id'];
        info_hash = this.url['query']['info_hash'];
        remote_port = this.url['query']['port'];
        key = this.url['query']['key'];
        
        client.sadd(info_hash, key + ',' + ip_address + ',' + remote_port,  function(err, success) {
           // sys.puts(success);
        });
        
        client.smembers(info_hash, function(err, peers) {
                   res.writeHead(200, {'Content-Type': 'text/plain'});
                   res.end(format(peers));
                   sys.puts(format(peers));
        });
});

format = function(peers) {
    peer_list = [];
    
    for (var i in peers) {
        array = peers[i].toString().split(',');
        small_peer = peer.compact(array[0], array[1], array[2])
        peer_list.push(small_peer);  
    }
    
    new_peer_list = peer_list.join('');
    hash = { interval: 5, 'tracker id': 'trackertracker', 'peers': new_peer_list};
    
    return Bencode.encode(hash);
}

server.listen(3100);