import { HttpError } from '../../utils/httpError';
import {
  MARKET_CATEGORIES,
  normalizeArmorType,
  normalizeMarketCategory,
  normalizeMarketSeason,
  normalizeTradeType,
  normalizeWeaponType,
  normOpt,
  toIntInRange,
  toMarkupPercent,
  toNonNegFloat,
  toNonNegInt,
  toPercentValue,
  marketSupportsCombatFields,
} from '../../utils/normalizers';
import {
  createDefaultMarkups,
  createRegion,
  deleteItem,
  deleteRegion,
  findItemById,
  findRegionById,
  findTradeLogById,
  insertItem,
  insertTradeEvent,
  insertTradeLog,
  listItems,
  listMarkups,
  listRegions,
  listTradeLogs,
  updateItem,
  updateRegionName,
  upsertMarkup,
} from './market.repository';

export async function listMarketItems() {
  return listItems();
}

export async function listMarketRegions() {
  return listRegions();
}

export async function createMarketRegion(name: string) {
  const value = String(name || '').trim();
  if (!value) throw new HttpError(400, 'Заполните название региона');
  const result = await createRegion(value);
  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;
  await createDefaultMarkups(insertedId, Object.keys(MARKET_CATEGORIES));
  return { id: insertedId, name: value, markup_percent: 0 };
}

export async function updateMarketRegion(id: number, name: string) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const existing = await findRegionById(id);
  if (!existing) throw new HttpError(404, 'Регион не найден');
  const nextName = String(name || '').trim();
  if (!nextName) throw new HttpError(400, 'Заполните название региона');
  await updateRegionName(id, nextName);
  return { id, name: nextName, markup_percent: Number(existing.markup_percent || 0) };
}

export async function deleteMarketRegion(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  await deleteRegion(id);
  return { message: 'Регион удалён' };
}

export async function listMarketMarkups(seasonRaw: unknown) {
  const season = normalizeMarketSeason(seasonRaw);
  if (season === null) throw new HttpError(400, 'Некорректный сезон');
  return listMarkups(season);
}

export async function upsertMarketMarkup(body: any) {
  const regionId = Number(body?.region_id);
  const season = normalizeMarketSeason(body?.season);
  const category = normalizeMarketCategory(body?.category);
  const markupPercent = toMarkupPercent(body?.markup_percent, 0);

  if (!Number.isFinite(regionId) || regionId <= 0) throw new HttpError(400, 'Выберите регион');
  if (season === null) throw new HttpError(400, 'Некорректный сезон');
  if (category === null || !category) throw new HttpError(400, 'Некорректная категория');
  if (markupPercent === null) throw new HttpError(400, 'Наценка должна быть числом от 0 до 1000');

  const region = await findRegionById(regionId);
  if (!region) throw new HttpError(404, 'Регион не найден');

  const row = await upsertMarkup(regionId, season, category, markupPercent);
  return row || { region_id: regionId, region: region.name, season, category, markup_percent: markupPercent };
}

export async function listMarketTrades(limitRaw: unknown) {
  const limitValue = Number(limitRaw || 200);
  const limit = Number.isFinite(limitValue) ? Math.min(Math.max(Math.trunc(limitValue), 1), 500) : 200;
  return listTradeLogs(limit);
}

export async function createMarketTradeLog(body: any, userId: number) {
  const itemIdRaw = body?.item_id;
  const itemId = itemIdRaw === null || itemIdRaw === undefined || itemIdRaw === '' ? null : Number(itemIdRaw);
  if (itemId !== null && (!Number.isFinite(itemId) || itemId <= 0)) throw new HttpError(400, 'Некорректный предмет');

  const itemName = String(body?.item_name || '').trim();
  if (!itemName) throw new HttpError(400, 'Название предмета обязательно');
  if (itemName.length > 255) throw new HttpError(400, 'Название предмета слишком длинное');

  const tradeType = normalizeTradeType(body?.trade_type);
  if (!tradeType) throw new HttpError(400, 'Некорректный тип сделки');

  const season = normalizeMarketSeason(body?.season);
  if (season === null) throw new HttpError(400, 'Некорректный сезон');

  const category = normalizeMarketCategory(body?.category);
  if (!category) throw new HttpError(400, 'Некорректная категория');

  const regionIdRaw = body?.region_id;
  const regionId = regionIdRaw === null || regionIdRaw === undefined || regionIdRaw === '' ? null : Number(regionIdRaw);
  if (regionId !== null && (!Number.isFinite(regionId) || regionId <= 0)) throw new HttpError(400, 'Некорректный регион');

  const markupPercent = toMarkupPercent(body?.markup_percent, 0);
  if (markupPercent === null) throw new HttpError(400, 'Некорректная наценка');

  const baseCp = toNonNegInt(body?.base_cp, null);
  const finalCp = toNonNegInt(body?.final_cp, null);
  if (baseCp === null || finalCp === null) throw new HttpError(400, 'Некорректная цена');

  const roll = toIntInRange(body?.roll, 1, 20);
  if (roll === null) throw new HttpError(400, 'Некорректный бросок');

  const rollModeRaw = String(body?.roll_mode || 'normal').trim().toLowerCase();
  const rollMode = rollModeRaw === 'adv' || rollModeRaw === 'dis' ? rollModeRaw : 'normal';

  const rollAltRaw = body?.roll_alt;
  const rollAlt = rollAltRaw === null || rollAltRaw === undefined || rollAltRaw === '' ? null : toIntInRange(rollAltRaw, 1, 20);
  if (rollAltRaw !== undefined && rollAltRaw !== null && rollAltRaw !== '' && rollAlt === null) {
    throw new HttpError(400, 'Некорректный альтернативный бросок');
  }

  const bonus = toIntInRange(body?.bonus, -50, 50);
  if (bonus === null) throw new HttpError(400, 'Некорректный бонус');

  const extraBonus = toIntInRange(body?.extra_bonus ?? 0, 0, 200);
  if (extraBonus === null) throw new HttpError(400, 'Некорректный бонус доп. кубов');

  const extraDiceRaw = body?.extra_dice;
  const extraDiceStr = extraDiceRaw ? String(extraDiceRaw).trim() : '';
  if (extraDiceStr && extraDiceStr.length > 2000) throw new HttpError(400, 'Слишком много данных по доп. кубам');

  const result = toIntInRange(body?.result, -200, 200);
  if (result === null) throw new HttpError(400, 'Некорректный результат');

  const percentValue = toPercentValue(body?.percent_value);
  if (percentValue === null) throw new HttpError(400, 'Некорректное значение процента');

  const skillIdRaw = String(body?.skill_id || '').trim();
  const skillId = skillIdRaw ? skillIdRaw.slice(0, 32) : null;
  const skillLabelRaw = String(body?.skill_label || '').trim();
  const skillLabel = skillLabelRaw ? skillLabelRaw.slice(0, 64) : null;

  const resultInsert = await insertTradeLog({
    user_id: userId,
    item_id: itemId,
    item_name: itemName,
    trade_type: tradeType,
    roll_mode: rollMode,
    roll_alt: rollAlt,
    season,
    region_id: regionId,
    category,
    markup_percent: markupPercent,
    base_cp: baseCp,
    roll,
    bonus,
    extra_bonus: extraBonus,
    extra_dice: extraDiceStr || null,
    result,
    percent_value: percentValue,
    final_cp: finalCp,
    skill_id: skillId,
    skill_label: skillLabel,
  });

  const insertedId = typeof resultInsert.insertId === 'bigint' ? Number(resultInsert.insertId) : resultInsert.insertId;
  const row = await findTradeLogById(insertedId);
  const eventPayload = row
    ? {
        trade_log_id: Number(row.id),
        created_at: row.created_at,
        user: {
          login: row.user_login,
          nickname: row.user_nickname,
        },
        trade_type: row.trade_type,
        item_name: row.item_name,
        season: row.season,
        region: row.region_name,
        category: row.category,
        markup_percent: Number(row.markup_percent || 0),
        base_cp: Number(row.base_cp || 0),
        roll_mode: row.roll_mode,
        roll: Number(row.roll || 0),
        roll_alt: row.roll_alt === null || row.roll_alt === undefined ? null : Number(row.roll_alt),
        bonus: Number(row.bonus || 0),
        extra_bonus: Number(row.extra_bonus || 0),
        result: Number(row.result || 0),
        percent_value: Number(row.percent_value || 0),
        final_cp: Number(row.final_cp || 0),
      }
    : {
        trade_log_id: Number(insertedId),
        trade_type: tradeType,
        item_name: itemName,
        final_cp: finalCp,
      };
  await insertTradeEvent(Number(insertedId), eventPayload);
  return row || { id: insertedId };
}

export async function createMarketItem(body: any) {
  const name = String(body?.name || '').trim();
  const category = normalizeMarketCategory(body?.category);
  const short_description = normOpt(body?.short_description);
  const damageRaw = normOpt(body?.damage);
  const armorClassRaw = normOpt(body?.armor_class);
  const armorTypeRaw = normalizeArmorType(body?.armor_type);
  const weaponTypeRaw = normalizeWeaponType(body?.weapon_type);
  const price_gp = toNonNegInt(body?.price_gp, 0);
  const price_sp = toNonNegInt(body?.price_sp, 0);
  const price_cp = toNonNegInt(body?.price_cp, 0);
  const weightRaw = body?.weight;
  const weight = toNonNegFloat(weightRaw, null);

  if (!name) throw new HttpError(400, 'Заполните название');
  if (category === null) throw new HttpError(400, 'Некорректная категория');
  if (price_gp === null || price_sp === null || price_cp === null) throw new HttpError(400, 'Цена должна быть неотрицательным числом');
  if (weaponTypeRaw === null) throw new HttpError(400, 'Некорректная категория оружия');
  if (armorTypeRaw === null) throw new HttpError(400, 'Некорректный тип доспеха');
  if (weight === null && String(weightRaw || '').trim() !== '') throw new HttpError(400, 'Вес должен быть неотрицательным числом');

  const finalCategory = category || 'food_plant';
  const combatOk = marketSupportsCombatFields(finalCategory);
  const damage = combatOk ? damageRaw : null;
  const armor_class = combatOk ? armorClassRaw : null;
  const weapon_type = combatOk && damage ? (weaponTypeRaw ?? null) : null;
  const armor_type = combatOk && armor_class ? (armorTypeRaw ?? null) : null;

  if (damage !== null && damage !== undefined && String(damage).length > 60) throw new HttpError(400, 'Поле "Урон" слишком длинное (макс. 60 символов)');
  if (armor_class !== null && armor_class !== undefined && String(armor_class).length > 60) throw new HttpError(400, 'Поле "Класс доспеха" слишком длинное (макс. 60 символов)');
  if (short_description !== null && short_description !== undefined && String(short_description).length > 2000) throw new HttpError(400, 'Краткое описание слишком длинное (макс. 2000 символов)');

  const result = await insertItem({
    name,
    category: finalCategory,
    damage: damage ?? null,
    armor_class: armor_class ?? null,
    armor_type: armor_type ?? null,
    weapon_type: weapon_type ?? null,
    short_description: short_description ?? null,
    weight,
    price_gp,
    price_sp,
    price_cp,
  });

  const insertedId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;

  return {
    id: insertedId,
    name,
    category: finalCategory,
    damage: damage ?? null,
    armor_class: armor_class ?? null,
    armor_type: armor_type ?? null,
    weapon_type: weapon_type ?? null,
    short_description: short_description ?? null,
    weight,
    price_gp,
    price_sp,
    price_cp,
  };
}

export async function updateMarketItem(id: number, body: any) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  const existing = await findItemById(id);
  if (!existing) throw new HttpError(404, 'Предмет не найден');

  const nextName = body?.name !== undefined ? String(body.name || '').trim() : String(existing.name || '').trim();
  const nextCategory = body?.category !== undefined ? normalizeMarketCategory(body.category) : normalizeMarketCategory(existing.category);
  const nextShortDescription = body?.short_description !== undefined ? normOpt(body.short_description) : normOpt(existing.short_description);
  const nextDamage = body?.damage !== undefined ? normOpt(body.damage) : normOpt(existing.damage);
  const nextArmorClass = body?.armor_class !== undefined ? normOpt(body.armor_class) : normOpt(existing.armor_class);
  const nextArmorTypeRaw = body?.armor_type !== undefined ? normalizeArmorType(body.armor_type) : normalizeArmorType(existing.armor_type);
  const nextWeaponTypeRaw = body?.weapon_type !== undefined ? normalizeWeaponType(body.weapon_type) : normalizeWeaponType(existing.weapon_type);
  const nextWeightRaw = body?.weight !== undefined ? body.weight : existing.weight;
  const nextWeight = toNonNegFloat(nextWeightRaw, null);
  const nextPriceGp = body?.price_gp !== undefined ? toNonNegInt(body.price_gp, 0) : Number(existing.price_gp || 0);
  const nextPriceSp = body?.price_sp !== undefined ? toNonNegInt(body.price_sp, 0) : Number(existing.price_sp || 0);
  const nextPriceCp = body?.price_cp !== undefined ? toNonNegInt(body.price_cp, 0) : Number(existing.price_cp || 0);

  if (!nextName) throw new HttpError(400, 'Заполните название');
  if (nextCategory === null) throw new HttpError(400, 'Некорректная категория');
  if (nextPriceGp === null || nextPriceSp === null || nextPriceCp === null) throw new HttpError(400, 'Цена должна быть неотрицательным числом');
  if (nextWeaponTypeRaw === null) throw new HttpError(400, 'Некорректная категория оружия');
  if (nextArmorTypeRaw === null) throw new HttpError(400, 'Некорректный тип доспеха');
  if (nextWeight === null && String(nextWeightRaw || '').trim() !== '') throw new HttpError(400, 'Вес должен быть неотрицательным числом');

  const finalCategory = nextCategory || 'food_plant';
  const combatOk = marketSupportsCombatFields(finalCategory);
  const finalDamage = combatOk ? nextDamage : null;
  const finalArmorClass = combatOk ? nextArmorClass : null;
  const finalWeaponType = combatOk && finalDamage ? (nextWeaponTypeRaw ?? null) : null;
  const finalArmorType = combatOk && finalArmorClass ? (nextArmorTypeRaw ?? null) : null;

  if (finalDamage !== null && finalDamage !== undefined && String(finalDamage).length > 60) throw new HttpError(400, 'Поле "Урон" слишком длинное (макс. 60 символов)');
  if (finalArmorClass !== null && finalArmorClass !== undefined && String(finalArmorClass).length > 60) throw new HttpError(400, 'Поле "Класс доспеха" слишком длинное (макс. 60 символов)');
  if (nextShortDescription !== null && nextShortDescription !== undefined && String(nextShortDescription).length > 2000) throw new HttpError(400, 'Краткое описание слишком длинное (макс. 2000 символов)');

  await updateItem(id, {
    name: nextName,
    category: finalCategory,
    damage: finalDamage ?? null,
    armor_class: finalArmorClass ?? null,
    armor_type: finalArmorType ?? null,
    weapon_type: finalWeaponType ?? null,
    short_description: nextShortDescription ?? null,
    weight: nextWeight,
    price_gp: nextPriceGp,
    price_sp: nextPriceSp,
    price_cp: nextPriceCp,
  });

  return {
    id,
    name: nextName,
    category: finalCategory,
    damage: finalDamage ?? null,
    armor_class: finalArmorClass ?? null,
    armor_type: finalArmorType ?? null,
    weapon_type: finalWeaponType ?? null,
    short_description: nextShortDescription ?? null,
    weight: nextWeight,
    price_gp: nextPriceGp,
    price_sp: nextPriceSp,
    price_cp: nextPriceCp,
  };
}

export async function deleteMarketItem(id: number) {
  if (!Number.isFinite(id)) throw new HttpError(400, 'Некорректный id');
  await deleteItem(id);
  return { message: 'Предмет удалён' };
}
