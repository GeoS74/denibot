const XLSX = require('xlsx');

const Nomenclature = require('../models/Nomenclature');
require('../models/Owner');
require('../models/Param');

; (async _ => {
  try {
    console.log('start');
    const nom = await Nomenclature.aggregate([
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
          'owner.isMain': true,
          toMatched: { $not: { $size: 0 } }
        }
      },
      {
        $lookup: {
          from: 'nomenclatures',
          localField: '_id',
          foreignField: 'mainNomenclatureId',
          as: 'positions',

          pipeline: [{
            $lookup: {
              from: 'params',
              localField: '_id',
              foreignField: 'nomenclatureId',
              as: 'parameters',
            },
          },
          { $limit: 1 },
          { $unwind: '$parameters' }],
        },
      },
      // {
      //   $limit: 1
      // }
    ]);
    console.log('end');

    const data = [[
      '№ п/п',
      'код БОВИД',
      'артикул БОВИД',
      'наименование БОВИД',
      'код АА',
      // 'артикл',
      // 'наименование',
      'длина',
      'ширина',
      'высота',
      'вес',
      'производитель',
      // 'specification',
      'parameter',
    ]];

    // console.log(nom);
    // console.log(nom[0].positions);
    // return;

    nom.map((pos, i )=> {
      pos.positions.map((matchPos, k) => {
        const temp = k === 0 ? [i+1, pos.code, pos.article, pos.title] : new Array(4).fill(null);

        const www = temp.concat([
          matchPos.code,
          // matchPos?.parameters?.article,
          // matchPos?.parameters?.title,
          matchPos?.parameters?.length,
          matchPos?.parameters?.width,
          matchPos?.parameters?.height,
          matchPos?.parameters?.weight,
          matchPos?.parameters?.manufacturer,
          // null,
          matchPos?.parameters?.parameter,
        ]);

        data.push(www)
      })
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Карточки');
    await XLSX.writeFile(wb, 'files/cards.xlsx', {
      bookType: 'xlsx'
    });

    console.log('excel complete');

  } catch (error) {
    console.log(`Fatal error: ${error.message}`)
  }
})()