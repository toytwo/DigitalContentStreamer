"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentSession, logout, type SessionUser } from "../../../lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type UserProfile = {
    user_id: number,
    email: string,
    phone_number: number,
    user_role: string,
    first_name: string,
    last_name: string,
    password: string,
    creation_date: string,
    region_id: number,
    referral_method: string,
    display_name: string,
    profile_description: string,
    profile_image_filepath: string,
}

type TabName = 'contact' | 'personal' | 'manage';

export default function Page(){
    const router = useRouter();
    const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [activeTab, setActiveTab] = useState<TabName>('contact');
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Partial<UserProfile>>({});
    const [uploadingImage, setUploadingImage] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        getCurrentSession().then((currentUser) => {
            if (!currentUser) {
                router.replace('/login');
                return;
            }
            setSessionUser(currentUser);
        });
    }, [router]);

    useEffect(() => {
        if (!sessionUser) return;
        
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/user_profile/details`, {
                    credentials: "include"
                });
                const data = await response.json();
                setProfile(data.payload); 
                setEditValues(data.payload);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };

        fetchData();
    }, [sessionUser]);

    const handleStartEdit = (field: string) => {
        setEditingField(field);
    };

    const handleSaveEdit = async (field: string) => {
        if (!profile) {
            return;
        }

        try {
            setSaveError(null);

            const value = editValues[field as keyof UserProfile];
            const updatePayload: Record<string, string> = {
                [field]: typeof value === "number" ? value.toString() : String(value ?? ""),
            };

            const response = await fetch(`${API_BASE_URL}/user_profile/details`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatePayload),
            });

            const data = await response.json();
            if (!response.ok || !data?.success || !data?.payload) {
                const detail = data?.detail;
                throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail ?? "Unable to save changes"));
            }

            setProfile(data.payload);
            setEditValues(data.payload);
            setEditingField(null);
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : "Unable to save changes");
        }
    };

    const handleCancel = () => {
        setEditingField(null);
        if (profile) {
            setEditValues(profile);
        }
    };

    const handleImageUpload = async (file: File) => {
        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch(`${API_BASE_URL}/user_profile/upload-image`, {
                method: 'POST',
                credentials: "include",
                body: formData
            });
            
            const data = await response.json();
            if (data.success && profile) {
                setProfile({
                ...profile,
                profile_image_filepath: `${data.payload.filepath}?t=${Date.now()}`
            });
            }
        } catch (error) {
            console.error("Failed to upload image:", error);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        setDeleteError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/user_profile/delete`, {
                method: "DELETE",
                credentials: "include",
            });

            const data = await response.json();
            if (!response.ok || !data?.success) {
                throw new Error(data?.detail ?? "Failed to delete account");
            }
            
            logout()
            
            router.replace('/login');
        } catch (error) {
            setDeleteError(error instanceof Error ? error.message : "Failed to delete account");
            setIsDeleting(false);
        }
    };

    if (!profile) {
        return (
            <main className="bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16)_0%,rgba(11,18,32,0.94)_42%,rgba(5,9,19,1)_100%)] px-4 py-4 text-foreground">
                <div className="flex items-center justify-center h-96">
                    <p className="text-sky-300/80">Loading profile...</p>
                </div>
            </main>
        );
    }

    const tabs: { id: TabName; label: string }[] = [
        { id: 'contact', label: 'Contact' },
        { id: 'personal', label: 'Personal Info' },
        { id: 'manage', label: 'Manage' },
    ];

    return(
        <main className="bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16)_0%,rgba(11,18,32,0.94)_42%,rgba(5,9,19,1)_100%)] px-4 py-4 text-foreground">
            <div className="mx-auto w-full max-w-4xl flex flex-col">
                <div className="flex gap-8 items-start pb-8 border-b border-white/10 flex-shrink-0">
                    <ProfileImageUpload 
                        imageUrl={`${API_BASE_URL}/api/images/${profile.profile_image_filepath ?? "profiles/DefaultProfileImage.png"}`}
                        onUpload={handleImageUpload}
                        isUploading={uploadingImage}
                    />
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <h1 className="text-3xl font-medium text-white truncate">
                            {profile.display_name}
                        </h1>
                        <p className="text-sm text-sky-300/80 font-medium capitalize">
                            {profile.user_role}
                        </p>
                        <p className="text-sm text-white/60">
                            {profile.first_name} {profile.last_name}
                        </p>
                        <div className="mt-3">
                            <EditableField
                                value={profile.profile_description || "No bio yet"}
                                isEditing={editingField === 'profile_description'}
                                editValue={editValues.profile_description || ''}
                                onStartEdit={() => handleStartEdit('profile_description')}
                                onSave={() => handleSaveEdit('profile_description')}
                                onCancel={handleCancel}
                                onChange={(val) => setEditValues({...editValues, profile_description: val})}
                                isTextarea
                            />
                        </div>
                    </div>
                </div>

                {saveError ? (
                    <div className="mt-4 rounded-lg border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                        {saveError}
                    </div>
                ) : null}

                <div className="flex gap-0 border-b border-white/10 flex-shrink-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 h-12 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                                activeTab === tab.id
                                    ? 'text-white border-b-sky-400'
                                    : 'text-white/60 border-b-transparent hover:text-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="overflow-y-auto max-h-[calc(100vh-22rem)]">
                    <div className="animate-fadeIn py-6 pr-4">
                        {activeTab === 'contact' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ProfileField
                                    label="Email"
                                    value={profile.email}
                                    isEditing={editingField === 'email'}
                                    editValue={editValues.email || ''}
                                    onStartEdit={() => handleStartEdit('email')}
                                    onSave={() => handleSaveEdit('email')}
                                    onCancel={handleCancel}
                                    onChange={(val) => setEditValues({...editValues, email: val})}
                                    type="email"
                                />
                                <ProfileField
                                    label="Phone Number"
                                    value={profile.phone_number}
                                    isEditing={editingField === 'phone_number'}
                                    editValue={editValues.phone_number?.toString() || ''}
                                    onStartEdit={() => handleStartEdit('phone_number')}
                                    onSave={() => handleSaveEdit('phone_number')}
                                    onCancel={handleCancel}
                                    onChange={(val) => setEditValues({...editValues, phone_number: parseInt(val) || 0})}
                                    type="tel"
                                />
                            </div>
                        )}
                        {activeTab === 'personal' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ProfileField
                                    label="Display Name"
                                    value={profile.display_name}
                                    isEditing={editingField === 'display_name'}
                                    editValue={editValues.display_name || ''}
                                    onStartEdit={() => handleStartEdit('display_name')}
                                    onSave={() => handleSaveEdit('display_name')}
                                    onCancel={handleCancel}
                                    onChange={(val) => setEditValues({...editValues, display_name: val})}
                                    type="text"
                                />
                                <ProfileField
                                    label="First Name"
                                    value={profile.first_name}
                                    isEditing={editingField === 'first_name'}
                                    editValue={editValues.first_name || ''}
                                    onStartEdit={() => handleStartEdit('first_name')}
                                    onSave={() => handleSaveEdit('first_name')}
                                    onCancel={handleCancel}
                                    onChange={(val) => setEditValues({...editValues, first_name: val})}
                                    type="text"
                                />
                                <ProfileField
                                    label="Last Name"
                                    value={profile.last_name}
                                    isEditing={editingField === 'last_name'}
                                    editValue={editValues.last_name || ''}
                                    onStartEdit={() => handleStartEdit('last_name')}
                                    onSave={() => handleSaveEdit('last_name')}
                                    onCancel={handleCancel}
                                    onChange={(val) => setEditValues({...editValues, last_name: val})}
                                    type="text"
                                />
                                <ReadOnlyField label="Member Since" 
                                    value={new Date(profile.creation_date).toLocaleDateString()}
                                />
                            </div>
                        )}
                        {activeTab === 'manage' && (
                            <div className="flex flex-col gap-6">
                                <PasswordChangeSection 
                                    onError={setSaveError}
                                    apiBaseUrl={API_BASE_URL}
                                />

                                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-white mb-2">Delete Account</h3>
                                    <p className="text-sm text-white/60 mb-4">
                                        Permanently delete your account and all associated data. This action cannot be undone.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(true);
                                            setDeleteConfirmation("");
                                            setDeleteError(null);
                                        }}
                                        className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-300/30 rounded hover:bg-rose-500/30 transition text-sm font-medium"
                                    >
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showDeleteModal && (
                <DeleteAccountModal
                    displayName={profile.display_name}
                    onConfirm={handleDeleteAccount}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setDeleteConfirmation("");
                        setDeleteError(null);
                    }}
                    confirmationText={deleteConfirmation}
                    onConfirmationChange={setDeleteConfirmation}
                    isDeleting={isDeleting}
                    error={deleteError}
                />
            )}
        </main>
    );
}

interface ProfileImageUploadProps {
    imageUrl: string;
    onUpload: (file: File) => void;
    isUploading: boolean;
}

function ProfileImageUpload({ imageUrl, onUpload, isUploading }: ProfileImageUploadProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className="relative group flex-shrink-0">
            <img 
                src={imageUrl}
                alt="Profile"
                className="w-52 h-52 rounded-full object-cover border border-white/10"
            />
            <label
                htmlFor="profile-image-input"
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
            >
                {isUploading ? (
                    <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                ) : (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                )}
            </label>
            <input
                id="profile-image-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
            />
        </div>
    );
}

interface ProfileFieldProps {
    label: string;
    value: any;
    isEditing: boolean;
    editValue: string;
    onStartEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onChange: (val: string) => void;
    type?: string;
}

function ProfileField({
    label,
    value,
    isEditing,
    editValue,
    onStartEdit,
    onSave,
    onCancel,
    onChange,
    type = 'text'
}: ProfileFieldProps) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 group cursor-pointer hover:border-white/20 transition">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                {label}
                {!isEditing && (
                    <button
                        onClick={onStartEdit}
                        className="opacity-0 group-hover:opacity-100 transition text-white/40 hover:text-white ml-auto"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                )}
            </h3>
            {isEditing ? (
                <div>
                    <input
                        type={type}
                        value={editValue}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-sky-400"
                        autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={onSave}
                            className="px-3 py-1 text-xs bg-sky-500 text-white rounded hover:bg-sky-600 transition"
                        >
                            Save
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-3 py-1 text-xs bg-white/10 text-white rounded hover:bg-white/20 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-white/60">{value}</p>
            )}
        </div>
    );
}

interface ReadOnlyFieldProps {
    label: string;
    value: any;
}

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-sm font-medium text-white mb-3">{label}</h3>
            <p className="text-sm text-white/60">{value}</p>
        </div>
    );
}

interface EditableFieldProps {
    value: string;
    isEditing: boolean;
    editValue: string;
    onStartEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onChange: (val: string) => void;
    isTextarea?: boolean;
}

function EditableField({
    value,
    isEditing,
    editValue,
    onStartEdit,
    onSave,
    onCancel,
    onChange,
    isTextarea = false
}: EditableFieldProps) {
    return (
        <div className="flex items-start gap-2">
            {isEditing ? (
                <div className="flex-1">
                    {isTextarea ? (
                        <textarea
                            value={editValue}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-sky-400"
                            rows={3}
                            autoFocus
                        />
                    ) : (
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-sky-400"
                            autoFocus
                        />
                    )}
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={onSave}
                            className="px-3 py-1 text-xs bg-sky-500 text-white rounded hover:bg-sky-600 transition"
                        >
                            Save
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-3 py-1 text-xs bg-white/10 text-white rounded hover:bg-white/20 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-start gap-2 group">
                    <p className="text-sm text-white/60 line-clamp-3">
                        {value}
                    </p>
                    <button
                        onClick={onStartEdit}
                        className="opacity-0 group-hover:opacity-100 transition text-white/40 hover:text-white p-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}

interface PasswordChangeSectionProps {
    onError: (error: string | null) => void;
    apiBaseUrl: string;
}

function PasswordChangeSection({ onError, apiBaseUrl }: PasswordChangeSectionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setError(null);
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters");
            return;
        }

        if (currentPassword === newPassword) {
            setError("New password must be different from current password");
            return;
        }

        setIsSaving(true);

        try {
            const profileResponse = await fetch(`${apiBaseUrl}/user_profile/details`, {
                credentials: "include"
            });
            const profileData = await profileResponse.json();
            
            if (!profileResponse.ok || !profileData?.payload) {
                throw new Error("Failed to verify password");
            }

            if (currentPassword !== profileData.payload.password) {
                setError("Current password is incorrect");
                setIsSaving(false);
                return;
            }

            const response = await fetch(`${apiBaseUrl}/user_profile/details`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    password: newPassword,
                }),
            });

            const data = await response.json();
            if (!response.ok || !data?.success) {
                throw new Error(data?.detail ?? "Failed to change password");
            }

            setSuccess(true);
            setIsEditing(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            onError(null);
            
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to change password";
            setError(errorMsg);
            onError(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError(null);
        setSuccess(false);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Change Password</h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-sky-400 hover:text-sky-300 transition font-medium"
                    >
                        Update Password
                    </button>
                )}
            </div>

            {success && (
                <div className="mb-4 rounded-lg border border-green-300/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                    ✓ Password changed successfully
                </div>
            )}

            {error && (
                <div className="mb-4 rounded-lg border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                </div>
            )}

            {isEditing && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter your current password"
                            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-sky-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-sky-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-sky-400"
                        />
                    </div>

                    <p className="text-xs text-white/50">Password must be at least 8 characters</p>

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 text-sm bg-sky-500 text-white rounded hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {isSaving ? "Saving..." : "Save Password"}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="px-4 py-2 text-sm bg-white/10 text-white rounded hover:bg-white/20 transition disabled:opacity-50 font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {!isEditing && !success && (
                <p className="text-sm text-white/60">
                    Keep your account secure by updating your password regularly.
                </p>
            )}
        </div>
    );
}

interface DeleteAccountModalProps {
    displayName: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmationText: string;
    onConfirmationChange: (text: string) => void;
    isDeleting: boolean;
    error: string | null;
}

function DeleteAccountModal({
    displayName,
    onConfirm,
    onCancel,
    confirmationText,
    onConfirmationChange,
    isDeleting,
    error
}: DeleteAccountModalProps) {
    const requiredText = `DELETE ${displayName}`;
    const isConfirmed = confirmationText === requiredText;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-white/10 rounded-lg max-w-md w-full p-6">
                <h2 className="text-xl font-semibold text-white mb-2">Delete Account</h2>
                <p className="text-sm text-white/60 mb-4">
                    This action cannot be undone. All your data will be permanently deleted.
                </p>

                {error && (
                    <div className="mb-4 rounded-lg border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                        {error}
                    </div>
                )}

                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-300/30 rounded-lg">
                    <p className="text-xs font-medium text-white/80 mb-3">
                        To confirm, type the following exactly:
                    </p>
                    <p className="font-mono text-sm text-rose-300 mb-3">
                        {requiredText}
                    </p>
                    <input
                        type="text"
                        value={confirmationText}
                        onChange={(e) => onConfirmationChange(e.target.value)}
                        placeholder="Type the text above"
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-sky-400 font-mono"
                        disabled={isDeleting}
                        autoFocus
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onConfirm}
                        disabled={!isConfirmed || isDeleting}
                        className="flex-1 px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                    >
                        {isDeleting ? "Deleting..." : "Confirm Delete"}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition disabled:opacity-50 font-medium text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}