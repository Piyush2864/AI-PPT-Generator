import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Trash2, ShieldAlert, Loader2 } from 'lucide-react';
import { useProfile, useUpdateProfile, useChangePassword, useDeleteAccount } from '../hooks/useUser';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';


function UpdateNameSection({ currentName }: { currentName: string }) {
  const [name, setName] = useState(currentName);
  const updateProfile = useUpdateProfile();

  useEffect(() => { setName(currentName); }, [currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === currentName) return;
    updateProfile.mutate({ name: name.trim() });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <CardTitle>Profile information</CardTitle>
        </div>
        <CardDescription>Update your display name.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={100}
              required
            />
          </div>
          <Button
            type="submit"
            isLoading={updateProfile.isPending}
            disabled={name.trim() === currentName || name.trim().length < 2}
          >
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


function ChangePasswordSection() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const changePassword = useChangePassword();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.currentPassword) e.currentPassword = 'Required';
    if (form.newPassword.length < 8) e.newPassword = 'Min 8 characters';
    if (!/[A-Z]/.test(form.newPassword)) e.newPassword = 'Must contain an uppercase letter';
    if (!/[0-9]/.test(form.newPassword)) e.newPassword = 'Must contain a number';
    if (form.newPassword !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    changePassword.mutate(
      { currentPassword: form.currentPassword, newPassword: form.newPassword },
      { onSuccess: () => setForm({ currentPassword: '', newPassword: '', confirm: '' }) },
    );
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <CardTitle>Change password</CardTitle>
        </div>
        <CardDescription>
          After changing your password, other devices will be logged out automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="••••••••"
              value={form.currentPassword}
              onChange={set('currentPassword')}
              error={errors.currentPassword}
            />
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-danger">{errors.currentPassword}</p>
            )}
          </div>

          <div>
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="At least 8 characters"
              value={form.newPassword}
              onChange={set('newPassword')}
              error={errors.newPassword}
            />
            {errors.newPassword && (
              <p className="mt-1 text-xs text-danger">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Re-enter new password"
              value={form.confirm}
              onChange={set('confirm')}
              error={errors.confirm}
            />
            {errors.confirm && (
              <p className="mt-1 text-xs text-danger">{errors.confirm}</p>
            )}
          </div>

          <Button type="submit" isLoading={changePassword.isPending}>
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


function DeleteAccountSection() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const deleteAccount = useDeleteAccount();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    deleteAccount.mutate(
      { password },
      {
        onSuccess: async () => {
          await logout();
          navigate('/login');
        },
      },
    );
  };

  return (
    <Card className="border-danger/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-danger" />
          <CardTitle className="text-danger">Danger zone</CardTitle>
        </div>
        <CardDescription>
          Permanently delete your account and all presentations. This cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showConfirm ? (
          <Button
            variant="danger"
            className="gap-1.5"
            onClick={() => setShowConfirm(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete my account
          </Button>
        ) : (
          <form onSubmit={handleDelete} className="space-y-4">
            <div className="rounded-lg bg-danger/5 border border-danger/20 p-3">
              <p className="text-sm text-danger font-medium">
                This will permanently delete your account and all your presentations.
              </p>
            </div>
            <div>
              <Label htmlFor="deletePassword">Enter your password to confirm</Label>
              <Input
                id="deletePassword"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                variant="danger"
                isLoading={deleteAccount.isPending}
                className="gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                Yes, delete my account
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowConfirm(false); setPassword(''); }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Profile Page ───────────────────────────────────────────────────────────
export function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const { user } = useAuth();

  const displayName = profile?.name ?? user?.name ?? '';
  const displayEmail = profile?.email ?? user?.email ?? '';

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Account settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile and account preferences.
        </p>
      </div>

      {/* Email (read-only) */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
        </div>
        <span className="ml-auto rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          Email cannot be changed
        </span>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <UpdateNameSection currentName={displayName} />
        <ChangePasswordSection />
        <DeleteAccountSection />
      </div>
    </div>
  );
}
