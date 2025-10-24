import { useState, useEffect } from "react";
import { Plus, Image as ImageIcon, Zap, Link as LinkIcon, ExternalLink, EyeOff, Eye, SquarePen, Trash2, Lightbulb, Loader2, BarChart3, Newspaper, Ticket, ShoppingBag, Bell, Calendar, Trophy, Users, Heart, Star, Share2, Camera, Video, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner@2.0.3";
import { bannerService, PromoBanner, QuickLink } from "../../services/bannerService";

interface BannerManagementProps {
  darkMode: boolean;
}

export function BannerManagement({ darkMode }: BannerManagementProps) {
  const [activeTab, setActiveTab] = useState<'banners' | 'quicklinks'>('banners');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickLinkModalOpen, setIsQuickLinkModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);
  const [editingQuickLink, setEditingQuickLink] = useState<QuickLink | null>(null);
  const [loading, setLoading] = useState(false);
  const [promoBanners, setPromoBanners] = useState<PromoBanner[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    type: 'primary' as 'primary' | 'secondary',
    emoji: '',
    title: '',
    description: '',
    image: '',
    link: '',
    cta: '',
    bgColor: '#0C2340',
    textColor: '#FFFFFF'
  });

  // Quick Link form state
  const [quickLinkFormData, setQuickLinkFormData] = useState({
    title: '',
    description: '',
    link: '',
    icon: 'BarChart3',
    iconColor: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)'
  });

  // Cargar banners desde Firestore
  useEffect(() => {
    loadBanners();
    loadQuickLinks();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const banners = await bannerService.getAllBanners();
      setPromoBanners(banners);
    } catch (error) {
      console.error('Error loading banners:', error);
      toast.error('Error al cargar los banners');
    } finally {
      setLoading(false);
    }
  };

  const loadQuickLinks = async () => {
    try {
      const links = await bannerService.getAllQuickLinks();
      setQuickLinks(links);
    } catch (error) {
      console.error('Error loading quick links:', error);
      toast.error('Error al cargar los enlaces rápidos');
    }
  };

  const handleToggleBanner = async (id: string, isActive: boolean) => {
    try {
      await bannerService.toggleBannerActive(id, !isActive);
      await loadBanners();
      toast.success(isActive ? 'Banner desactivado' : 'Banner activado');
    } catch (error) {
      console.error('Error toggling banner:', error);
      toast.error('Error al cambiar el estado del banner');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este banner?')) {
      return;
    }

    try {
      await bannerService.deleteBanner(id);
      await loadBanners();
      toast.success('Banner eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Error al eliminar el banner');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      type: 'primary',
      emoji: '',
      title: '',
      description: '',
      image: '',
      link: '',
      cta: '',
      bgColor: '#0C2340',
      textColor: '#FFFFFF'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner: PromoBanner) => {
    setEditingBanner(banner);
    setFormData({
      type: banner.type,
      emoji: banner.emoji,
      title: banner.title,
      description: banner.description,
      image: banner.image,
      link: banner.link,
      cta: banner.cta,
      bgColor: banner.bgColor || '#0C2340',
      textColor: banner.textColor || '#FFFFFF'
    });
    setIsModalOpen(true);
  };

  const handleSaveBanner = async () => {
    if (!formData.title || !formData.description || !formData.image) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);

      if (editingBanner) {
        // Editar banner existente
        await bannerService.updateBanner(editingBanner.id, formData);
        toast.success('Banner actualizado exitosamente');
      } else {
        // Crear nuevo banner
        await bannerService.createBanner(formData);
        toast.success('Banner creado exitosamente');
      }

      await loadBanners();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Error al guardar el banner');
    } finally {
      setLoading(false);
    }
  };

  // Quick Links handlers
  const handleToggleQuickLink = async (id: string, isActive: boolean) => {
    try {
      await bannerService.toggleQuickLinkActive(id, !isActive);
      await loadQuickLinks();
      toast.success(isActive ? 'Enlace desactivado' : 'Enlace activado');
    } catch (error) {
      console.error('Error toggling quick link:', error);
      toast.error('Error al cambiar el estado del enlace');
    }
  };

  const handleDeleteQuickLink = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este enlace?')) {
      return;
    }

    try {
      await bannerService.deleteQuickLink(id);
      await loadQuickLinks();
      toast.success('Enlace eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting quick link:', error);
      toast.error('Error al eliminar el enlace');
    }
  };

  const handleOpenEditQuickLinkModal = (link: QuickLink) => {
    setEditingQuickLink(link);
    setQuickLinkFormData({
      title: link.title,
      description: link.description,
      link: link.link,
      icon: link.icon,
      iconColor: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    });
    setIsQuickLinkModalOpen(true);
  };

  const handleSaveQuickLink = async () => {
    if (!quickLinkFormData.title || !quickLinkFormData.link) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);

      if (editingQuickLink) {
        // Editar enlace existente
        await bannerService.updateQuickLink(editingQuickLink.id, quickLinkFormData);
        toast.success('Enlace actualizado exitosamente');
      } else {
        // Crear nuevo enlace
        await bannerService.createQuickLink(quickLinkFormData);
        toast.success('Enlace creado exitosamente');
      }

      await loadQuickLinks();
      setIsQuickLinkModalOpen(false);
    } catch (error) {
      console.error('Error saving quick link:', error);
      toast.error('Error al guardar el enlace');
    } finally {
      setLoading(false);
    }
  };

  const getIconForQuickLink = (icon: string, color?: string) => {
    const iconProps = { size: 24, style: { color: color || '#8B5CF6' } };
    switch (icon) {
      case 'BarChart3': return <BarChart3 {...iconProps} />;
      case 'Bell': return <Bell {...iconProps} />;
      case 'Calendar': return <Calendar {...iconProps} />;
      case 'ShoppingBag': return <ShoppingBag {...iconProps} />;
      case 'Newspaper': return <Newspaper {...iconProps} />;
      case 'Trophy': return <Trophy {...iconProps} />;
      case 'Users': return <Users {...iconProps} />;
      case 'Heart': return <Heart {...iconProps} />;
      case 'Star': return <Star {...iconProps} />;
      case 'Share2': return <Share2 {...iconProps} />;
      case 'Camera': return <Camera {...iconProps} />;
      case 'Video': return <Video {...iconProps} />;
      case 'MapPin': return <MapPin {...iconProps} />;
      case 'Phone': return <Phone {...iconProps} />;
      case 'Mail': return <Mail {...iconProps} />;
      case 'Instagram': return <Instagram {...iconProps} />;
      case 'Facebook': return <Facebook {...iconProps} />;
      case 'Twitter': return <Twitter {...iconProps} />;
      default: return <LinkIcon {...iconProps} />;
    }
  };

  const iconOptions = [
    { value: 'BarChart3', label: 'Gráfico de Barras' },
    { value: 'Bell', label: 'Campana (Notificaciones)' },
    { value: 'Calendar', label: 'Calendario' },
    { value: 'ShoppingBag', label: 'Bolsa de Compras' },
    { value: 'Newspaper', label: 'Periódico' },
    { value: 'Trophy', label: 'Trofeo' },
    { value: 'Users', label: 'Usuarios' },
    { value: 'Heart', label: 'Corazón' },
    { value: 'Star', label: 'Estrella' },
    { value: 'Share2', label: 'Compartir' },
    { value: 'Camera', label: 'Cámara' },
    { value: 'Video', label: 'Video' },
    { value: 'MapPin', label: 'Pin de Mapa' },
    { value: 'Phone', label: 'Teléfono' },
    { value: 'Mail', label: 'Correo' },
    { value: 'Instagram', label: 'Instagram' },
    { value: 'Facebook', label: 'Facebook' },
    { value: 'Twitter', label: 'Twitter' },
  ];

  const primaryBanners = promoBanners.filter(b => b.type === 'primary');
  const secondaryBanners = promoBanners.filter(b => b.type === 'secondary');

  if (loading && promoBanners.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-white' : 'text-gray-900'}`} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Banners de Promoción
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Gestiona los banners y enlaces rápidos de la página principal
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col gap-2 w-full">
        <div
          role="tablist"
          className={`text-muted-foreground h-9 items-center justify-center rounded-xl p-[3px] grid w-full max-w-md grid-cols-2 ${
            darkMode ? 'bg-white/5' : 'bg-gray-100'
          }`}
        >
          <button
            type="button"
            role="tab"
            onClick={() => setActiveTab('banners')}
            className={`h-[calc(100%-1px)] flex-1 justify-center rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] flex items-center gap-2 ${
              activeTab === 'banners'
                ? darkMode
                  ? 'bg-input/30 border-input text-foreground'
                  : 'bg-card text-foreground'
                : darkMode
                  ? 'text-muted-foreground'
                  : 'text-foreground'
            }`}
          >
            <ImageIcon size={16} />
            Banners Promocionales
          </button>
          <button
            type="button"
            role="tab"
            onClick={() => setActiveTab('quicklinks')}
            className={`h-[calc(100%-1px)] flex-1 justify-center rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] flex items-center gap-2 ${
              activeTab === 'quicklinks'
                ? darkMode
                  ? 'bg-input/30 border-input text-foreground'
                  : 'bg-card text-foreground'
                : darkMode
                  ? 'text-muted-foreground'
                  : 'text-foreground'
            }`}
          >
            <Zap size={16} />
            Enlaces Rápidos
          </button>
        </div>

        {/* Tab Content - Banners Promocionales */}
        {activeTab === 'banners' && (
          <div className="flex-1 outline-none space-y-6 mt-6">
            {/* Create Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleOpenCreateModal}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 h-11 px-5 py-2.5 bg-gradient-to-r from-[#0C2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#0C2340] text-white shadow-lg"
              >
                <Plus size={18} className="mr-2" />
                Crear Banner
              </Button>
            </div>

            {/* Primary Banners */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Banners Altos (Primary)
                </h3>
                <span
                  className="inline-flex items-center rounded-full border px-2.5 py-1 text-sm gap-1.5"
                  style={{
                    background: 'linear-gradient(135deg, rgb(200, 169, 99) 0%, rgb(184, 152, 80) 100%)',
                    color: 'rgb(12, 35, 64)',
                    borderColor: 'rgba(200, 169, 99, 0.3)',
                    boxShadow: 'rgba(200, 169, 99, 0.25) 0px 2px 8px'
                  }}
                >
                  <span className="font-medium">{primaryBanners.length} {primaryBanners.length === 1 ? 'banner' : 'banners'}</span>
                </span>
              </div>

              {primaryBanners.length === 0 ? (
                <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No hay banners altos creados
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {primaryBanners.map((banner) => (
                    <div
                      key={banner.id}
                      className={`glass-card rounded-2xl p-6 border overflow-hidden ${
                        darkMode
                          ? 'bg-[#1E293B]/50 border-white/10'
                          : 'bg-white border-gray-200 shadow-md'
                      }`}
                    >
                      {/* Banner Image */}
                      <div className="relative h-32 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden rounded-lg">
                        <img
                          src={banner.image}
                          alt={`${banner.emoji} ${banner.title}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Badge className={`${banner.isActive ? 'bg-[#10B981]' : 'bg-gray-500'} text-white border-transparent`}>
                            {banner.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                          <Badge className="bg-[#C8A963] text-[#0C2340] border-transparent">
                            Banner Alto
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {banner.emoji} {banner.title}
                          </h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {banner.description}
                          </p>
                        </div>

                        {banner.link && (
                          <div className={`flex items-center gap-2 text-xs ${darkMode ? 'text-white/60' : 'text-[#0C2340]'}`}>
                            <LinkIcon size={14} />
                            <span className="truncate">{banner.link}</span>
                          </div>
                        )}

                        {banner.cta && (
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
                            darkMode ? 'bg-[#C8A963]/20 text-[#C8A963]' : 'bg-[#C8A963]/10 text-[#0C2340]'
                          }`}>
                            <ExternalLink size={12} />
                            {banner.cta}
                          </div>
                        )}

                        <Separator className={darkMode ? 'bg-white/10' : 'bg-gray-200'} />

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleBanner(banner.id, banner.isActive)}
                            disabled={loading}
                            className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all duration-300 h-9 rounded-lg gap-1.5 px-4 flex-1 border-2 bg-white/50 backdrop-blur-sm hover:bg-white ${
                              darkMode
                                ? 'dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 hover:border-[#C8A963]/40 dark:hover:border-[#C8A963]/30'
                                : 'border-[#E01E37]/30 hover:border-[#E01E37]/40'
                            } text-[#E01E37]`}
                          >
                            {banner.isActive ? <EyeOff size={14} className="mr-1" /> : <Eye size={14} className="mr-1" />}
                            {banner.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(banner)}
                            disabled={loading}
                            className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all duration-300 h-9 rounded-lg gap-1.5 px-4 border-2 bg-white/50 backdrop-blur-sm hover:bg-white ${
                              darkMode
                                ? 'dark:bg-white/5 dark:hover:bg-white/10 border-gray-200 dark:border-white/10 hover:border-[#C8A963]/40 dark:hover:border-[#C8A963]/30 text-white'
                                : 'text-foreground border-gray-200 hover:border-[#C8A963]/40'
                            }`}
                          >
                            <SquarePen size={14} className="mr-1" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(banner.id)}
                            disabled={loading}
                            className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all duration-300 h-9 rounded-lg gap-1.5 px-4 border-2 bg-white/50 backdrop-blur-sm ${
                              darkMode
                                ? 'dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 hover:border-[#C8A963]/40 dark:hover:border-[#C8A963]/30'
                                : 'hover:bg-[#E01E37]/10 border-[#E01E37]/30'
                            } text-[#E01E37]`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator className={darkMode ? 'bg-white/10' : 'bg-gray-200'} />

            {/* Secondary Banners */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Banners Bajos (Secondary)
                </h3>
                <span
                  className="inline-flex items-center rounded-full border px-2.5 py-1 text-sm gap-1.5"
                  style={{
                    background: 'linear-gradient(135deg, rgb(200, 169, 99) 0%, rgb(184, 152, 80) 100%)',
                    color: 'rgb(12, 35, 64)',
                    borderColor: 'rgba(200, 169, 99, 0.3)',
                    boxShadow: 'rgba(200, 169, 99, 0.25) 0px 2px 8px'
                  }}
                >
                  <span className="font-medium">{secondaryBanners.length} {secondaryBanners.length === 1 ? 'banner' : 'banners'}</span>
                </span>
              </div>

              {secondaryBanners.length === 0 ? (
                <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No hay banners bajos creados
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {secondaryBanners.map((banner) => (
                    <div
                      key={banner.id}
                      className={`glass-card rounded-2xl p-6 border overflow-hidden ${
                        darkMode
                          ? 'bg-[#1E293B]/50 border-white/10'
                          : 'bg-white border-gray-200 shadow-md'
                      }`}
                    >
                      {/* Banner Image */}
                      <div className="relative h-32 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden rounded-lg">
                        <img
                          src={banner.image}
                          alt={`${banner.emoji} ${banner.title}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Badge className={`${banner.isActive ? 'bg-[#10B981]' : 'bg-gray-500'} text-white border-transparent`}>
                            {banner.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                          <Badge className="bg-[#0C2340] text-white border-transparent">
                            Banner Bajo
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {banner.emoji} {banner.title}
                          </h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {banner.description}
                          </p>
                        </div>

                        {banner.link && (
                          <div className={`flex items-center gap-2 text-xs ${darkMode ? 'text-white/60' : 'text-[#0C2340]'}`}>
                            <LinkIcon size={14} />
                            <span className="truncate">{banner.link}</span>
                          </div>
                        )}

                        {banner.cta && (
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
                            darkMode ? 'bg-[#C8A963]/20 text-[#C8A963]' : 'bg-[#C8A963]/10 text-[#0C2340]'
                          }`}>
                            <ExternalLink size={12} />
                            {banner.cta}
                          </div>
                        )}

                        <Separator className={darkMode ? 'bg-white/10' : 'bg-gray-200'} />

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleBanner(banner.id, banner.isActive)}
                            disabled={loading}
                            className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all duration-300 h-9 rounded-lg gap-1.5 px-4 flex-1 border-2 bg-white/50 backdrop-blur-sm hover:bg-white ${
                              darkMode
                                ? 'dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 hover:border-[#C8A963]/40 dark:hover:border-[#C8A963]/30'
                                : 'border-[#E01E37]/30 hover:border-[#E01E37]/40'
                            } text-[#E01E37]`}
                          >
                            {banner.isActive ? <EyeOff size={14} className="mr-1" /> : <Eye size={14} className="mr-1" />}
                            {banner.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(banner)}
                            disabled={loading}
                            className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all duration-300 h-9 rounded-lg gap-1.5 px-4 border-2 bg-white/50 backdrop-blur-sm hover:bg-white ${
                              darkMode
                                ? 'dark:bg-white/5 dark:hover:bg-white/10 border-gray-200 dark:border-white/10 hover:border-[#C8A963]/40 dark:hover:border-[#C8A963]/30 text-white'
                                : 'text-foreground border-gray-200 hover:border-[#C8A963]/40'
                            }`}
                          >
                            <SquarePen size={14} className="mr-1" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(banner.id)}
                            disabled={loading}
                            className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all duration-300 h-9 rounded-lg gap-1.5 px-4 border-2 bg-white/50 backdrop-blur-sm ${
                              darkMode
                                ? 'dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 hover:border-[#C8A963]/40 dark:hover:border-[#C8A963]/30'
                                : 'hover:bg-[#E01E37]/10 border-[#E01E37]/30'
                            } text-[#E01E37]`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content - Enlaces Rápidos */}
        {activeTab === 'quicklinks' && (
          <div className="flex-1 outline-none space-y-6 mt-6">
            {/* Header with Create Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Enlaces Rápidos de Acceso
                </h3>
                <span
                  className="inline-flex items-center rounded-full border px-2.5 py-1 text-sm gap-1.5"
                  style={{
                    background: 'linear-gradient(135deg, rgb(200, 169, 99) 0%, rgb(184, 152, 80) 100%)',
                    color: 'rgb(12, 35, 64)',
                    borderColor: 'rgba(200, 169, 99, 0.3)',
                    boxShadow: 'rgba(200, 169, 99, 0.25) 0px 2px 8px'
                  }}
                >
                  <span className="font-medium">{quickLinks.length} {quickLinks.length === 1 ? 'enlace' : 'enlaces'}</span>
                </span>
              </div>
              <Button
                onClick={() => {
                  setEditingQuickLink(null);
                  setQuickLinkFormData({
                    title: '',
                    description: '',
                    link: '',
                    icon: 'BarChart3',
                    iconColor: '#8B5CF6',
                    bgColor: 'rgba(139, 92, 246, 0.1)'
                  });
                  setIsQuickLinkModalOpen(true);
                }}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 h-11 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
              >
                <Plus size={18} />
                Crear Enlace
              </Button>
            </div>

            {/* Quick Links Grid */}
            {quickLinks.length === 0 ? (
              <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No hay enlaces rápidos creados
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickLinks.map((link) => (
                  <div
                    key={link.id}
                    className={`rounded-xl border p-5 transition-all duration-300 hover:shadow-md ${
                      darkMode
                        ? 'bg-[#1E293B]/50 border-white/10'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    {/* Icon and Status */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: link.bgColor || 'rgba(139, 92, 246, 0.1)',
                          boxShadow: `${link.iconColor || '#8B5CF6'}20 0px 4px 12px`
                        }}
                      >
                        {getIconForQuickLink(link.icon, link.iconColor)}
                      </div>
                      <Badge className={link.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white border-transparent'}>
                        {link.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>

                    {/* Content */}
                    <h4 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {link.title}
                    </h4>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                      {link.description}
                    </p>

                    {link.link && (
                      <div className={`flex items-center gap-1.5 text-xs mb-4 p-2 rounded ${
                        darkMode ? 'bg-white/5 text-white/60' : 'bg-gray-50 text-gray-500'
                      }`}>
                        <LinkIcon size={12} />
                        <span className="truncate">{link.link}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleQuickLink(link.id, link.isActive)}
                        disabled={loading}
                        className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all duration-300 h-9 rounded-lg gap-1.5 px-3 flex-1 border-2 bg-white/50 backdrop-blur-sm hover:bg-white ${
                          darkMode
                            ? 'dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 hover:border-[#C8A963]/40 dark:hover:border-[#C8A963]/30'
                            : 'border-[#E01E37]/30 hover:border-[#E01E37]/40'
                        } text-[#E01E37]`}
                      >
                        {link.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => handleOpenEditQuickLinkModal(link)}
                        disabled={loading}
                        className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all duration-300 h-9 rounded-lg gap-1.5 px-3 border-2 bg-white/50 backdrop-blur-sm hover:bg-white ${
                          darkMode
                            ? 'dark:bg-white/5 dark:hover:bg-white/10 border-gray-200 dark:border-white/10 hover:border-[#C8A963]/40 dark:hover:border-[#C8A963]/30 text-white'
                            : 'text-foreground border-gray-200 hover:border-[#C8A963]/40'
                        }`}
                      >
                        <SquarePen size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteQuickLink(link.id)}
                        disabled={loading}
                        className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all duration-300 h-9 rounded-lg gap-1.5 px-3 border-2 bg-white/50 backdrop-blur-sm ${
                          darkMode
                            ? 'dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 hover:border-[#C8A963]/40 dark:hover:border-[#C8A963]/30'
                            : 'hover:bg-[#E01E37]/10 border-[#E01E37]/30'
                        } text-[#E01E37]`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal - Crear/Editar Banner */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-[#1E293B] text-white' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {editingBanner ? 'Editar Banner' : 'Crear Banner'}
            </DialogTitle>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Actualiza la información del banner
            </p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Tipo de Banner */}
            <div>
              <Label className={`text-sm font-semibold mb-2 block ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Tipo de Banner <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'primary' })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.type === 'primary'
                      ? 'border-[#C8A963] bg-[#C8A963]/10'
                      : darkMode
                        ? 'border-white/10 bg-white/5'
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                      formData.type === 'primary' ? 'border-[#C8A963]' : darkMode ? 'border-white/30' : 'border-gray-300'
                    }`}>
                      {formData.type === 'primary' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#C8A963]"></div>
                      )}
                    </div>
                    <div>
                      <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Banner Alto</div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Destacado principal</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'secondary' })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.type === 'secondary'
                      ? 'border-[#C8A963] bg-[#C8A963]/10'
                      : darkMode
                        ? 'border-white/10 bg-white/5'
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                      formData.type === 'secondary' ? 'border-[#C8A963]' : darkMode ? 'border-white/30' : 'border-gray-300'
                    }`}>
                      {formData.type === 'secondary' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#C8A963]"></div>
                      )}
                    </div>
                    <div>
                      <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Banner Bajo</div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Secundario compacto</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Título del Banner */}
            <div>
              <Label htmlFor="title" className={`text-sm font-semibold mb-2 block ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Título del Banner <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="🎟️ ¡Boletos Disponibles!"
                className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
              />
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor="description" className={`text-sm font-semibold mb-2 block ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Descripción <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Consigue tus boletos para el próximo partido en casa"
                rows={4}
                className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
              />
            </div>

            {/* URL de la Imagen */}
            <div>
              <Label htmlFor="image" className={`text-sm font-semibold mb-2 block ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                URL de la Imagen <span className="text-red-500">*</span>
              </Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&h=400&fit=crop"
                className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
              />
              <div className={`flex items-center gap-2 mt-2 text-xs ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                <Lightbulb size={14} />
                <span>Recomendado: 800x400px para mejor visualización</span>
              </div>
            </div>

            {/* Vista Previa */}
            {formData.image && (
              <div>
                <Label className={`text-sm font-semibold mb-2 block ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Vista Previa
                </Label>
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Error+al+cargar+imagen';
                    }}
                  />
                </div>
              </div>
            )}

            {/* URL de Destino */}
            <div>
              <Label htmlFor="link" className={`text-sm font-semibold mb-2 block ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                URL de Destino (Opcional)
              </Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://example.com/tickets"
                className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
              />
            </div>

            {/* Texto del Botón */}
            <div>
              <Label htmlFor="cta" className={`text-sm font-semibold mb-2 block ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Texto del Botón (Opcional)
              </Label>
              <Input
                id="cta"
                value={formData.cta}
                onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                placeholder="Comprar Boletos"
                className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
              />
            </div>

            {/* Colores */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bgColor" className={`text-sm font-semibold mb-2 block ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Color de Fondo
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="bgColor"
                    value={formData.bgColor}
                    onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={formData.bgColor}
                    onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                    className={`flex-1 ${darkMode ? 'bg-white/5 border-white/10 text-white' : ''}`}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="textColor" className={`text-sm font-semibold mb-2 block ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Color de Texto
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="textColor"
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    className={`flex-1 ${darkMode ? 'bg-white/5 border-white/10 text-white' : ''}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-white/10">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={loading}
              className={darkMode ? 'border-white/10 text-white hover:bg-white/5' : ''}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveBanner}
              disabled={loading}
              className="bg-[#0C2340] hover:bg-[#1e3a5f] text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal - Crear/Editar Enlace Rápido */}
      <Dialog open={isQuickLinkModalOpen} onOpenChange={setIsQuickLinkModalOpen}>
        <DialogContent className={`max-w-lg max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-[#1E293B] text-white' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {editingQuickLink ? 'Editar Enlace Rápido' : 'Crear Nuevo Enlace Rápido'}
            </DialogTitle>
            <p className={`text-sm text-muted-foreground ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {editingQuickLink ? 'Actualiza la información del enlace' : 'Agrega un nuevo acceso rápido a la aplicación'}
            </p>
          </DialogHeader>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveQuickLink(); }}>
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="linkTitle" className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                Título *
              </Label>
              <Input
                id="linkTitle"
                value={quickLinkFormData.title}
                onChange={(e) => setQuickLinkFormData({ ...quickLinkFormData, title: e.target.value })}
                placeholder="ej: Estadísticas"
                required
                className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
              />
            </div>

            {/* Subtítulo */}
            <div className="space-y-2">
              <Label htmlFor="linkSubtitle" className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                Subtítulo *
              </Label>
              <Input
                id="linkSubtitle"
                value={quickLinkFormData.description}
                onChange={(e) => setQuickLinkFormData({ ...quickLinkFormData, description: e.target.value })}
                placeholder="ej: Ver todas"
                required
                className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
              />
            </div>

            <Separator className={darkMode ? 'bg-white/10' : 'bg-border'} />

            {/* Selector de Icono */}
            <div className="space-y-2">
              <Label htmlFor="linkIcon" className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                Icono *
              </Label>
              <select
                id="linkIcon"
                value={quickLinkFormData.icon}
                onChange={(e) => setQuickLinkFormData({ ...quickLinkFormData, icon: e.target.value })}
                className={`flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm whitespace-nowrap transition-all outline-none ${
                  darkMode
                    ? 'bg-input/30 border-white/10 text-white hover:bg-input/50'
                    : 'bg-input-background border-input text-foreground hover:bg-input'
                }`}
              >
                {iconOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* URL de Destino */}
            <div className="space-y-2">
              <Label htmlFor="linkUrl" className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                URL de Destino *
              </Label>
              <Input
                type="url"
                id="linkUrl"
                value={quickLinkFormData.link}
                onChange={(e) => setQuickLinkFormData({ ...quickLinkFormData, link: e.target.value })}
                placeholder="https://..."
                required
                className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
              />
            </div>

            <Separator className={darkMode ? 'bg-white/10' : 'bg-border'} />

            {/* Colores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkColor" className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  Color del Icono
                </Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="linkColor"
                    value={quickLinkFormData.iconColor}
                    onChange={(e) => setQuickLinkFormData({ ...quickLinkFormData, iconColor: e.target.value })}
                    className="w-16 h-10 p-1 rounded cursor-pointer border"
                  />
                  <Input
                    type="text"
                    value={quickLinkFormData.iconColor}
                    onChange={(e) => setQuickLinkFormData({ ...quickLinkFormData, iconColor: e.target.value })}
                    className={`flex-1 ${darkMode ? 'bg-white/5 border-white/10 text-white' : ''}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkBgColor" className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  Color de Fondo (RGBA)
                </Label>
                <Input
                  type="text"
                  id="linkBgColor"
                  value={quickLinkFormData.bgColor}
                  onChange={(e) => setQuickLinkFormData({ ...quickLinkFormData, bgColor: e.target.value })}
                  placeholder="rgba(139, 92, 246, 0.1)"
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                />
              </div>
            </div>

            {/* Vista Previa */}
            <div className="space-y-2">
              <Label className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                Vista Previa
              </Label>
              <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-50 border-gray-200' : 'bg-gray-50 border-gray-200'}`}>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                  style={{
                    backgroundColor: quickLinkFormData.bgColor,
                    boxShadow: `${quickLinkFormData.iconColor}20 0px 4px 12px`
                  }}
                >
                  {getIconForQuickLink(quickLinkFormData.icon, quickLinkFormData.iconColor)}
                </div>
                <h4 className="font-medium mb-0.5 text-gray-900">
                  {quickLinkFormData.title || 'Título'}
                </h4>
                <p className="text-xs text-gray-600">
                  {quickLinkFormData.description || 'Subtítulo'}
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <Button
                type="button"
                onClick={() => setIsQuickLinkModalOpen(false)}
                disabled={loading}
                className={`border-2 bg-white/50 backdrop-blur-sm text-foreground hover:bg-white ${
                  darkMode
                    ? 'dark:bg-white/5 dark:hover:bg-white/10 border-gray-200 dark:border-white/10 hover:border-[#C8A963]/40 dark:hover:border-[#C8A963]/30 text-white'
                    : 'border-gray-200 hover:border-[#C8A963]/40'
                }`}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Guardar Cambios
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
