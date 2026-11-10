'use strict';

/**
 * Privacy policy. It describes what the site really does (see ANALYTICS and <head> in src/layout.js,
 * the map on the home page, the calculator in js/calc.js). If a new third-party script or a form
 * appears on the site, describe it here too. The owner confirmed nothing beyond these facts:
 * do not add retention periods, legal entity details or other promises without asking.
 */

const { CONTACTS, T } = require('../site');

const UPDATED = '2026-11-10';
const GA_OPTOUT = 'https://tools.google.com/dlpage/gaoptout';
const YM_OPTOUT = 'https://yandex.com/support/metrica/general/opt-out.html';
const ext = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;

module.exports = [
  {
    id: 'privacy',
    lang: 'ru',
    type: 'info',
    path: '/politika-konfidencialnosti/',
    updated: UPDATED,
    breadcrumb: 'Политика конфиденциальности',
    title: 'Политика конфиденциальности | 3DPie',
    description: 'Какие данные собирает сайт 3dpie.uz, зачем нужна статистика посещений, что происходит с файлами в калькуляторе и как связаться со студией 3DPie.',
    kicker: 'Документ',
    h1: 'Политика конфиденциальности',
    lead: 'На сайте нет регистрации и форм: мы не просим оставлять имя, телефон или почту. Файлы из калькулятора не покидают ваш браузер. Статистику посещений собирают Яндекс Метрика и Google Analytics.',
    sections: [
      {
        title: 'Кто отвечает за сайт',
        html: `
<p>Сайт 3dpie.uz принадлежит студии 3D-печати 3DPie. Адрес: ${T.ru.address.full}.</p>
<p>Связаться с нами: <a href="tel:${CONTACTS.phone}">${CONTACTS.phoneHuman}</a>, Telegram <a href="${CONTACTS.telegram}" target="_blank" rel="noopener">${CONTACTS.telegramHandle}</a>.</p>`
      },
      {
        title: 'Что сайт о вас узнаёт',
        html: `
<ul>
<li><strong>Статистика посещений.</strong> На сайте работают Яндекс Метрика (вместе с Вебвизором: он записывает действия на странице — прокрутку, нажатия, движения мыши) и Google Analytics. Они получают технические данные: IP-адрес, сведения об устройстве и браузере, какие страницы и когда вы открывали, с какого сайта пришли. Для этого используются файлы cookie.</li>
<li><strong>Нажатия на кнопки.</strong> В статистике видно, что кто-то нажал «Позвонить», «Telegram» или загрузил модель в калькулятор, — без имени и номера телефона.</li>
<li><strong>Чего сайт не делает.</strong> Не просит имя, телефон или почту, не требует регистрации и не принимает оплату.</li>
</ul>
<p>Статистика нужна нам, чтобы понимать, какие страницы полезны и что на сайте стоит улучшить.</p>`
      },
      {
        title: 'Калькулятор и ваши файлы',
        html: `
<p>Файлы моделей (STL, OBJ, 3MF), которые вы загружаете в <a href="/ceny/#calc">калькулятор</a>, обрабатываются прямо в вашем браузере: они не отправляются на сервер и нигде не сохраняются. Файл попадает к нам, только если вы сами пришлёте его в Telegram.</p>`
      },
      {
        title: 'Сторонние сервисы',
        html: `
<p>Чтобы страницы открывались, ваш браузер обращается к сторонним сервисам. Они получают ваш IP-адрес и технические данные запроса:</p>
<ul>
<li>Cloudflare и GitHub Pages — хранение и доставка страниц сайта;</li>
<li>Google Fonts — шрифты;</li>
<li>Google Maps — карта на главной странице;</li>
<li>Яндекс Метрика и Google Analytics — статистика посещений.</li>
</ul>
<p>У каждого из этих сервисов своя политика конфиденциальности.</p>`
      },
      {
        title: 'Когда вы пишете или звоните нам',
        html: `
<p>Заказ оформляется в Telegram, по телефону или в Instagram. Вы сами сообщаете то, что нужно для заказа: имя, номер телефона, фото и файлы детали, адрес доставки.</p>
<p>Мы используем эти данные, чтобы рассчитать и выполнить заказ и связаться с вами. При отправке в другой регион передаём службе доставки (BTS или Яндекс Доставка) то, что нужно для вручения посылки. Мы не продаём ваши данные и не передаём их для рекламы.</p>`
      },
      {
        title: 'Как отказаться от статистики',
        html: `
<p>Запретите файлы cookie в настройках браузера или поставьте официальные расширения-блокировщики: ${ext(GA_OPTOUT, 'для Google Analytics')} и ${ext(YM_OPTOUT, 'для Яндекс Метрики')}. Сайт и калькулятор при этом продолжат работать полностью.</p>`
      },
      {
        title: 'Ваши права',
        html: `
<p>Вы можете спросить, какие ваши данные у нас есть, попросить исправить или удалить их — напишите в Telegram <a href="${CONTACTS.telegram}" target="_blank" rel="noopener">${CONTACTS.telegramHandle}</a> или позвоните.</p>
<p>Обработка персональных данных в Узбекистане регулируется Законом Республики Узбекистан «О персональных данных».</p>
<p>Если что-то изменится, мы обновим эту страницу. Дата обновления: 10 ноября 2026 года.</p>`
      }
    ],
    related: ['prices', 'modeling', 'scanning'],
    sitemapImages: []
  },
  {
    id: 'privacy',
    lang: 'uz',
    type: 'info',
    path: '/uz/maxfiylik-siyosati/',
    updated: UPDATED,
    breadcrumb: 'Maxfiylik siyosati',
    title: 'Maxfiylik siyosati | 3DPie',
    description: "3dpie.uz sayti qanday ma'lumotlarni to'playdi, tashriflar statistikasi nima uchun kerak, kalkulyatordagi fayllar bilan nima bo'ladi va 3DPie bilan aloqa.",
    kicker: 'Hujjat',
    h1: 'Maxfiylik siyosati',
    lead: "Saytda ro'yxatdan o'tish va formalar yo'q: ism, telefon yoki pochta qoldirishni so'ramaymiz. Kalkulyatordagi fayllar brauzeringizdan chiqmaydi. Tashriflar statistikasini Yandex Metrika va Google Analytics yig'adi.",
    sections: [
      {
        title: 'Sayt uchun kim javob beradi',
        html: `
<p>3dpie.uz sayti 3DPie 3D chop etish studiyasiga tegishli. Manzil: ${T.uz.address.full}.</p>
<p>Biz bilan aloqa: <a href="tel:${CONTACTS.phone}">${CONTACTS.phoneHuman}</a>, Telegram <a href="${CONTACTS.telegram}" target="_blank" rel="noopener">${CONTACTS.telegramHandle}</a>.</p>`
      },
      {
        title: 'Sayt siz haqingizda nimalarni biladi',
        html: `
<ul>
<li><strong>Tashriflar statistikasi.</strong> Saytda Yandex Metrika (Vebvizor bilan birga: u sahifadagi harakatlarni — aylantirish, bosishlar, sichqoncha harakatini yozib oladi) va Google Analytics ishlaydi. Ular texnik ma'lumotlarni oladi: IP-manzil, qurilma va brauzer haqida ma'lumot, qaysi sahifalarni qachon ochganingiz, qaysi saytdan kelganingiz. Buning uchun cookie fayllari ishlatiladi.</li>
<li><strong>Tugmalarni bosish.</strong> Statistikada kimdir «Qo'ng'iroq qilish», «Telegram» tugmasini bosgani yoki kalkulyatorga model yuklagani ko'rinadi — ism va telefon raqamisiz.</li>
<li><strong>Sayt nima qilmaydi.</strong> Ism, telefon yoki pochtani so'ramaydi, ro'yxatdan o'tishni talab qilmaydi va to'lov qabul qilmaydi.</li>
</ul>
<p>Statistika qaysi sahifalar foydali ekanini va saytda nimani yaxshilash kerakligini tushunishimiz uchun kerak.</p>`
      },
      {
        title: 'Kalkulyator va fayllaringiz',
        html: `
<p><a href="/uz/narxlar/#calc">Kalkulyatorga</a> yuklagan model fayllaringiz (STL, OBJ, 3MF) to'g'ridan-to'g'ri brauzeringizda qayta ishlanadi: ular serverga yuborilmaydi va hech qayerda saqlanmaydi. Fayl bizga faqat o'zingiz uni Telegramga yuborsangizgina yetib keladi.</p>`
      },
      {
        title: 'Tashqi xizmatlar',
        html: `
<p>Sahifalar ochilishi uchun brauzeringiz tashqi xizmatlarga murojaat qiladi. Ular IP-manzilingiz va so'rovning texnik ma'lumotlarini oladi:</p>
<ul>
<li>Cloudflare va GitHub Pages — sayt sahifalarini saqlash va yetkazish;</li>
<li>Google Fonts — shriftlar;</li>
<li>Google Maps — bosh sahifadagi xarita;</li>
<li>Yandex Metrika va Google Analytics — tashriflar statistikasi.</li>
</ul>
<p>Bu xizmatlarning har birining o'z maxfiylik siyosati bor.</p>`
      },
      {
        title: "Bizga yozganingizda yoki qo'ng'iroq qilganingizda",
        html: `
<p>Buyurtma Telegram, telefon yoki Instagram orqali rasmiylashtiriladi. Buyurtma uchun kerakli ma'lumotlarni o'zingiz aytasiz: ism, telefon raqami, detal rasmlari va fayllari, yetkazib berish manzili.</p>
<p>Bu ma'lumotlardan buyurtmani hisoblash, bajarish va siz bilan bog'lanish uchun foydalanamiz. Boshqa viloyatga jo'natishda yetkazib berish xizmatiga (BTS yoki Yandex) jo'natmani topshirish uchun kerakli ma'lumotlarni beramiz. Ma'lumotlaringizni sotmaymiz va reklama uchun bermaymiz.</p>`
      },
      {
        title: 'Statistikadan qanday voz kechish mumkin',
        html: `
<p>Brauzer sozlamalarida cookie fayllarini taqiqlang yoki rasmiy bloklovchi kengaytmalarni o'rnating: ${ext(GA_OPTOUT, 'Google Analytics uchun')} va ${ext(YM_OPTOUT, 'Yandex Metrika uchun')}. Sayt va kalkulyator shunda ham to'liq ishlayveradi.</p>`
      },
      {
        title: 'Huquqlaringiz',
        html: `
<p>Bizda qanday ma'lumotlaringiz borligini so'rashingiz, ularni tuzatish yoki o'chirishni so'rashingiz mumkin — Telegramga <a href="${CONTACTS.telegram}" target="_blank" rel="noopener">${CONTACTS.telegramHandle}</a> yozing yoki qo'ng'iroq qiling.</p>
<p>O'zbekistonda shaxsga doir ma'lumotlarga ishlov berish O'zbekiston Respublikasining «Shaxsga doir ma'lumotlar to'g'risida»gi Qonuni bilan tartibga solinadi.</p>
<p>Biror narsa o'zgarsa, bu sahifani yangilaymiz. Yangilangan sana: 2026-yil 10-noyabr.</p>`
      }
    ],
    related: ['prices', 'modeling', 'scanning'],
    sitemapImages: []
  }
];
