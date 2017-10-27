class Users {
  constructor() {
    // Users will end up as an array of objects/users for the users list in the room
    this.users = [];
  }
  addUser(id, name, room) {
    // Make object of user to push on to array, then push it
    const user = { id, name, room };
    this.users.push(user);
    return user;
  }
  removeUser(id) {
    let i = this.users.findIndex(u => u.id === id);
    if (i >= 0) {
      // return just the user that was removed
      return this.users.splice(i, 1)[0];
    }
  }
  getUser(id) {
    // Use the "find" method, which returns exactly one object--unlike "filter"
    return this.users.find(user => user.id === id);
  }
  getUserList(room) {
    // Iterate and return an array of strings of only users in room
    const users = this.users.filter(user => user.room === room);
    const namesArray = users.map(user => user.name);

    return namesArray;
  }
}

module.exports = { Users };
