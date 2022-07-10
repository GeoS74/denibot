class Bot {
  constructor(data){
    process.on('message', message => this.action(message))
    this.name = data.name
    this.uri = data.uri
  }

  status = 'created';
  name;
  uri;

  action(message) {
    switch(message){
      case 'status':
        // console.log(`${this.name} status: ${this.status}`)
      this.getStatus()
    }
  }

  getStatus(){
    process.send(`${this.name} status: ${this.status}`)
  }
}

const bot = new Bot(process.env)




// console.log(`child process ${process.argv[2]} running`);

// process.on('message', (message) => {
//   switch (message) {
//     case 'status':
//       console.log(`bot ${message} is running`);
//       break;
//     case 'stop':
//       console.log(`bot ${message} is stopped`);
//       process.exit();
//   }

//   // console.log(`server send: ${message}`)
//   // process.send('i am bot')
// });
