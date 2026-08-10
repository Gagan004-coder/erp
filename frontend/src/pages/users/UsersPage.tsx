import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { userService } from '../../services/userService';
import { User, PaginatedResult } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [result, setResult] = useState<PaginatedResult<User> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    name: string; email: string; password?: string; role: string;
  }>();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await userService.getAll({ page: String(page), limit: '10' });
      setResult(data);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditingUser(null); reset({ name: '', email: '', password: '', role: 'SALES' }); setShowModal(true); };
  const openEdit = (u: User) => { setEditingUser(u); reset({ name: u.name, email: u.email, role: u.role, password: '' }); setShowModal(true); };

  const onSubmit = async (data: { name: string; email: string; password?: string; role: string }) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        const payload: Record<string, string> = { name: data.name, email: data.email, role: data.role };
        if (data.password) payload.password = data.password;
        await userService.update(editingUser.id, payload);
        toast.success('User updated');
      } else {
        await userService.create(data as { name: string; email: string; password: string; role: string });
        toast.success('User created');
      }
      setShowModal(false);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await userService.delete(deleteId);
      toast.success('User deleted');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage team members and roles</p>
        </div>
        <button id="add-user-btn" className="btn btn-primary" onClick={openCreate}>+ Add User</button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5}><LoadingSpinner /></td></tr>
            ) : result?.data.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-600/30 border border-brand-500/30 flex items-center justify-center text-xs font-semibold text-brand-400">
                      {u.name[0].toUpperCase()}
                    </div>
                    <span className="font-medium">{u.name}</span>
                    {u.id === currentUser?.id && <span className="badge-blue text-[10px]">You</span>}
                  </div>
                </td>
                <td className="text-gray-400 text-sm">{u.email}</td>
                <td><StatusBadge status={u.role} /></td>
                <td className="text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="flex gap-1.5">
                    <button id={`edit-user-${u.id}`} className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>Edit</button>
                    {u.id !== currentUser?.id && (
                      <button id={`delete-user-${u.id}`} className="btn btn-danger btn-sm" onClick={() => setDeleteId(u.id)}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result && <Pagination current={page} total={result.totalPages} onPageChange={setPage} />}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUser ? 'Edit User' : 'New User'}>
        <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input id="user-name" className="input" {...register('name', { required: true })} />
          </div>
          <div>
            <label className="label">Email *</label>
            <input id="user-email" type="email" className="input" {...register('email', { required: true })} />
          </div>
          <div>
            <label className="label">{editingUser ? 'Password (leave blank to keep)' : 'Password *'}</label>
            <input id="user-password" type="password" className="input" {...register('password', { required: !editingUser })} placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="label">Role *</label>
            <select id="user-role" className="select" {...register('role', { required: true })}>
              <option value="ADMIN">Admin</option>
              <option value="SALES">Sales</option>
              <option value="WAREHOUSE">Warehouse</option>
              <option value="ACCOUNTS">Accounts</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
            <button id="user-submit" type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {deleteId && (
        <ConfirmDialog
          title="Delete User"
          message="This will permanently delete the user account."
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
