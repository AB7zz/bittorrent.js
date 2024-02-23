'use strict';
import { getPeers } from './src/tracker.js'
import { infoHash, open, parseUrl, size } from './src/torrent-parser.js'

const torrent = open('test.torrent')

getPeers(torrent, peers => {
    console.log('list of peers: ', peers)
})



