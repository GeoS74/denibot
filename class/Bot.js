module.exports = class Bot {
  _state;

  _name;

  _uri;

  _id; // id in collection Owners

  _pid; // process id

  _start;

  _end;

  _error = [];

  _countMainNomeclateres = 0;

  _countProcessedPosition = 0;

  _countAddPosition = 0;

  constructor(data, pid) {
    process.on('message', (message) => this._parentSend(message));
    this._state = 'created';
    this._name = data.name;
    this._uri = data.uri;
    this._id = data.id;
    this._pid = pid;
  }

  async run(){}

  getState() {
    const state = {
      pid: this._pid,
      name: this._name,
      state: this._state,
      error: this._error,
      processed: `обработано ${this._countProcessedPosition} из ${this._countMainNomeclateres} позиций`,
      writed: `записано ${this._countAddPosition} позиций`,
      runTime: `${this._getRunTime()} sec`,
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

  _getRunTime(){
    if(!this._start) return 0;
    return ((this._end ? this._end : Date.now()) - this._start) / 1000;
  }
};
