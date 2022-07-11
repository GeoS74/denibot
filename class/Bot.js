module.exports = class Bot {
  _state;

  _name;

  _uri;

  _pid;

  constructor(data, pid) {
    process.on('message', (message) => this._parentSend(message));
    this._state = 'created';
    this._name = data.name;
    this._uri = data.uri;
    this._pid = pid;
  }

  getState() {
    const state = `pid: ${this._pid} name: ${this._name} state: ${this._state}`;
    process.send(state);
    console.log(state);
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
