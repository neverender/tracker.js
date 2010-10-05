var Connect = require('connect');
var Bencode = require('bencode');
var sys = require('sys');
var client = require("./lib/redis-node-client/lib/redis-client").createClient();
var url = require('url');
//var array = new Array();
var server = Connect.createServer(
  // Connect.logger(),
    Connect.staticProvider(__dirname + '/public'),
    
    function(req, res) {
        
        if(req.headers['x-forwarded-for'] == null) {
            ip_address = req.socket.remoteAddress;
        } else {
            ip_address = req.headers['x-forwarded-for'];
        }

       // console.log(req);
        this.url = url.parse(req.url, true);
        peer_id = this.url['query']['peer_id'];
        info_hash = this.url['query']['info_hash'];
        
        remote_port = this.url['query']['port'];
        key = this.url['query']['key'];
        sys.puts(key);
       
           // console.log(peer_id);
        client.exists('peer:' + peer_id, function(err, does) {
            if(!does) {
                client.hmset('peer:' + peer_id, 'peer_id', peer_id, 'ip', ip_address, 'port', remote_port, function (err, val) {
                    if (err) throw new Error(err);
                });
            }
        });

       // client.hgetall('peer:' + peer_id,  function(err, val) {
         //   sys.puts(val.port); 
        //});
        
        peers = [];
        client.keys('peer:*', function(err, keys) {
            peer_list = keys; 
            peer_list.forEach(function(peer) {
                client.hgetall(peer, function(err, g){
                   peers.push(g); 
                   res.writeHead(200, {'Content-Type': 'text/plain'});
                   res.end(ben(peers));
                  sys.puts(ben(peers));
                });
            });           
        });
     

    }
);


// Classes

var Peer = (function() {
    var Peer = function (peer_id, ip, port) {
        this.peer_id = peer_id;
        this.ip = ip;
        this.port = port;
    };

    Peer.prototype = {
        compact: function() {
            /* TODO: Memoize the output of this every time `peer.port` or `peer.ip` changes */
            var ret = '';
            var ip_parts = this.ip.split('.');
          //  if (ip_parts.length !== 4)
            //    return '';

            for (var i = 0; i < 4; ++i) {
                var n = parseInt(ip_parts[i]);
            //    if (!n || n > 255) {
              //      console.log('Invalid IP: ' + this.ip);
               //     return '';
               // }

                ret += String.fromCharCode(n);
            }

            if (this.port <= 0 || this.port >= 65536)
                return '';

            ret += String.fromCharCode(this.port >> 8);
            ret += String.fromCharCode(this.port & 255);

            return ret;
        }
    };
    return Peer;
})();













ben = function(peers) {
    peer_list = [];
    peers.forEach(function(p) {
        small_peer = new Peer(p.peer_id.toString(), p.ip.toString(), p.port.toString());
        peer_list.push(small_peer);  
        //sys.puts(peer_list);
    });
    
    this.p = peer_list.map(function(p) {
        return p.compact();
    }).join('');
    //sys.puts(this.p);
    //sys.puts(JSON.stringify(peer_list));
    //peer_list.push(peers[0]);
    //sys.puts(peer_list);
    hash = { interval: 5, 'tracker id': 'dkjdkdjdk', 'peers': this.p};
    return Bencode.encode(hash);
}

server.listen(3100);
