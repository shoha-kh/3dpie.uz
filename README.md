# 3dpie.uz

Статический сайт студии 3D-печати 3DPie (RU + UZ), хостинг — GitHub Pages.
Правила проекта и карта файлов для Claude Code — в [CLAUDE.md](CLAUDE.md).

## Как редактировать

HTML-страницы **генерируются** — не правьте `index.html`, `uz.html` и папки страниц руками.

| Что изменить | Где |
|---|---|
| Телефон, адрес, цены, доставка, тексты шапки и подвала | `src/site.js` |
| Шапка, подвал, `<head>`, разметка Schema.org | `src/layout.js` |
| Тексты главной | `src/pages/home.js` |
| Страницы услуг и статьи | `src/pages/*.js` (RU и UZ в одном файле) |
| Работы в галерее | `data/gallery.json` |
| Стили | `css/styles.css`, `css/gallery.css` |
| Справка для ИИ-ассистентов | `llms.txt` (правится вручную — держите факты в синхроне с `src/site.js`) |

## Команды

```sh
npm run build                      # все страницы, галерея, sitemap.xml
npm run check                      # ссылки, разметка, запрещённые фразы (старая цена, часы и т.п.)
npm run shots -- / /ceny/          # скриншоты в .shots/ (десктоп + телефон 375px)
npm run og                         # картинки для соцсетей images/og-ru.jpg, og-uz.jpg
npm run video -- raw.mp4 my-id --sheet               # раскадровка: нет ли принтера в кадре
npm run video -- raw.mp4 my-id --cut=0-38 --poster=5 # видео + обложка в gallery/my-id/
```

После правок: `npm run build && npm run check`, затем коммит и пуш в `main` — GitHub Actions опубликует
сайт и отправит адреса в IndexNow (Bing, Яндекс).

## Новая страница

1. Скопируйте похожий файл в `src/pages/`, поменяйте `id`, `path`, тексты для обоих языков.
2. Выберите для неё отдельную группу запросов из [KEYWORDS.md](KEYWORDS.md).
3. `npm run build` — страница появится в подвале, sitemap и `hreflang` автоматически.
4. Добавьте её в `llms.txt`.

В Claude Code то же самое делают команды `/new-page`, `/add-work` (работа из Instagram) и `/verify`.
