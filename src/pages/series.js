'use strict';

const { PRICES: P } = require('../site');

const UPDATED = '2026-11-10';
const WORKS = ['cable-clips-batch', 'socket-box-caps', 'tweeter-mounts', 'microchip-cases'];

module.exports = [
  {
    id: 'series',
    lang: 'ru',
    type: 'service',
    path: '/seriynaya-pechat/',
    updated: UPDATED,
    nav: 'services',
    breadcrumb: 'Серийная 3D-печать',
    navTitle: 'Серийная 3D-печать',
    title: 'Серийная 3D-печать в Ташкенте — партии деталей на заказ | 3DPie',
    description: 'Серийная 3D-печать в Ташкенте: партии одинаковых деталей десятками и сотнями, 200 креплений — за 2 дня. Скидки на серии, договор для юрлиц.',
    tg: 'Здравствуйте! Нужна партия одинаковых деталей.',
    kicker: 'Услуга · серии и партии',
    h1: 'Серийная 3D-печать: партии одинаковых деталей',
    lead: 'Нужна не одна деталь, а десятки или сотни одинаковых? Серии печатаем параллельно: партию из 200 креплений для кабеля сделали за 2 дня. Нужна только 3D-модель или образец.',
    heroImage: { src: '/gallery/socket-box-caps/socket-box-caps-poster.webp', w: 800, h: 930, alt: 'Заглушки для подрозетников, напечатанные серией на 3D-принтере', caption: '<span>пример</span> Заглушки для подрозетников — серийное изделие' },
    spec: [
      ['Объём', 'от нескольких штук до сотен'],
      ['Пример', '200 креплений за 2 дня'],
      ['Цена', 'в серии ниже за штуку'],
      ['Для бизнеса', 'договор и документы']
    ],
    sections: [
      {
        title: 'Когда нужна серия',
        html: `
<ul>
<li><strong>Крепёж и расходные детали</strong> — крепления, заглушки, держатели одного размера на весь объект.</li>
<li><strong>Свой продукт небольшим тиражом</strong> — пробная партия изделия, корпуса или комплектующих.</li>
<li><strong>Запчасти для оборудования</strong> — одинаковые детали про запас, когда оригинал не купить.</li>
<li><strong>Прототип перед тиражом</strong> — сначала один образец на проверку, потом партия.</li>
</ul>
<p>Примеры наших серийных изделий — <a href="/raboty/socket-box-caps/">заглушки для подрозетников</a> в двух вариантах и <a href="/raboty/tweeter-mounts/">накладки для твитеров</a>.</p>`
      },
      {
        title: 'Как считается цена серии',
        html: `
<p>Платите за вес пластика: ${P.ru.tiers}. В серии цена за штуку ниже: модель уже готова, а принтеры загружены эффективнее. На серии одинаковых деталей и для постоянных клиентов действуют скидки.</p>
<p>В <a href="/ceny/#calc">калькуляторе</a> укажите количество — он покажет вес, примерное время печати и сумму за партию без скидки. Точную цену назовём до начала работы.</p>`
      },
      {
        title: 'Что нужно для заказа',
        html: `
<ol>
<li>3D-модель (STL, STEP) или образец детали. Нет модели — построим по образцу, фото с линейкой или эскизу.</li>
<li>Количество и срок, к которому нужна партия.</li>
<li>Для чего деталь — подберём пластик под нагрузку и температуру.</li>
</ol>
<p>Для юрлиц — договор и документы.</p>`
      }
    ],
    works: WORKS,
    faq: [
      { q: 'Сколько деталей можно заказать?', a: 'От нескольких штук до сотен. Пример из практики — 200 креплений для кабеля за 2 дня. Срок для вашей партии назовём, когда увидим модель.' },
      { q: 'Есть ли скидка на серию?', a: 'Да: на серии одинаковых деталей и для постоянных клиентов.' },
      { q: 'Как вы проверяете детали в партии?', a: 'Каждую деталь проверяем перед выдачей. Если обнаружится брак — переделаем бесплатно.' },
      { q: 'Можно сначала заказать один образец?', a: `Да, это обычный заказ: напечатаем одну деталь, вы проверите её в деле и после этого закажете партию. Минимальный заказ — ${P.min} сум.` }
    ],
    related: ['prices', 'modeling', 'enclosures', 'materials'],
    service: { name: 'Серийная 3D-печать деталей', serviceType: 'Серийная 3D-печать', minPrice: P.minOrder },
    hasGallery: true,
    sitemapImages: ['/gallery/socket-box-caps/socket-box-caps-poster.webp']
  },
  {
    id: 'series',
    lang: 'uz',
    type: 'service',
    path: '/uz/seriyali-chop-etish/',
    updated: UPDATED,
    nav: 'services',
    breadcrumb: 'Seriyali 3D chop etish',
    navTitle: 'Seriyali 3D chop etish',
    title: 'Seriyali 3D chop etish Toshkentda — buyurtma asosida partiyalar | 3DPie',
    description: "Toshkentda seriyali 3D chop etish: bir xil detallar o'nlab va yuzlab, 200 ta mahkamlagich — 2 kunda. Seriyalarga chegirma, yuridik shaxslarga shartnoma.",
    tg: 'Assalomu alaykum! Bir xil detallar partiyasi kerak.',
    kicker: 'Xizmat · seriya va partiyalar',
    h1: 'Seriyali 3D chop etish: bir xil detallar partiyasi',
    lead: "Bitta emas, o'nlab yoki yuzlab bir xil detal kerakmi? Seriyalarni parallel chop etamiz: 200 ta kabel mahkamlagichi partiyasini 2 kunda tayyorladik. Faqat 3D model yoki namuna kerak.",
    heroImage: { src: '/gallery/socket-box-caps/socket-box-caps-poster.webp', w: 800, h: 930, alt: '3D printerda seriyali chop etilgan podrozetnik himoya qopqoqlari', caption: '<span>namuna</span> Podrozetnik qopqoqlari — seriyali buyum' },
    spec: [
      ['Hajm', 'bir necha donadan yuzlab donagacha'],
      ['Misol', '200 ta mahkamlagich 2 kunda'],
      ['Narx', 'seriyada donasi arzonroq'],
      ['Biznes uchun', 'shartnoma va hujjatlar']
    ],
    sections: [
      {
        title: 'Seriya qachon kerak',
        html: `
<ul>
<li><strong>Mahkamlagich va sarflanadigan detallar</strong> — butun obyekt uchun bir xil o'lchamdagi mahkamlagich, tiqin, tutqichlar.</li>
<li><strong>Kichik tirajdagi o'z mahsulotingiz</strong> — buyum, korpus yoki butlovchi qismlarning sinov partiyasi.</li>
<li><strong>Uskunalar uchun ehtiyot qismlar</strong> — originalini sotib olib bo'lmaganda zaxira uchun bir xil detallar.</li>
<li><strong>Tirajdan oldin prototip</strong> — avval tekshirish uchun bitta namuna, keyin partiya.</li>
</ul>
<p>Seriyali buyumlarimizga misol — ikki xil turdagi <a href="/uz/ishlar/socket-box-caps/">podrozetnik himoya qopqoqlari</a> va <a href="/uz/ishlar/tweeter-mounts/">tweeter nakladkalari</a>.</p>`
      },
      {
        title: 'Seriya narxi qanday hisoblanadi',
        html: `
<p>Plastik og'irligi uchun to'laysiz: ${P.uz.tiers}. Seriyada dona narxi arzonroq: model tayyor, printerlar samaraliroq yuklanadi. Bir xil detallar seriyasiga va doimiy mijozlarga chegirmalar bor.</p>
<p><a href="/uz/narxlar/#calc">Kalkulyatorda</a> miqdorni kiriting — u og'irlik, taxminiy chop etish vaqti va partiya summasini chegirmasiz ko'rsatadi. Aniq narxni ish boshlanishidan oldin aytamiz.</p>`
      },
      {
        title: 'Buyurtma uchun nima kerak',
        html: `
<ol>
<li>3D model (STL, STEP) yoki detal namunasi. Model bo'lmasa — namuna, chizg'ichli rasm yoki eskiz bo'yicha yaratamiz.</li>
<li>Miqdor va partiya qachongacha kerakligi.</li>
<li>Detal nima uchun — yuklama va haroratga mos plastik tanlaymiz.</li>
</ol>
<p>Yuridik shaxslar uchun — shartnoma va hujjatlar.</p>`
      }
    ],
    works: WORKS,
    faq: [
      { q: 'Nechta detal buyurtma qilish mumkin?', a: "Bir necha donadan yuzlab donagacha. Amaliyotdan misol — 200 ta kabel mahkamlagichi 2 kunda. Partiyangiz muddatini modelni ko'rgach aytamiz." },
      { q: 'Seriyaga chegirma bormi?', a: 'Ha: bir xil detallar seriyasiga va doimiy mijozlar uchun.' },
      { q: 'Partiyadagi detallar qanday tekshiriladi?', a: 'Har bir detalni topshirishdan oldin tekshiramiz. Nuqson chiqsa — bepul qayta tayyorlaymiz.' },
      { q: 'Avval bitta namuna buyurtma qilsa bo\'ladimi?', a: `Ha, bu oddiy buyurtma: bitta detal chop etamiz, siz uni amalda tekshirasiz va shundan keyin partiyaga buyurtma berasiz. Minimal buyurtma — ${P.min} so'm.` }
    ],
    related: ['prices', 'modeling', 'enclosures', 'materials'],
    service: { name: 'Detallarni seriyali 3D chop etish', serviceType: 'Seriyali 3D chop etish', minPrice: P.minOrder },
    hasGallery: true,
    sitemapImages: ['/gallery/socket-box-caps/socket-box-caps-poster.webp']
  }
];
