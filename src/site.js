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

module.exports = { SITE_URL, CONTACTS, T, STEPS, STEPS_TITLE, STEP_LABEL, businessNode };
