'use strict';

/**
 * Business facts shared by every page (NAP, links) and UI strings per language.
 * Working hours are intentionally not published (owner's request).
 * Change contact details here only — header, footer, JSON-LD and llms.txt all read from this file
 * (llms.txt is hand-written: keep it in sync when facts change).
 */

const SITE_URL = 'https://3dpie.uz';

const CONTACTS = {
  phone: '+998901391094',
  phoneHuman: '+998 90 139 10 94',
  telegram: 'https://t.me/pie3d',
  telegramHandle: '@pie3d',
  instagram: 'https://www.instagram.com/3dpie.uz',
  instagramHandle: '@3dpie.uz',
  geo: { lat: 41.453319, lng: 69.557021 },
  postalCode: '111700',
  mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1301.6256151982968!2d69.5570212281913!3d41.45332872531939!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38aefb69d2c4e733%3A0x655af263ac156173!2z0YPQu9C40YbQsCDQkNC80LjRgNCwINCi0LXQvNGD0YDQsCA2MiDQsCwg0KfQuNGA0YfQuNC6LCDQotCw0YjQutC10L3RgtGB0LrQsNGPINC-0LHQu9Cw0YHRgtGMLCDQo9C30LHQtdC60LjRgdGC0LDQvQ!5e0!3m2!1sru!2s!4v1762893583444!5m2!1sru!2s',
  mapLink: 'https://maps.google.com/?q=41.453319,69.557021'
};

const T = {
  ru: {
    htmlLang: 'ru',
    hreflang: 'ru-UZ',
    ogLocale: 'ru_UZ',
    home: '/',
    homeName: 'Главная',
    brandLoc: 'Чирчик · Ташкент',
    navLabel: 'Основное меню',
    nav: [
      { href: '/#services', label: 'Услуги', key: 'services' },
      { href: '/#gallery', label: 'Работы', key: 'works' },
      { href: '/ceny/', label: 'Цены', key: 'prices' },
      { href: '/materialy/', label: 'Материалы', key: 'materials' },
      { href: '/#contact', label: 'Контакты', key: 'contact' }
    ],
    menu: 'Меню',
    langLabel: 'Язык сайта',
    ctaTelegram: 'Отправить фото в Telegram',
    ctaTelegramShort: 'Telegram',
    ctaCall: 'Позвонить',
    address: {
      street: 'ул. Амира Тимура, 62а',
      city: 'Чирчик',
      region: 'Ташкентская область',
      full: 'Ташкентская обл., г. Чирчик, ул. Амира Тимура, 62а',
      landmark: 'Ориентир: 10-я автобаза'
    },
    priceRange: 'от 100 000 сум',
    footerAbout: 'Студия 3D-печати, 3D-сканирования и 3D-моделирования: 3д печать пластиковых и резиновых деталей на заказ по фото и образцу. Производство в Чирчике, доставка по Ташкенту и области, отправка по Узбекистану через BTS и Яндекс Доставку.',
    footerServices: 'Услуги',
    footerInfo: 'Полезное',
    footerContacts: 'Связь',
    footerInfoLinks: [
      { href: '/ceny/', label: 'Цены на 3D-печать' },
      { href: '/materialy/', label: 'Какой пластик выбрать' },
      { href: '/#gallery', label: 'Примеры работ' },
      { href: '/#faq', label: 'Вопросы и ответы' },
      { href: '/#contact', label: 'Как нас найти' }
    ],
    copyright: '© 2023–2026 3DPie. 3D-печать на заказ в Узбекистане.',
    breadcrumbLabel: 'Навигационная цепочка',
    worksTitle: 'Наши работы по теме',
    worksMore: 'Все работы',
    faqTitle: 'Вопросы и ответы',
    relatedTitle: 'Другие услуги',
    ctaBandTitle: 'Пришлите фото детали — назовём цену',
    ctaBandText: 'Сфотографируйте деталь или обломок рядом с линейкой и напишите, для чего она. Консультация бесплатная.',
    more: 'Подробнее',
    businessDescription: '3DPie — студия 3D-печати, 3D-сканирования и 3D-моделирования в Чирчике (Ташкентская область, Узбекистан). Изготавливает пластиковые и резиновые детали на заказ для частных клиентов и бизнеса по фото, образцу или чертежу: автозапчасти, шестерни и детали для техники, корпуса, серийные партии, реверс-инжиниринг сломанных деталей. Материалы PLA, PETG, PETG-CF, ABS, TPU, Nylon. Заказ от 100 000 сум, простая деталь — 1–2 дня, консультация бесплатная. Доставка по Ташкенту и Ташкентской области, отправка по Узбекистану через BTS и Яндекс Доставку.',
    areaNames: { chirchiq: 'Чирчик', tashkent: 'Ташкент', region: 'Ташкентская область', country: 'Узбекистан' }
  },
  uz: {
    htmlLang: 'uz-Latn-UZ',
    hreflang: 'uz-UZ',
    ogLocale: 'uz_UZ',
    home: '/uz.html',
    homeName: 'Bosh sahifa',
    brandLoc: 'Chirchiq · Toshkent',
    navLabel: 'Asosiy menyu',
    nav: [
      { href: '/uz.html#services', label: 'Xizmatlar', key: 'services' },
      { href: '/uz.html#gallery', label: 'Ishlar', key: 'works' },
      { href: '/uz/narxlar/', label: 'Narxlar', key: 'prices' },
      { href: '/uz/materiallar/', label: 'Materiallar', key: 'materials' },
      { href: '/uz.html#contact', label: 'Aloqa', key: 'contact' }
    ],
    menu: 'Menyu',
    langLabel: 'Sayt tili',
    ctaTelegram: 'Telegramga rasm yuborish',
    ctaTelegramShort: 'Telegram',
    ctaCall: "Qo'ng'iroq qilish",
    address: {
      street: "Amir Temur ko'chasi, 62a",
      city: 'Chirchiq',
      region: 'Toshkent viloyati',
      full: "Toshkent viloyati, Chirchiq sh., Amir Temur ko'chasi, 62a",
      landmark: "Mo'ljal: 10-avtobaza"
    },
    priceRange: "100 000 so'mdan",
    footerAbout: "3D chop etish (3D bosib chiqarish, 3D pechat), 3D skanerlash va 3D modellashtirish studiyasi: rasm va namuna bo'yicha plastik va rezina detallar. Ishlab chiqarish Chirchiqda, Toshkent va viloyat bo'ylab yetkazib berish, O'zbekiston bo'ylab BTS va Yandex orqali jo'natish.",
    footerServices: 'Xizmatlar',
    footerInfo: 'Foydali',
    footerContacts: 'Aloqa',
    footerInfoLinks: [
      { href: '/uz/narxlar/', label: '3D chop etish narxlari' },
      { href: '/uz/materiallar/', label: 'Qaysi plastikni tanlash kerak' },
      { href: '/uz.html#gallery', label: 'Ishlarimiz' },
      { href: '/uz.html#faq', label: 'Savol-javoblar' },
      { href: '/uz.html#contact', label: 'Manzil' }
    ],
    copyright: "© 2023–2026 3DPie. O'zbekistonda buyurtma asosida 3D chop etish.",
    breadcrumbLabel: 'Navigatsiya',
    worksTitle: 'Shu mavzudagi ishlarimiz',
    worksMore: 'Barcha ishlar',
    faqTitle: 'Savol-javoblar',
    relatedTitle: 'Boshqa xizmatlar',
    ctaBandTitle: 'Detal rasmini yuboring — narxini aytamiz',
    ctaBandText: "Detalni yoki uning siniq bo'lagini chizg'ich yonida suratga oling va nima uchun kerakligini yozing. Konsultatsiya bepul.",
    more: 'Batafsil',
    businessDescription: "3DPie — Chirchiqdagi (Toshkent viloyati, O'zbekiston) 3D chop etish, 3D skanerlash va 3D modellashtirish studiyasi. Jismoniy shaxslar va biznes uchun rasm, namuna yoki chizma asosida plastik va rezina detallarni buyurtma asosida tayyorlaydi: avtoehtiyot qismlar, texnika uchun tishli g'ildiraklar va detallar, korpuslar, seriyali partiyalar, singan detallarni teskari muhandislik orqali tiklash. Materiallar: PLA, PETG, PETG-CF, ABS, TPU, Nylon. Buyurtma 100 000 so'mdan, oddiy detal — 1–2 kun, konsultatsiya bepul. Toshkent va Toshkent viloyati bo'ylab yetkazib berish, O'zbekiston bo'ylab BTS va Yandex orqali jo'natish.",
    areaNames: { chirchiq: 'Chirchiq', tashkent: 'Toshkent', region: 'Toshkent viloyati', country: "O'zbekiston" }
  }
};

// Order steps shown on the home page and on every service page.
const STEPS = {
  ru: [
    { t: 'Пришлите фото или образец', d: 'Фото детали рядом с линейкой, размеры, эскиз или готовый файл (STL, STEP). Образец можно привезти в Чирчик.' },
    { t: 'Получите цену и срок', d: 'Консультация бесплатная. Цену называем до начала работы, без скрытых доплат.' },
    { t: 'Сканируем, моделируем, печатаем', d: 'Если файла нет — снимаем форму 3D-сканером или по размерам и строим модель сами. Простая деталь готова за 1–2 дня, сложный проект — за 3–7 дней.' },
    { t: 'Забираете или получаете доставкой', d: 'Самовывоз в Чирчике, курьер по Ташкенту и Ташкентской области, в другие регионы — BTS или Яндекс Доставка (платно).' }
  ],
  uz: [
    { t: 'Rasm yoki namuna yuboring', d: "Detalning chizg'ich yonidagi rasmi, o'lchamlari, eskiz yoki tayyor fayl (STL, STEP). Namunani Chirchiqqa olib kelishingiz mumkin." },
    { t: 'Narx va muddatni biling', d: "Konsultatsiya bepul. Narxni ish boshlanishidan oldin aytamiz, yashirin to'lovlarsiz." },
    { t: 'Skanerlaymiz, modellashtiramiz, chop etamiz', d: "Fayl bo'lmasa — shaklni 3D skaner yoki o'lchamlar bo'yicha olib, modelni o'zimiz yaratamiz. Oddiy detal 1–2 kunda, murakkab loyiha 3–7 kunda tayyor." },
    { t: 'Olib keting yoki yetkazib beramiz', d: "Chirchiqdan olib ketish, Toshkent va Toshkent viloyati bo'ylab kuryer, boshqa viloyatlarga — BTS yoki Yandex orqali (pullik)." }
  ]
};

const STEPS_TITLE = { ru: 'Как заказать', uz: 'Qanday buyurtma beriladi' };
const STEP_LABEL = { ru: 'Шаг', uz: 'Qadam' };

function businessNode(lang) {
  const t = T[lang];
  return {
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#business`,
    name: '3DPie',
    alternateName: ['3DPie.uz', '3dpie', '3D Pie'],
    description: t.businessDescription,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/images/logo.jpg`,
    image: [
      `${SITE_URL}/images/og-${lang}.jpg`,
      `${SITE_URL}/gallery/ventilation-grille/ventilation-grille-1.jpg`,
      `${SITE_URL}/gallery/ev-charger-adapter/ev-charger-adapter-poster.webp`
    ],
    telephone: CONTACTS.phone,
    priceRange: t.priceRange,
    currenciesAccepted: 'UZS',
    address: {
      '@type': 'PostalAddress',
      streetAddress: t.address.street,
      addressLocality: t.address.city,
      addressRegion: t.address.region,
      postalCode: CONTACTS.postalCode,
      addressCountry: 'UZ'
    },
    geo: { '@type': 'GeoCoordinates', latitude: CONTACTS.geo.lat, longitude: CONTACTS.geo.lng },
    hasMap: CONTACTS.mapLink,
    areaServed: [
      { '@type': 'City', name: t.areaNames.chirchiq },
      { '@type': 'City', name: t.areaNames.tashkent },
      { '@type': 'AdministrativeArea', name: t.areaNames.region },
      { '@type': 'Country', name: t.areaNames.country }
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: CONTACTS.phone,
      contactType: 'customer service',
      areaServed: 'UZ',
      availableLanguage: ['ru', 'uz']
    },
    knowsAbout: ['3D printing', '3D scanning', '3D modeling', 'reverse engineering', 'Fusion 360', 'FDM', 'PLA', 'PETG', 'PETG-CF', 'ABS', 'TPU', 'Nylon', 'prototyping', 'small batch production'],
    sameAs: [CONTACTS.instagram, CONTACTS.telegram]
  };
}

// STL calculator on the prices page (js/calc.js reads this as JSON). Estimate only — exact price in Telegram.
// Prices are per gram of plastic (owner, 2026-10). Build volumes in mm; composites print on a smaller
// machine. Never name the printers on the site. Densities are typical filament values, g/cm³.
const CALC = {
  minOrder: 100000,
  bed: [420, 420, 500],
  bedComposite: [245, 245, 245],
  shellMm: 0.85, // walls + top/bottom skin, counted as solid plastic
  overhangDeg: 45, // faces tilted more than this from vertical get supports
  supportFill: 0.15, // share of the space under an overhang filled by support plastic
  materials: [
    { id: 'pla', name: 'PLA', price: 1000, density: 1.24 },
    { id: 'petg', name: 'PETG', price: 1000, density: 1.27 },
    { id: 'abs', name: 'ABS', price: 1000, density: 1.04 },
    { id: 'petg-cf', name: 'PETG-CF', price: 1500, density: 1.3, composite: true },
    { id: 'tpu', name: 'TPU', price: 1500, density: 1.21 },
    { id: 'nylon', name: 'Nylon PA6', price: 5000, density: 1.13 }
  ],
  infill: [15, 20, 40, 100],
  infillDefault: 20,
  units: [['mm', 1], ['cm', 10], ['in', 25.4], ['m', 1000]]
};

const CALC_T = {
  ru: {
    title: 'Калькулятор по <em>STL</em>',
    note: 'Загрузите модель: посчитаем вес и примерную цену прямо в браузере. Файл никуда не отправляется и не сохраняется.',
    drop: '<b>Перетащите STL-файл сюда</b> или нажмите, чтобы выбрать',
    dropHint: 'Бинарный или текстовый STL, до 150 МБ',
    noscript: 'Для калькулятора нужен JavaScript. Пришлите файл в Telegram — посчитаем вручную.',
    other: 'Другой файл',
    rotate: 'Потяните, чтобы повернуть',
    legend: 'нависания',
    material: 'Пластик',
    infill: 'Заполнение',
    infillNames: { 15: 'Лёгкое', 20: 'Обычное', 40: 'Прочное', 100: 'Сплошное' },
    qty: 'Количество, шт',
    unit: 'Единицы в файле',
    unitNames: { mm: 'мм', cm: 'см', in: 'дюймы', m: 'метры' },
    size: 'Габариты',
    volume: 'Объём модели',
    weight: 'Вес 1 шт',
    supports: 'в т. ч. поддержки',
    perGram: 'Цена за грамм',
    perPiece: 'Цена 1 шт',
    total: 'Примерная стоимость',
    empty: 'Загрузите STL',
    sum: 'сум',
    g: 'г',
    cm3: 'см³',
    mm: 'мм',
    pcs: 'шт',
    tg: 'Точная цена в Telegram',
    copy: 'Скопировать расчёт',
    copied: 'Скопировано — вставьте в чат и приложите файл',
    disclaimer: 'Расчёт ориентировочный. Поддержки считаются под нависания круче 45° при положении детали как в файле, а мы можем развернуть её выгоднее. Постобработка и доработка модели не учтены. Для точной цены и срока пришлите файл в Telegram.',
    msg: {
      reading: 'Читаем файл…',
      bad: 'Не получилось прочитать файл. Нужен STL; STEP и другие форматы пришлите в Telegram — посчитаем вручную.',
      big: 'Файл больше 150 МБ — пришлите его в Telegram, посчитаем вручную.',
      open: 'Модель не замкнута (есть дыры в сетке) — вес может быть посчитан неточно.',
      tiny: 'Деталь очень маленькая. Если размеры не те — проверьте единицы измерения в файле.',
      fit: 'Деталь больше рабочей зоны ({bed} мм). Модель можно разделить на части — напишите нам, подскажем.',
      fitComposite: 'Композитные пластики печатаем до {bed} мм. Выберите другой пластик или напишите нам — подскажем.',
      min: 'Минимальный заказ — {min} сум, поэтому итог не меньше этой суммы.',
      noGl: 'Предпросмотр недоступен в этом браузере, но расчёт работает.'
    },
    copyText: '3D-печать по STL: {file}, {mat}, заполнение {infill}%, {qty} шт. Габариты {size} мм, ≈ {weight} г/шт (поддержки ≈ {sup} г). Расчёт на сайте: ≈ {total} сум.'
  },
  uz: {
    title: '<em>STL</em> bo\'yicha kalkulyator',
    note: "Modelni yuklang: og'irligi va taxminiy narxini shu yerda, brauzerda hisoblaymiz. Fayl hech qayerga yuborilmaydi va saqlanmaydi.",
    drop: "<b>STL faylni shu yerga tashlang</b> yoki tanlash uchun bosing",
    dropHint: 'Binar yoki matnli STL, 150 MB gacha',
    noscript: "Kalkulyator uchun JavaScript kerak. Faylni Telegramga yuboring — qo'lda hisoblaymiz.",
    other: 'Boshqa fayl',
    rotate: 'Aylantirish uchun torting',
    legend: 'osilgan qismlar',
    material: 'Plastik',
    infill: "To'ldirish",
    infillNames: { 15: 'Yengil', 20: 'Oddiy', 40: 'Mustahkam', 100: "To'liq" },
    qty: 'Miqdori, dona',
    unit: "O'lchov birligi",
    unitNames: { mm: 'mm', cm: 'sm', in: 'dyuym', m: 'metr' },
    size: "O'lchamlari",
    volume: 'Model hajmi',
    weight: "1 dona og'irligi",
    supports: 'shundan tayanchlar',
    perGram: 'Gramm narxi',
    perPiece: '1 dona narxi',
    total: 'Taxminiy narx',
    empty: 'STL yuklang',
    sum: "so'm",
    g: 'g',
    cm3: 'sm³',
    mm: 'mm',
    pcs: 'dona',
    tg: 'Aniq narx Telegramda',
    copy: 'Hisobni nusxalash',
    copied: 'Nusxalandi — chatga qo\'ying va faylni biriktiring',
    disclaimer: "Hisob taxminiy. Tayanchlar 45° dan tik osilgan qismlar ostiga, detal fayldagidek joylashganda hisoblanadi — biz uni foydaliroq aylantirishimiz mumkin. Keyingi ishlov va modelni tuzatish hisobga olinmagan. Aniq narx va muddat uchun faylni Telegramga yuboring.",
    msg: {
      reading: "Fayl o'qilmoqda…",
      bad: "Faylni o'qib bo'lmadi. STL kerak; STEP va boshqa formatlarni Telegramga yuboring — qo'lda hisoblaymiz.",
      big: "Fayl 150 MB dan katta — uni Telegramga yuboring, qo'lda hisoblaymiz.",
      open: "Model yopiq emas (to'rda teshiklar bor) — og'irlik noaniq hisoblanishi mumkin.",
      tiny: "Detal juda kichik. O'lchamlar noto'g'ri bo'lsa — fayldagi o'lchov birligini tekshiring.",
      fit: "Detal ish maydonidan katta ({bed} mm). Modelni qismlarga bo'lish mumkin — bizga yozing, maslahat beramiz.",
      fitComposite: "Kompozit plastiklarni {bed} mm gacha chop etamiz. Boshqa plastikni tanlang yoki bizga yozing.",
      min: "Minimal buyurtma — {min} so'm, shuning uchun jami bu summadan kam emas.",
      noGl: "Bu brauzerda oldindan ko'rish mavjud emas, lekin hisob ishlaydi."
    },
    copyText: "STL bo'yicha 3D chop etish: {file}, {mat}, to'ldirish {infill}%, {qty} dona. O'lchamlari {size} mm, ≈ {weight} g/dona (tayanchlar ≈ {sup} g). Saytdagi hisob: ≈ {total} so'm."
  }
};

module.exports = { SITE_URL, CONTACTS, T, STEPS, STEPS_TITLE, STEP_LABEL, CALC, CALC_T, businessNode };
