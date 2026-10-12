'use strict';

const UPDATED = '2026-10-12';
const WORKS = ['broken-part-restore', 'flexible-rubber-parts', 'socket-box-caps'];

module.exports = [
  {
    id: 'gears',
    lang: 'ru',
    type: 'service',
    path: '/shesterni/',
    updated: UPDATED,
    nav: 'services',
    breadcrumb: 'Шестерни и детали для техники',
    navTitle: 'Шестерни и детали для техники',
    title: 'Шестерни на заказ в Ташкенте — печать шестерёнок и деталей для техники | 3DPie',
    description: 'Изготовим шестерню по образцу на 3D-принтере в Ташкенте и Чирчике: для мясорубки, блендера, миксера, привода ворот, станка. Ручки, втулки, ролики, крепления для бытовой техники. От 100 000 сум.',
    kicker: 'Услуга · шестерни и запчасти',
    h1: 'Шестерни и пластиковые детали для бытовой техники и механизмов',
    lead: 'Шестерёнка в мясорубке или блендере сломалась, а сервис говорит «такой нет»? Принесите старую — даже со стёртыми зубьями. Снимем параметры, смоделируем и напечатаем новую из прочного пластика.',
    heroImage: { src: '/gallery/flexible-rubber-parts/flexible-rubber-parts-poster.webp', w: 800, h: 855, alt: 'Гибкие износостойкие детали из TPU, напечатанные на 3D-принтере', caption: '<span>пример</span> Гибкие детали из TPU — замена резиновым' },
    spec: [
      ['Что делаем', 'шестерни, втулки, ролики, ручки, крепления'],
      ['Пластики', 'Nylon, PETG, ABS, TPU'],
      ['Нужно от вас', 'старая деталь или фото с линейкой'],
      ['Цена', 'от 100 000 сум']
    ],
    sections: [
      {
        title: 'Для какой техники',
        html: `
<ul>
<li><strong>Кухонная техника</strong> — шестерни мясорубок, блендеров, миксеров, хлебопечек, кухонных комбайнов.</li>
<li><strong>Бытовые приборы</strong> — ручки, кнопки, ролики, защёлки, крышки, детали пылесосов и вентиляторов.</li>
<li><strong>Механизмы и оборудование</strong> — шестерни приводов, втулки, направляющие, корпуса редукторов в мастерских и на производстве.</li>
<li><strong>Ремонт и строительство</strong> — заглушки, держатели, крепёж нестандартных размеров.</li>
</ul>`
      },
      {
        title: 'Из чего печатать шестерню',
        html: `
<p>Для шестерён важны прочность зуба и износостойкость. Чаще всего выбираем <strong>Nylon</strong> — он прочный и скользкий, поэтому меньше изнашивается в паре с другой шестернёй. Для лёгких нагрузок подходит <strong>PETG</strong>. Для деталей, которые должны пружинить или гасить удар, — гибкий <strong>TPU</strong>.</p>
<p>В мясорубках пластиковая шестерня часто работает как «предохранитель»: она специально слабее мотора и ломается первой при перегрузке. Поэтому мы не делаем её прочнее разумного — иначе при заклинивании пострадает двигатель.</p>`
      }
    ],
    works: WORKS,
    faq: [
      { q: 'Можно ли сделать шестерню, если зубья стёрлись?', a: 'Да. По уцелевшей части считаем количество зубьев, модуль и диаметр, а также посадку на вал. Если сломано сильно, поможет фото ответной шестерни.' },
      { q: 'Сколько служит напечатанная шестерня?', a: 'Зависит от нагрузки и пластика. Шестерня из нейлона в бытовой технике работает долго; для тяжёлых промышленных нагрузок подскажем, стоит ли печатать или лучше искать металл.' },
      { q: 'Сколько стоит шестерня на заказ?', a: 'От 100 000 сум. Цена зависит от размера, сложности и того, нужно ли моделировать с нуля. Пришлите фото в Telegram — назовём цену до начала работы.' }
    ],
    related: ['modeling', 'scanning', 'auto', 'materials'],
    service: { name: 'Изготовление шестерён и деталей для техники на 3D-принтере', serviceType: '3D-печать шестерён', minPrice: 100000 },
    hasGallery: true,
    sitemapImages: ['/gallery/flexible-rubber-parts/flexible-rubber-parts-poster.webp']
  },
  {
    id: 'gears',
    lang: 'uz',
    type: 'service',
    path: '/uz/tishli-gildiraklar/',
    updated: UPDATED,
    nav: 'services',
    breadcrumb: "Tishli g'ildiraklar va texnika detallari",
    navTitle: "Tishli g'ildiraklar va texnika detallari",
    title: "Tishli g'ildirak (shesternya) buyurtma asosida Toshkentda | 3DPie",
    description: "Toshkent va Chirchiqda namuna bo'yicha 3D printerda tishli g'ildirak (shesternya) tayyorlaymiz: go'sht qiymalagich, blender, mikser, darvoza yuritmasi, stanok uchun. Maishiy texnika uchun dastak, vtulka, rolik, mahkamlagichlar. 100 000 so'mdan.",
    kicker: "Xizmat · tishli g'ildiraklar va ehtiyot qismlar",
    h1: "Maishiy texnika va mexanizmlar uchun tishli g'ildiraklar va plastik detallar",
    lead: "Go'sht qiymalagich yoki blenderdagi shesternya sindi, servisda esa «bunisi yo'q» deyishyaptimi? Eskisini olib keling — tishlari yeyilgan bo'lsa ham. Parametrlarini olamiz, modellashtiramiz va mustahkam plastikdan yangisini chop etamiz.",
    heroImage: { src: '/gallery/flexible-rubber-parts/flexible-rubber-parts-poster.webp', w: 800, h: 855, alt: '3D printerda chop etilgan TPU dan egiluvchan, yeyilishga chidamli detallar', caption: "<span>misol</span> TPU dan egiluvchan detallar — rezina o'rniga" },
    spec: [
      ['Nima qilamiz', "tishli g'ildiraklar, vtulkalar, roliklar, dastaklar, mahkamlagichlar"],
      ['Plastiklar', 'Nylon, PETG, ABS, TPU'],
      ['Sizdan kerak', "eski detal yoki chizg'ichli rasm"],
      ['Narx', "100 000 so'mdan"]
    ],
    sections: [
      {
        title: 'Qaysi texnika uchun',
        html: `
<ul>
<li><strong>Oshxona texnikasi</strong> — go'sht qiymalagich, blender, mikser, non pishirgich, oshxona kombaynlari shesternyalari.</li>
<li><strong>Maishiy asboblar</strong> — dastaklar, tugmalar, roliklar, qulfchalar, qopqoqlar, changyutgich va ventilyator detallari.</li>
<li><strong>Mexanizmlar va uskunalar</strong> — ustaxona va ishlab chiqarishdagi yuritma shesternyalari, vtulkalar, yo'naltiruvchilar, reduktor korpuslari.</li>
<li><strong>Ta'mir va qurilish</strong> — tiqinlar, ushlagichlar, nostandart o'lchamdagi mahkamlagichlar.</li>
</ul>`
      },
      {
        title: "Tishli g'ildirakni nimadan chop etish kerak",
        html: `
<p>Tishli g'ildiraklar uchun tish mustahkamligi va yeyilishga chidamlilik muhim. Ko'pincha <strong>Nylon</strong> tanlaymiz — u mustahkam va sirpanchiq, shuning uchun boshqa shesternya bilan juftlikda kamroq yeyiladi. Yengil yuklamalar uchun <strong>PETG</strong> mos keladi. Prujinadek ishlashi yoki zarbani yumshatishi kerak bo'lgan detallar uchun — egiluvchan <strong>TPU</strong>.</p>
<p>Go'sht qiymalagichlarda plastik shesternya ko'pincha «saqlagich» vazifasini bajaradi: u ataylab motordan kuchsizroq qilinadi va ortiqcha yuklamada birinchi bo'lib sinadi. Shuning uchun uni me'yordan ortiq mustahkam qilmaymiz — aks holda tiqilib qolganda dvigatel zarar ko'radi.</p>`
      }
    ],
    works: WORKS,
    faq: [
      { q: "Tishlari yeyilgan bo'lsa ham shesternya yasash mumkinmi?", a: "Ha. Butun qolgan qismi bo'yicha tishlar soni, modul va diametrni, shuningdek valga o'rnatilishini hisoblaymiz. Qattiq singan bo'lsa, juft shesternya rasmi yordam beradi." },
      { q: 'Chop etilgan shesternya qancha xizmat qiladi?', a: "Yuklama va plastikka bog'liq. Maishiy texnikada neylon shesternya uzoq ishlaydi; og'ir sanoat yuklamalari uchun chop etish kerakmi yoki metall izlash yaxshiroqmi — maslahat beramiz." },
      { q: 'Buyurtma asosida shesternya qancha turadi?', a: "100 000 so'mdan. Narx o'lcham, murakkablik va noldan modellashtirish kerak-kerakmasligiga bog'liq. Rasmni Telegramga yuboring — ish boshlanishidan oldin narxini aytamiz." }
    ],
    related: ['modeling', 'scanning', 'auto', 'materials'],
    service: { name: "3D printerda tishli g'ildiraklar va texnika detallarini tayyorlash", serviceType: "Tishli g'ildiraklarni 3D chop etish", minPrice: 100000 },
    hasGallery: true,
    sitemapImages: ['/gallery/flexible-rubber-parts/flexible-rubber-parts-poster.webp']
  }
];
