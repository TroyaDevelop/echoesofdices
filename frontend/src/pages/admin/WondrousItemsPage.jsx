import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import WondrousItemsHeader from '../../components/admin/wondrous-items/WondrousItemsHeader.jsx';
import WondrousItemCreateForm from '../../components/admin/wondrous-items/WondrousItemCreateForm.jsx';
import WondrousItemRow from '../../components/admin/wondrous-items/WondrousItemRow.jsx';
import { wondrousItemsAPI } from '../../lib/api.js';
import { normalizeSpellDescriptionForSave } from '../../lib/richText.js';

const normalize = (v) => String(v || '').trim();

export default function AdminWondrousItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [itemType, setItemType] = useState('wondrous');
  const [rarity, setRarity] = useState('common');
  const [recommendedCost, setRecommendedCost] = useState('');
  const [rarityEot, setRarityEot] = useState('common');
  const [recommendedCostEot, setRecommendedCostEot] = useState('');
  const [attunementRequired, setAttunementRequired] = useState(false);
  const [attunementBy, setAttunementBy] = useState('');
  const [source, setSource] = useState('');
  const [sourcePages, setSourcePages] = useState('');
  const [description, setDescription] = useState('');
  const [hasEotVariant, setHasEotVariant] = useState(false);
  const [descriptionEot, setDescriptionEot] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editItemType, setEditItemType] = useState('wondrous');
  const [editRarity, setEditRarity] = useState('common');
  const [editRecommendedCost, setEditRecommendedCost] = useState('');
  const [editRarityEot, setEditRarityEot] = useState('common');
  const [editRecommendedCostEot, setEditRecommendedCostEot] = useState('');
  const [editAttunementRequired, setEditAttunementRequired] = useState(false);
  const [editAttunementBy, setEditAttunementBy] = useState('');
  const [editSource, setEditSource] = useState('');
  const [editSourcePages, setEditSourcePages] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editHasEotVariant, setEditHasEotVariant] = useState(false);
  const [editDescriptionEot, setEditDescriptionEot] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await wondrousItemsAPI.listAdmin();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки предметов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredSorted = useMemo(() => {
    const q = normalize(query).toLowerCase();
    const filtered = (items || []).filter((item) => {
      if (!q) return true;
      return normalize(item.name).toLowerCase().includes(q);
    });

    return filtered.sort((a, b) => normalize(a.name).localeCompare(normalize(b.name), 'ru', { sensitivity: 'base' }));
  }, [items, query]);

  const shouldScrollItems = useMemo(() => filteredSorted.length > 8, [filteredSorted.length]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name: normalize(name),
      name_en: normalize(nameEn) || null,
      item_type: normalize(itemType) || 'wondrous',
      rarity: normalize(rarity) || 'common',
      recommended_cost: normalize(recommendedCost) || null,
      rarity_eot: hasEotVariant ? normalize(rarityEot) || 'common' : null,
      recommended_cost_eot: hasEotVariant ? normalize(recommendedCostEot) || null : null,
      attunement_required: Boolean(attunementRequired),
      attunement_by: attunementRequired ? normalize(attunementBy) || null : null,
      source: normalize(source) || null,
      source_pages: normalize(sourcePages) || null,
      description: normalizeSpellDescriptionForSave(description),
      description_eot: hasEotVariant ? normalizeSpellDescriptionForSave(descriptionEot) : null,
    };

    if (!payload.name) {
      setError('Название предмета обязательно');
      return;
    }

    try {
      await wondrousItemsAPI.create(payload);
      setName('');
      setNameEn('');
      setItemType('wondrous');
      setRarity('common');
      setRecommendedCost('');
      setRarityEot('common');
      setRecommendedCostEot('');
      setAttunementRequired(false);
      setAttunementBy('');
      setSource('');
      setSourcePages('');
      setDescription('');
      setHasEotVariant(false);
      setDescriptionEot('');
      await load();
    } catch (e2) {
      console.error(e2);
      setError(e2.message || 'Ошибка добавления предмета');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить предмет?')) return;
    setError('');
    try {
      await wondrousItemsAPI.remove(id);
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления предмета');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditName(String(item.name || ''));
    setEditNameEn(String(item.name_en || ''));
    setEditItemType(String(item.item_type || 'wondrous'));
    setEditRarity(String(item.rarity || 'common'));
    setEditRecommendedCost(String(item.recommended_cost || ''));
    setEditRarityEot(String(item.rarity_eot || 'common'));
    setEditRecommendedCostEot(String(item.recommended_cost_eot || ''));
    setEditAttunementRequired(Boolean(item.attunement_required));
    setEditAttunementBy(String(item.attunement_by || ''));
    setEditSource(String(item.source || ''));
    setEditSourcePages(String(item.source_pages || ''));
    setEditDescription(String(item.description || ''));
    const eotDesc = String(item.description_eot || '').trim();
    const eotCost = String(item.recommended_cost_eot || '').trim();
    const eotRarity = String(item.rarity_eot || '').trim();
    setEditHasEotVariant(Boolean(eotDesc || eotCost || eotRarity));
    setEditDescriptionEot(String(item.description_eot || ''));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditNameEn('');
    setEditItemType('wondrous');
    setEditRarity('common');
    setEditRecommendedCost('');
    setEditRarityEot('common');
    setEditRecommendedCostEot('');
    setEditAttunementRequired(false);
    setEditAttunementBy('');
    setEditSource('');
    setEditSourcePages('');
    setEditDescription('');
    setEditHasEotVariant(false);
    setEditDescriptionEot('');
  };

  const saveEdit = async (id) => {
    setError('');

    const payload = {
      name: normalize(editName),
      name_en: normalize(editNameEn) || null,
      item_type: normalize(editItemType) || 'wondrous',
      rarity: normalize(editRarity) || 'common',
      recommended_cost: normalize(editRecommendedCost) || null,
      rarity_eot: editHasEotVariant ? normalize(editRarityEot) || 'common' : null,
      recommended_cost_eot: editHasEotVariant ? normalize(editRecommendedCostEot) || null : null,
      attunement_required: Boolean(editAttunementRequired),
      attunement_by: editAttunementRequired ? normalize(editAttunementBy) || null : null,
      source: normalize(editSource) || null,
      source_pages: normalize(editSourcePages) || null,
      description: normalizeSpellDescriptionForSave(editDescription),
      description_eot: editHasEotVariant ? normalizeSpellDescriptionForSave(editDescriptionEot) : null,
    };

    if (!payload.name) {
      setError('Название предмета обязательно');
      return;
    }

    try {
      await wondrousItemsAPI.update(id, payload);
      cancelEdit();
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка обновления предмета');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <WondrousItemsHeader query={query} onQueryChange={setQuery} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}

        <WondrousItemCreateForm
          name={name}
          onNameChange={setName}
          nameEn={nameEn}
          onNameEnChange={setNameEn}
          itemType={itemType}
          onItemTypeChange={setItemType}
          rarity={rarity}
          onRarityChange={setRarity}
          recommendedCost={recommendedCost}
          onRecommendedCostChange={setRecommendedCost}
          rarityEot={rarityEot}
          onRarityEotChange={setRarityEot}
          recommendedCostEot={recommendedCostEot}
          onRecommendedCostEotChange={setRecommendedCostEot}
          attunementRequired={attunementRequired}
          onAttunementRequiredChange={setAttunementRequired}
          attunementBy={attunementBy}
          onAttunementByChange={setAttunementBy}
          source={source}
          onSourceChange={setSource}
          sourcePages={sourcePages}
          onSourcePagesChange={setSourcePages}
          description={description}
          onDescriptionChange={setDescription}
          hasEotVariant={hasEotVariant}
          onHasEotVariantChange={setHasEotVariant}
          descriptionEot={descriptionEot}
          onDescriptionEotChange={setDescriptionEot}
          onSubmit={handleCreate}
        />

        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="p-6 text-gray-700">Загрузка…</div>
          ) : filteredSorted.length === 0 ? (
            <div className="p-6 text-gray-700">Предметов не найдено.</div>
          ) : (
            <div className={`divide-y divide-gray-200 ${shouldScrollItems ? 'max-h-[36rem] overflow-y-auto' : ''}`}>
              {filteredSorted.map((item) => (
                <WondrousItemRow
                  key={item.id}
                  item={item}
                  isEditing={editingId === item.id}
                  onStartEdit={() => startEdit(item)}
                  onDelete={() => handleDelete(item.id)}
                  editState={{
                    editingKey: editingId,
                    editName,
                    setEditName,
                    editNameEn,
                    setEditNameEn,
                    editItemType,
                    setEditItemType,
                    editRarity,
                    setEditRarity,
                    editRecommendedCost,
                    setEditRecommendedCost,
                    editRarityEot,
                    setEditRarityEot,
                    editRecommendedCostEot,
                    setEditRecommendedCostEot,
                    editAttunementRequired,
                    setEditAttunementRequired,
                    editAttunementBy,
                    setEditAttunementBy,
                    editSource,
                    setEditSource,
                    editSourcePages,
                    setEditSourcePages,
                    editDescription,
                    setEditDescription,
                    editHasEotVariant,
                    setEditHasEotVariant,
                    editDescriptionEot,
                    setEditDescriptionEot,
                  }}
                  onSaveEdit={() => saveEdit(item.id)}
                  onCancelEdit={cancelEdit}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
