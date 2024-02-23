'use strict';

import fs from 'fs'
import bencode from 'bencode'
import crypto from 'crypto'
import url from 'url'

export const open = (filepath) => {
    return bencode.decode(fs.readFileSync(filepath))
}

export const parseUrl = (torrent) => {
    const announce = torrent.announce.toString('utf8')
    const parsedUrl = url.parse(announce)
    return parsedUrl
}

export const size = (torrent) => {
    const size = torrent.info.files ? torrent.info.files.map(file => file.length).redue((a, b) => a + b) : torrent.info.length
    return BigInt(size)
}

export const infoHash = (torrent) => {
    const info = bencode.encode(torrent.info)
    return crypto.createHash('sha1').update(info).digest()
}