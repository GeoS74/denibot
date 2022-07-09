console.log(`child process ${process.argv[2]} running`);

process.on('message', (message) => {
  switch (message) {
    case 'status':
      console.log(`bot ${message} is running`);
      break;
    case 'stop':
      console.log(`bot ${message} is stopped`);
      process.exit();
  }

  // console.log(`server send: ${message}`)
  // process.send('i am bot')
});
