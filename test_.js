const puppeteer = require('puppeteer');

(async _ => {
  await start(9050);
  await start(9052);

  console.log(new Array(10).fill(null).map((e, i) => (9052+i)))
  process.exit();
})()

async function start(port) {
  try{
    const browser = await puppeteer.launch({
      headless: true, // hide browser
      args: [`--proxy-server=socks5://127.0.0.1:${port}`],
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(300000);
    const ip = await page.goto('https://api.ipify.org').then((res) => res.text());
    await browser.close();
    console.log('ip: ', ip)
  }
  catch(error){
    console.log('error: ', error.message)
  }
}