'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';
import { Item } from '@/types';
import Modal from './ui/Modal';
import Button from './ui/Button';

interface DeleteItemModalProps {
  item: Item;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteItemModal({ item, onClose, onDeleted }: DeleteItemModalProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const response = await api.delete(`/items/${item.id}`);
      toast.success(response.data.message);
      onDeleted();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal title="Hapus Barang" onClose={onClose}>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Yakin ingin menghapus <span className="font-semibold">{item.name}</span> ({item.code})? Riwayat transaksi barang ini
        juga akan ikut terhapus.
      </p>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Batal
        </Button>
        <Button variant="danger" loading={deleting} onClick={handleDelete}>
          Hapus
        </Button>
      </div>
    </Modal>
  );
}
