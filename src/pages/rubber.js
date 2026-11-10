'use strict';

const { PRICES: P, CALC, money } = require('../site');

const UPDATED = '2026-11-10';
const WORKS = ['flexible-rubber-parts', 'broken-part-restore'];
const TPU = money(CALC.materials.find(m => m.id === 'tpu').price); // per gram

module.exports = [
  {
    id: 'rubber',
    lang: 'ru',
    type: 'service',
    path: '/rezinovye-detali/',
    updated: UPDATED,
    nav: 'services',
    breadcrumb: 'Резиновые детали из TPU',
    navTitle: 'Резиновые детали из TPU',
    title: 'Резиновые детали на заказ в Ташкенте — печать из TPU | 3DPie',
    description: `Гибкие резиновые детали на 3D-принтере в Ташкенте: уплотнители, втулки, демпферы, накладки из TPU — по образцу или фото. От ${P.min} сум.`,
    tg: 'Здравствуйте! Нужна резиновая деталь из TPU.',
    kicker: 'Услуга · резиновые детали',
    h1: 'Резиновые детали из TPU на заказ',
    lead: 'Порвался уплотнитель, рассыпалась втулка или нужна мягкая накладка, которой нет в продаже? Напечатаем её из TPU — гибкого пластика, похожего на резину. Достаточно старой детали или фото с линейкой.',
    heroImage: { src: '/gallery/flexible-rubber-parts/flexible-rubber-parts-poster.webp', w: 800, h: 855, alt: 'Гибкие резиновые детали из TPU, напечатанные на 3D-принтере', caption: '<span>пример</span> Гибкие детали из TPU — замена резиновым' },
    spec: [
      ['Материал', 'TPU — гибкий, как резина'],
      ['Что делаем', 'уплотнители, втулки, демпферы, ножки, накладки'],
      ['Нужно от вас', 'старая деталь или фото с линейкой'],
      ['Цена', `${TPU} сум за грамм, заказ от ${P.min} сум`]
    ],
    sections: [
      {
        title: 'Что печатаем из TPU',
        html: `
<ul>
<li><strong>Уплотнители и прокладки</strong> — когда оригинал порвался, а отдельно его не продают.</li>
<li><strong>Втулки и демпферы</strong> — детали, которые должны пружинить и гасить удар.</li>
<li><strong>Ножки и накладки</strong> — мягкие опоры и защитные элементы для техники и мебели.</li>
<li><strong>Защитные чехлы</strong> — гибкие кожухи по форме вашего изделия.</li>
</ul>`
      },
      {
        title: 'Чем TPU отличается от обычного пластика',
        html: `
<p>Детали из TPU гнутся, пружинят и не трескаются. Материал износостойкий, поэтому такие детали часто служат дольше силиконовых.</p>
<p>Если детали нужна жёсткость, а не гибкость, подойдут PETG, ABS или Nylon — сравнение в статье <a href="/materialy/">«Какой пластик выбрать»</a>.</p>`
      },
      {
        title: 'Как заказать копию резиновой детали',
        html: `
<ol>
<li>Привезите старую деталь или сфотографируйте её рядом с линейкой — подойдёт даже порванная.</li>
<li>Сложную форму снимем 3D-сканером, простую — по размерам. Строим 3D-модель.</li>
<li>Печатаем из TPU. Если нужно, меняем размер или форму — можно не только повторить деталь, но и сделать её лучше.</li>
</ol>`
      }
    ],
    works: WORKS,
    faq: [
      { q: 'Заменит ли TPU обычную резину?', a: 'Для уплотнителей, втулок, демпферов и накладок — да: TPU гибкий и износостойкий. Если деталь работает в особых условиях — при высокой температуре или в агрессивной среде — напишите, подскажем, подойдёт ли материал.' },
      { q: 'Можно ли сделать деталь без образца?', a: 'Да, по размерам или эскизу. Но с образцом — даже порванным — получится точнее и быстрее.' },
      { q: 'Сколько стоит резиновая деталь?', a: `TPU стоит ${TPU} сум за грамм, минимальный заказ — ${P.min} сум. Примерную цену покажет <a href="/ceny/#calc">калькулятор</a>, точную назовём в Telegram до начала работы.` }
    ],
    related: ['gears', 'auto', 'materials', 'prices'],
    service: { name: 'Изготовление резиновых деталей из TPU на 3D-принтере', serviceType: '3D-печать из TPU', minPrice: P.minOrder },
    hasGallery: true,
    sitemapImages: ['/gallery/flexible-rubber-parts/flexible-rubber-parts-poster.webp']
  },
  {
    id: 'rubber',
    lang: 'uz',
    type: 'service',
    path: '/uz/rezina-detallar/',
    updated: UPDATED,
    nav: 'services',
    breadcrumb: 'TPU dan rezina detallar',
    navTitle: 'TPU dan rezina detallar',
    title: 'Buyurtma asosida rezina detallar Toshkentda — TPU dan chop etish | 3DPie',
    description: `Toshkentda 3D printerda egiluvchan rezina detallar: TPU dan zichlagich, vtulka, dempfer, nakladka — namuna yoki rasm bo'yicha. ${P.min} so'mdan.`,
    tg: 'Assalomu alaykum! TPU dan rezina detal kerak.',
    kicker: 'Xizmat · rezina detallar',
    h1: 'TPU dan buyurtma asosida rezina detallar',
    lead: "Zichlagich yirtildimi, vtulka yemirildimi yoki sotuvda yo'q yumshoq nakladka kerakmi? Uni TPU dan — rezinaga o'xshash egiluvchan plastikdan chop etamiz. Eski detal yoki chizg'ich yonidagi rasm yetarli.",
    heroImage: { src: '/gallery/flexible-rubber-parts/flexible-rubber-parts-poster.webp', w: 800, h: 855, alt: '3D printerda chop etilgan TPU dan egiluvchan rezina detallar', caption: "<span>namuna</span> TPU dan egiluvchan detallar — rezina o'rniga" },
    spec: [
      ['Material', 'TPU — rezinadek egiluvchan'],
      ['Nima qilamiz', 'zichlagich, vtulka, dempfer, oyoqcha, nakladka'],
      ['Sizdan kerak', "eski detal yoki chizg'ichli rasm"],
      ['Narx', `grammi ${TPU} so'm, buyurtma ${P.min} so'mdan`]
    ],
    sections: [
      {
        title: 'TPU dan nimalarni chop etamiz',
        html: `
<ul>
<li><strong>Zichlagichlar va qistirmalar</strong> — original yirtilgan, alohida esa sotilmaydigan hollarda.</li>
<li><strong>Vtulkalar va dempferlar</strong> — prujinalanishi va zarbani yumshatishi kerak bo'lgan detallar.</li>
<li><strong>Oyoqchalar va nakladkalar</strong> — texnika va mebel uchun yumshoq tayanch va himoya elementlari.</li>
<li><strong>Himoya g'iloflari</strong> — buyumingiz shakliga mos egiluvchan qoplamalar.</li>
</ul>`
      },
      {
        title: 'TPU oddiy plastikdan nimasi bilan farq qiladi',
        html: `
<p>TPU dan tayyorlangan detallar egiladi, prujinalanadi va yorilmaydi. Material yeyilishga chidamli, shuning uchun bunday detallar ko'pincha silikondan uzoqroq xizmat qiladi.</p>
<p>Detalga egiluvchanlik emas, qattiqlik kerak bo'lsa, PETG, ABS yoki Nylon mos keladi — taqqoslash <a href="/uz/materiallar/">«Qaysi plastikni tanlash kerak»</a> maqolasida.</p>`
      },
      {
        title: 'Rezina detal nusxasiga qanday buyurtma beriladi',
        html: `
<ol>
<li>Eski detalni olib keling yoki chizg'ich yonida suratga oling — yirtilgani ham bo'ladi.</li>
<li>Murakkab shaklni 3D skaner bilan, oddiysini o'lchamlar bo'yicha olamiz. 3D model yaratamiz.</li>
<li>TPU dan chop etamiz. Kerak bo'lsa, o'lcham yoki shaklni o'zgartiramiz — detalni takrorlash bilan birga yaxshilash ham mumkin.</li>
</ol>`
      }
    ],
    works: WORKS,
    faq: [
      { q: "TPU oddiy rezinaning o'rnini bosadimi?", a: "Zichlagich, vtulka, dempfer va nakladkalar uchun — ha: TPU egiluvchan va yeyilishga chidamli. Detal alohida sharoitda — yuqori haroratda yoki agressiv muhitda ishlasa, yozing: material mos keladimi, maslahat beramiz." },
      { q: 'Namunasiz detal tayyorlash mumkinmi?', a: "Ha, o'lchamlar yoki eskiz bo'yicha. Lekin namuna bilan — hatto yirtilgan bo'lsa ham — aniqroq va tezroq chiqadi." },
      { q: 'Rezina detal qancha turadi?', a: `TPU grammi ${TPU} so'm, minimal buyurtma — ${P.min} so'm. Taxminiy narxni <a href="/uz/narxlar/#calc">kalkulyator</a> ko'rsatadi, aniq narxni ish boshlanishidan oldin Telegramda aytamiz.` }
    ],
    related: ['gears', 'auto', 'materials', 'prices'],
    service: { name: '3D printerda TPU dan rezina detallar tayyorlash', serviceType: 'TPU dan 3D chop etish', minPrice: P.minOrder },
    hasGallery: true,
    sitemapImages: ['/gallery/flexible-rubber-parts/flexible-rubber-parts-poster.webp']
  }
];
