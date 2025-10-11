import { useState } from "react";
import { Plus, Edit, Trash2, Eye, FileText, Calendar, CheckCircle, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { toast } from "sonner@2.0.3";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  status: 'published' | 'draft';
  publishDate: string;
  author: string;
}

interface NewsManagementProps {
  darkMode: boolean;
}

export function NewsManagement({ darkMode }: NewsManagementProps) {
  const [articles, setArticles] = useState<Article[]>([
    {
      id: 1,
      title: 'Victoria contundente contra las Criollas',
      excerpt: 'Las Cangrejeras dominaron 3-0 en un partido memorable en el Roberto Clemente...',
      status: 'published',
      publishDate: '2025-10-07',
      author: 'Admin',
    },
    {
      id: 2,
      title: 'Andrea Rangel nombrada MVP de la semana',
      excerpt: 'La opuesta destacó con 28 puntos en la victoria del sábado...',
      status: 'published',
      publishDate: '2025-10-06',
      author: 'Content Manager',
    },
    {
      id: 3,
      title: 'Próximo partido decisivo en casa',
      excerpt: 'Este sábado las Cangrejeras enfrentan a las Gigantes en un duelo crucial...',
      status: 'draft',
      publishDate: '2025-10-08',
      author: 'Content Manager',
    },
  ]);

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este artículo?')) {
      setArticles(articles.filter(a => a.id !== id));
      toast.success('Artículo eliminado exitosamente');
    }
  };

  const handlePublish = (id: number) => {
    setArticles(articles.map(a => 
      a.id === id ? { ...a, status: 'published' as const } : a
    ));
    toast.success('Artículo publicado exitosamente');
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
        <Button className="bg-[#0C2340] hover:bg-[#1e3a5f] text-white">
          <Plus size={18} className="mr-2" />
          Crear Artículo
        </Button>
      </div>

      {/* Articles Grid */}
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
            {/* Status Badge */}
            <div className="flex items-start justify-between mb-4">
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
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className={darkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : ''}>
                  <Eye size={16} />
                </Button>
                <Button variant="ghost" size="sm" className={darkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : ''}>
                  <Edit size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(article.id)}
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
                <span>{article.publishDate}</span>
              </div>
              <div className={`flex items-center gap-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                <FileText size={14} />
                <span>{article.author}</span>
              </div>
            </div>

            {/* Actions */}
            {article.status === 'draft' && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                <Button
                  onClick={() => handlePublish(article.id)}
                  className="w-full bg-[#10B981] hover:bg-[#059669] text-white"
                  size="sm"
                >
                  Publicar Ahora
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

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
            2.4K
          </div>
          <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
            Vistas Esta Semana
          </div>
        </div>
      </div>
    </div>
  );
}
