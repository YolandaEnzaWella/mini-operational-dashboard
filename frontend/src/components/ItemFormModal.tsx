'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage, getValidationErrors } from '@/lib/api';
import { Category, Item, ValidationErrors, Warehouse } from '@/types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import FormField, { Input, Select } from './ui/FormField';

interface ItemFormModalProps {
  item: Item | null;
  categories: Category[];
  warehouses: Warehouse[];
  onClose: () => void;
  onSaved: () => void;
}

export default function ItemFormModal({ item, categories, warehouses, onClose, onSaved }: ItemFormModalProps) {
  const isEdit = item !== null;

  const [form, setForm] = useState({
    code: item?.code ?? '',
    name: item?.name ?? '',
    category_id: item ? String(item.category_id) : '',
    warehouse_id: item ? String(item.warehouse_id) : '',
    stock: item ? String(item.stock) : '0',
    min_stock: item ? String(item.min_stock) : '5',
    unit: item?.unit ?? 'pcs',
    is_maintenance: item?.status === 'Maintenance',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const response = isEdit ? await api.put(`/items/${item.id}`, form) : await api.post('/items', form);

      toast.success(response.data.message);
      onSaved();
    } catch (error) {
      setErrors(getValidationErrors(error));
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Barang' : 'Tambah Barang'}
      description={isEdit ? 'Perbarui data barang' : 'Stok awal akan tercatat sebagai transaksi masuk'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField label="Nama Barang" error={errors.name?.[0]}>
            <Input name="name" value={form.name} onChange={handleChange} placeholder="Contoh: Helm Safety" />
          </FormField>
        </div>

        <FormField label="Kode Barang" error={errors.code?.[0]}>
          <Input name="code" value={form.code} onChange={handleChange} placeholder="SAF-001" />
        </FormField>

        <FormField label="Satuan" error={errors.unit?.[0]}>
          <Input name="unit" value={form.unit} onChange={handleChange} placeholder="pcs" />
        </FormField>

        <FormField label="Kategori" error={errors.category_id?.[0]}>
          <Select name="category_id" value={form.category_id} onChange={handleChange}>
            <option value="">Pilih kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Gudang" error={errors.warehouse_id?.[0]}>
          <Select name="warehouse_id" value={form.warehouse_id} onChange={handleChange}>
            <option value="">Pilih gudang</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label={isEdit ? 'Stok Saat Ini' : 'Stok Awal'}
          error={errors.stock?.[0]}
          hint={isEdit ? 'Ubah stok melalui transaksi' : undefined}
        >
          <Input type="number" name="stock" min={0} value={form.stock} onChange={handleChange} disabled={isEdit} />
        </FormField>

        <FormField label="Stok Minimum" error={errors.min_stock?.[0]}>
          <Input type="number" name="min_stock" min={0} value={form.min_stock} onChange={handleChange} />
        </FormField>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 sm:col-span-2 dark:border-gray-700">
          <input
            type="checkbox"
            checked={form.is_maintenance}
            onChange={(event) => setForm({ ...form, is_maintenance: event.target.checked })}
            className="h-4 w-4 accent-indigo-600"
          />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Sedang maintenance</p>
            <p className="text-xs text-gray-500">Barang tidak bisa dikeluarkan selama maintenance</p>
          </div>
        </label>

        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? 'Simpan Perubahan' : 'Tambah Barang'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
