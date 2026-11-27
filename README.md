# Сводка — страница и веб-демо

Публичная часть: лендинг и веб-версия. Исходники Desktop и Server находятся в приватном репозитории.

- Лендинг: https://kraishkinaa.github.io/svodka/
- Живое демо встроено на главную страницу: виджеты считаются сразу, без перехода.
- Отдельная страница демо: https://kraishkinaa.github.io/svodka/demo/?showcase=1
- Скачивание Desktop закрыто до оплаты.

Публикация: GitHub Pages, ветка `main`, папка `/docs`.

## Статистика

Статистика GoatCounter уже включена: панель https://svodka.goatcounter.com. Счётчик не использует cookies и не собирает персональные данные. События: открытие демо, загрузка Excel, попытка скачивания, переход в Telegram.

Своя панель аналитики: запустите `services/analytics`, а затем пересоберите страницу с адресом сервиса: `node tools/build-pages.js --analytics-url https://аналитика.example.ru`. Подробности — в `services/analytics/README.md`.
