module.exports = (io, socket, onlineUsers) => {
  socket.on('new user', (username) => {
    onlineUsers[username] = socket.id;
    socket['username'] = username;
    // Send the username to all clients currently connected
    io.emit('new user', username);
    // Listen for new messages
    socket.on('new message', (data) => {
      // Save the new message to the channel.
      channels[data.channel].push({sender: data.sender, message: data.message});
      // Emit only to sockets that are in that channel room.
      io.to(data.channel).emit('new message', data);
    });
    socket.on('get online users', () => {
      // Send over the onlineUsers
      socket.emit('get online users', onlineUsers);
    });
    socket.on('new channel', (newChannel) => {
      channels[newChannel] = [];
      // Have the socket join the new channel room.
      socket.join(newChannel);
      // Inform all clients of the new channel.
      io.emit('new channel', newChannel);
      socket.emit('user changed channel', {
        channel: newChannel,
        messages: channels[newChannel],
      });
    });
    socket.on('disconnect', () => {
      delete onlineUsers[socket.username];
      io.emit('user has left', onlineUsers);
    });
  });
};
