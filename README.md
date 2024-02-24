# What is this?

An implementation of the BitTorrent client which uses the BitTorrent protocol to connect to all the peers and download every block of every piece within the file contained in the torrent file.


# How it works?

1. Get a list of all the peers through a UDP connection with the tracker of the torrent file (trackers can be found in the 'announce' property which is inside the .torrent file which is bencoded)

2. Connect to each peer through a TCP connection to make sure every request receives a valid response i.e the block that was requested from the peer

3. Block bytes are then written to the file (file name is taken from the 'info.name' property found inside the torrent file)


# How you can download the contents of a torrent file using this?

1. ```git clone https://github.com/AB7zz/bittorrent.js```
2. Replace the test.torrent with your torrent file
3. Replace Ln 6 Col 22 in index.js with your torrent file name
4. Replace Ln 12 Col 21 in src/tracker.js with your tracker name (found inside 'announce' property inside your torrent file. Choose the one starting with udp://)
5. run ```node index.js``` in your terminal at the root directory


Happy coding! 
Email abhinavcv007@gmail.com for any doubts