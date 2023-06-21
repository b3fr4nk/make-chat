module.exports = (io, socket, onlineUsers) => {
  socket.on('new user', (username) => {
    onlineUsers[username] = socket.id;
    socket['username'] = username;
    // Send the username to all clients currently connected
    io.emit('new user', username);
    // Listen for new messages
    socket.on('new message', (data) => {
    // Send that data back to ALL clients
      console.log(`🎤 ${data.sender}: ${data.message} 🎤`);
      io.emit('new message', data);
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
