'use strict';

import net from 'net'
import { Buffer } from 'buffer'
import { getPeers } from './tracker.js';
import { parse, buildHandshake, buildBitfield, buildCancel, buildChoke, buildHave, buildInterested, buildKeepAlive, buildPiece, buildPort, buildRequest, buildUnchoke, buildUninterested } from './message.js';
import Pieces from './pieces.js'
import Queue from './queue.js';
import fs from 'fs'

export default function downloadTorrent(torrent, path){
    getPeers(torrent, peers => {
        console.log(peers)
        const pieces = new Pieces(torrent)
        const file = fs.openSync(path, 'w')
        peers.forEach(peer => download(peer, torrent, pieces, file))
    })
}

function download(peer, torrent, pieces, file){
    console.log('Peer: ', peer)
    const socket = new net.Socket()
    socket.on('error', console.log)

    socket.connect(peer.port, peer.ip, () => {
        console.log('Sending handshake request to peer', peer)
        socket.write(buildHandshake(torrent))
    })

    const queue = new Queue(torrent)
    onWholeMsg(socket, msg => msgHandler(msg, socket, pieces, queue, torrent, file));
    
}

function msgHandler(msg, socket, pieces, queue, torrent, file) {
    if (isHandshake(msg)){
        console.log('Received handshake response from peer')
        console.log('Sending interested message')
        socket.write(buildInterested())
    }else{
        const m = parse(msg)

        if(m.id === 0) chokeHandler(socket)
        if(m.id === 1) unchokeHandler(socket, pieces, queue)
        if(m.id === 4) haveHandler(socket, pieces, queue, m.payload)
        if(m.id === 5) bitfieldHandler(socket, pieces, queue, m.payload)
        if(m.id === 7) pieceHandler(socket, pieces, queue, torrent, file, m.payload)
    }
}

function chokeHandler(socket) {
    socket.end()
}

function unchokeHandler(socket, pieces, queue) {
    queue.choked = false
    requestPiece(socket, pieces, queue)
}

function haveHandler(payload, socket, requested, queue) {
    const pieceIndex = payload.readUInt32BE(0)
    const queueEmpty = queue.length === 0
    queue.queue(pieceIndex)
    if(queueEmpty) requestPiece(socket, requested, queue)
}

function bitfieldHandler(socket, pieces, queue, payload) {
    const queueEmpty = queue.length === 0
    payload.forEach((byte, i) => {
        for (let j=0; j<8; j++){
            if (byte % 2) queue.queue(i*8+7-j)
            byte = Math.floor(byte/2)
        }
    })
    if(queueEmpty) requestPiece(socket, pieces, queue)
}

function pieceHandler(socket, pieces, queue, torrent, file, pieceResp) {
    console.log('Received piece response', pieceResp)
    pieces.addReceived(pieceResp)

    const offset = pieceResp.index * torrent.info['piece length'] + pieceResp.begin
    console.log('handeling piece', offset)
    fs.write(file, pieceResp.block, 0, pieceResp.block.length, offset, () => {})

    if(pieces.isDone()){
        console.log("FINISHED DOWNLOADING!")
        socket.end()
        try { fs.closeSync(file); } catch(e) {}
    }else{
        requestPiece(socket, pieces, queue);
    }
}

function requestPiece(socket, pieces, queue) {
    if (queue.choked){
        console.log('tried to request piece while choked')
        return null
    } 

    while (queue.length()) {
        const pieceBlock = queue.deque();
        console.log('Requesting', pieceBlock)
        if (pieces.needed(pieceBlock)) {
          socket.write(buildRequest(pieceBlock));
          pieces.addRequested(pieceBlock);
          break;
        }
    }
}

function isHandshake(msg) {
    return msg.length === msg.readUInt8(0) + 49 &&
           msg.toString('utf8', 1) === 'BitTorrent protocol';
}

function onWholeMsg(socket, callback){
    let savedBuf = Buffer.alloc(0)
    let handshake = true

    socket.on('data', recvBuf => {
        // msgLen calculates the length of the message
        const msgLen = () => handshake ? savedBuf.readUInt8(0) + 49 : savedBuf.readInt32BE(0) + 4
        savedBuf = Buffer.concat([savedBuf, recvBuf])

        while(savedBuf.length >= 4 && savedBuf.length >= msgLen()){
            callback(savedBuf.slice(0, msgLen()))
            savedBuf = savedBuf.slice(msgLen())
            handshake = false
        }
    })
}