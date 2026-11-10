'use strict'

/**
 * Business facts shared by every page (NAP, links) and UI strings per language.
 * Working hours are intentionally not published (owner's request).
 * Change contact details here only — header, footer, JSON-LD and llms.txt all read from this file
 * (llms.txt is hand-written: keep it in sync when facts change).
 */

const SITE_URL = 'https://3dpie.uz'

const CONTACTS = {
  phone: '+998901391094',
  phoneHuman: '+998 90 139 10 94',
  telegram: 'https://t.me/pie3d',
  telegramHandle: '@pie3d',
  instagram: 'https://www.instagram.com/3dpie.uz',
  instagramHandle: '@3dpie.uz',
  geo: { lat: 41.453319, lng: 69.557021 },
  postalCode: '111727',
  mapEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1301.6256151982968!2d69.5570212281913!3d41.45332872531939!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38aefb69d2c4e733%3A0x655af263ac156173!2z0YPQu9C40YbQsCDQkNC80LjRgNCwINCi0LXQvNGD0YDQsCA2MiDQsCwg0KfQuNGA0YfQuNC6LCDQotCw0YjQutC10L3RgtGB0LrQsNGPINC-0LHQu9Cw0YHRgtGMLCDQo9C30LHQtdC60LjRgdGC0LDQvQ!5e0!3m2!1sru!2s!4v1762893583444!5m2!1sru!2s',
  mapLink: 'https://maps.google.com/?q=41.453319,69.557021',
  yandexMap: 'https://yandex.uz/maps/-/CPrdnOOs',
  whatsapp: 'https://wa.me/998901391094',
}

// STL calculator on the prices page (js/calc.js reads this as JSON). Estimate only — exact price in Telegram.
// Prices are per gram of plastic (owner, 2026-10; ABS 1 500 since 2026-11). Build volumes in mm; composites print on a smaller
// machine. Never name the printers on the site. Densities are typical filament values, g/cm³.
const CALC = {
  minOrder: 100000,
  maxPlates: 10, // models in one estimate, each on its own plate
  bed: [420, 420, 500],
  bedComposite: [245, 245, 245],
  shellMm: 0.85, // walls + top/bottom skin at the default wall count, counted as solid plastic
  overhangDeg: 45, // faces tilted more than this from vertical get supports
  // Advanced mode: what the visitor may change. Defaults equal the simple mode.
  walls: { min: 1, max: 8, def: 2 }, // one wall = shellMm / def
  layers: [0.12, 0.16, 0.2, 0.28], // layer height, mm
  layerDefault: 0.2,
  overhangs: [30, 45, 60], // selectable support thresholds, degrees
  // Print time estimate (shown as approximate). These are typical FDM figures, NOT measured on the
  // studio's machines — tune them if the estimate is off. Speeds are averages incl. acceleration, mm/s;
  // maxFlow caps how much plastic the nozzle melts, mm³/s; materials scale all of it by `speed`.
  time: {
    lineWidth: 0.42,
    speed: { wall: 60, infill: 120, support: 100 },
    maxFlow: 12,
    travel: 1.1, // share of non-printing moves
    layerSec: 3, // layer change
    startSec: 360, // heating and bed levelling
  },
  supportFill: 0.15, // share of the space under an overhang filled by support plastic
  materials: [
    { id: 'pla', name: 'PLA', price: 1000, density: 1.24, speed: 1 },
    { id: 'petg', name: 'PETG', price: 1000, density: 1.27, speed: 0.8 },
    { id: 'abs', name: 'ABS', price: 1500, density: 1.04, speed: 0.9 },
    {
      id: 'petg-cf',
      name: 'PETG-CF',
      price: 1500,
      density: 1.3,
      speed: 0.7,
      composite: true,
    },
    { id: 'tpu', name: 'TPU', price: 1500, density: 1.21, speed: 0.35 },
    { id: 'nylon', name: 'Nylon PA6', price: 5000, density: 1.13, speed: 0.6 },
  ],
  materialDefault: 'petg',
  infill: [15, 20, 40, 100],
  infillDefault: 20,
  units: [
    ['mm', 1],
    ['cm', 10],
    ['in', 25.4],
    ['m', 1000],
  ],
}

// Price texts for pages, schema and social images. Always built from CALC, so the calculator,
// the page texts and JSON-LD cannot disagree. Change a price in CALC — every page follows.
// llms.txt is hand-written: `npm run check` compares it with these numbers.
function money(n, sep) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep || ' ')
}

const PRICE_WORDS = {
  ru: { and: 'и', sum: 'сум', perGram: p => `${p} сум за грамм`, short: p => `${p} сум/г` },
  uz: { and: 'va', sum: "so'm", perGram: p => `grammi ${p} so'm`, short: p => `${p} so'm/g` },
}

// Materials grouped by price, cheapest first: [{ price, names: ['PLA', 'PETG', 'ABS'] }, …]
const PRICE_TIERS = []
for (const m of CALC.materials) {
  let tier = PRICE_TIERS.find(t => t.price === m.price)
  if (!tier) PRICE_TIERS.push((tier = { price: m.price, names: [] }))
  tier.names.push(m.name)
}
PRICE_TIERS.sort((x, y) => x.price - y.price)

function priceTexts(lang) {
  const w = PRICE_WORDS[lang]
  const list = names =>
    names.length > 1
      ? `${names.slice(0, -1).join(', ')} ${w.and} ${names[names.length - 1]}`
      : names[0]
  const base = PRICE_TIERS[0]
  return {
    baseNames: list(base.names), // "PLA, PETG и ABS"
    basePerGram: w.perGram(money(base.price)), // "1 000 сум за грамм"
    basePerGramNb: w.perGram(money(base.price, '&nbsp;')),
    // "PLA, PETG и ABS — 1 000 сум за грамм, PETG-CF и TPU — 1 500 сум, Nylon PA6 — 5 000 сум"
    tiers: PRICE_TIERS.map(
      (t, i) =>
        `${list(t.names)} — ${i === 0 ? w.perGram(money(t.price)) : `${money(t.price)} ${w.sum}`}`,
    ).join(', '),
    // rows for a spec list: ['PLA, PETG, ABS', '1 000 сум/г']
    spec: PRICE_TIERS.map(t => [t.names.join(', '), w.short(money(t.price))]),
  }
}

const PRICES = {
  minOrder: CALC.minOrder, // number, for JSON-LD
  min: money(CALC.minOrder), // "100 000"
  minNb: money(CALC.minOrder, '&nbsp;'),
  bed: CALC.bed.join(' × '), // "420 × 420 × 500"
  bedComposite: CALC.bedComposite.join(' × '),
  tiers: PRICE_TIERS,
  ru: priceTexts('ru'),
  uz: priceTexts('uz'),
}

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
      { href: '/#contact', label: 'Контакты', key: 'contact' },
    ],
    menu: 'Меню',
    langLabel: 'Язык сайта',
    ctaTelegram: 'Отправить фото в Telegram',
    ctaTelegramShort: 'Telegram',
    ctaCall: 'Позвонить',
    tgText: 'Здравствуйте! Пишу с сайта 3dpie.uz.',
    mapsLabel: 'На карте',
    address: {
      street: 'ул. Амира Тимура, 62а',
      city: 'Чирчик',
      region: 'Ташкентская область',
      full: 'Ташкентская обл., г. Чирчик, ул. Амира Тимура, 62а',
      landmark: 'Ориентир: 10-я автобаза',
      landmarkName: '10-я автобаза',
    },
    priceRange: `от ${PRICES.min} сум`,
    footerAbout:
      'Студия 3D-печати, 3D-сканирования и 3D-моделирования: 3д печать пластиковых и резиновых деталей на заказ по фото и образцу. Производство в Чирчике, доставка по Ташкенту и области, отправка по Узбекистану через BTS и Яндекс Доставку.',
    footerServices: 'Услуги',
    footerInfo: 'Полезное',
    footerContacts: 'Связь',
    footerInfoLinks: [
      { href: '/ceny/', label: 'Цены на 3D-печать' },
      { href: '/materialy/', label: 'Какой пластик выбрать' },
      { href: '/#gallery', label: 'Примеры работ' },
      { href: '/#faq', label: 'Вопросы и ответы' },
      { href: '/#contact', label: 'Как нас найти' },
    ],
    copyright: '© 2023–2026 3DPie. 3D-печать на заказ в Узбекистане.',
    breadcrumbLabel: 'Навигационная цепочка',
    worksTitle: 'Наши работы по теме',
    workKicker: 'Наша работа',
    workAbout: 'О работе',
    workPhotos: 'Фото',
    workServices: 'Услуги по теме',
    workOthers: 'Другие работы',
    workTitleTail: ' — 3D-печать в Ташкенте | 3DPie',
    workDescTail: ' Работа студии 3DPie: 3D-печать на заказ в Ташкенте и Чирчике.',
    workTg: 'Здравствуйте! Хочу заказать похожее: ',
    worksMore: 'Все работы',
    faqTitle: 'Вопросы и ответы',
    relatedTitle: 'Другие услуги',
    ctaBandTitle: 'Пришлите фото детали — назовём цену',
    ctaBandText:
      'Сфотографируйте деталь или обломок рядом с линейкой и напишите, для чего она. Консультация бесплатная.',
    more: 'Подробнее',
    businessDescription:
      `3DPie — студия 3D-печати, 3D-сканирования и 3D-моделирования в Чирчике (Ташкентская область, Узбекистан). Изготавливает пластиковые и резиновые детали на заказ для частных клиентов и бизнеса по фото, образцу или чертежу: автозапчасти, шестерни и детали для техники, корпуса, серийные партии, реверс-инжиниринг сломанных деталей. Материалы PLA, PETG, PETG-CF, ABS, TPU, Nylon. Заказ от ${PRICES.min} сум, простая деталь — 1–2 дня, консультация бесплатная. Доставка по Ташкенту и Ташкентской области, отправка по Узбекистану через BTS и Яндекс Доставку.`,
    areaNames: {
      chirchiq: 'Чирчик',
      tashkent: 'Ташкент',
      region: 'Ташкентская область',
      country: 'Узбекистан',
    },
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
      { href: '/uz.html#contact', label: 'Aloqa', key: 'contact' },
    ],
    menu: 'Menyu',
    langLabel: 'Sayt tili',
    ctaTelegram: 'Telegramga rasm yuborish',
    ctaTelegramShort: 'Telegram',
    ctaCall: "Qo'ng'iroq qilish",
    tgText: 'Assalomu alaykum! 3dpie.uz saytidan yozyapman.',
    mapsLabel: 'Xaritada',
    address: {
      street: "Amir Temur ko'chasi, 62a",
      city: 'Chirchiq',
      region: 'Toshkent viloyati',
      full: "Toshkent viloyati, Chirchiq sh., Amir Temur ko'chasi, 62a",
      landmark: "Mo'ljal: 10-avtobaza",
      landmarkName: '10-avtobaza',
    },
    priceRange: `${PRICES.min} so'mdan`,
    footerAbout:
      "3D chop etish (3D bosib chiqarish, 3D pechat), 3D skanerlash va 3D modellashtirish studiyasi: rasm va namuna bo'yicha plastik va rezina detallar. Ishlab chiqarish Chirchiqda, Toshkent va viloyat bo'ylab yetkazib berish, O'zbekiston bo'ylab BTS va Yandex orqali jo'natish.",
    footerServices: 'Xizmatlar',
    footerInfo: 'Foydali',
    footerContacts: 'Aloqa',
    footerInfoLinks: [
      { href: '/uz/narxlar/', label: '3D chop etish narxlari' },
      { href: '/uz/materiallar/', label: 'Qaysi plastikni tanlash kerak' },
      { href: '/uz.html#gallery', label: 'Ishlarimiz' },
      { href: '/uz.html#faq', label: 'Savol-javoblar' },
      { href: '/uz.html#contact', label: 'Manzil' },
    ],
    copyright:
      "© 2023–2026 3DPie. O'zbekistonda buyurtma asosida 3D chop etish.",
    breadcrumbLabel: 'Navigatsiya',
    worksTitle: 'Shu mavzudagi ishlarimiz',
    workKicker: 'Bizning ish',
    workAbout: 'Ish haqida',
    workPhotos: 'Rasmlar',
    workServices: 'Mavzuga oid xizmatlar',
    workOthers: 'Boshqa ishlar',
    workTitleTail: ' — Toshkentda 3D chop etish | 3DPie',
    workDescTail: ' 3DPie studiyasi ishi: Toshkent va Chirchiqda buyurtma asosida 3D chop etish.',
    workTg: "Assalomu alaykum! Shunga o'xshash buyurtma bermoqchiman: ",
    worksMore: 'Barcha ishlar',
    faqTitle: 'Savol-javoblar',
    relatedTitle: 'Boshqa xizmatlar',
    ctaBandTitle: 'Detal rasmini yuboring — narxini aytamiz',
    ctaBandText:
      "Detalni yoki uning siniq bo'lagini chizg'ich yonida suratga oling va nima uchun kerakligini yozing. Konsultatsiya bepul.",
    more: 'Batafsil',
    businessDescription:
      `3DPie — Chirchiqdagi (Toshkent viloyati, O'zbekiston) 3D chop etish, 3D skanerlash va 3D modellashtirish studiyasi. Jismoniy shaxslar va biznes uchun rasm, namuna yoki chizma asosida plastik va rezina detallarni buyurtma asosida tayyorlaydi: avtoehtiyot qismlar, texnika uchun tishli g'ildiraklar va detallar, korpuslar, seriyali partiyalar, singan detallarni teskari muhandislik orqali tiklash. Materiallar: PLA, PETG, PETG-CF, ABS, TPU, Nylon. Buyurtma ${PRICES.min} so'mdan, oddiy detal — 1–2 kun, konsultatsiya bepul. Toshkent va Toshkent viloyati bo'ylab yetkazib berish, O'zbekiston bo'ylab BTS va Yandex orqali jo'natish.`,
    areaNames: {
      chirchiq: 'Chirchiq',
      tashkent: 'Toshkent',
      region: 'Toshkent viloyati',
      country: "O'zbekiston",
    },
  },
}

// Order steps shown on the home page and on every service page.
const STEPS = {
  ru: [
    {
      t: 'Пришлите фото или образец',
      d: 'Фото детали рядом с линейкой, размеры, эскиз или готовый файл (STL, STEP). Образец можно привезти в Чирчик.',
    },
    {
      t: 'Получите цену и срок',
      d: 'Консультация бесплатная. Цену называем до начала работы, без скрытых доплат.',
    },
    {
      t: 'Сканируем, моделируем, печатаем',
      d: 'Если файла нет — снимаем форму 3D-сканером или по размерам и строим модель сами. Простая деталь готова за 1–2 дня, сложный проект — за 3–7 дней.',
    },
    {
      t: 'Забираете или получаете доставкой',
      d: 'Самовывоз в Чирчике, курьер по Ташкенту и Ташкентской области, в другие регионы — BTS или Яндекс Доставка (платно).',
    },
  ],
  uz: [
    {
      t: 'Rasm yoki namuna yuboring',
      d: "Detalning chizg'ich yonidagi rasmi, o'lchamlari, eskiz yoki tayyor fayl (STL, STEP). Namunani Chirchiqqa olib kelishingiz mumkin.",
    },
    {
      t: 'Narx va muddatni biling',
      d: "Konsultatsiya bepul. Narxni ish boshlanishidan oldin aytamiz, yashirin to'lovlarsiz.",
    },
    {
      t: 'Skanerlaymiz, modellashtiramiz, chop etamiz',
      d: "Fayl bo'lmasa — shaklni 3D skaner yoki o'lchamlar bo'yicha olib, modelni o'zimiz yaratamiz. Oddiy detal 1–2 kunda, murakkab loyiha 3–7 kunda tayyor.",
    },
    {
      t: 'Olib keting yoki yetkazib beramiz',
      d: "Chirchiqdan olib ketish, Toshkent va Toshkent viloyati bo'ylab kuryer, boshqa viloyatlarga — BTS yoki Yandex orqali (pullik).",
    },
  ],
}

const STEPS_TITLE = { ru: 'Как заказать', uz: 'Qanday buyurtma beriladi' }
const STEP_LABEL = { ru: 'Шаг', uz: 'Qadam' }

function businessNode(lang) {
  const t = T[lang]
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
      `${SITE_URL}/gallery/ev-charger-adapter/ev-charger-adapter-poster.webp`,
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
      addressCountry: 'UZ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: CONTACTS.geo.lat,
      longitude: CONTACTS.geo.lng,
    },
    hasMap: CONTACTS.mapLink,
    areaServed: [
      { '@type': 'City', name: t.areaNames.chirchiq },
      { '@type': 'City', name: t.areaNames.tashkent },
      { '@type': 'AdministrativeArea', name: t.areaNames.region },
      { '@type': 'Country', name: t.areaNames.country },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: CONTACTS.phone,
      contactType: 'customer service',
      areaServed: 'UZ',
      availableLanguage: ['ru', 'uz'],
    },
    knowsAbout: [
      '3D printing',
      '3D scanning',
      '3D modeling',
      'reverse engineering',
      'Fusion 360',
      'FDM',
      'PLA',
      'PETG',
      'PETG-CF',
      'ABS',
      'TPU',
      'Nylon',
      'prototyping',
      'small batch production',
    ],
    sameAs: [CONTACTS.instagram, CONTACTS.telegram],
  }
}

const CALC_T = {
  ru: {
    title: 'Калькулятор <em>3D-печати</em>',
    note: 'Загрузите одну или несколько моделей: посчитаем вес, время печати и примерную цену прямо в браузере. Файлы никуда не отправляются и не сохраняются.',
    drop: '<b>Перетащите файлы моделей сюда</b> или нажмите, чтобы выбрать',
    dropHint: 'STL, OBJ или 3MF до 100 МБ. Можно несколько: каждая модель — на отдельном столе',
    plate: 'Стол',
    plates: 'Столы с моделями',
    platesTitle: 'Столы',
    addModel: 'Добавить модель',
    addHint: 'на отдельный стол',
    remove: 'Убрать модель',
    settings: 'Параметры печати',
    scopeLabel: 'Для каких столов параметры',
    scopeCommon: 'Общие',
    scopeCommonSub: 'для всех столов',
    scopePlateSub: 'свои параметры',
    hintCommon: 'Действуют на все столы. Отдельному столу можно задать свои — переключитесь на него.',
    hintCommonOwn: 'У открытого стола есть свои параметры: для него они важнее общих.',
    hintPlate: 'Что измените здесь — только для этого стола. Остальное берётся из общих.',
    asCommon: 'как в общих',
    ownTag: 'свои',
    resetPlate: 'Вернуть столу общие параметры',
    models: 'Моделей',
    pieces: 'Деталей',
    sumWeight: 'Общий вес',
    sumTime: 'Время печати (примерно)',
    noscript:
      'Для калькулятора нужен JavaScript. Пришлите файл в Telegram — посчитаем вручную.',
    other: 'Заменить файл',
    rotate: 'Потяните — повернуть, колесо или щипок — масштаб',
    faceHint: 'Нажмите на грань модели — она ляжет на стол',
    zoomIn: 'Приблизить',
    zoomOut: 'Отдалить',
    zoomFit: 'Показать целиком',
    orient: 'Положение на столе',
    orientAuto: 'Авто',
    orientAutoTitle: 'Подобрать положение с наименьшими поддержками',
    orientFace: 'Гранью на стол',
    orientX: 'Повернуть вокруг X на 90°',
    orientY: 'Повернуть вокруг Y на 90°',
    orientReset: 'Как в файле',
    legend: 'нависания',
    material: 'Пластик',
    advanced: 'Продвинутый режим',
    advancedHint: 'Высота слоя, стенки, точное заполнение и поддержки',
    infill: 'Заполнение',
    infillExact: 'Точное заполнение',
    layer: 'Высота слоя',
    layerNames: { 0.12: 'Детально', 0.16: 'Тонко', 0.2: 'Обычно', 0.28: 'Быстро' },
    walls: 'Стенки, шт',
    support: 'Поддержки',
    supportOff: 'Без поддержек',
    supportAt: 'Нависания круче {deg}°',
    reset: 'Сбросить настройки',
    infillNames: {
      15: 'Лёгкое',
      20: 'Обычное',
      40: 'Прочное',
      100: 'Сплошное',
    },
    qty: 'Количество, шт',
    unit: 'Единицы в файле',
    unitNames: { mm: 'мм', cm: 'см', in: 'дюймы', m: 'метры' },
    size: 'Габариты',
    volume: 'Объём модели',
    weight: 'Вес 1 шт',
    supports: 'в т. ч. поддержки',
    perGram: 'Цена за грамм',
    time: 'Время печати 1 шт (примерно)',
    h: 'ч',
    min: 'мин',
    perPiece: 'Цена 1 шт',
    total: 'Примерная стоимость',
    empty: 'Загрузите модель',
    sum: 'сум',
    g: 'г',
    cm3: 'см³',
    mm: 'мм',
    pcs: 'шт',
    tg: 'Точная цена в Telegram',
    send: 'Отправить расчёт в Telegram',
    save: 'Сохранить',
    copy: 'Скопировать',
    copied: 'Скопировано — вставьте в чат и приложите файл модели.',
    sent: 'Расчёт подставлен в сообщение — приложите к нему файл модели.',
    saved: 'Картинка с расчётом сохранена — её можно отправить нам в Telegram.',
    saveFail: 'Не получилось сохранить картинку — скопируйте расчёт текстом.',
    disclaimer:
      'Расчёт ориентировочный. Поддержки считаются под нависания для выбранного положения детали — кнопка «Авто» подберёт положение, где их меньше всего. Время печати — примерное: это работа принтера без очереди, подготовки и постобработки; общее время — если печатать столы один за другим. Доработка модели не учтена. Точную цену и срок готовности назовём в Telegram.',
    card: {
      title: 'Расчёт 3D-печати',
      line1: '{mat} · заполнение {infill}% · слой {layer} мм · стенок: {walls}',
      line2: '{size} мм · {qty} шт',
      line3: '≈ {weight} г/шт ({sup})',
      line4: 'Печать 1 шт ≈ {time} (примерно)',
      note: 'Расчёт ориентировочный, время печати примерное. Точную цену и срок назовём в Telegram.',
    },
    msg: {
      reading: 'Читаем файл…',
      bad: 'Не получилось прочитать файл. Подходят STL, OBJ и 3MF; STEP и другие форматы пришлите в Telegram — посчитаем вручную.',
      big: 'Файл больше 100 МБ — пришлите его в Telegram, посчитаем вручную.',
      auto: 'Подбираем положение с наименьшими поддержками…',
      autoDone: 'Выбрано положение с наименьшими поддержками. Его можно изменить кнопками выше.',
      open: 'Модель не замкнута (есть дыры в сетке) — вес может быть посчитан неточно.',
      tiny: 'Деталь очень маленькая. Если размеры не те — проверьте единицы измерения в файле.',
      fit: 'Деталь больше рабочей зоны ({bed} мм). Модель можно разделить на части — напишите нам, подскажем.',
      fitComposite:
        'Композитные пластики печатаем до {bed} мм. Выберите другой пластик или напишите нам — подскажем.',
      min: 'Минимальный заказ — {min} сум, поэтому итог не меньше этой суммы.',
      noGl: 'Предпросмотр недоступен в этом браузере, но расчёт работает.',
      limit: 'В одном расчёте — до {max} моделей. Остальные пришлите в Telegram.',
    },
    copyHead: '3D-печать — расчёт на сайте {site}',
    copyItem:
      '{n}) {file} — {mat}, заполнение {infill}%, слой {layer} мм, стенок: {walls}, {qty} шт. Габариты {size} мм, ≈ {weight} г/шт ({sup}), печать 1 шт ≈ {time}, ≈ {sum} сум',
    copyItemShort: '{n}) {file} — {mat}, {qty} шт, ≈ {sum} сум',
    copyTotal:
      'Итого: моделей — {count}, деталей — {pieces}, ≈ {weight} г. Время печати ≈ {time} (примерно). Расчёт на сайте: ≈ {total} сум.',
    copySup: 'поддержки ≈ {sup} г',
    copyNoSup: 'без поддержек',
  },
  uz: {
    title: '3D chop etish <em>kalkulyatori</em>',
    note: "Bitta yoki bir nechta modelni yuklang: og'irligi, chop etish vaqti va taxminiy narxini shu yerda, brauzerda hisoblaymiz. Fayllar hech qayerga yuborilmaydi va saqlanmaydi.",
    drop: '<b>Model fayllarini shu yerga tashlang</b> yoki tanlash uchun bosing',
    dropHint: 'STL, OBJ yoki 3MF, 100 MB gacha. Bir nechta fayl mumkin: har bir model — alohida stolda',
    plate: 'Stol',
    plates: 'Modelli stollar',
    platesTitle: 'Stollar',
    addModel: "Model qo'shish",
    addHint: 'alohida stolga',
    remove: 'Modelni olib tashlash',
    settings: 'Chop etish parametrlari',
    scopeLabel: 'Parametrlar qaysi stollar uchun',
    scopeCommon: 'Umumiy',
    scopeCommonSub: 'barcha stollar uchun',
    scopePlateSub: 'maxsus parametrlar',
    hintCommon: "Barcha stollarga ta'sir qiladi. Alohida stolga maxsus parametrlar berish uchun unga o'ting.",
    hintCommonOwn: "Ochiq stolning maxsus parametrlari bor: u uchun ular umumiydan ustun.",
    hintPlate: "Bu yerda o'zgartirganingiz faqat shu stol uchun. Qolganlari umumiydan olinadi.",
    asCommon: 'umumiydagidek',
    ownTag: 'maxsus',
    resetPlate: 'Stolga umumiy parametrlarni qaytarish',
    models: 'Modellar',
    pieces: 'Detallar',
    sumWeight: "Umumiy og'irlik",
    sumTime: 'Chop etish vaqti (taxminan)',
    noscript:
      "Kalkulyator uchun JavaScript kerak. Faylni Telegramga yuboring — qo'lda hisoblaymiz.",
    other: 'Faylni almashtirish',
    rotate: "Torting — aylantirish, g'ildirak yoki chimdish — masshtab",
    faceHint: 'Model yuzasini bosing — u stolga yotadi',
    zoomIn: 'Yaqinlashtirish',
    zoomOut: 'Uzoqlashtirish',
    zoomFit: "To'liq ko'rsatish",
    orient: 'Stoldagi holati',
    orientAuto: 'Avto',
    orientAutoTitle: 'Eng kam tayanchli holatni tanlash',
    orientFace: 'Yuzasi bilan stolga',
    orientX: 'X atrofida 90° burish',
    orientY: 'Y atrofida 90° burish',
    orientReset: 'Fayldagidek',
    legend: 'osilgan qismlar',
    material: 'Plastik',
    advanced: 'Kengaytirilgan rejim',
    advancedHint: "Qatlam balandligi, devorlar, aniq to'ldirish va tayanchlar",
    infill: "To'ldirish",
    infillExact: "Aniq to'ldirish",
    layer: 'Qatlam balandligi',
    layerNames: { 0.12: 'Batafsil', 0.16: 'Nozik', 0.2: 'Oddiy', 0.28: 'Tez' },
    walls: 'Devorlar, dona',
    support: 'Tayanchlar',
    supportOff: 'Tayanchlarsiz',
    supportAt: '{deg}° dan tik osilgan qismlar',
    reset: 'Sozlamalarni tiklash',
    infillNames: { 15: 'Yengil', 20: 'Oddiy', 40: 'Mustahkam', 100: "To'liq" },
    qty: 'Miqdori, dona',
    unit: "O'lchov birligi",
    unitNames: { mm: 'mm', cm: 'sm', in: 'dyuym', m: 'metr' },
    size: "O'lchamlari",
    volume: 'Model hajmi',
    weight: "1 dona og'irligi",
    supports: 'shundan tayanchlar',
    perGram: 'Gramm narxi',
    time: '1 dona chop etish vaqti (taxminan)',
    h: 'soat',
    min: 'daq.',
    perPiece: '1 dona narxi',
    total: 'Taxminiy narx',
    empty: 'Modelni yuklang',
    sum: "so'm",
    g: 'g',
    cm3: 'sm³',
    mm: 'mm',
    pcs: 'dona',
    tg: 'Aniq narx Telegramda',
    send: 'Hisobni Telegramga yuborish',
    save: 'Saqlash',
    copy: 'Nusxalash',
    copied: "Nusxalandi — chatga qo'ying va model faylini biriktiring.",
    sent: "Hisob xabarga qo'yildi — unga model faylini biriktiring.",
    saved: 'Hisob rasmi saqlandi — uni bizga Telegramda yuborishingiz mumkin.',
    saveFail: "Rasmni saqlab bo'lmadi — hisobni matn sifatida nusxalang.",
    disclaimer:
      "Hisob taxminiy. Tayanchlar tanlangan holat uchun osilgan qismlar ostiga hisoblanadi — «Avto» tugmasi ular eng kam bo'lgan holatni tanlaydi. Chop etish vaqti — taxminiy: bu printerning ishi, navbat, tayyorgarlik va keyingi ishlovsiz; umumiy vaqt — stollar ketma-ket chop etilganda. Modelni tuzatish hisobga olinmagan. Aniq narx va tayyor bo'lish muddatini Telegramda aytamiz.",
    card: {
      title: '3D chop etish hisobi',
      line1: "{mat} · to'ldirish {infill}% · qatlam {layer} mm · devorlar: {walls}",
      line2: '{size} mm · {qty} dona',
      line3: '≈ {weight} g/dona ({sup})',
      line4: '1 dona chop etish ≈ {time} (taxminan)',
      note: 'Hisob taxminiy, chop etish vaqti ham taxminiy. Aniq narx va muddatni Telegramda aytamiz.',
    },
    msg: {
      reading: "Fayl o'qilmoqda…",
      bad: "Faylni o'qib bo'lmadi. STL, OBJ va 3MF mos keladi; STEP va boshqa formatlarni Telegramga yuboring — qo'lda hisoblaymiz.",
      big: "Fayl 100 MB dan katta — uni Telegramga yuboring, qo'lda hisoblaymiz.",
      auto: 'Eng kam tayanchli holat tanlanmoqda…',
      autoDone: "Eng kam tayanchli holat tanlandi. Uni yuqoridagi tugmalar bilan o'zgartirish mumkin.",
      open: "Model yopiq emas (to'rda teshiklar bor) — og'irlik noaniq hisoblanishi mumkin.",
      tiny: "Detal juda kichik. O'lchamlar noto'g'ri bo'lsa — fayldagi o'lchov birligini tekshiring.",
      fit: "Detal ish maydonidan katta ({bed} mm). Modelni qismlarga bo'lish mumkin — bizga yozing, maslahat beramiz.",
      fitComposite:
        'Kompozit plastiklarni {bed} mm gacha chop etamiz. Boshqa plastikni tanlang yoki bizga yozing.',
      min: "Minimal buyurtma — {min} so'm, shuning uchun jami bu summadan kam emas.",
      noGl: "Bu brauzerda oldindan ko'rish mavjud emas, lekin hisob ishlaydi.",
      limit: 'Bitta hisobda {max} tagacha model. Qolganlarini Telegramga yuboring.',
    },
    copyHead: '3D chop etish — {site} saytidagi hisob',
    copyItem:
      "{n}) {file} — {mat}, to'ldirish {infill}%, qatlam {layer} mm, devorlar: {walls}, {qty} dona. O'lchamlari {size} mm, ≈ {weight} g/dona ({sup}), 1 dona chop etish ≈ {time}, ≈ {sum} so'm",
    copyItemShort: "{n}) {file} — {mat}, {qty} dona, ≈ {sum} so'm",
    copyTotal:
      "Jami: modellar — {count}, detallar — {pieces}, ≈ {weight} g. Chop etish vaqti ≈ {time} (taxminan). Saytdagi hisob: ≈ {total} so'm.",
    copySup: 'tayanchlar ≈ {sup} g',
    copyNoSup: 'tayanchlarsiz',
  },
}

module.exports = {
  SITE_URL,
  CONTACTS,
  T,
  STEPS,
  STEPS_TITLE,
  STEP_LABEL,
  CALC,
  CALC_T,
  PRICES,
  money,
  businessNode,
}
