'use strict';

const UPDATED = '2026-10-12';
const WORKS = ['car-air-deflector', 'tweeter-mounts', 'ac-frame', 'lada-vesta-exhaust'];

module.exports = [
  {
    id: 'auto',
    lang: 'ru',
    type: 'service',
    path: '/avtozapchasti/',
    updated: UPDATED,
    nav: 'services',
    breadcrumb: 'Автозапчасти на 3D-принтере',
    navTitle: 'Автозапчасти и детали салона',
    title: 'Автозапчасти на 3D-принтере в Ташкенте — по образцу и фото | 3DPie',
    description: 'Печатаем пластиковые автозапчасти по образцу в Ташкенте и Чирчике: клипсы, заглушки, дефлекторы, решётки, накладки под твитеры, детали салона для Chevrolet, Lada, иномарок. От 100 000 сум, 1–2 дня.',
    kicker: 'Услуга · автозапчасти',
    h1: 'Пластиковые автозапчасти на 3D-принтере — по образцу и фото',
    lead: 'Сломалась клипса, потерялась заглушка, треснул дефлектор, а оригинал не найти или он стоит как половина машины? Сделаем копию по образцу или фото — из пластика, который выдержит жару в салоне.',
    heroImage: { src: '/images/work-tweeter.webp', w: 640, h: 634, alt: 'Накладка под твитер, напечатанная на 3D-принтере и установленная в салон автомобиля', caption: '<span>пример</span> Накладка под твитер — установлена в салон' },
    spec: [
      ['Для каких авто', 'любые — Chevrolet, Lada, иномарки'],
      ['Пластики', 'ABS, PETG, TPU, Nylon'],
      ['Срок', 'от 1–2 дней'],
      ['Цена', 'от 100 000 сум']
    ],
    sections: [
      {
        title: 'Что печатаем для авто',
        html: `
<ul>
<li><strong>Детали салона</strong> — дефлекторы воздуховодов, ручки, кнопки-заглушки, крышки бардачка и подлокотника, держатели.</li>
<li><strong>Крепёж</strong> — клипсы обшивки, пистоны, кронштейны, фиксаторы, которые ломаются при снятии панелей.</li>
<li><strong>Автозвук</strong> — подиумы и накладки под твитеры и динамики, переходные рамки.</li>
<li><strong>Тюнинг и экстерьер</strong> — решётки, насадки, декоративные элементы, как декоративный выхлоп для Lada Vesta в наших работах.</li>
</ul>`
      },
      {
        title: 'Почему не обычный PLA',
        html: `
<p>Летом в Ташкенте салон машины на солнце нагревается выше 60&nbsp;°C. Обычный PLA при такой температуре размягчается и деталь ведёт. Поэтому для авто мы печатаем из <strong>ABS</strong> и <strong>PETG</strong> — они держат жару, а для уплотнителей и гибких элементов используем <strong>TPU</strong>.</p>
<p>Подробное сравнение — в статье <a href="/materialy/">какой пластик выбрать для 3D-печати</a>.</p>`
      }
    ],
    works: WORKS,
    faq: [
      { q: 'Можно ли напечатать деталь для старой машины, на которую нет запчастей?', a: 'Да, это частая задача. Нужен образец, обломок или хорошие фото с линейкой — по ним строим 3D-модель и печатаем копию. Модель сохраняем, поэтому повторная деталь делается быстрее.' },
      { q: 'Выдержит ли деталь жару в салоне летом?', a: 'Для деталей салона используем ABS и PETG — они держат нагрев на солнце. PLA для авто не рекомендуем.' },
      { q: 'Сколько стоит напечатать автозапчасть?', a: 'Минимальный заказ — 100 000 сум. Точную цену назовём по фото в Telegram, консультация бесплатная. Партия одинаковых клипс обходится дешевле в пересчёте на штуку.' }
    ],
    related: ['modeling', 'scanning', 'gears', 'materials'],
    service: { name: 'Изготовление автозапчастей на 3D-принтере', serviceType: '3D-печать автозапчастей', minPrice: 100000 },
    hasGallery: true,
    sitemapImages: ['/images/work-tweeter.webp', '/gallery/car-air-deflector/car-air-deflector-poster.webp']
  },
  {
    id: 'auto',
    lang: 'uz',
    type: 'service',
    path: '/uz/avtoehtiyot-qismlar/',
    updated: UPDATED,
    nav: 'services',
    breadcrumb: '3D printerda avtoehtiyot qismlar',
    navTitle: 'Avtoehtiyot qismlar va salon detallari',
    title: "3D printerda avtoehtiyot qismlar Toshkentda — namuna bo'yicha | 3DPie",
    description: "Toshkent va Chirchiqda namuna bo'yicha plastik avtoehtiyot qismlarni chop etamiz: klipsalar, tiqinlar, deflektorlar, panjaralar, tvitter nakladkalari, Chevrolet, Lada va xorijiy avtomobillar salon detallari. 100 000 so'mdan, 1–2 kun.",
    kicker: 'Xizmat · avtoehtiyot qismlar',
    h1: "3D printerda plastik avtoehtiyot qismlar — namuna va rasm bo'yicha",
    lead: "Klipsa sindimi, tiqin yo'qoldimi, deflektor yorildimi, originali esa topilmaydi yoki juda qimmatmi? Namuna yoki rasm bo'yicha nusxasini salondagi issiqqa chidaydigan plastikdan tayyorlaymiz.",
    heroImage: { src: '/images/work-tweeter.webp', w: 640, h: 634, alt: "3D printerda chop etilgan va avtomobil saloniga o'rnatilgan tvitter nakladkasi", caption: "<span>misol</span> Tvitter nakladkasi — salonga o'rnatilgan" },
    spec: [
      ['Qaysi avtomobillar uchun', 'istalgan — Chevrolet, Lada, xorijiy avtomobillar'],
      ['Plastiklar', 'ABS, PETG, TPU, Nylon'],
      ['Muddat', '1–2 kundan'],
      ['Narx', "100 000 so'mdan"]
    ],
    sections: [
      {
        title: 'Avtomobil uchun nimalarni chop etamiz',
        html: `
<ul>
<li><strong>Salon detallari</strong> — havo deflektorlari, dastaklar, tiqin-tugmalar, bardachok va podlokotnik qopqoqlari, ushlagichlar.</li>
<li><strong>Mahkamlagichlar</strong> — panellarni yechishda sinadigan obshivka klipsalari, pistonlar, kronshteynlar, fiksatorlar.</li>
<li><strong>Avtozvuk</strong> — tvitter va dinamiklar uchun podiumlar va nakladkalar, o'tish ramkalari.</li>
<li><strong>Tyuning va tashqi qism</strong> — panjaralar, nasadkalar, dekorativ elementlar, ishlarimizdagi Lada Vesta dekorativ glushitel kabi.</li>
</ul>`
      },
      {
        title: 'Nega oddiy PLA emas',
        html: `
<p>Yozda Toshkentda quyosh ostidagi avtomobil saloni 60&nbsp;°C dan yuqori qiziydi. Oddiy PLA bunday haroratda yumshab, detal qiyshayib qoladi. Shuning uchun avtomobil uchun <strong>ABS</strong> va <strong>PETG</strong> dan chop etamiz — ular issiqqa chidaydi, zichlagichlar va egiluvchan elementlar uchun esa <strong>TPU</strong> ishlatamiz.</p>
<p>Batafsil taqqoslash — <a href="/uz/materiallar/">3D chop etish uchun qaysi plastikni tanlash kerak</a> maqolasida.</p>`
      }
    ],
    works: WORKS,
    faq: [
      { q: "Ehtiyot qismi yo'q eski mashina uchun detal chop etish mumkinmi?", a: "Ha, bu tez-tez uchraydigan vazifa. Namuna, siniq bo'lak yoki chizg'ichli yaxshi rasmlar kerak — ular bo'yicha 3D model yaratib, nusxasini chop etamiz. Modelni saqlab qo'yamiz, shuning uchun takroriy detal tezroq tayyorlanadi." },
      { q: 'Detal yozda salondagi issiqqa chidaydimi?', a: "Salon detallari uchun ABS va PETG ishlatamiz — ular quyoshdagi qizishga chidaydi. Avtomobil uchun PLA tavsiya etmaymiz." },
      { q: 'Avtoehtiyot qismni chop etish qancha turadi?', a: "Minimal buyurtma — 100 000 so'm. Aniq narxni Telegramdagi rasm bo'yicha aytamiz, konsultatsiya bepul. Bir xil klipsalar partiyasi dona hisobida arzonroq tushadi." }
    ],
    related: ['modeling', 'scanning', 'gears', 'materials'],
    service: { name: '3D printerda avtoehtiyot qismlar tayyorlash', serviceType: 'Avtoehtiyot qismlarni 3D chop etish', minPrice: 100000 },
    hasGallery: true,
    sitemapImages: ['/images/work-tweeter.webp', '/gallery/car-air-deflector/car-air-deflector-poster.webp']
  }
];
