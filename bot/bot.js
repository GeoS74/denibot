class Bot {
  state;
  name;
  uri;
  pid;

  constructor(data, pid) {
    process.on('message', message => this.parentSend(message))
    this.state = 'created'
    this.name = data.name
    this.uri = data.uri
    this.pid = pid
  }

  parentSend(message) {
    switch (message) {
      case 'state':
        this.getState()
        break
    }
  }

  getState() {
    const state = `pid: ${this.pid} name: ${this.name} state: ${this.state}`
    process.send(state)
    console.log(state)
  }
}

const bot = new Bot(process.env, process.pid)
