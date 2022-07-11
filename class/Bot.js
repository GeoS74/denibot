module.exports = class Bot {
  _state;

  _name;

  _uri;

  _id; // id in collection Owners

  _pid; // process id

  constructor(data, pid) {
    process.on('message', (message) => this._parentSend(message));
    this._state = 'created';
    this._name = data.name;
    this._uri = data.uri;
    this._id = data.id;
    this._pid = pid;
  }

  getState() {
    const state = {
      pid: this._pid,
      name: this._name,
      state: this._state,
    };
    process.send(JSON.stringify(state));
  }

  _parentSend(message) {
    switch (message) {
      case 'state':
        this.getState();
        break;
      default:
    }
  }
};
