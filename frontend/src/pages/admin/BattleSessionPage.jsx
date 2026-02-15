import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { screenAPI } from '../../lib/api.js';

const parseHp = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(Math.trunc(n), 0);
};

export default function AdminBattleSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [rebroadcasting, setRebroadcasting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');
  const [encounter, setEncounter] = useState(null);
  const [participants, setParticipants] = useState([]);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await screenAPI.getEncounterById(id);
      setEncounter(data || null);
      setParticipants(Array.isArray(data?.monsters) ? data.monsters : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка загрузки сессии боя');
      setEncounter(null);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const initiativeOrder = useMemo(() => {
    const list = Array.isArray(encounter?.initiative_order) ? encounter.initiative_order : [];
    return list;
  }, [encounter]);

  const handleRebroadcast = async () => {
    setError('');
    if (!encounter?.id) return;
    setRebroadcasting(true);
    try {
      const data = await screenAPI.rebroadcastOrder(encounter.id);
      setEncounter(data || null);
      setParticipants(Array.isArray(data?.monsters) ? data.monsters : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка переотправки порядка ходов');
    } finally {
      setRebroadcasting(false);
    }
  };

  const handleFinish = async () => {
    setError('');
    if (!encounter?.id) return;
    if (!window.confirm('Завершить бой?')) return;

    setFinishing(true);
    try {
      await screenAPI.finishEncounter(encounter.id);
      navigate('/admin/screen/encounters', { replace: true });
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка завершения боя');
    } finally {
      setFinishing(false);
    }
  };

  const setParticipantHpLocal = (monsterInstanceId, value) => {
    setParticipants((prev) =>
      prev.map((participant) => {
        if (participant.monster_instance_id !== monsterInstanceId) return participant;
        if (value === '') return { ...participant, hp_current: '' };
        const parsed = parseHp(value);
        if (parsed === null) return participant;
        return { ...participant, hp_current: parsed };
      })
    );
  };

  const handleUpdateHp = async (participant) => {
    setError('');
    if (!encounter?.id) return;

    const hpCurrent = Number(participant?.hp_current);
    if (!Number.isFinite(hpCurrent) || hpCurrent < 0) {
      setError('HP должно быть неотрицательным числом');
      return;
    }

    try {
      const data = await screenAPI.updateMonsterHp(encounter.id, participant.monster_instance_id, Math.trunc(hpCurrent));
      setEncounter(data || null);
      setParticipants(Array.isArray(data?.monsters) ? data.monsters : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка обновления HP');
    }
  };

  const handleRemoveParticipant = async (participant) => {
    setError('');
    if (!encounter?.id) return;
    if (!participant?.monster_instance_id) return;
    if (!window.confirm(`Удалить участника "${participant.name || 'без имени'}" из боя?`)) return;

    try {
      const data = await screenAPI.removeParticipant(encounter.id, participant.monster_instance_id);
      setEncounter(data || null);
      setParticipants(Array.isArray(data?.monsters) ? data.monsters : []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Ошибка удаления участника из боя');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Столкновение</h1>
        </div>

        {error ? <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        {loading ? (
          <div className="rounded-lg border bg-white p-4 text-sm text-gray-600">Загрузка сессии…</div>
        ) : null}

        {!loading && !encounter ? (
          <div className="rounded-lg border bg-white p-4 text-sm text-gray-600">Сессия боя не найдена или уже завершена.</div>
        ) : null}

        {!loading && encounter ? (
          <>
            <section className="rounded-lg border bg-white p-4 space-y-2">
              <div className="text-lg font-semibold text-gray-900">Идет бой. Мастер: {encounter.master_name || '—'}</div>
              <div className="text-sm text-gray-600">Энкаунтер: {encounter.name}</div>
              <div className="text-sm text-gray-600">Статус: {encounter.status}</div>
            </section>

            <section className="rounded-lg border bg-white p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRebroadcast}
                  disabled={rebroadcasting || encounter.status !== 'active'}
                  className="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 disabled:opacity-70"
                >
                  {rebroadcasting ? 'Отправка…' : 'Переотправить порядок ходов'}
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={finishing}
                  className="rounded-lg bg-red-600 text-white px-4 py-2 hover:bg-red-700 disabled:opacity-70"
                >
                  {finishing ? 'Завершение…' : 'Завершить бой'}
                </button>
              </div>
            </section>

            <section className="rounded-lg border bg-white p-4 space-y-3">
              <div className="text-sm font-semibold text-gray-900">HP участников</div>
              {participants.length === 0 ? (
                <div className="text-sm text-gray-500">Участники не найдены.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {participants.map((participant) => (
                    <div key={participant.monster_instance_id} className="rounded-lg border border-gray-200 p-3 space-y-2">
                      <div className="font-medium text-gray-900">
                        {participant.name} {participant.participant_type === 'player' ? '(игрок)' : ''}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={participant.hp_current ?? ''}
                          onChange={(event) => setParticipantHpLocal(participant.monster_instance_id, event.target.value)}
                          className="w-32 rounded-lg border px-3 py-2"
                          placeholder="Текущий HP"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateHp(participant)}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          Обновить HP
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(participant)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                        >
                          Удалить из боя
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-lg border bg-white p-4 space-y-3">
              <div className="text-sm font-semibold text-gray-900">Текущий порядок ходов</div>
              {initiativeOrder.length === 0 ? (
                <div className="text-sm text-gray-500">Порядок ходов пока не сформирован.</div>
              ) : (
                <ol className="space-y-2">
                  {initiativeOrder.map((row, index) => (
                    <li key={row.monster_instance_id} className="rounded-lg border border-gray-200 px-3 py-2 flex items-center justify-between">
                      <span className="text-gray-900">{index + 1}. {row.name} {row.participant_type === 'player' ? '(игрок)' : ''}</span>
                      <span className="text-sm text-gray-600">{row.initiative_total} (к20: {row.initiative_roll} {row.dex_mod >= 0 ? '+' : ''}{row.dex_mod})</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
