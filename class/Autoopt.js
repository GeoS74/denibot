const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const config = require('../config');
const Bot = require('./Bot');
const Puppeteer = require('./Puppeteer');
const logger = require('../libs/logger')('interceptor');

const puppeteer = new Puppeteer(config.bot.socksPort.Autoopt);

module.exports = class Autoopt extends Bot {
  // @Override
  // @return Object
  async _getParamPosition(uri) {
    const data = await puppeteer.getPage(uri, 'text');
    const params = await this._htmlParserParam(data);
    return params;
  }

  async _htmlParserParam(html) {
    const dom = new JSDOM(html);
    const result = {};

    // title
    result.title = dom.window.document.querySelector('.card-product-title') ? dom.window.document.querySelector('.card-product-title').textContent : undefined;

    // article:
    result.article = dom.window.document.querySelector('.card-product-article') ? dom.window.document.querySelector('.card-product-article').textContent : undefined;
    if (result.article) {
      if (result.article.toLowerCase().indexOf('артикул: ') !== -1) {
        result.article = result.article.slice(9);
      }
    }

    // applicabilities
    const basketId = dom.window.document.querySelector('in-basket') ? dom.window.document.querySelector('in-basket').getAttribute('id') : undefined;
    if (basketId) {
      try {
        result.applicabilities = await puppeteer.getPage(`https://www.autoopt.ru/api/v1/catalog/good-applicabilities/${basketId}?all=true&markId=0&modelId=0&loadFilters=true`, 'text');
      } catch (err) {
        result.applicabilities = undefined;
        logger.error(err.message);
      }
    }

    // description
    // искать надо в этом теге <div itemprop="description">...</div>,
    // причём внутри может попадаться всё что угодно
    result.description = dom.window.document.querySelector('div[itemprop="description"]')
      ? dom.window.document.querySelector('div[itemprop="description"]').innerHTML.trim().replace(/<br>/g, '-----') : undefined;

    // характеристики width, height, length, weight, manufacturer
    let table = dom.window.document.querySelector('.table-specification');
    if (table) {
      const specification = [];
      for (let i = 0; i < table.rows.length; i += 1) {
        // проверка на правильную вёрстку таблиц
        // возможны вот такие ошибки в вёрстке: <tr>...</tr><tr></table>
        if (table?.rows[i]?.cells?.length >= 2) {
          const prop = table.rows[i].cells[0].textContent.toLowerCase();

          if (prop.indexOf('ширина') !== -1) {
            result.width = table.rows[i].cells[1]?.textContent;
          } else if (prop.indexOf('высота') !== -1) {
            result.height = table.rows[i].cells[1]?.textContent;
          } else if (prop.indexOf('длина') !== -1) {
            result.length = table.rows[i].cells[1]?.textContent;
          } else if (prop.indexOf('вес') !== -1) {
            result.weight = table.rows[i].cells[1]?.textContent;
          }

          specification.push(`${table.rows[i].cells[0].textContent}: ${table.rows[i].cells[1].textContent}`);
        }
      }
      if (specification.length) result.specification = JSON.stringify(specification);
    }

    // параметры
    table = dom.window.document.querySelector('.table-item-options');
    if (table) {
      const parameter = [];
      for (let i = 0; i < table.rows.length; i += 1) {
        // проверка на правильную вёрстку таблиц
        // возможны вот такие ошибки в вёрстке: <tr>...</tr><tr></table>
        if (table?.rows[i]?.cells?.length >= 2) {
          const prop = table.rows[i].cells[0].textContent.toLowerCase();
          if (prop.indexOf('производитель') !== -1) {
            result.manufacturer = table.rows[i].cells[1]?.textContent;
          }
          parameter.push(`${table.rows[i].cells[0].textContent}: ${table.rows[i].cells[1].textContent}`);
        }
      }
      if (parameter.length) result.parameter = JSON.stringify(parameter);
    }
    return result;
  }

  // @Override
  // @return Array
  async _getSearchPosition(article) {
    const url = new URL(`/search/index?search=${encodeURI(article)}`, this._uri);
    const data = await puppeteer.getPage(url, 'text');
    return this._htmlParserSearching(data);
  }

  // @return Array
  async _getSearchPositionFetch(article) {
    const url = new URL(`/search/index?search=${encodeURI(article)}`, this._uri);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.fetch.timeout);
    const result = await fetch(url, { signal: controller.signal })
      .then(async (res) => {
        if (res.ok) {
          const html = await res.text();
          return this._htmlParserSearching(html);
        }
        throw new Error('search error');
      })
      .catch((error) => {
        throw new Error(error.message);
      });
    clearTimeout(timeoutId);
    return result;
  }

  _htmlParserSearching(html) {
    const result = [];
    const dom = new JSDOM(html);
    const positions = dom.window.document.querySelectorAll('.n-catalog-item__product');
    if (positions.length) {
      for (const position of positions) {
        const uri = position.querySelector('.n-catalog-item__name a')?.href;
        const data = {
          uri: uri ? new URL(uri, this._uri).toString() : undefined,
          code: position.querySelector('.n-catalog-item__code-box > span')?.innerHTML || undefined,
          article: position.querySelector('.n-catalog-item__article > .n-catalog-item__click-copy')?.innerHTML || undefined,
        };
        result.push(data);
      }
    }
    return result;
  }
};
