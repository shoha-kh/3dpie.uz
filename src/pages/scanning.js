'use strict';

const UPDATED = '2026-10-12';
const WORKS = ['ev-charger-adapter', 'ac-frame', 'broken-part-restore'];

module.exports = [
  {
    id: 'scanning',
    lang: 'ru',
    type: 'service',
    path: '/3d-skanirovanie/',
    updated: UPDATED,
    nav: 'services',
    breadcrumb: '3D-сканирование и реверс-инжиниринг',
    navTitle: '3D-сканирование и реверс-инжиниринг',
    title: '3D-сканирование деталей и реверс-инжиниринг в Ташкенте | 3DPie',
    description: '3D-сканирование деталей в Ташкенте и Чирчике: снимаем форму сложной или сломанной детали 3D-сканером, строим модель, усиливаем слабые места и печатаем. Реверс-инжиниринг для частных клиентов и бизнеса. От 100 000 сум.',
    kicker: 'Услуга · 3D-сканирование',
    h1: '3D-сканирование и реверс-инжиниринг',
    h1Html: '3D-сканирование и <em>реверс-инжиниринг</em>',
    lead: 'Когда у детали сложная форма и линейкой её не измерить, мы снимаем её 3D-сканером. По скану строим точную модель, исправляем то, из-за чего оригинал сломался, и печатаем новую деталь — пластиковую или резиновую.',
    heroImage: { src: '/gallery/ev-charger-adapter/ev-charger-adapter-poster.webp', w: 720, h: 1280, alt: 'Восстановленный корпус переходника зарядки электромобиля, сделанный по 3D-скану', caption: 'Корпус переходника зарядки электромобиля — по 3D-скану' },
    spec: [
      ['Что сканируем', 'сломанные детали, корпуса, места установки'],
      ['Результат', 'модель STL / STEP или готовая деталь'],
      ['Для кого', 'частные клиенты и бизнес'],
      ['Цена', 'от 100 000 сум, консультация бесплатно']
    ],
    sections: [
      {
        title: 'Когда нужен 3D-скан',
        html: `
<ul>
<li><strong>Сложная форма</strong> — изогнутые корпуса, детали салона, накладки, которые невозможно точно обмерить штангенциркулем.</li>
<li><strong>Деталь должна встать по месту</strong> — например, рамка вокруг кондиционера в кабине спецтехники: сканируем место установки и делаем рамку точно по нему.</li>
<li><strong>Оригинал сломан или изношен</strong> — восстанавливаем геометрию по скану, а слабые места делаем толще. Так мы восстановили корпус переходника зарядки электромобиля: через него идёт большой ток, и суперклей тут не вариант.</li>
<li><strong>Нужна серия копий</strong> — один раз сканируем и моделируем, дальше печатаем столько, сколько нужно.</li>
</ul>`
      },
      {
        title: 'Как проходит работа',
        html: `
<ol>
<li>Вы привозите деталь в Чирчик или передаёте курьером. Если деталь установлена на технике — обсуждаем выезд.</li>
<li>Сканируем деталь и получаем облако точек.</li>
<li>По скану строим чистую 3D-модель, дорабатываем крепления и толщину стенок.</li>
<li>Печатаем из подходящего материала: PETG, ABS, Nylon или гибкого TPU.</li>
</ol>
<p>Модель остаётся в файле — её можно получить в STL или STEP и повторить печать в любой момент.</p>`
      }
    ],
    works: WORKS,
    faq: [
      { q: 'Что такое реверс-инжиниринг?', a: 'Это восстановление 3D-модели по готовой детали, когда чертежей нет. Деталь сканируют или обмеряют, строят модель и по ней изготавливают копию — часто улучшенную.' },
      { q: 'Сколько стоит 3D-сканирование?', a: 'Зависит от размера и сложности детали. Минимальный заказ — 100 000 сум. Пришлите фото детали в Telegram — консультация бесплатная, цену назовём до начала работы.' },
      { q: 'Можно ли отсканировать деталь прямо на машине или технике?', a: 'Да, место установки тоже можно отсканировать — так мы делали рамку для кондиционера в кабине спецтехники. Условия выезда обсуждаем отдельно.' }
    ],
    related: ['modeling', 'auto', 'prices'],
    service: { name: '3D-сканирование и реверс-инжиниринг', serviceType: '3D-сканирование', minPrice: 100000 },
    hasGallery: true,
    sitemapImages: ['/gallery/ev-charger-adapter/ev-charger-adapter-poster.webp', '/gallery/ac-frame/ac-frame-poster.webp']
  },
  {
    id: 'scanning',
    lang: 'uz',
    type: 'service',
    path: '/uz/3d-skanerlash/',
    updated: UPDATED,
    nav: 'services',
    breadcrumb: '3D skanerlash va teskari muhandislik',
    navTitle: '3D skanerlash va teskari muhandislik',
    title: "3D skanerlash va reverse engineering Toshkentda | 3DPie",
    description: "Toshkent va Chirchiqda detallarni 3D skanerlash: murakkab yoki singan detal shaklini 3D skaner bilan olamiz, model yaratamiz, zaif joylarini mustahkamlaymiz va chop etamiz. Jismoniy shaxslar va biznes uchun teskari muhandislik. 100 000 so'mdan.",
    kicker: 'Xizmat · 3D skanerlash',
    h1: '3D skanerlash va teskari muhandislik',
    h1Html: '3D skanerlash va <em>teskari muhandislik</em>',
    lead: "Detal shakli murakkab bo'lib, uni chizg'ich bilan o'lchab bo'lmasa, biz uni 3D skaner bilan olamiz. Skan bo'yicha aniq model yaratamiz, original sinishiga sabab bo'lgan joyni tuzatamiz va yangi detalni chop etamiz — plastik yoki rezina.",
    heroImage: { src: '/gallery/ev-charger-adapter/ev-charger-adapter-poster.webp', w: 720, h: 1280, alt: "3D skan bo'yicha tiklangan elektromobil zaryad adapteri korpusi", caption: "Elektromobil zaryad adapteri korpusi — 3D skan bo'yicha" },
    spec: [
      ['Nimani skanerlaymiz', "singan detallar, korpuslar, o'rnatish joylari"],
      ['Natija', 'STL / STEP model yoki tayyor detal'],
      ['Kim uchun', 'jismoniy shaxslar va biznes'],
      ['Narx', "100 000 so'mdan, konsultatsiya bepul"]
    ],
    sections: [
      {
        title: '3D skan qachon kerak',
        html: `
<ul>
<li><strong>Murakkab shakl</strong> — egri korpuslar, salon detallari, nakladkalar, ularni shtangensirkul bilan aniq o'lchab bo'lmaydi.</li>
<li><strong>Detal joyiga aniq tushishi kerak</strong> — masalan, maxsus texnika kabinasidagi konditsioner atrofidagi ramka: o'rnatish joyini skanerlab, ramkani aynan unga moslab yasaymiz.</li>
<li><strong>Original singan yoki yeyilgan</strong> — geometriyani skan bo'yicha tiklaymiz, zaif joylarini qalinroq qilamiz. Elektromobil zaryad adapteri korpusini shunday tikladik: undan katta tok o'tadi, superkley bu yerda yaramaydi.</li>
<li><strong>Bir nechta nusxa kerak</strong> — bir marta skanerlab modellashtiramiz, keyin kerakli miqdorda chop etamiz.</li>
</ul>`
      },
      {
        title: 'Ish qanday kechadi',
        html: `
<ol>
<li>Detalni Chirchiqqa olib kelasiz yoki kuryer orqali yuborasiz. Detal texnikaga o'rnatilgan bo'lsa — joyiga borishni kelishamiz.</li>
<li>Detalni skanerlaymiz va nuqtalar bulutini olamiz.</li>
<li>Skan bo'yicha toza 3D model yaratamiz, mahkamlagichlar va devor qalinligini yaxshilaymiz.</li>
<li>Mos materialdan chop etamiz: PETG, ABS, Nylon yoki egiluvchan TPU.</li>
</ol>
<p>Model faylda saqlanadi — uni STL yoki STEP formatida olishingiz va istalgan vaqtda qayta chop etishingiz mumkin.</p>`
      }
    ],
    works: WORKS,
    faq: [
      { q: 'Teskari muhandislik (reverse engineering) nima?', a: "Bu chizmalar bo'lmaganda tayyor detal bo'yicha 3D modelni tiklash. Detal skanerlanadi yoki o'lchanadi, model yaratiladi va u bo'yicha nusxa — ko'pincha yaxshilangan nusxa tayyorlanadi." },
      { q: '3D skanerlash qancha turadi?', a: "Detal o'lchami va murakkabligiga bog'liq. Minimal buyurtma — 100 000 so'm. Detal rasmini Telegramga yuboring — konsultatsiya bepul, narxni ish boshlanishidan oldin aytamiz." },
      { q: 'Detalni mashina yoki texnikaning o\'zida skanerlash mumkinmi?', a: "Ha, o'rnatish joyini ham skanerlash mumkin — maxsus texnika kabinasidagi konditsioner ramkasini shunday qilganmiz. Borish shartlari alohida kelishiladi." }
    ],
    related: ['modeling', 'auto', 'prices'],
    service: { name: '3D skanerlash va teskari muhandislik', serviceType: '3D skanerlash', minPrice: 100000 },
    hasGallery: true,
    sitemapImages: ['/gallery/ev-charger-adapter/ev-charger-adapter-poster.webp', '/gallery/ac-frame/ac-frame-poster.webp']
  }
];
