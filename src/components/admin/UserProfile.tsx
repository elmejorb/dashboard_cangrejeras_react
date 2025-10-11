import { useState, useRef, useEffect } from "react";
import {
  User as UserIcon,
  Mail,
  Lock,
  Camera,
  Save,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  Shield,
  Calendar,
  Trash2,
  Clock,
  Bell
} from "lucide-react";
import { User } from "../../utils/auth";
import { useAuth } from "../../contexts/AuthContext";
import { storageService } from "../../services/storageService";
import { toast } from "sonner@2.0.3";
import { CardPremium } from "./CardPremium";
import { BadgePremium } from "./BadgePremium";
import { ActivityHistory } from "./ActivityHistory";
import { NotificationSettings } from "./NotificationSettings";

interface UserProfileProps {
  darkMode: boolean;
  currentUser: User;
  onUserUpdate: (user: User) => void;
}

type TabType = 'profile' | 'activity' | 'notifications';

export function UserProfile({ darkMode, currentUser, onUserUpdate }: UserProfileProps) {
  const { updateUserProfile, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    avatar: currentUser.avatar || '',
  });

  // Password states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState(currentUser.avatar || '');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Validate form
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Password validation if password section is open
    if (showPasswordSection) {
      if (!passwordData.currentPassword) {
        newErrors.currentPassword = 'Ingresa tu contraseña actual';
      }

      if (!passwordData.newPassword) {
        newErrors.newPassword = 'Ingresa una nueva contraseña';
      } else if (passwordData.newPassword.length < 6) {
        newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (!passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Confirma tu nueva contraseña';
      } else if (passwordData.newPassword !== passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen debe ser menor a 5MB');
        return;
      }

      // Store file for later upload
      setSelectedFile(file);

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle remove avatar
  const handleRemoveAvatar = () => {
    setPreviewImage('');
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, avatar: '' }));
    setIsEditing(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Por favor corrige los errores');
      return;
    }

    setIsSaving(true);

    try {
      let avatarURL = formData.avatar;

      // Upload avatar to Firebase Storage if a new file was selected
      if (selectedFile) {
        setIsUploading(true);
        try {
          avatarURL = await storageService.uploadAdminAvatar(
            currentUser.id,
            selectedFile,
            (progress) => {
              setUploadProgress(progress.progress);
            }
          );
          setIsUploading(false);
          setUploadProgress(0);
          toast.success('Imagen subida exitosamente');
        } catch (error: any) {
          setIsUploading(false);
          toast.error(error.message || 'Error al subir la imagen');
          setIsSaving(false);
          return;
        }
      }

      // Update profile info
      const updatedUser: User = {
        ...currentUser,
        name: formData.name.trim(),
        email: formData.email.trim(),
        avatar: avatarURL,
      };

      // Update user profile in Firebase
      await updateUserProfile(updatedUser);

      // Handle password change if applicable
      if (showPasswordSection && passwordData.currentPassword && passwordData.newPassword) {
        try {
          await updatePassword(passwordData.currentPassword, passwordData.newPassword);
          toast.success('Contraseña actualizada exitosamente');
        } catch (error: any) {
          toast.error(error.message || 'Error al actualizar contraseña');
          setIsSaving(false);
          return;
        }
      }

      // Update local state
      onUserUpdate(updatedUser);

      setIsEditing(false);
      setShowPasswordSection(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSelectedFile(null);
      setPreviewImage(avatarURL);

      toast.success('Perfil actualizado exitosamente');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      name: currentUser.name,
      email: currentUser.email,
      avatar: currentUser.avatar || '',
    });
    setPreviewImage(currentUser.avatar || '');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    setIsEditing(false);
    setShowPasswordSection(false);
  };

  // Watch for changes
  useEffect(() => {
    const hasChanges = 
      formData.name !== currentUser.name ||
      formData.email !== currentUser.email ||
      formData.avatar !== (currentUser.avatar || '');
    
    if (hasChanges && !isEditing) {
      setIsEditing(true);
    }
  }, [formData, currentUser, isEditing]);

  // Tabs configuration
  const tabs = [
    {
      id: 'profile' as TabType,
      label: 'Información',
      icon: UserIcon,
      description: 'Datos personales y configuración'
    },
    {
      id: 'activity' as TabType,
      label: 'Actividad',
      icon: Clock,
      description: 'Historial de acciones'
    },
    {
      id: 'notifications' as TabType,
      label: 'Notificaciones',
      icon: Bell,
      description: 'Preferencias de notificaciones'
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className={`text-3xl mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Mi Perfil
        </h1>
        <p className={darkMode ? 'text-white/60' : 'text-gray-600'}>
          Administra tu información personal y configuración de cuenta
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <CardPremium darkMode={darkMode} className="p-2">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                    isActive
                      ? 'bg-[#C8A963] text-white shadow-lg'
                      : darkMode
                        ? 'hover:bg-white/10 text-white/60 hover:text-white'
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <TabIcon size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </CardPremium>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && renderProfileTab()}
      {activeTab === 'activity' && <ActivityHistory darkMode={darkMode} userId={currentUser.id} />}
      {activeTab === 'notifications' && <NotificationSettings darkMode={darkMode} userId={currentUser.id} />}
    </div>
  );

  // Render Profile Tab
  function renderProfileTab() {
    return (

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card - Left Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <CardPremium
            darkMode={darkMode}
            className="p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Información Personal
              </h2>
              {isEditing && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      darkMode
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <X size={16} className="inline mr-2" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || isUploading}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 bg-[#C8A963] hover:bg-[#b89850] text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Subiendo {Math.round(uploadProgress)}%
                      </>
                    ) : isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Avatar Section */}
            <div className="flex items-start gap-6 mb-6 pb-6 border-b" style={{
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }}>
              <div className="relative group">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt={formData.name}
                    className="w-24 h-24 rounded-full object-cover shadow-lg ring-4 ring-[#C8A963]/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#C8A963] to-[#0C2340] flex items-center justify-center shadow-lg ring-4 ring-[#C8A963]/20">
                    <span className="text-white text-2xl font-bold">
                      {getUserInitials(formData.name)}
                    </span>
                  </div>
                )}
                
                {/* Camera overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Camera size={24} className="text-white" />
                </button>

                {/* Remove button */}
                {previewImage && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-[#E01E37] hover:bg-[#c01830] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                    title="Eliminar foto"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="flex-1">
                <h3 className={`text-lg mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Foto de Perfil
                </h3>
                <p className={`text-sm mb-3 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                  Formatos permitidos: JPG, PNG, GIF (máx. 5MB)
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    darkMode
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  <Camera size={16} className="inline mr-2" />
                  {previewImage ? 'Cambiar Foto' : 'Subir Foto'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  <UserIcon size={16} className="inline mr-2 text-[#C8A963]" />
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    setErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                    darkMode
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/40'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  } ${errors.name ? 'border-[#E01E37] ring-2 ring-[#E01E37]/20' : ''}`}
                  placeholder="Ej: María González"
                />
                {errors.name && (
                  <p className="text-[#E01E37] text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm mb-2 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  <Mail size={16} className="inline mr-2 text-[#C8A963]" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, email: e.target.value }));
                    setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                    darkMode
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/40'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  } ${errors.email ? 'border-[#E01E37] ring-2 ring-[#E01E37]/20' : ''}`}
                  placeholder="ejemplo@cangrejeras.com"
                />
                {errors.email && (
                  <p className="text-[#E01E37] text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
          </CardPremium>

          {/* Password Section */}
          <CardPremium
            darkMode={darkMode}
            className="p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-xl mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Seguridad
                </h2>
                <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                  Actualiza tu contraseña para mantener tu cuenta segura
                </p>
              </div>
              {!showPasswordSection && (
                <button
                  onClick={() => setShowPasswordSection(true)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    darkMode
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  <Lock size={16} className="inline mr-2" />
                  Cambiar Contraseña
                </button>
              )}
            </div>

            {showPasswordSection && (
              <div className="space-y-4 animate-scale-in">
                {/* Current Password */}
                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => {
                        setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }));
                        setErrors(prev => ({ ...prev, currentPassword: undefined }));
                      }}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 ${
                        darkMode
                          ? 'bg-white/5 border-white/10 text-white placeholder-white/40'
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                      } ${errors.currentPassword ? 'border-[#E01E37] ring-2 ring-[#E01E37]/20' : ''}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                        darkMode ? 'text-white/40 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-[#E01E37] text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => {
                        setPasswordData(prev => ({ ...prev, newPassword: e.target.value }));
                        setErrors(prev => ({ ...prev, newPassword: undefined }));
                      }}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 ${
                        darkMode
                          ? 'bg-white/5 border-white/10 text-white placeholder-white/40'
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                      } ${errors.newPassword ? 'border-[#E01E37] ring-2 ring-[#E01E37]/20' : ''}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                        darkMode ? 'text-white/40 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-[#E01E37] text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => {
                        setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }));
                        setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                      }}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 ${
                        darkMode
                          ? 'bg-white/5 border-white/10 text-white placeholder-white/40'
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                      } ${errors.confirmPassword ? 'border-[#E01E37] ring-2 ring-[#E01E37]/20' : ''}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                        darkMode ? 'text-white/40 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[#E01E37] text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className={`flex items-start gap-3 p-4 rounded-lg ${
                  darkMode ? 'bg-blue-500/10' : 'bg-blue-50'
                }`}>
                  <AlertCircle size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className={darkMode ? 'text-blue-200' : 'text-blue-900'}>
                      <strong>Requisitos de contraseña:</strong>
                    </p>
                    <ul className={`mt-1 space-y-1 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                      <li>• Mínimo 6 caracteres</li>
                      <li>• Combina letras y números para mayor seguridad</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowPasswordSection(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setErrors(prev => ({
                      ...prev,
                      currentPassword: undefined,
                      newPassword: undefined,
                      confirmPassword: undefined
                    }));
                  }}
                  className={`text-sm ${darkMode ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200`}
                >
                  Cancelar cambio de contraseña
                </button>
              </div>
            )}
          </CardPremium>
        </div>

        {/* Right Sidebar - Account Info */}
        <div className="space-y-6">
          {/* Account Details */}
          <CardPremium
            darkMode={darkMode}
            className="p-6"
          >
            <h3 className={`text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Detalles de Cuenta
            </h3>
            
            <div className="space-y-4">
              {/* Role */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={16} className="text-[#C8A963]" />
                  <span className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    Rol
                  </span>
                </div>
                <BadgePremium
                  variant={
                    currentUser.role === 'Super Admin' ? 'success' :
                    currentUser.role === 'Admin' ? 'info' :
                    currentUser.role === 'Editor' ? 'warning' : 'default'
                  }
                  className="text-sm"
                >
                  {currentUser.role}
                </BadgePremium>
              </div>

              {/* User ID */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon size={16} className="text-[#C8A963]" />
                  <span className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    ID de Usuario
                  </span>
                </div>
                <p className={`text-sm font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  #{currentUser.id}
                </p>
              </div>

              {/* Member since */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-[#C8A963]" />
                  <span className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    Miembro desde
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentUser.createdAt || '15 de enero, 2024'}
                </p>
              </div>
            </div>
          </CardPremium>

          {/* Account Status */}
          <CardPremium
            darkMode={darkMode}
            className="p-6"
          >
            <h3 className={`text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Estado de Cuenta
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                  Estado
                </span>
                <BadgePremium variant="success" className="text-xs">
                  <Check size={12} className="inline mr-1" />
                  Activa
                </BadgePremium>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                  Email verificado
                </span>
                <BadgePremium variant="success" className="text-xs">
                  <Check size={12} className="inline mr-1" />
                  Verificado
                </BadgePremium>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                  Autenticación 2FA
                </span>
                <BadgePremium variant="default" className="text-xs">
                  No configurada
                </BadgePremium>
              </div>
            </div>
          </CardPremium>

          {/* Quick Actions */}
          <CardPremium
            darkMode={darkMode}
            className="p-6"
          >
            <h3 className={`text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Acciones Rápidas
            </h3>
            
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full px-4 py-2.5 rounded-lg text-left transition-all duration-200 ${
                  darkMode
                    ? 'bg-white/5 hover:bg-white/10 text-white'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                }`}
              >
                <Bell size={16} className="inline mr-2" />
                <span className="text-sm">Notificaciones</span>
              </button>
              
              <button
                onClick={() => setActiveTab('activity')}
                className={`w-full px-4 py-2.5 rounded-lg text-left transition-all duration-200 ${
                  darkMode
                    ? 'bg-white/5 hover:bg-white/10 text-white'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                }`}
              >
                <Clock size={16} className="inline mr-2" />
                <span className="text-sm">Ver actividad</span>
              </button>
              
              <button
                onClick={() => toast.info('Próximamente: Configurar 2FA')}
                className={`w-full px-4 py-2.5 rounded-lg text-left transition-all duration-200 ${
                  darkMode
                    ? 'bg-white/5 hover:bg-white/10 text-white'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                }`}
              >
                <Shield size={16} className="inline mr-2" />
                <span className="text-sm">Configurar 2FA</span>
              </button>
            </div>
          </CardPremium>
        </div>
      </div>
    );
  }
}
