this.compact = function(key, ip, port) {
	this.key = key;
	this.ip = ip;
	this.port = port;
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
};
