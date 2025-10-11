import { useState } from "react";
import { Save, User, Bell, Shield, Palette, Globe, UserPlus, Edit2, Trash2, Users, Mail, Key, Target, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { toast } from "sonner@2.0.3";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface SettingsManagementProps {
  darkMode: boolean;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Editor' | 'Moderador';
  status: 'Activo' | 'Inactivo';
  lastLogin: string;
}

export function SettingsManagement({ darkMode }: SettingsManagementProps) {
  const [settings, setSettings] = useState({
    // General
    appName: 'Cangrejeras de Santurce',
    appDescription: 'App oficial del equipo de voleibol',
    contactEmail: 'info@cangrejeras.com',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    votingAlerts: true,
    matchReminders: true,
    
    // Privacy
    publicStats: true,
    allowComments: true,
    moderateContent: false,
    
    // Appearance
    primaryColor: '#0C2340',
    accentColor: '#C8A963',
  });

  // User Management State
  const [users, setUsers] = useState<AdminUser[]>([
    {
      id: '1',
      name: 'Admin Principal',
      email: 'admin@cangrejeras.com',
      role: 'Super Admin',
      status: 'Activo',
      lastLogin: '2025-10-08 10:30 AM'
    },
    {
      id: '2',
      name: 'María González',
      email: 'maria@cangrejeras.com',
      role: 'Admin',
      status: 'Activo',
      lastLogin: '2025-10-07 3:15 PM'
    },
    {
      id: '3',
      name: 'Carlos Rivera',
      email: 'carlos@cangrejeras.com',
      role: 'Editor',
      status: 'Activo',
      lastLogin: '2025-10-06 9:00 AM'
    }
  ]);

  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Editor' as AdminUser['role'],
    status: 'Activo' as AdminUser['status']
  });

  const handleSave = () => {
    toast.success('Configuración guardada exitosamente');
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro de restablecer la configuración?')) {
      toast.success('Configuración restablecida');
    }
  };

  // User Management Functions
  const handleAddUser = () => {
    setIsEditMode(false);
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'Editor',
      status: 'Activo'
    });
    setShowUserDialog(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setIsEditMode(true);
    setSelectedUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status
    });
    setShowUserDialog(true);
  };

  const handleDeleteUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter(u => u.id !== selectedUser.id));
      toast.success(`Usuario ${selectedUser.name} eliminado`);
      setShowDeleteDialog(false);
      setSelectedUser(null);
    }
  };

  const saveUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (!isEditMode && !newUser.password) {
      toast.error('La contraseña es requerida para nuevos usuarios');
      return;
    }

    if (isEditMode && selectedUser) {
      // Edit existing user
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, name: newUser.name, email: newUser.email, role: newUser.role, status: newUser.status }
          : u
      ));
      toast.success('Usuario actualizado exitosamente');
    } else {
      // Add new user
      const user: AdminUser = {
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        lastLogin: 'Nunca'
      };
      setUsers([...users, user]);
      toast.success('Usuario agregado exitosamente');
    }

    setShowUserDialog(false);
    setSelectedUser(null);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-[#E01E37]/10 text-[#E01E37]';
      case 'Admin':
        return 'bg-[#C8A963]/10 text-[#C8A963]';
      case 'Editor':
        return 'bg-[#3B82F6]/10 text-[#3B82F6]';
      case 'Moderador':
        return 'bg-[#8B5CF6]/10 text-[#8B5CF6]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Configuración
          </h2>
          <p className={`text-sm mt-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
            Administra la configuración general de la aplicación
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className={darkMode ? 'border-white/10 text-white/70' : ''}>
            Restablecer
          </Button>
          <Button onClick={handleSave} className="bg-[#0C2340] hover:bg-[#1e3a5f] text-white">
            <Save size={18} className="mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* User Management Section */}
      <div
        className={`rounded-xl border p-6 ${
          darkMode
            ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
            : 'bg-white/80 border-gray-200 backdrop-blur-xl'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0C2340]/10">
              <Users size={20} style={{ color: '#0C2340' }} />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Gestión de Usuarios
              </h3>
              <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                {users.length} usuario{users.length !== 1 ? 's' : ''} administrador{users.length !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>
          <Button onClick={handleAddUser} className="bg-[#0C2340] hover:bg-[#1e3a5f] text-white">
            <UserPlus size={18} className="mr-2" />
            Agregar Usuario
          </Button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  Usuario
                </th>
                <th className={`text-left py-3 px-4 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  Email
                </th>
                <th className={`text-left py-3 px-4 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  Rol
                </th>
                <th className={`text-left py-3 px-4 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  Estado
                </th>
                <th className={`text-left py-3 px-4 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  Último Acceso
                </th>
                <th className={`text-right py-3 px-4 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b ${darkMode ? 'border-white/5' : 'border-gray-100'} hover:${darkMode ? 'bg-white/5' : 'bg-gray-50'} transition-colors`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#C8A963] flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className={`py-4 px-4 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                    {user.email}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.status === 'Activo' 
                        ? 'bg-[#10B981]/10 text-[#10B981]' 
                        : 'bg-gray-500/10 text-gray-500'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className={`py-4 px-4 text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    {user.lastLogin}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className={darkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : ''}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        className={`${darkMode ? 'text-white/70 hover:text-[#E01E37] hover:bg-[#E01E37]/10' : 'hover:text-[#E01E37] hover:bg-[#E01E37]/10'}`}
                        disabled={user.role === 'Super Admin'}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* General */}
          <div
            className={`rounded-xl border p-6 ${
              darkMode
                ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
                : 'bg-white/80 border-gray-200 backdrop-blur-xl'
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[#0C2340]/10">
                <Globe size={20} style={{ color: '#0C2340' }} />
              </div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Configuración General
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appName" className={darkMode ? 'text-white/80' : ''}>
                  Nombre de la Aplicación
                </Label>
                <Input
                  id="appName"
                  value={settings.appName}
                  onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="appDescription" className={darkMode ? 'text-white/80' : ''}>
                  Descripción
                </Label>
                <Input
                  id="appDescription"
                  value={settings.appDescription}
                  onChange={(e) => setSettings({ ...settings, appDescription: e.target.value })}
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className={darkMode ? 'text-white/80' : ''}>
                  Email de Contacto
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div
            className={`rounded-xl border p-6 ${
              darkMode
                ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
                : 'bg-white/80 border-gray-200 backdrop-blur-xl'
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[#F97316]/10">
                <Bell size={20} className="text-[#F97316]" />
              </div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Notificaciones
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Notificaciones por Email
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    Recibe actualizaciones por correo
                  </div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Notificaciones Push
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    Alertas en tiempo real
                  </div>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, pushNotifications: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Alertas de Votación
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    Notificar cuando hay votaciones activas
                  </div>
                </div>
                <Switch
                  checked={settings.votingAlerts}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, votingAlerts: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Recordatorios de Partidos
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    Avisos antes de cada partido
                  </div>
                </div>
                <Switch
                  checked={settings.matchReminders}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, matchReminders: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div
            className={`rounded-xl border p-6 ${
              darkMode
                ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
                : 'bg-white/80 border-gray-200 backdrop-blur-xl'
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[#8B5CF6]/10">
                <Shield size={20} className="text-[#8B5CF6]" />
              </div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Privacidad y Seguridad
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Estadísticas Públicas
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    Permitir acceso público a las estadísticas
                  </div>
                </div>
                <Switch
                  checked={settings.publicStats}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, publicStats: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Permitir Comentarios
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    Los usuarios pueden comentar en noticias
                  </div>
                </div>
                <Switch
                  checked={settings.allowComments}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, allowComments: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Moderar Contenido
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    Revisar comentarios antes de publicar
                  </div>
                </div>
                <Switch
                  checked={settings.moderateContent}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, moderateContent: checked })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div
            className={`rounded-xl border p-6 ${
              darkMode
                ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
                : 'bg-white/80 border-gray-200 backdrop-blur-xl'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#3B82F6]/10">
                <User size={20} className="text-[#3B82F6]" />
              </div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Perfil de Admin
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#C8A963] flex items-center justify-center">
                  <span className="text-white text-xl font-bold">AD</span>
                </div>
                <div>
                  <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Admin
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    Super Administrator
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className={`w-full ${darkMode ? 'border-white/10 text-white/70' : ''}`}>
                Editar Perfil
              </Button>
            </div>
          </div>

          {/* Appearance */}
          <div
            className={`rounded-xl border p-6 ${
              darkMode
                ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
                : 'bg-white/80 border-gray-200 backdrop-blur-xl'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#EC4899]/10">
                <Palette size={20} className="text-[#EC4899]" />
              </div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Apariencia
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className={darkMode ? 'text-white/80' : ''}>Color Primario</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer"
                  />
                  <Input
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className={darkMode ? 'text-white/80' : ''}>Color de Acento</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer"
                  />
                  <Input
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div
            className={`rounded-xl border p-6 ${
              darkMode
                ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
                : 'bg-white/80 border-gray-200 backdrop-blur-xl'
            }`}
          >
            <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Información del Sistema
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={darkMode ? 'text-white/60' : 'text-gray-600'}>Versión:</span>
                <span className={darkMode ? 'text-white' : 'text-gray-900'}>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-white/60' : 'text-gray-600'}>Última actualización:</span>
                <span className={darkMode ? 'text-white' : 'text-gray-900'}>Oct 8, 2025</span>
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-white/60' : 'text-gray-600'}>Base de datos:</span>
                <span className="text-[#10B981]">Conectada</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className={darkMode ? 'bg-[#1E293B] border-white/10' : ''}>
          <DialogHeader>
            <DialogTitle className={darkMode ? 'text-white' : ''}>
              {isEditMode ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription className={darkMode ? 'text-white/60' : ''}>
              {isEditMode 
                ? 'Modifica los detalles del usuario administrador'
                : 'Completa los datos para crear un nuevo usuario administrador'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userName" className={darkMode ? 'text-white/80' : ''}>
                Nombre Completo *
              </Label>
              <div className="relative">
                <User size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
                <Input
                  id="userName"
                  placeholder="Ej: María González"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className={`pl-10 ${darkMode ? 'bg-white/5 border-white/10 text-white' : ''}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userEmail" className={darkMode ? 'text-white/80' : ''}>
                Email *
              </Label>
              <div className="relative">
                <Mail size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
                <Input
                  id="userEmail"
                  type="email"
                  placeholder="usuario@cangrejeras.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className={`pl-10 ${darkMode ? 'bg-white/5 border-white/10 text-white' : ''}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userPassword" className={darkMode ? 'text-white/80' : ''}>
                Contraseña {isEditMode ? '(dejar en blanco para mantener actual)' : '*'}
              </Label>
              <div className="relative">
                <Key size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
                <Input
                  id="userPassword"
                  type="password"
                  placeholder={isEditMode ? 'Nueva contraseña (opcional)' : 'Contraseña segura'}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className={`pl-10 ${darkMode ? 'bg-white/5 border-white/10 text-white' : ''}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className={darkMode ? 'text-white/80' : ''}>Rol del Usuario *</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value as AdminUser['role'] })}
              >
                <SelectTrigger className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={darkMode ? 'bg-[#1E293B] border-white/10' : ''}>
                  <SelectItem value="Super Admin" className={darkMode ? 'text-white' : ''}>
                    Super Admin - Acceso total al sistema
                  </SelectItem>
                  <SelectItem value="Admin" className={darkMode ? 'text-white' : ''}>
                    Admin - Gestión completa excepto usuarios
                  </SelectItem>
                  <SelectItem value="Editor" className={darkMode ? 'text-white' : ''}>
                    Editor - Gestión de contenido y noticias
                  </SelectItem>
                  <SelectItem value="Moderador" className={darkMode ? 'text-white' : ''}>
                    Moderador - Moderación de comentarios
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={darkMode ? 'text-white/80' : ''}>Estado *</Label>
              <Select
                value={newUser.status}
                onValueChange={(value) => setNewUser({ ...newUser, status: value as AdminUser['status'] })}
              >
                <SelectTrigger className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={darkMode ? 'bg-[#1E293B] border-white/10' : ''}>
                  <SelectItem value="Activo" className={darkMode ? 'text-white' : ''}>
                    Activo
                  </SelectItem>
                  <SelectItem value="Inactivo" className={darkMode ? 'text-white' : ''}>
                    Inactivo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUserDialog(false)}
              className={darkMode ? 'border-white/10 text-white/70' : ''}
            >
              Cancelar
            </Button>
            <Button
              onClick={saveUser}
              className="bg-[#0C2340] hover:bg-[#1e3a5f] text-white"
            >
              {isEditMode ? 'Actualizar Usuario' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className={darkMode ? 'bg-[#1E293B] border-white/10' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle className={darkMode ? 'text-white' : ''}>
              ¿Eliminar Usuario?
            </AlertDialogTitle>
            <AlertDialogDescription className={darkMode ? 'text-white/60' : ''}>
              ¿Estás seguro de que deseas eliminar a <strong>{selectedUser?.name}</strong>? 
              Esta acción no se puede deshacer y el usuario perderá acceso al panel de administración.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={darkMode ? 'border-white/10 text-white/70' : ''}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-[#E01E37] hover:bg-[#c01a30] text-white"
            >
              Eliminar Usuario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
