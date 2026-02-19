import { useEffect, useMemo, useState } from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function TacticalMapEditor({
  participants,
  mapViewportRef,
  mapPanState,
  onMapMouseDown,
  mapWidth,
  mapHeight,
  mapViewState,
  mapImageUrl,
  mapCellSize,
  mapGridDashed,
  mapGridOpacity,
  visibleGridCols,
  visibleGridRows,
  mapTokens,
  selectedTokenId,
  activeDragTokenId,
  getTokenDisplayName,
  onTokenMouseDown,
  onTokenResizeMouseDown,
  onSelectToken,
  onAddTokenFromParticipant,
  onUpdateTokenField,
  onUploadTokenImage,
  onUploadMapFile,
  mapUploadButtonLabel,
  onRemoveToken,
  tokenSelectedFileNames,
}) {
  const [tokenPickerOpen, setTokenPickerOpen] = useState(false);
  const [topTokenId, setTopTokenId] = useState(null);

  const participantOptions = useMemo(() => Array.isArray(participants) ? participants : [], [participants]);
  const linkedIds = useMemo(() => {
    const set = new Set();
    for (const token of Array.isArray(mapTokens) ? mapTokens : []) {
      const linkedId = String(token?.linked_monster_instance_id || '').trim();
      if (linkedId) set.add(linkedId);
    }
    return set;
  }, [mapTokens]);

  useEffect(() => {
    if (selectedTokenId) {
      setTopTokenId(selectedTokenId);
    }
  }, [selectedTokenId]);

  useEffect(() => {
    if (!topTokenId) return;
    const exists = (Array.isArray(mapTokens) ? mapTokens : []).some((token) => String(token?.token_id || '') === String(topTokenId));
    if (!exists) setTopTokenId(null);
  }, [mapTokens, topTokenId]);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-gray-50 p-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-xs font-medium text-gray-700">Инструменты карты</div>
          <div className="relative">
            <div className="flex items-center gap-2">
              {onUploadMapFile ? (
                <>
                  <input
                    id="tactical-map-upload-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      if (file) onUploadMapFile(file);
                      event.target.value = '';
                    }}
                  />
                  <label
                    htmlFor="tactical-map-upload-input"
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    {mapUploadButtonLabel || 'Загрузить карту'}
                  </label>
                </>
              ) : null}
              <button
                type="button"
                onClick={() => setTokenPickerOpen((prev) => !prev)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
              >
                + Добавить токен
              </button>
            </div>
            {tokenPickerOpen ? (
              <div className="absolute right-0 z-20 mt-1 w-72 max-h-72 overflow-auto rounded-lg border bg-white shadow-lg">
                {participantOptions.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-500">Нет участников для добавления токена</div>
                ) : (
                  participantOptions.map((participant) => {
                    const instanceId = String(participant?.monster_instance_id || '').trim();
                    const alreadyPlaced = instanceId ? linkedIds.has(instanceId) : false;
                    return (
                      <button
                        key={`pick-token-${participant.monster_instance_id}`}
                        type="button"
                        disabled={alreadyPlaced}
                        onClick={() => {
                          if (alreadyPlaced) return;
                          onAddTokenFromParticipant?.(participant);
                          setTokenPickerOpen(false);
                        }}
                        className={`w-full border-b last:border-b-0 px-3 py-2 text-left text-sm ${alreadyPlaced ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : 'text-gray-800 hover:bg-gray-50'}`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span>{alreadyPlaced ? '✓' : '+'}</span>
                          <span>{participant.name || 'Участник'} {String(participant?.participant_type || '') === 'player' ? '(игрок)' : ''}</span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div
          ref={mapViewportRef}
          className={`relative h-[640px] w-full max-w-[960px] overflow-hidden overscroll-none rounded mx-auto ${mapPanState ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={onMapMouseDown}
        >
          <div
            className="relative origin-top-left"
            style={{
              width: mapWidth,
              height: mapHeight,
              transform: `translate(${mapViewState.offsetX}px, ${mapViewState.offsetY}px) scale(${mapViewState.scale})`,
              transformOrigin: '0 0',
              backgroundColor: '#111827',
              backgroundImage: mapImageUrl ? `url(${mapImageUrl})` : 'none',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          >
            {Array.from({ length: visibleGridCols + 1 }).map((_, index) => (
              <div
                key={`grid-v-${index}`}
                className="absolute top-0 bottom-0"
                style={{
                  left: index * mapCellSize,
                  borderLeft: `1px ${mapGridDashed ? 'dashed' : 'solid'} rgba(255,255,255,${Number(mapGridOpacity || 0.35)})`,
                }}
              />
            ))}
            {Array.from({ length: visibleGridRows + 1 }).map((_, index) => (
              <div
                key={`grid-h-${index}`}
                className="absolute left-0 right-0"
                style={{
                  top: index * mapCellSize,
                  borderTop: `1px ${mapGridDashed ? 'dashed' : 'solid'} rgba(255,255,255,${Number(mapGridOpacity || 0.35)})`,
                }}
              />
            ))}

            {(Array.isArray(mapTokens) ? mapTokens : []).map((token) => {
              const sizeCells = Math.max(Number(token.size_cells || 1), 1);
              const left = Math.max(Number(token.x || 0), 0) * mapCellSize;
              const top = Math.max(Number(token.y || 0), 0) * mapCellSize;
              const sizePx = sizeCells * mapCellSize;
              const displayName = getTokenDisplayName?.(token) || 'Токен';
              const isSelected = selectedTokenId === token.token_id;
              const isTopToken = topTokenId === token.token_id;
              const resizeHandleSize = clamp(Math.round(sizePx * 0.2), 10, 20);
              const resizeHandleOffset = Math.round(resizeHandleSize / 3);
              return (
                <div
                  key={token.token_id}
                  className="absolute select-none"
                  style={{
                    left,
                    top,
                    width: sizePx,
                    cursor: activeDragTokenId === token.token_id ? 'grabbing' : 'grab',
                    zIndex: isTopToken ? 120 : 20,
                  }}
                  onMouseDown={(event) => {
                    event.stopPropagation();
                    onTokenMouseDown?.(event, token);
                  }}
                  onClick={() => {
                    setTopTokenId(token.token_id);
                    onSelectToken?.(token.token_id);
                  }}
                >
                  <div
                    className={`rounded-full overflow-hidden bg-black/40 ${selectedTokenId === token.token_id ? 'border-2 border-purple-400' : 'border border-white/70'}`}
                    style={{ width: sizePx, height: sizePx }}
                  >
                    {token.image_url ? (
                      <img src={token.image_url} alt={displayName} className="w-full h-full object-cover" draggable={false} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xs">{displayName.slice(0, 2)}</div>
                    )}
                  </div>
                  {onTokenResizeMouseDown ? (
                    <button
                      type="button"
                      aria-label={`Изменить размер токена ${displayName}`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        onTokenResizeMouseDown(event, token);
                      }}
                      className={`absolute rounded-full border border-white bg-purple-500 shadow ${isSelected ? '' : 'hidden'}`}
                      style={{
                        top: -resizeHandleOffset,
                        right: -resizeHandleOffset,
                        width: resizeHandleSize,
                        height: resizeHandleSize,
                        zIndex: 125,
                      }}
                    />
                  ) : null}
                </div>
              );
            })}

            {(Array.isArray(mapTokens) ? mapTokens : []).map((token) => {
              const sizeCells = Math.max(Number(token.size_cells || 1), 1);
              const left = Math.max(Number(token.x || 0), 0) * mapCellSize;
              const top = Math.max(Number(token.y || 0), 0) * mapCellSize;
              const sizePx = sizeCells * mapCellSize;
              const displayName = getTokenDisplayName?.(token) || 'Токен';
              const isSelected = selectedTokenId === token.token_id;
              const isTopToken = topTokenId === token.token_id;
              return (
                <div
                  key={`label-${token.token_id}`}
                  className="absolute pointer-events-none select-none text-white drop-shadow text-center leading-none"
                  style={{
                    left,
                    top: top + sizePx + 2,
                    width: sizePx,
                    zIndex: isTopToken ? 130 : 70,
                    fontFamily: token.font_family || 'Inter',
                    fontSize: Number(token.font_size || 14),
                    textShadow: '0 1px 2px rgba(0,0,0,0.7)',
                  }}
                >
                  {displayName}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-72 overflow-auto rounded-lg border p-2">
        {(mapTokens || []).length === 0 ? <div className="text-sm text-gray-500">Токены пока не добавлены.</div> : null}
        {(mapTokens || []).map((token) => (
          <div key={token.token_id} className="rounded-lg border border-gray-200 p-2 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <select
                value={token.linked_monster_instance_id || ''}
                onChange={(event) => onUpdateTokenField?.(token.token_id, 'linked_monster_instance_id', event.target.value || null)}
                className="rounded-lg border px-2 py-1 text-sm"
              >
                <option value="">Не привязан</option>
                {(participants || []).map((participant) => (
                  <option key={`link-${participant.monster_instance_id}`} value={participant.monster_instance_id}>
                    {participant.name || 'Участник'}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="number"
                min={8}
                max={64}
                value={token.font_size || 14}
                onChange={(event) => onUpdateTokenField?.(token.token_id, 'font_size', Number(event.target.value || 14))}
                className="rounded-lg border px-2 py-1 text-sm"
                placeholder="Размер шрифта"
              />
              <div className="flex items-center gap-2">
                <input
                  id={`token-file-input-${token.token_id}`}
                  type="file"
                  accept="image/*"
                  onChange={(event) => onUploadTokenImage?.(token, event.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor={`token-file-input-${token.token_id}`}
                  className="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-700 bg-gray-50 hover:bg-gray-100 cursor-pointer truncate"
                >
                  {tokenSelectedFileNames?.[token.token_id] || 'Нажмите, чтобы выбрать файл токена'}
                </label>
                <button
                  type="button"
                  onClick={() => onRemoveToken?.(token)}
                  className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
