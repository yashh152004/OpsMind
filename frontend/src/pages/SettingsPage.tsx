import React from 'react'
import { useAuth } from '@/hooks'

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your account and organization settings.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Account Settings */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Account Information</h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium text-foreground">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium text-foreground">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Organization</h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Organization ID</p>
              <p className="font-medium text-foreground">{user?.organizationId}</p>
            </div>
            <button className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90">
              View Organization
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Actions</h2>
          <div className="mt-4 space-y-4">
            <button className="w-full rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted">
              Change Password
            </button>
            <button
              onClick={() => logout()}
              className="w-full rounded-lg border border-destructive bg-destructive/10 px-4 py-2 font-medium text-destructive hover:bg-destructive/20"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
