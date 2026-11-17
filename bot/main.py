import asyncio
import os
import sys
from pathlib import Path
from typing import Optional

import aiohttp
from aiogram import Bot, Dispatcher, Router, F
from aiogram.enums import ParseMode
from aiogram.filters import Command, CommandStart, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import (
    BotCommand,
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    Message,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
)
from aiogram.utils.keyboard import InlineKeyboardBuilder, ReplyKeyboardBuilder
from dotenv import load_dotenv

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

BOT_TOKEN = os.getenv("BOT_TOKEN")
ADMIN_CHAT_ID = int(os.getenv("ADMIN_CHAT_ID", "0"))
BOT_API_SECRET = os.getenv("BOT_API_SECRET", "")
SERVER_URL = os.getenv("SERVER_URL", "http://localhost:3000")

if not BOT_TOKEN:
    sys.exit("BOT_TOKEN not set in .env")

router = Router()


class ContactState(StatesGroup):
    waiting_name = State()
    waiting_message = State()


class ReplyState(StatesGroup):
    waiting_reply = State()


class AddPortfolioState(StatesGroup):
    title = State()
    description = State()
    tags = State()
    tech = State()
    result = State()
    link = State()
    color = State()


def is_admin(user_id: int) -> bool:
    return user_id == ADMIN_CHAT_ID


def main_reply_kb(admin: bool = False) -> ReplyKeyboardMarkup:
    builder = ReplyKeyboardBuilder()
    builder.row(
        KeyboardButton(text="💼 Послуги та ціни"),
        KeyboardButton(text="📂 Портфоліо"),
    )
    builder.row(
        KeyboardButton(text="🧮 Калькулятор"),
        KeyboardButton(text="✉️ Написати нам"),
    )
    if admin:
        builder.row(KeyboardButton(text="🔐 Адмін панель"))
    return builder.as_markup(resize_keyboard=True, input_field_placeholder="Оберіть розділ...")


def services_inline_kb() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="Сайт-візитівка", callback_data="price_site_single"),
        InlineKeyboardButton(text="Корпоративний сайт", callback_data="price_site_multi"),
    )
    builder.row(
        InlineKeyboardButton(text="Telegram бот", callback_data="price_bot"),
        InlineKeyboardButton(text="Парсер даних", callback_data="price_parser"),
    )
    builder.row(
        InlineKeyboardButton(text="Сайт + Бот", callback_data="price_complex"),
        InlineKeyboardButton(text="Автоматизація", callback_data="price_auto"),
    )
    builder.row(InlineKeyboardButton(text="🧮 Розрахувати вартість", callback_data="calculator"))
    return builder.as_markup()


def calc_type_kb() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="🌐 Сайт", callback_data="calc_site"),
        InlineKeyboardButton(text="🤖 Бот", callback_data="calc_bot"),
    )
    builder.row(
        InlineKeyboardButton(text="🔍 Парсер", callback_data="calc_parser"),
        InlineKeyboardButton(text="⚙️ Автоматизація", callback_data="calc_auto"),
    )
    builder.row(InlineKeyboardButton(text="📦 Комплекс (Сайт+Бот)", callback_data="calc_complex"))
    builder.row(InlineKeyboardButton(text="⬅️ Назад", callback_data="back_main"))
    return builder.as_markup()


def admin_inline_kb() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="💬 Активні чати", callback_data="admin_chats"),
        InlineKeyboardButton(text="📂 Портфоліо", callback_data="admin_portfolio"),
    )
    builder.row(InlineKeyboardButton(text="➕ Додати проект", callback_data="admin_add_portfolio"))
    return builder.as_markup()


def portfolio_manage_kb(item_id: str) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="🗑️ Видалити", callback_data=f"del_portfolio_{item_id}"),
    )
    builder.row(InlineKeyboardButton(text="⬅️ Назад до списку", callback_data="admin_portfolio"))
    return builder.as_markup()


async def api_get(session: aiohttp.ClientSession, endpoint: str) -> Optional[dict | list]:
    try:
        async with session.get(
            f"{SERVER_URL}{endpoint}",
            headers={"x-bot-secret": BOT_API_SECRET},
            timeout=aiohttp.ClientTimeout(total=10),
        ) as resp:
            if resp.status == 200:
                return await resp.json()
    except Exception as e:
        print(f"API GET error {endpoint}: {e}")
    return None


async def api_post(session: aiohttp.ClientSession, endpoint: str, data: dict) -> Optional[dict]:
    try:
        async with session.post(
            f"{SERVER_URL}{endpoint}",
            json=data,
            headers={"x-bot-secret": BOT_API_SECRET},
            timeout=aiohttp.ClientTimeout(total=10),
        ) as resp:
            return await resp.json()
    except Exception as e:
        print(f"API POST error {endpoint}: {e}")
    return None


async def api_delete(session: aiohttp.ClientSession, endpoint: str) -> bool:
    try:
        async with session.delete(
            f"{SERVER_URL}{endpoint}",
            headers={"x-bot-secret": BOT_API_SECRET},
            timeout=aiohttp.ClientTimeout(total=10),
        ) as resp:
            return resp.status == 200
    except Exception as e:
        print(f"API DELETE error {endpoint}: {e}")
    return False


# === 2FA Login Approval Handlers ===
@router.callback_query(F.data.startswith("auth_approve:"))
async def on_auth_approve(callback: CallbackQuery):
    request_id = callback.data.split(":", 1)[1]
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(
                f"{SERVER_URL}/api/auth/2fa-resolve",
                json={"requestId": request_id, "action": "approve", "secret": BOT_API_SECRET},
                timeout=aiohttp.ClientTimeout(total=5)
            ) as resp:
                if resp.status == 200:
                    await callback.message.edit_text(
                        "✅ *Вхід успішно підтверджено!*\nСесія адміна розблокована.",
                        parse_mode=ParseMode.MARKDOWN
                    )
                else:
                    await callback.answer("Помилка підтвердження або запит застарів.", show_alert=True)
        except Exception as e:
            await callback.answer(f"Помилка зв'язку із сервером: {e}", show_alert=True)
    await callback.answer()

@router.callback_query(F.data.startswith("auth_reject:"))
async def on_auth_reject(callback: CallbackQuery):
    request_id = callback.data.split(":", 1)[1]
    async with aiohttp.ClientSession() as session:
        try:
            await session.post(
                f"{SERVER_URL}/api/auth/2fa-resolve",
                json={"requestId": request_id, "action": "reject", "secret": BOT_API_SECRET},
                timeout=aiohttp.ClientTimeout(total=5)
            )
        except Exception:
            pass
    await callback.message.edit_text(
        "❌ *Спробу входу заблоковано!*\nДоступ заборонено.",
        parse_mode=ParseMode.MARKDOWN
    )
    await callback.answer("Спробу заблоковано!")


@router.message(CommandStart())
async def cmd_start(message: Message):
    admin = is_admin(message.from_user.id)
    name = message.from_user.first_name or "Гість"

    welcome = (
        f"👋 Привіт, <b>{name}</b>!\n\n"
        f"Я бот <b>Medleb Digital</b> — студії розробки під ключ.\n\n"
        f"🌐 Сайти · 🤖 Боти · 🔍 Парсери · ⚙️ Автоматизація\n\n"
        f"<i>Найнижчі ціни на ринку — якість без компромісів.</i>"
    )

    await message.answer(welcome, parse_mode=ParseMode.HTML, reply_markup=main_reply_kb(admin))

    if admin:
        await message.answer(
            "🔐 <b>Режим адміністратора увімкнено</b>\n\nУ вас є доступ до адмін-панелі.",
            parse_mode=ParseMode.HTML,
            reply_markup=admin_inline_kb(),
        )


@router.message(F.text == "💼 Послуги та ціни")
async def msg_services(message: Message):
    text = (
        "💼 <b>Послуги та ціни Medleb Digital</b>\n\n"
        "Оберіть послугу для детальної інформації:"
    )
    await message.answer(text, parse_mode=ParseMode.HTML, reply_markup=services_inline_kb())


@router.message(F.text == "🧮 Калькулятор")
async def msg_calculator(message: Message):
    await message.answer(
        "🧮 <b>Калькулятор вартості</b>\n\nОберіть тип проекту:",
        parse_mode=ParseMode.HTML,
        reply_markup=calc_type_kb(),
    )


@router.message(F.text == "📂 Портфоліо")
async def msg_portfolio(message: Message):
    async with aiohttp.ClientSession() as session:
        items = await api_get(session, "/api/bot/portfolio")

    if not items:
        await message.answer("Портфоліо тимчасово недоступне.")
        return

    text = "📂 <b>Наші проекти:</b>\n\n"
    for item in items[:8]:
        tags = " · ".join(item.get("tags", []))
        link = f'\n🔗 <a href="{item["link"]}">Переглянути</a>' if item.get("link") else ""
        text += f"<b>{item['title']}</b>\n{item['description'][:120]}...\n<i>{tags}</i>{link}\n\n"

    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="✉️ Замовити схожий проект", callback_data="contact"))
    builder.row(InlineKeyboardButton(text="⬅️ Назад", callback_data="back_main"))

    await message.answer(text, parse_mode=ParseMode.HTML, reply_markup=builder.as_markup())


@router.message(F.text == "✉️ Написати нам")
async def msg_contact_start(message: Message, state: FSMContext):
    await state.set_state(ContactState.waiting_name)
    await message.answer(
        "✉️ <b>Форма зворотного зв'язку</b>\n\nВведіть ваше ім'я:",
        parse_mode=ParseMode.HTML,
        reply_markup=ReplyKeyboardRemove(),
    )


@router.message(F.text == "🔐 Адмін панель")
async def msg_admin(message: Message):
    if not is_admin(message.from_user.id):
        await message.answer("⛔ Доступ заборонено.")
        return
    await message.answer(
        "🔐 <b>Адмін-панель</b>\n\nОберіть дію:",
        parse_mode=ParseMode.HTML,
        reply_markup=admin_inline_kb(),
    )


@router.message(ContactState.waiting_name)
async def contact_name(message: Message, state: FSMContext):
    name = message.text.strip()
    if len(name) < 2:
        await message.answer("Будь ласка, введіть коректне ім'я (мінімум 2 символи):")
        return
    await state.update_data(name=name[:60])
    await state.set_state(ContactState.waiting_message)

    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="❌ Скасувати", callback_data="cancel_contact"))

    await message.answer(
        f"Чудово, <b>{name}</b>!\n\nТепер опишіть ваш проект або задайте питання:",
        parse_mode=ParseMode.HTML,
        reply_markup=builder.as_markup(),
    )


@router.message(ContactState.waiting_message)
async def contact_message(message: Message, state: FSMContext):
    data = await state.get_data()
    name = data.get("name", "Гість")
    text = message.text.strip()

    if len(text) < 5:
        await message.answer("Опишіть детальніше (мінімум 5 символів):")
        return

    await state.clear()

    bot: Bot = message.bot
    user = message.from_user
    username = f"@{user.username}" if user.username else "без юзернейму"

    await bot.send_message(
        ADMIN_CHAT_ID,
        f"📨 <b>Нове замовлення через бот!</b>\n\n"
        f"👤 Ім'я: <b>{name}</b>\n"
        f"🔗 Telegram: {username}\n"
        f"🆔 ID: <code>{user.id}</code>\n\n"
        f"💬 <b>Повідомлення:</b>\n{text}",
        parse_mode=ParseMode.HTML,
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[[
            InlineKeyboardButton(text="↩️ Відповісти", url=f"tg://user?id={user.id}")
        ]]),
    )

    admin = is_admin(user.id)
    await message.answer(
        "✅ <b>Повідомлення надіслано!</b>\n\nДякую за звернення! Відповім протягом 1–3 годин.",
        parse_mode=ParseMode.HTML,
        reply_markup=main_reply_kb(admin),
    )


@router.callback_query(F.data == "cancel_contact")
async def cancel_contact(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    admin = is_admin(callback.from_user.id)
    await callback.message.answer("Скасовано.", reply_markup=main_reply_kb(admin))
    await callback.answer()


@router.callback_query(F.data == "back_main")
async def back_main(callback: CallbackQuery):
    admin = is_admin(callback.from_user.id)
    await callback.message.answer(
        "Головне меню:",
        reply_markup=main_reply_kb(admin),
    )
    await callback.answer()


@router.callback_query(F.data == "contact")
async def cb_contact(callback: CallbackQuery, state: FSMContext):
    await state.set_state(ContactState.waiting_name)
    await callback.message.answer(
        "✉️ <b>Форма зворотного зв'язку</b>\n\nВведіть ваше ім'я:",
        parse_mode=ParseMode.HTML,
        reply_markup=ReplyKeyboardRemove(),
    )
    await callback.answer()


@router.callback_query(F.data == "calculator")
async def cb_calculator(callback: CallbackQuery):
    await callback.message.edit_text(
        "🧮 <b>Калькулятор вартості</b>\n\nОберіть тип проекту:",
        parse_mode=ParseMode.HTML,
        reply_markup=calc_type_kb(),
    )
    await callback.answer()


@router.callback_query(F.data.startswith("price_"))
async def cb_price(callback: CallbackQuery):
    prices = {
        "price_site_single": ("Сайт-візитівка", "$200", "Односторінкова презентація бізнесу або портфоліо. Адаптивний дизайн, SEO, форма зв'язку."),
        "price_site_multi": ("Корпоративний сайт", "$500", "Багатосторінковий сайт з каталогом, блогом або інтернет-магазином. CMS, адмін-панель."),
        "price_bot": ("Telegram бот", "$300", "Бот будь-якої складності: продажі, підтримка, розсилки, управління. Інтеграція з оплатою."),
        "price_parser": ("Парсер даних", "$75", "Автоматичний збір даних з будь-яких сайтів. Збереження в Excel/БД, планувальник запуску."),
        "price_complex": ("Сайт + Бот", "$750", "Комплексне рішення: повноцінний сайт + Telegram бот з єдиною БД. Вигідніше ніж окремо."),
        "price_auto": ("Автоматизація бізнесу", "$350", "Автоматизація рутинних процесів: звіти, розсилки, моніторинг, інтеграція систем."),
    }

    key = callback.data
    if key not in prices:
        await callback.answer()
        return

    name, price, desc = prices[key]

    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="🧮 Розрахувати точно", callback_data="calculator"))
    builder.row(InlineKeyboardButton(text="✉️ Замовити", callback_data="contact"))
    builder.row(InlineKeyboardButton(text="⬅️ Всі послуги", callback_data="all_services"))

    await callback.message.edit_text(
        f"💼 <b>{name}</b>\n\n"
        f"💰 Вартість: від <b>{price}</b>\n\n"
        f"{desc}",
        parse_mode=ParseMode.HTML,
        reply_markup=builder.as_markup(),
    )
    await callback.answer()


@router.callback_query(F.data == "all_services")
async def cb_all_services(callback: CallbackQuery):
    await callback.message.edit_text(
        "💼 <b>Послуги та ціни Medleb Digital</b>\n\nОберіть послугу:",
        parse_mode=ParseMode.HTML,
        reply_markup=services_inline_kb(),
    )
    await callback.answer()


@router.callback_query(F.data.startswith("calc_"))
async def cb_calc(callback: CallbackQuery):
    results = {
        "calc_site": ("Сайт", "від $200–$1200", "Залежно від кількості сторінок та функціоналу."),
        "calc_bot": ("Telegram бот", "від $300–$800", "Базовий бот від $300. Кожна функція (оплата, магазин, адмін) +$80–$150."),
        "calc_parser": ("Парсер даних", "від $75–$625", "Консольний від $75, в боті від $500, на сайті від $625."),
        "calc_auto": ("Автоматизація бізнесу", "від $350", "Залежно від складності процесів та інтеграцій."),
        "calc_complex": ("Сайт + Бот", "від $750", "Комплексне рішення з єдиною базою даних та синхронізацією."),
    }

    key = callback.data
    if key not in results:
        await callback.answer()
        return

    name, price, note = results[key]

    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="✉️ Обговорити проект", callback_data="contact"))
    builder.row(InlineKeyboardButton(text="⬅️ Інший тип", callback_data="calculator"))

    await callback.message.edit_text(
        f"🧮 <b>Калькулятор: {name}</b>\n\n"
        f"💰 Орієнтовна вартість: <b>{price}</b>\n\n"
        f"ℹ️ {note}\n\n"
        f"<i>Точна ціна розраховується після обговорення деталей проекту.</i>",
        parse_mode=ParseMode.HTML,
        reply_markup=builder.as_markup(),
    )
    await callback.answer()


@router.callback_query(F.data == "admin_chats")
async def cb_admin_chats(callback: CallbackQuery):
    if not is_admin(callback.from_user.id):
        await callback.answer("⛔ Доступ заборонено", show_alert=True)
        return

    async with aiohttp.ClientSession() as session:
        chats = await api_get(session, "/api/bot/chats")

    if not chats:
        builder = InlineKeyboardBuilder()
        builder.row(InlineKeyboardButton(text="⬅️ Назад", callback_data="back_admin"))
        await callback.message.edit_text(
            "💬 <b>Активних чатів немає</b>",
            parse_mode=ParseMode.HTML,
            reply_markup=builder.as_markup(),
        )
        await callback.answer()
        return

    text = "💬 <b>Активні чати:</b>\n\n"
    builder = InlineKeyboardBuilder()

    for i, chat in enumerate(chats[:10]):
        last_msg = chat.get("messages", [])[-1] if chat.get("messages") else None
        preview = last_msg["text"][:40] if last_msg else "Немає повідомлень"
        unread = chat.get("unread", 0)
        unread_str = f" 🔴{unread}" if unread else ""
        text += f"{i + 1}. <b>{chat['clientName']}</b>{unread_str}\n   {preview}...\n\n"
        builder.row(
            InlineKeyboardButton(
                text=f"💬 {chat['clientName']}{unread_str}",
                callback_data=f"open_chat_{chat['id']}",
            )
        )

    builder.row(InlineKeyboardButton(text="⬅️ Назад", callback_data="back_admin"))
    await callback.message.edit_text(text, parse_mode=ParseMode.HTML, reply_markup=builder.as_markup())
    await callback.answer()


@router.callback_query(F.data.startswith("open_chat_"))
async def cb_open_chat(callback: CallbackQuery, state: FSMContext):
    if not is_admin(callback.from_user.id):
        await callback.answer("⛔ Доступ заборонено", show_alert=True)
        return

    chat_id = callback.data.replace("open_chat_", "")

    async with aiohttp.ClientSession() as session:
        chats = await api_get(session, "/api/bot/chats")

    chat = None
    if chats:
        for c in chats:
            if c["id"] == chat_id:
                chat = c
                break

    if not chat:
        await callback.answer("Чат не знайдено", show_alert=True)
        return

    messages = chat.get("messages", [])[-5:]
    history = ""
    for msg in messages:
        who = "👤 Клієнт" if msg["from"] == "client" else "🔐 Ви"
        history += f"{who}: {msg['text'][:100]}\n"

    await state.set_state(ReplyState.waiting_reply)
    await state.update_data(reply_chat_id=chat_id, client_name=chat["clientName"])

    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="❌ Скасувати", callback_data="cancel_reply"))

    await callback.message.answer(
        f"💬 <b>Чат з {chat['clientName']}</b>\n\n"
        f"<b>Останні повідомлення:</b>\n{history}\n"
        f"Введіть вашу відповідь:",
        parse_mode=ParseMode.HTML,
        reply_markup=builder.as_markup(),
    )
    await callback.answer()


@router.callback_query(F.data.startswith("reply_chat_"))
async def cb_reply_chat(callback: CallbackQuery, state: FSMContext):
    if not is_admin(callback.from_user.id):
        await callback.answer("⛔ Доступ заборонено", show_alert=True)
        return

    chat_id = callback.data.replace("reply_chat_", "")
    await state.set_state(ReplyState.waiting_reply)
    await state.update_data(reply_chat_id=chat_id, client_name="Клієнт")

    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="❌ Скасувати", callback_data="cancel_reply"))

    await callback.message.reply(
        "✍️ Введіть вашу відповідь клієнту:",
        reply_markup=builder.as_markup(),
    )
    await callback.answer()


@router.message(ReplyState.waiting_reply)
async def admin_reply_message(message: Message, state: FSMContext):
    if not is_admin(message.from_user.id):
        return

    data = await state.get_data()
    chat_id = data.get("reply_chat_id")
    client_name = data.get("client_name", "Клієнт")

    await state.clear()

    async with aiohttp.ClientSession() as session:
        result = await api_post(
            session,
            "/api/bot/relay",
            {"chatId": chat_id, "text": message.text},
        )

    admin = is_admin(message.from_user.id)

    if result and result.get("ok"):
        await message.answer(
            f"✅ Відповідь надіслана клієнту <b>{client_name}</b>",
            parse_mode=ParseMode.HTML,
            reply_markup=main_reply_kb(admin),
        )
    else:
        await message.answer(
            "⚠️ Не вдалося надіслати. Клієнт може бути офлайн.",
            reply_markup=main_reply_kb(admin),
        )


@router.callback_query(F.data == "cancel_reply")
async def cancel_reply(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    admin = is_admin(callback.from_user.id)
    await callback.message.answer("Скасовано.", reply_markup=main_reply_kb(admin))
    await callback.answer()


@router.callback_query(F.data == "admin_portfolio")
async def cb_admin_portfolio(callback: CallbackQuery):
    if not is_admin(callback.from_user.id):
        await callback.answer("⛔ Доступ заборонено", show_alert=True)
        return

    async with aiohttp.ClientSession() as session:
        items = await api_get(session, "/api/bot/portfolio")

    if not items:
        builder = InlineKeyboardBuilder()
        builder.row(InlineKeyboardButton(text="➕ Додати проект", callback_data="admin_add_portfolio"))
        builder.row(InlineKeyboardButton(text="⬅️ Назад", callback_data="back_admin"))
        await callback.message.edit_text(
            "📂 <b>Портфоліо порожнє</b>",
            parse_mode=ParseMode.HTML,
            reply_markup=builder.as_markup(),
        )
        await callback.answer()
        return

    text = f"📂 <b>Портфоліо ({len(items)} проектів):</b>\n\n"
    builder = InlineKeyboardBuilder()

    for item in items[:8]:
        text += f"• <b>{item['title']}</b> — {', '.join(item.get('tags', []))}\n"
        builder.row(
            InlineKeyboardButton(text=f"🗑️ {item['title']}", callback_data=f"del_portfolio_{item['id']}")
        )

    builder.row(InlineKeyboardButton(text="➕ Додати проект", callback_data="admin_add_portfolio"))
    builder.row(InlineKeyboardButton(text="⬅️ Назад", callback_data="back_admin"))

    await callback.message.edit_text(text, parse_mode=ParseMode.HTML, reply_markup=builder.as_markup())
    await callback.answer()


@router.callback_query(F.data.startswith("del_portfolio_"))
async def cb_del_portfolio(callback: CallbackQuery):
    if not is_admin(callback.from_user.id):
        await callback.answer("⛔ Доступ заборонено", show_alert=True)
        return

    item_id = callback.data.replace("del_portfolio_", "")

    async with aiohttp.ClientSession() as session:
        ok = await api_delete(session, f"/api/bot/portfolio/{item_id}")

    if ok:
        await callback.answer("✅ Проект видалено", show_alert=True)
        await cb_admin_portfolio(callback)
    else:
        await callback.answer("❌ Помилка видалення", show_alert=True)


@router.callback_query(F.data == "admin_add_portfolio")
async def cb_add_portfolio_start(callback: CallbackQuery, state: FSMContext):
    if not is_admin(callback.from_user.id):
        await callback.answer("⛔ Доступ заборонено", show_alert=True)
        return

    await state.set_state(AddPortfolioState.title)

    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="❌ Скасувати", callback_data="cancel_add_portfolio"))

    await callback.message.answer(
        "➕ <b>Додавання проекту до портфоліо</b>\n\nВведіть <b>назву</b> проекту:",
        parse_mode=ParseMode.HTML,
        reply_markup=builder.as_markup(),
    )
    await callback.answer()


@router.message(AddPortfolioState.title)
async def add_portfolio_title(message: Message, state: FSMContext):
    await state.update_data(title=message.text.strip()[:100])
    await state.set_state(AddPortfolioState.description)
    await message.answer("Введіть <b>опис</b> проекту (1–3 речення):", parse_mode=ParseMode.HTML)


@router.message(AddPortfolioState.description)
async def add_portfolio_desc(message: Message, state: FSMContext):
    await state.update_data(description=message.text.strip()[:1000])
    await state.set_state(AddPortfolioState.tags)
    await message.answer("Введіть <b>теги</b> через кому (напр.: Сайт, Дизайн, SEO):", parse_mode=ParseMode.HTML)


@router.message(AddPortfolioState.tags)
async def add_portfolio_tags(message: Message, state: FSMContext):
    tags = [t.strip()[:30] for t in message.text.split(",") if t.strip()][:6]
    await state.update_data(tags=tags)
    await state.set_state(AddPortfolioState.tech)
    await message.answer("Введіть <b>технології</b> (напр.: Python / aiogram):", parse_mode=ParseMode.HTML)


@router.message(AddPortfolioState.tech)
async def add_portfolio_tech(message: Message, state: FSMContext):
    await state.update_data(tech=message.text.strip()[:100])
    await state.set_state(AddPortfolioState.result)
    await message.answer("Введіть <b>результат</b> (напр.: +40% клієнтів) або '-' щоб пропустити:", parse_mode=ParseMode.HTML)


@router.message(AddPortfolioState.result)
async def add_portfolio_result(message: Message, state: FSMContext):
    r = "" if message.text.strip() == "-" else message.text.strip()[:100]
    await state.update_data(result=r)
    await state.set_state(AddPortfolioState.link)
    await message.answer("Введіть <b>посилання</b> на проект або '-' щоб пропустити:", parse_mode=ParseMode.HTML)


@router.message(AddPortfolioState.link)
async def add_portfolio_link(message: Message, state: FSMContext):
    link = "" if message.text.strip() == "-" else message.text.strip()[:500]
    await state.update_data(link=link)
    await state.set_state(AddPortfolioState.color)
    await message.answer("Введіть <b>колір</b> у форматі #RRGGBB (напр.: #0ea5e9) або '-' для стандартного:", parse_mode=ParseMode.HTML)


@router.message(AddPortfolioState.color)
async def add_portfolio_color(message: Message, state: FSMContext):
    color_input = message.text.strip()
    color = color_input if color_input.startswith("#") and len(color_input) == 7 else "#6366f1"
    await state.update_data(color=color)

    data = await state.get_data()
    await state.clear()

    async with aiohttp.ClientSession() as session:
        result = await api_post(session, "/api/bot/portfolio", data)

    admin = is_admin(message.from_user.id)

    if result and result.get("id"):
        await message.answer(
            f"✅ <b>Проект «{data['title']}» додано до портфоліо!</b>",
            parse_mode=ParseMode.HTML,
            reply_markup=main_reply_kb(admin),
        )
    else:
        await message.answer(
            "❌ Помилка при збереженні. Спробуйте ще раз.",
            reply_markup=main_reply_kb(admin),
        )


@router.callback_query(F.data == "cancel_add_portfolio")
async def cancel_add_portfolio(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    admin = is_admin(callback.from_user.id)
    await callback.message.answer("Скасовано.", reply_markup=main_reply_kb(admin))
    await callback.answer()


@router.callback_query(F.data == "back_admin")
async def back_admin(callback: CallbackQuery):
    await callback.message.edit_text(
        "🔐 <b>Адмін-панель</b>\n\nОберіть дію:",
        parse_mode=ParseMode.HTML,
        reply_markup=admin_inline_kb(),
    )
    await callback.answer()


@router.message(Command("admin"))
async def cmd_admin(message: Message):
    if not is_admin(message.from_user.id):
        return
    await message.answer(
        "🔐 <b>Адмін-панель</b>\n\nОберіть дію:",
        parse_mode=ParseMode.HTML,
        reply_markup=admin_inline_kb(),
    )


@router.message(Command("chats"))
async def cmd_chats(message: Message):
    if not is_admin(message.from_user.id):
        return

    async with aiohttp.ClientSession() as session:
        chats = await api_get(session, "/api/bot/chats")

    if not chats:
        await message.answer("💬 Активних чатів немає.")
        return

    builder = InlineKeyboardBuilder()
    for chat in chats[:10]:
        unread = chat.get("unread", 0)
        unread_str = f" ({unread})" if unread else ""
        builder.row(
            InlineKeyboardButton(
                text=f"💬 {chat['clientName']}{unread_str}",
                callback_data=f"open_chat_{chat['id']}",
            )
        )

    await message.answer(
        f"💬 <b>Активні чати ({len(chats)}):</b>",
        parse_mode=ParseMode.HTML,
        reply_markup=builder.as_markup(),
    )


async def set_commands(bot: Bot):
    commands = [
        BotCommand(command="start", description="Головне меню"),
        BotCommand(command="admin", description="Адмін панель"),
        BotCommand(command="chats", description="Активні чати"),
    ]
    await bot.set_my_commands(commands)


async def main():
    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher(storage=MemoryStorage())
    dp.include_router(router)

    await set_commands(bot)
    print("🤖 Medleb Digital Bot запущено (aiogram 3)")
    print(f"🔗 Server: {SERVER_URL}")

    await dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types())


if __name__ == "__main__":
    asyncio.run(main())
