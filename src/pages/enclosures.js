'use strict';

const { PRICES: P } = require('../site');

const UPDATED = '2026-11-10';
const WORKS = ['microchip-cases', 'ev-charger-adapter', 'biokamin-box', 'broken-part-restore'];

module.exports = [
  {
    id: 'enclosures',
    lang: 'ru',
    type: 'service',
    path: '/korpusa/',
    updated: UPDATED,
    nav: 'services',
    breadcrumb: 'Корпуса для электроники',
    navTitle: 'Корпуса для электроники',
    title: 'Корпуса для электроники на заказ в Ташкенте — 3D-печать | 3DPie',
    description: `Корпуса для электроники и приборов на 3D-принтере в Ташкенте: по чертежу, эскизу или образцу, один экземпляр или партия. От ${P.min} сум.`,
    tg: 'Здравствуйте! Нужен корпус на заказ.',
    kicker: 'Услуга · корпуса и короба',
    h1: 'Корпуса для электроники и приборов на заказ',
    lead: 'Плата готова, а корпуса под неё нет? Или старый корпус треснул и замену не найти? Смоделируем корпус по вашим размерам, чертежу или образцу и напечатаем — один экземпляр или партию.',
    heroImage: { src: '/gallery/microchip-cases/microchip-cases-poster.webp', w: 800, h: 800, alt: 'Корпус для микросхем, смоделированный и напечатанный на 3D-принтере на заказ', caption: '<span>пример</span> Корпус для микросхем — по запросу клиента' },
    spec: [
      ['Что делаем', 'корпуса, крышки, короба, панели'],
      ['Пластики', 'PLA, PETG, PETG-CF, ABS'],
      ['Размер', `до ${P.bed} мм`],
      ['Цена', `от ${P.min} сум`]
    ],
    sections: [
      {
        title: 'Какие корпуса делаем',
        html: `
<ul>
<li><strong>Корпуса для плат и микросхем</strong> — моделируем по вашим чертежам, эскизам или размерам, как <a href="/#work-microchip-cases">корпус для микросхем</a>.</li>
<li><strong>Замена сломанному корпусу</strong> — сканируем обломки, строим модель и усиливаем слабые места. Так восстановили <a href="/#work-ev-charger-adapter">корпус переходника зарядки электромобиля</a>: стенки сделали толще.</li>
<li><strong>Декоративные короба и панели</strong> — например, <a href="/#work-biokamin-box">короб для биокамина</a> из PETG-CF с матовой фактурой.</li>
<li><strong>Прототипы и небольшие партии</strong> — один корпус на проверку, затем серия.</li>
</ul>`
      },
      {
        title: 'Какой пластик выбрать для корпуса',
        html: `
<ul>
<li><strong>PLA</strong> — жёсткий и точный, для корпусов в помещении. Размягчается примерно от 55&nbsp;°C.</li>
<li><strong>PETG</strong> — прочный, не боится влаги, держит около 70&nbsp;°C. Подходит для улицы.</li>
<li><strong>ABS</strong> — термостойкий (до ~90&nbsp;°C), хорошо шлифуется. Для корпусов приборов.</li>
<li><strong>PETG-CF</strong> — PETG с углеволокном: очень жёсткий, с матовой фактурой. Размер детали — до ${P.bedComposite} мм.</li>
</ul>
<p>Подробнее — в статье <a href="/materialy/">«Какой пластик выбрать»</a>.</p>`
      },
      {
        title: 'Крепёж и файлы',
        html: `
<p>Для винтов можем поставить латунные резьбовые вставки — как в <a href="/#work-broken-part-restore">этой работе</a>.</p>
<p>Если модель нужна вам для своего производства, отдаём файлы STL и STEP. Есть готовая модель — посчитайте примерную цену в <a href="/ceny/#calc">калькуляторе</a>.</p>`
      }
    ],
    works: WORKS,
    faq: [
      { q: 'Что нужно, чтобы заказать корпус?', a: 'Размеры платы или устройства, чертёж, эскиз или образец. Расскажите, где корпус будет стоять, — подберём пластик.' },
      { q: 'Можно ли восстановить треснувший корпус?', a: 'Да. Сканируем или обмеряем обломки, строим модель и усиливаем слабые места — например, делаем стенки толще.' },
      { q: 'Какой максимальный размер корпуса?', a: `За один раз — до ${P.bed} мм, из PETG-CF — до ${P.bedComposite} мм. Корпус больше можно разделить на части.` }
    ],
    related: ['modeling', 'scanning', 'series', 'materials'],
    service: { name: 'Изготовление корпусов для электроники на 3D-принтере', serviceType: '3D-печать корпусов', minPrice: P.minOrder },
    hasGallery: true,
    sitemapImages: ['/gallery/microchip-cases/microchip-cases-poster.webp']
  },
  {
    id: 'enclosures',
    lang: 'uz',
    type: 'service',
    path: '/uz/korpuslar/',
    updated: UPDATED,
    nav: 'services',
    breadcrumb: 'Elektronika uchun korpuslar',
    navTitle: 'Elektronika uchun korpuslar',
    title: 'Elektronika uchun korpuslar Toshkentda — buyurtma asosida 3D chop etish | 3DPie',
    description: `Toshkentda 3D printerda elektronika va asboblar uchun korpuslar: chizma, eskiz yoki namuna bo'yicha, bitta yoki partiya. ${P.min} so'mdan.`,
    tg: 'Assalomu alaykum! Buyurtma asosida korpus kerak.',
    kicker: 'Xizmat · korpus va qutilar',
    h1: 'Elektronika va asboblar uchun buyurtma asosida korpuslar',
    lead: "Plata tayyor, lekin unga korpus yo'qmi? Yoki eski korpus yorilib, o'rniga topib bo'lmayaptimi? Korpusni o'lchamlaringiz, chizma yoki namuna bo'yicha modellashtirib chop etamiz — bitta nusxa yoki partiya.",
    heroImage: { src: '/gallery/microchip-cases/microchip-cases-poster.webp', w: 800, h: 800, alt: '3D printerda buyurtma asosida modellashtirib chop etilgan mikrosxema korpusi', caption: "<span>namuna</span> Mikrosxema korpusi — mijoz so'roviga ko'ra" },
    spec: [
      ['Nima qilamiz', 'korpus, qopqoq, quti, panellar'],
      ['Plastiklar', 'PLA, PETG, PETG-CF, ABS'],
      ["O'lcham", `${P.bed} mm gacha`],
      ['Narx', `${P.min} so'mdan`]
    ],
    sections: [
      {
        title: 'Qanday korpuslar tayyorlaymiz',
        html: `
<ul>
<li><strong>Plata va mikrosxemalar uchun korpuslar</strong> — chizma, eskiz yoki o'lchamlaringiz bo'yicha modellashtiramiz, masalan <a href="/uz.html#work-microchip-cases">mikrosxema korpusi</a>.</li>
<li><strong>Singan korpus o'rniga yangisi</strong> — siniq bo'laklarni skanerlaymiz, model yaratamiz va zaif joylarini mustahkamlaymiz. <a href="/uz.html#work-ev-charger-adapter">Elektromobil zaryad adapteri korpusi</a> shunday tiklangan: devorlari qalinlashtirilgan.</li>
<li><strong>Dekorativ quti va panellar</strong> — masalan, mat yuzali PETG-CF dan <a href="/uz.html#work-biokamin-box">biokamin qutisi</a>.</li>
<li><strong>Prototiplar va kichik partiyalar</strong> — tekshirish uchun bitta korpus, keyin seriya.</li>
</ul>`
      },
      {
        title: 'Korpus uchun qaysi plastikni tanlash kerak',
        html: `
<ul>
<li><strong>PLA</strong> — qattiq va aniq, xona ichidagi korpuslar uchun. Taxminan 55&nbsp;°C dan yumshaydi.</li>
<li><strong>PETG</strong> — mustahkam, namlikdan qo'rqmaydi, ~70&nbsp;°C ga chidaydi. Ko'cha uchun mos.</li>
<li><strong>ABS</strong> — issiqqa chidamli (~90&nbsp;°C gacha), yaxshi silliqlanadi. Asbob korpuslari uchun.</li>
<li><strong>PETG-CF</strong> — uglerod tolali PETG: juda qattiq, mat yuzali. Detal o'lchami — ${P.bedComposite} mm gacha.</li>
</ul>
<p>Batafsil — <a href="/uz/materiallar/">«Qaysi plastikni tanlash kerak»</a> maqolasida.</p>`
      },
      {
        title: 'Mahkamlash va fayllar',
        html: `
<p>Vintlar uchun latun rezbali vtulkalar o'rnatishimiz mumkin — <a href="/uz.html#work-broken-part-restore">mana bu ishdagidek</a>.</p>
<p>Model o'z ishlab chiqarishingiz uchun kerak bo'lsa, STL va STEP fayllarni beramiz. Tayyor model bo'lsa — taxminiy narxni <a href="/uz/narxlar/#calc">kalkulyatorda</a> hisoblang.</p>`
      }
    ],
    works: WORKS,
    faq: [
      { q: 'Korpusga buyurtma berish uchun nima kerak?', a: "Plata yoki qurilma o'lchamlari, chizma, eskiz yoki namuna. Korpus qayerda turishini ayting — plastikni tanlab beramiz." },
      { q: 'Yorilgan korpusni tiklash mumkinmi?', a: "Ha. Siniq bo'laklarni skanerlaymiz yoki o'lchaymiz, model yaratamiz va zaif joylarini mustahkamlaymiz — masalan, devorlarini qalinlashtiramiz." },
      { q: "Korpusning maksimal o'lchami qancha?", a: `Bir martada — ${P.bed} mm gacha, PETG-CF dan — ${P.bedComposite} mm gacha. Kattaroq korpusni qismlarga bo'lish mumkin.` }
    ],
    related: ['modeling', 'scanning', 'series', 'materials'],
    service: { name: '3D printerda elektronika uchun korpuslar tayyorlash', serviceType: 'Korpuslarni 3D chop etish', minPrice: P.minOrder },
    hasGallery: true,
    sitemapImages: ['/gallery/microchip-cases/microchip-cases-poster.webp']
  }
];
