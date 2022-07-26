const puppeteer = require('puppeteer');

const Nomenclature = require('./models/Nomenclature');
require('./models/Owner');

; (async () => {
  // await start(9050)
  // await start(9052)
  // process.exit()
})()


  ; (async () => {
    try {
      const result = await Nomenclature.aggregate([
        {
          $lookup: {
            from: 'owners',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner',
          },
        },
        {
          $match: {
            'owner.botName': new RegExp('Heavytruck'),
          },
        },
        {
          $lookup: {
            from: 'prices',
            localField: '_id',
            foreignField: 'nomenclatureId',
            as: 'price',

            // pipeline:[{$limit: 1}]
          },
        },
        // {
        //   $unwind: '$price'
        // },
        {
          $sort: {'price.createdAt' : -1},
        },
        {
          $match: {
            'price': {$not: {$size: 0}},
            'price.createdAt': {$not: {$gt: new Date(Date.now() + 1000*3600*24*10)}}
          },
        },
        { $limit: 4 },
      ]);

      // console.log(result[0]?.price)
      result.map(r => console.log(r?.price))
    } catch (error) {
      console.log(error.message)
    }
    process.exit()
  })()

async function start(port) {
  try {
    const browser = await puppeteer.launch({
      headless: true, // hide browser
      args: [`--proxy-server=socks5://127.0.0.1:${port}`],
      // args: [`--proxy-server=https://127.0.0.1:${port}`],
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    page.on('console', msg => {
      console.log(msg);
    });
    const ip = await page.goto('https://api.ipify.org').then((res) => res.text());
    browser.close();
    console.log('ip: ', ip)
  } catch (error) {
    console.log('error: ', error.message)
  }
}