'use client';

import { useState } from 'react';
import { NumberSet, LotteryConfig } from '@/lib/lotteries/types';
import NumberSetForm from './NumberSetForm';
import LotteryBall from '@/components/lottery/LotteryBall';
import Button from '@/components/ui/Button';

interface Props {
  sets: NumberSet[];
  selectedId: string | null;
  lotteries: LotteryConfig[];
  onSelect: (id: string) => void;
  onAdd: (set: Omit<NumberSet, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<Omit<NumberSet, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
}

export default function NumberSetManager({
  sets, selectedId, lotteries, onSelect, onAdd, onUpdate, onDelete,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = (data: Omit<NumberSet, 'id' | 'createdAt'>) => {
    if (editingId) {
      onUpdate(editingId, data);
      setEditingId(null);
    } else {
      onAdd(data);
    }
    setShowForm(false);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this number set?')) {
      onDelete(id);
      if (editingId === id) {
        setEditingId(null);
        setShowForm(false);
      }
    }
  };

  const editingSet = editingId ? sets.find(s => s.id === editingId) : undefined;

  if (showForm) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {editingId ? 'Edit Number Set' : 'Add Number Set'}
        </h3>
        <NumberSetForm
          lotteries={lotteries}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingId(null); }}
          editingSet={editingSet}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">My Number Sets</h3>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
          + Add New
        </Button>
      </div>

      {sets.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">
          No number sets yet. Add your first set to see how your numbers would have performed!
        </p>
      ) : (
        <div className="space-y-3">
          {sets.map(set => {
            const lottery = lotteries.find(l => l.slug === set.game);
            return (
              <button
                key={set.id}
                onClick={() => onSelect(set.id)}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  selectedId === set.id
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900 text-sm">{set.name}</span>
                  <span className="text-xs text-gray-500">{lottery?.name}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {set.numbers.map((n, i) => (
                    <LotteryBall key={i} number={n} size="sm" />
                  ))}
                  {set.bonusNumber != null && (
                    <LotteryBall
                      number={set.bonusNumber}
                      type="bonus"
                      size="sm"
                      color={lottery?.colors.bonusBall}
                    />
                  )}
                </div>
                {selectedId === set.id && (
                  <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={e => { e.stopPropagation(); handleEdit(set.id); }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(set.id); }}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
