'use strict';

import fs from 'fs'
import bencode from 'bencode'

export const open = (filepath) => {
    return bencode.decode(fs.readFileSync(filepath))
}

export const size = (torrent) => {
    const size = torrent.info.files ? torrent.info.files.map(file => file.length).redue((a, b) => a + b) : torrent.info.length
    return BigInt.toBuffer(size, {size: 8})
}

export const infoHash = (torrent) => {
    const info = bencode.encode(torrent.info)
    return crypto.createHash('sha1').update(info).digest()
}