'use strict';

import fs from 'fs'
import bencode from 'bencode'
import crypto from 'crypto'
import url from 'url'

export const BLOCK_LEN = Math.pow(2, 14);

export const open = (filepath) => {
    return bencode.decode(fs.readFileSync(filepath))
}

export const parseUrl = (torrent) => {
    const announce = torrent.announce.toString('utf8')
    const parsedUrl = url.parse(announce)
    return parsedUrl
}

export const size = (torrent) => {
    const size = torrent.info.files ? torrent.info.files.map(file => file.length).reduce((a, b) => a + b) : torrent.info.length
    const Bsize = BigInt(size)
    
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(Bsize);

    return buffer
}

export const infoHash = (torrent) => {
    const info = bencode.encode(torrent.info)
    return crypto.createHash('sha1').update(info).digest()
}

export const pieceLen = (torrent, pieceIndex) => {
    const size = torrent.info.files ? torrent.info.files.map(file => file.length).reduce((a, b) => a + b) : torrent.info.length
    const Bsize = BigInt(size)
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(Bsize);
    const totalLength = Number(buffer.readBigUInt64BE());
    const pieceLength = torrent.info['piece length'];
  
    const lastPieceLength = totalLength % pieceLength;
    const lastPieceIndex = Math.floor(totalLength / pieceLength);
  
    return lastPieceIndex === pieceIndex ? lastPieceLength : pieceLength;
};

export const blocksPerPiece = (torrent, pieceIndex) => {
    const pieceLength = pieceLen(torrent, pieceIndex);
    return Math.ceil(pieceLength / BLOCK_LEN);
};

export const blockLen = (torrent, pieceIndex, blockIndex) => {
    const pieceLength = pieceLen(torrent, pieceIndex);
  
    const lastPieceLength = pieceLength % BLOCK_LEN;
    const lastPieceIndex = Math.floor(pieceLength / BLOCK_LEN);
  
    return blockIndex === lastPieceIndex ? lastPieceLength : BLOCK_LEN;
};