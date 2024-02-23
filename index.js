'use strict';
import fs from 'fs'
import bencode from 'bencode'
import { getPeers } from './tracker.js'
import { open } from './torrent-parser.js'

const torrent = open('puppy.torrent')

getPeers(torrent, peers => {
    console.log('list of peers: ', peers)
})



