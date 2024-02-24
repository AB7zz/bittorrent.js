'use strict';

import { open } from './src/torrent-parser.js'
import downloadTorrent from './src/download.js';

const torrent = open('test.torrent')

const path = torrent.info.name

downloadTorrent(torrent, path)


