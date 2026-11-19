'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import api, { getErrorMessage, getValidationErrors } from '@/lib/api';
import { Item, TransactionType, ValidationErrors } from '@/types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import FormField, { Input, Select } from './ui/FormField';

interface TransactionModalProps {
  item: Item | null;
  defaultType: TransactionType;
  onClose: () => void;
  onSaved: () => void;
}

export default function TransactionModal({ item, defaultType, onClose, onSaved }: TransactionModalProps) {
  const [items, setItems] = useState<Item[]>(item ? [item] : []);
  const [form, setForm] = useState({
    item_id: item ? String(item.id) : '',
    type: defaultType,
    quantity: '1',
    created_by: localStorage.getItem('operator_name') ?? '',
    note: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/items', { params: { per_page: 100, sort_by: 'name' } })
      .then((response) => setItems(response.data.data))
      .catch((error) => toast.error(getErrorMessage(error)));
  }, []);

  const selectedItem = items.find((option) => String(option.id) === form.item_id);
  const quantity = Number(form.quantity) || 0;
  const stockAfter = selectedItem ? (form.type === 'in' ? selectedItem.stock + quantity : selectedItem.stock - quantity) : 0;
  const isMaintenance = form.type === 'out' && selectedItem?.status === 'Maintenance';
  const isInsufficient = form.type === 'out' && selectedItem !== undefined && quantity > selectedItem.stock;

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const response = await api.post('/transactions', form);

      localStorage.setItem('operator_name', form.created_by);
      toast.success(response.data.message);

      if (response.data.data.status === 'Low Stock') {
        toast(`Stok ${response.data.data.item_name} sudah menipis`, { icon: '⚠️' });
      }

      onSaved();
    } catch (error) {
      setErrors(getValidationErrors(error));
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Catat Transaksi" description="Stok barang akan diperbarui otomatis" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setForm({ ...form, type: 'in' })}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
              form.type === 'in' ? 'bg-white text-indigo-600 shadow-sm dark:bg-gray-700 dark:text-indigo-400' : 'text-gray-500'
            }`}
          >
            <ArrowDownToLine size={16} />
            Stok Masuk
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, type: 'out' })}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
              form.type === 'out' ? 'bg-white text-orange-600 shadow-sm dark:bg-gray-700 dark:text-orange-400' : 'text-gray-500'
            }`}
          >
            <ArrowUpFromLine size={16} />
            Stok Keluar
          </button>
        </div>

        <FormField label="Barang" error={errors.item_id?.[0]}>
          <Select name="item_id" value={form.item_id} onChange={handleChange}>
            <option value="">Pilih barang</option>
            {items.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} - {option.warehouse_name} (stok {option.stock} {option.unit})
              </option>
            ))}
          </Select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Jumlah" error={errors.quantity?.[0]}>
            <Input type="number" name="quantity" min={1} value={form.quantity} onChange={handleChange} />
          </FormField>

          <FormField label="Nama Petugas" error={errors.created_by?.[0]}>
            <Input name="created_by" value={form.created_by} onChange={handleChange} placeholder="Nama kamu" />
          </FormField>
        </div>

        {selectedItem && (
          <div
            className={`rounded-lg border p-3 text-sm ${
              isInsufficient || isMaintenance
                ? 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10'
                : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
            }`}
          >
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Stok sekarang</span>
              <span className="font-medium">
                {selectedItem.stock} {selectedItem.unit}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Stok setelah transaksi</span>
              <span className={`font-semibold ${stockAfter < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                {stockAfter} {selectedItem.unit}
              </span>
            </div>

            {isInsufficient && (
              <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertTriangle size={14} />
                Stok tidak mencukupi
              </p>
            )}

            {isMaintenance && (
              <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertTriangle size={14} />
                Barang sedang maintenance
              </p>
            )}
          </div>
        )}

        <FormField label="Catatan (opsional)" error={errors.note?.[0]}>
          <Input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder={form.type === 'in' ? 'Contoh: Pengiriman supplier' : 'Contoh: Dipinjam tim lapangan'}
          />
        </FormField>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={saving} disabled={isInsufficient || isMaintenance}>
            Simpan Transaksi
          </Button>
        </div>
      </form>
    </Modal>
  );
}
