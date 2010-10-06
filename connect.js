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
        //sys.puts(key);


       // client.hgetall('peer:' + peer_id,  function(err, val) {
         //   sys.puts(val.port); 
        //});
        
        client.sadd(info_hash, peer_id + ',' + ip_address + ',' + remote_port,  function(err, success) {
            sys.puts(success);
        });
        
        client.smembers(info_hash, function(err, peers) {
                  // sys.puts(peers); 
                   res.writeHead(200, {'Content-Type': 'text/plain'});
                   res.end(ben(peers));
                  sys.puts(ben(peers));
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
    
    for (var i in peers) {
    array = peers[i].toString().split(',');

       small_peer = new Peer(array[0], array[1], array[2]);
        //sys.puts(JSON.stringify(small_peer));
        peer_list.push(small_peer);  
        //sys.puts(peer_list);

    }
    
    this.p = peer_list.map(function(p) {
        return p.compact();
    }).join('');
    new_list = [];
    peer_list.forEach(function(p) {
        new_list.push(p.compact());
    });
    //sys.puts(this.p);
    //sys.puts(JSON.stringify(peer_list));
    //peer_list.push(peers[0]);
    //sys.puts(peer_list);
    hash = { interval: 5, 'tracker id': 'dkjdkdjdk', 'peers': this.p};
   // sys.puts(peers);
    return Bencode.encode(hash);
}

server.listen(3100);
