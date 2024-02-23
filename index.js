'use strict';
import { getPeers } from './tracker.js'
import { infoHash, open, parseUrl, size } from './torrent-parser.js'

const torrent = open('test.torrent')

getPeers(torrent, peers => {
    console.log('list of peers: ', peers)
})



