import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, FileText, Calendar, CheckCircle, Clock, X, Image as ImageIcon, Bell, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { toast } from "sonner@2.0.3";
import { newsService, Article, ArticleInput } from "../../services/newsService";
import { adminService } from "../../services/adminService";
import { useAuth } from "../../contexts/AuthContext";
import { activityLogService } from "../../services/activityLogService";
import { User } from "../../utils/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

interface NewsManagementProps {
  darkMode: boolean;
}

const CATEGORIES = ['General', 'Comunicados', 'Eventos'] as const;

export function NewsManagement({ darkMode }: NewsManagementProps) {
  const { currentUser } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);
  const [notifyingArticleId, setNotifyingArticleId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'General' as ArticleInput['category'],
    status: 'draft' as 'published' | 'draft',
    publishDate: new Date().toISOString().split('T')[0],
    imageUrl: '',
    authorId: '',
    authorName: ''
  });

  // Load articles and admins on mount
  useEffect(() => {
    loadArticles();
    loadAdmins();
  }, []);

  // Set default author when currentUser or admins change
  useEffect(() => {
    if (currentUser && !editingArticle) {
      setFormData(prev => ({
        ...prev,
        authorId: currentUser.id,
        authorName: currentUser.name
      }));
    }
  }, [currentUser, editingArticle]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await newsService.getAllArticles();
      setArticles(data);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast.error('Error al cargar artículos');
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const data = await adminService.getAllAdmins();
      setAdmins(data);
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'General',
      status: 'draft',
      publishDate: new Date().toISOString().split('T')[0],
      imageUrl: '',
      authorId: currentUser?.id || '',
      authorName: currentUser?.name || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      status: article.status,
      publishDate: article.publishDate instanceof Date
        ? article.publishDate.toISOString().split('T')[0]
        : new Date(article.publishDate).toISOString().split('T')[0],
      imageUrl: article.imageUrl || '',
      authorId: article.authorId,
      authorName: article.authorName
    });
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (article: Article) => {
    setViewingArticle(article);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingArticle(null);
  };

  const handleAuthorChange = (authorId: string) => {
    const selectedAdmin = admins.find(a => a.id === authorId);
    if (selectedAdmin) {
      setFormData({
        ...formData,
        authorId: selectedAdmin.id,
        authorName: selectedAdmin.name
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    if (!formData.authorId) {
      toast.error('Selecciona un autor');
      return;
    }

    try {
      if (editingArticle) {
        // Update existing article
        await newsService.updateArticle(editingArticle.id, formData);
        setArticles(articles.map(a =>
          a.id === editingArticle.id
            ? { ...a, ...formData, publishDate: new Date(formData.publishDate), updatedAt: new Date() }
            : a
        ));

        // Log activity
        if (currentUser) {
          await activityLogService.logActivity(
            currentUser.id,
            'update',
            'news',
            `Actualizó artículo "${formData.title}"`,
            { articleId: editingArticle.id }
          );
        }

        toast.success('Artículo actualizado exitosamente');
      } else {
        // Create new article
        const newArticle = await newsService.createArticle(formData);
        setArticles([newArticle, ...articles]);

        // Log activity
        if (currentUser) {
          await activityLogService.logActivity(
            currentUser.id,
            'create',
            'news',
            `Creó artículo "${formData.title}"`,
            { articleId: newArticle.id }
          );
        }

        toast.success('Artículo creado exitosamente');
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Error al guardar artículo');
    }
  };

  const handleDelete = async (article: Article) => {
    if (!confirm('¿Estás seguro de eliminar este artículo?')) {
      return;
    }

    try {
      await newsService.deleteArticle(article.id);
      setArticles(articles.filter(a => a.id !== article.id));

      // Log activity
      if (currentUser) {
        await activityLogService.logActivity(
          currentUser.id,
          'delete',
          'news',
          `Eliminó artículo "${article.title}"`,
          { articleId: article.id }
        );
      }

      toast.success('Artículo eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Error al eliminar artículo');
    }
  };

  const handlePublish = async (article: Article) => {
    try {
      await newsService.publishArticle(article.id);
      setArticles(articles.map(a =>
        a.id === article.id ? { ...a, status: 'published' as const, publishDate: new Date() } : a
      ));

      // Log activity
      if (currentUser) {
        await activityLogService.logActivity(
          currentUser.id,
          'update',
          'news',
          `Publicó artículo "${article.title}"`,
          { articleId: article.id }
        );
      }

      toast.success('Artículo publicado exitosamente');
    } catch (error) {
      console.error('Error publishing article:', error);
      toast.error('Error al publicar artículo');
    }
  };

  const handleSendNotification = async (article: Article) => {
    if (!confirm(`¿Enviar notificación a todos los usuarios sobre "${article.title}"?`)) {
      return;
    }

    setNotifyingArticleId(article.id);

    try {
      const functions = getFunctions();
      const sendNewsNotification = httpsCallable(functions, 'sendNewsNotification');

      const result = await sendNewsNotification({
        newsId: article.id,
        title: article.title,
        excerpt: article.excerpt
      });

      const data = result.data as { success: boolean; results: { success: number; failure: number } };

      if (data.success) {
        toast.success(`Notificación enviada: ${data.results.success} exitosas, ${data.results.failure} fallidas`);
      } else {
        toast.error('Error al enviar notificación');
      }
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast.error(error.message || 'Error al enviar notificación');
    } finally {
      setNotifyingArticleId(null);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('es-PR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Partidos':
        return 'bg-[#E01E37]/10 text-[#E01E37]';
      case 'Jugadoras':
        return 'bg-[#C8A963]/10 text-[#C8A963]';
      case 'Eventos':
        return 'bg-[#8B5CF6]/10 text-[#8B5CF6]';
      case 'Anuncios':
        return 'bg-[#3B82F6]/10 text-[#3B82F6]';
      default:
        return 'bg-[#0C2340]/10 text-[#0C2340]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Gestión de Noticias
          </h2>
          <p className={`text-sm mt-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
            Administra artículos y actualizaciones del equipo
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="bg-[#0C2340] hover:bg-[#1e3a5f] text-white"
        >
          <Plus size={18} className="mr-2" />
          Crear Artículo
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className={`text-center ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
            <FileText size={48} className="mx-auto mb-3 animate-pulse" />
            <p>Cargando artículos...</p>
          </div>
        </div>
      ) : articles.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className={`text-center ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
            <FileText size={48} className="mx-auto mb-3 opacity-30" />
            <p>No hay artículos</p>
            <p className="text-sm mt-2">Crea tu primer artículo</p>
          </div>
        </div>
      ) : (
        /* Articles Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className={`rounded-xl border p-6 transition-all duration-300 hover:shadow-lg ${
                darkMode
                  ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
                  : 'bg-white/80 border-gray-200 backdrop-blur-xl'
              }`}
            >
              {/* Image Preview */}
              {article.imageUrl && (
                <div className="mb-4 rounded-lg overflow-hidden h-40">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Status & Category Badges */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    className={
                      article.status === 'published'
                        ? 'bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20'
                        : 'bg-[#F97316]/10 text-[#F97316] hover:bg-[#F97316]/20'
                    }
                  >
                    {article.status === 'published' ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle size={14} />
                        Publicado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        Borrador
                      </span>
                    )}
                  </Badge>
                  <Badge className={getCategoryColor(article.category)}>
                    {article.category}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenViewModal(article)}
                    className={darkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : ''}
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditModal(article)}
                    className={darkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : ''}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(article)}
                    className="text-[#E01E37] hover:text-[#E01E37] hover:bg-[#E01E37]/10"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              {/* Title */}
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {article.title}
              </h3>

              {/* Excerpt */}
              <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                {article.excerpt}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs">
                <div className={`flex items-center gap-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                  <Calendar size={14} />
                  <span>{formatDate(article.publishDate)}</span>
                </div>
                <div className={`flex items-center gap-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                  <FileText size={14} />
                  <span>{article.authorName}</span>
                </div>
              </div>

              {/* Actions */}
              {article.status === 'draft' && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                  <Button
                    onClick={() => handlePublish(article)}
                    className="w-full bg-[#10B981] hover:bg-[#059669] text-white"
                    size="sm"
                  >
                    Publicar Ahora
                  </Button>
                </div>
              )}

              {/* Notify Button for Published Articles */}
              {article.status === 'published' && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                  <Button
                    onClick={() => handleSendNotification(article)}
                    disabled={notifyingArticleId === article.id}
                    className="w-full bg-[#0C2340] hover:bg-[#1e3a5f] text-white"
                    size="sm"
                  >
                    {notifyingArticleId === article.id ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Bell size={16} className="mr-2" />
                        Notificar a Usuarios
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div
          className={`rounded-xl border p-6 ${
            darkMode
              ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
              : 'bg-white/80 border-gray-200 backdrop-blur-xl'
          }`}
        >
          <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {articles.filter(a => a.status === 'published').length}
          </div>
          <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
            Artículos Publicados
          </div>
        </div>
        <div
          className={`rounded-xl border p-6 ${
            darkMode
              ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
              : 'bg-white/80 border-gray-200 backdrop-blur-xl'
          }`}
        >
          <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {articles.filter(a => a.status === 'draft').length}
          </div>
          <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
            Borradores
          </div>
        </div>
        <div
          className={`rounded-xl border p-6 ${
            darkMode
              ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
              : 'bg-white/80 border-gray-200 backdrop-blur-xl'
          }`}
        >
          <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {articles.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString()}
          </div>
          <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
            Vistas Totales
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6 ${
              darkMode ? 'bg-[#1E293B]' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingArticle ? 'Editar Artículo' : 'Crear Nuevo Artículo'}
              </h3>
              <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Victoria contundente contra las Criollas"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                  }`}
                  required
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  Extracto <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Breve resumen del artículo (1-2 líneas)"
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border resize-none ${
                    darkMode
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                  }`}
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  Contenido <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Contenido completo del artículo..."
                  rows={6}
                  className={`w-full px-3 py-2 rounded-lg border resize-none ${
                    darkMode
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                  }`}
                  required
                />
              </div>

              {/* Category & Date Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ArticleInput['category'] })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className={darkMode ? 'bg-[#1E293B]' : ''}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                    Fecha de Publicación
                  </label>
                  <input
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  URL de Imagen (Opcional)
                </label>
                <div className="flex gap-2">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <ImageIcon size={20} className={darkMode ? 'text-white/60' : 'text-gray-500'} />
                  </div>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40'
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                    }`}
                  />
                </div>
              </div>

              {/* Author Select */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  Autor
                </label>
                <select
                  value={formData.authorId}
                  onChange={(e) => handleAuthorChange(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="" className={darkMode ? 'bg-[#1E293B]' : ''}>
                    Seleccionar autor...
                  </option>
                  {admins.map((admin) => (
                    <option key={admin.id} value={admin.id} className={darkMode ? 'bg-[#1E293B]' : ''}>
                      {admin.name} ({admin.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  Estado
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === 'draft'}
                      onChange={() => setFormData({ ...formData, status: 'draft' })}
                      className="accent-[#0C2340]"
                    />
                    <span className={darkMode ? 'text-white/80' : 'text-gray-700'}>Borrador</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formData.status === 'published'}
                      onChange={() => setFormData({ ...formData, status: 'published' })}
                      className="accent-[#10B981]"
                    />
                    <span className={darkMode ? 'text-white/80' : 'text-gray-700'}>Publicado</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#0C2340] hover:bg-[#1e3a5f] text-white"
                >
                  {editingArticle ? 'Guardar Cambios' : 'Crear Artículo'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* App Preview Modal - Simula cómo se ve en la App móvil */}
      {isViewModalOpen && viewingArticle && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="relative w-full max-w-md mx-auto my-4">
            {/* Modal Container */}
            <div className={`rounded-2xl overflow-hidden shadow-2xl ${darkMode ? 'bg-[#1E293B]' : 'bg-gray-100'}`}>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#0C2340]">
                <h3 className="text-white font-semibold">Vista previa - App</h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Phone Screen Content */}
              <div className="bg-white max-h-[60vh] overflow-y-auto">
                {/* Hero Image */}
                <div className="w-full h-52 bg-[#0C2340] relative">
                  {viewingArticle.imageUrl ? (
                    <img
                      src={viewingArticle.imageUrl}
                      alt={viewingArticle.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={48} className="text-white/30" />
                    </div>
                  )}
                </div>

                {/* Article Content */}
                <div className="p-5">
                  {/* Title */}
                  <h1 className="text-[#0C2340] text-xl font-bold leading-tight mb-4">
                    {viewingArticle.title}
                  </h1>

                  {/* Author info */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-[#0C2340] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {viewingArticle.authorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-[#0C2340] text-sm">
                        {viewingArticle.authorName}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {formatDate(viewingArticle.publishDate)}
                      </div>
                    </div>
                  </div>

                  {/* Excerpt - destacado */}
                  <p className="text-gray-700 text-base leading-relaxed mb-4 font-medium">
                    {viewingArticle.excerpt}
                  </p>

                  {/* Content */}
                  <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                    {viewingArticle.content.split('\n').filter(p => p.trim()).map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className={`flex gap-3 p-4 border-t ${darkMode ? 'border-white/10 bg-[#1E293B]' : 'border-gray-200 bg-gray-50'}`}>
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenEditModal(viewingArticle);
                  }}
                  className="flex-1 bg-[#0C2340] hover:bg-[#1e3a5f] text-white"
                >
                  <Edit size={16} className="mr-2" />
                  Editar
                </Button>
                {viewingArticle.status === 'published' && (
                  <Button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleSendNotification(viewingArticle);
                    }}
                    className="flex-1 bg-[#C8A963] hover:bg-[#b89a54] text-white"
                  >
                    <Bell size={16} className="mr-2" />
                    Notificar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
