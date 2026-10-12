'use strict';

const UPDATED = '2026-10-12';

module.exports = [
  {
    id: 'prices',
    lang: 'ru',
    type: 'service',
    path: '/ceny/',
    updated: UPDATED,
    nav: 'prices',
    breadcrumb: 'Цены на 3D-печать',
    navTitle: 'Цены на 3D-печать',
    title: 'Цены на 3D-печать в Ташкенте — заказ от 100 000 сум | 3DPie',
    description: 'Сколько стоит 3D-печать в Ташкенте и Чирчике: минимальный заказ 100 000 сум, от чего зависит цена детали, сроки 1–7 дней, скидки на серии. Пришлите фото — консультация бесплатная.',
    kicker: 'Цены и сроки',
    h1: 'Сколько стоит 3D-печать в Ташкенте',
    lead: 'Минимальный заказ в 3DPie — <strong>100 000 сум</strong>. Точную цену детали называем по фото или файлу до начала работы. Консультация бесплатная.',
    spec: [
      ['Минимальный заказ', '100 000 сум'],
      ['Консультация', 'бесплатно'],
      ['Простая деталь', '1–2 дня'],
      ['Сложный проект', '3–7 дней'],
      ['Серии и постоянные клиенты', 'скидки']
    ],
    sections: [
      {
        title: 'От чего зависит цена',
        html: `
<div class="table-wrap">
<table class="table">
<thead><tr><th scope="col">Фактор</th><th scope="col">Как влияет</th></tr></thead>
<tbody>
<tr><th scope="row">Размер и вес</th><td>Чем больше пластика и часов печати, тем дороже. Мелкие клипсы и заглушки — самые недорогие заказы.</td></tr>
<tr><th scope="row">Пластик</th><td>PLA и PETG дешевле, инженерные пластики (Nylon, TPU) — дороже.</td></tr>
<tr><th scope="row">3D-модель</th><td>Если у вас есть готовый файл STL или STEP — платите только за печать. Если модель нужно построить по образцу — добавляется моделирование.</td></tr>
<tr><th scope="row">Количество</th><td>В серии цена за штуку ниже: модель уже готова, а принтеры загружены эффективнее.</td></tr>
<tr><th scope="row">Срочность</th><td>Срочный заказ вне очереди может стоить дороже.</td></tr>
</tbody>
</table>
</div>`
      },
      {
        title: 'Как узнать цену своей детали',
        html: `
<ol>
<li>Сфотографируйте деталь рядом с линейкой — сверху и сбоку. Если есть файл STL или STEP — пришлите его.</li>
<li>Напишите в Telegram <a href="https://t.me/pie3d" target="_blank" rel="noopener">@pie3d</a> или позвоните <a href="tel:+998901391094">+998 90 139 10 94</a>: для чего деталь, сколько штук, к какому сроку.</li>
<li>Ответим с ценой и сроком. Консультация бесплатная — спрашивать можно о любой идее.</li>
</ol>
<p>Цену называем до начала работы, без скрытых доплат. Для юрлиц — договор и документы.</p>`
      }
    ],
    faq: [
      { q: 'Почему нет цены за грамм?', a: 'Цена за грамм не учитывает время печати, моделирование и сложность. Две детали одного веса могут печататься 2 и 10 часов. Поэтому считаем цену каждой детали отдельно — так честнее.' },
      { q: 'Сколько стоит напечатать одну маленькую деталь?', a: 'Минимальный заказ — 100 000 сум. Мелкие детали выгоднее заказывать партией: например, 200 креплений для кабеля мы напечатали за 2 дня.' },
      { q: 'Есть ли скидки?', a: 'Да: на серии одинаковых деталей и для постоянных клиентов.' }
    ],
    related: ['modeling', 'scanning', 'auto', 'gears'],
    service: { name: '3D-печать на заказ', serviceType: '3D-печать', minPrice: 100000 },
    sitemapImages: []
  },
  {
    id: 'prices',
    lang: 'uz',
    type: 'service',
    path: '/uz/narxlar/',
    updated: UPDATED,
    nav: 'prices',
    breadcrumb: '3D chop etish narxlari',
    navTitle: '3D chop etish narxlari',
    title: "Toshkentda 3D chop etish narxlari — buyurtma 100 000 so'mdan | 3DPie",
    description: "Toshkent va Chirchiqda 3D chop etish (3D pechat) narxi: minimal buyurtma 100 000 so'm, detal narxi nimaga bog'liq, muddatlar 1–7 kun, seriyalarga chegirma. Rasm yuboring — konsultatsiya bepul.",
    kicker: 'Narxlar va muddatlar',
    h1: 'Toshkentda 3D chop etish qancha turadi',
    lead: "3DPie'da minimal buyurtma — <strong>100 000 so'm</strong>. Detalning aniq narxini ish boshlanishidan oldin rasm yoki fayl bo'yicha aytamiz. Konsultatsiya bepul.",
    spec: [
      ['Minimal buyurtma', "100 000 so'm"],
      ['Konsultatsiya', 'bepul'],
      ['Oddiy detal', '1–2 kun'],
      ['Murakkab loyiha', '3–7 kun'],
      ['Seriyalar va doimiy mijozlar', 'chegirmalar']
    ],
    sections: [
      {
        title: "Narx nimaga bog'liq",
        html: `
<div class="table-wrap">
<table class="table">
<thead><tr><th scope="col">Omil</th><th scope="col">Qanday ta'sir qiladi</th></tr></thead>
<tbody>
<tr><th scope="row">O'lcham va og'irlik</th><td>Plastik va chop etish soatlari qancha ko'p bo'lsa, shuncha qimmat. Mayda klipsa va tiqinlar — eng arzon buyurtmalar.</td></tr>
<tr><th scope="row">Plastik</th><td>PLA va PETG arzonroq, muhandislik plastiklari (Nylon, TPU) qimmatroq.</td></tr>
<tr><th scope="row">3D model</th><td>Tayyor STL yoki STEP faylingiz bo'lsa — faqat chop etish uchun to'laysiz. Modelni namuna bo'yicha yaratish kerak bo'lsa — modellashtirish qo'shiladi.</td></tr>
<tr><th scope="row">Miqdor</th><td>Seriyada dona narxi arzonroq: model tayyor, printerlar samaraliroq yuklanadi.</td></tr>
<tr><th scope="row">Shoshilinchlik</th><td>Navbatdan tashqari shoshilinch buyurtma qimmatroq bo'lishi mumkin.</td></tr>
</tbody>
</table>
</div>`
      },
      {
        title: 'Detalingiz narxini qanday bilish mumkin',
        html: `
<ol>
<li>Detalni chizg'ich yonida yuqoridan va yon tomondan suratga oling. STL yoki STEP fayl bo'lsa — uni yuboring.</li>
<li>Telegramga yozing <a href="https://t.me/pie3d" target="_blank" rel="noopener">@pie3d</a> yoki qo'ng'iroq qiling <a href="tel:+998901391094">+998 90 139 10 94</a>: detal nima uchun, nechta kerak, qachongacha.</li>
<li>Narx va muddat bilan javob beramiz. Konsultatsiya bepul — istalgan g'oya haqida so'rashingiz mumkin.</li>
</ol>
<p>Narxni ish boshlanishidan oldin, yashirin to'lovlarsiz aytamiz. Yuridik shaxslar uchun — shartnoma va hujjatlar.</p>`
      }
    ],
    faq: [
      { q: 'Nega gramm narxi yo\'q?', a: "Gramm narxi chop etish vaqti, modellashtirish va murakkablikni hisobga olmaydi. Bir xil og'irlikdagi ikki detal 2 va 10 soat chop etilishi mumkin. Shuning uchun har bir detal narxini alohida hisoblaymiz — bu adolatliroq." },
      { q: 'Bitta kichik detalni chop etish qancha turadi?', a: "Minimal buyurtma — 100 000 so'm. Mayda detallarni partiya bilan buyurtma qilish foydaliroq: masalan, 200 ta kabel mahkamlagichini 2 kunda chop etdik." },
      { q: 'Chegirmalar bormi?', a: "Ha: bir xil detallar seriyasiga va doimiy mijozlar uchun." }
    ],
    related: ['modeling', 'scanning', 'auto', 'gears'],
    service: { name: 'Buyurtma asosida 3D chop etish', serviceType: '3D chop etish', minPrice: 100000 },
    sitemapImages: []
  }
];
