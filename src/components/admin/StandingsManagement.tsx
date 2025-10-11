import { useState, useEffect } from "react";
import { Trophy, TrendingUp, TrendingDown, Minus, Edit2, Trash2, Plus, Save, X, MoveUp, MoveDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner@2.0.3";
import { standingsService, StandingsTeam } from "../../services/standingsService";

interface StandingsManagementProps {
  darkMode: boolean;
}

export function StandingsManagement({ darkMode }: StandingsManagementProps) {
  const [standings, setStandings] = useState<StandingsTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<StandingsTeam | null>(null);
  const [formData, setFormData] = useState<Partial<StandingsTeam>>({});

  // Load standings from Firestore
  const loadStandings = async () => {
    setIsLoading(true);
    try {
      await standingsService.initializeDefaultStandings();
      const data = await standingsService.getAllStandings();
      setStandings(data);
    } catch (error) {
      console.error('Error loading standings:', error);
      toast.error('Error al cargar tabla de posiciones');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStandings();
  }, []);

  const getPositionTrend = (index: number) => {
    // Mock trend data - in real app this would come from historical data
    if (index === 0) return 'up';
    if (index === standings.length - 1) return 'down';
    return 'same';
  };

  // Open dialog for editing
  const handleEdit = (team: StandingsTeam) => {
    setEditingTeam(team);
    setFormData(team);
    setIsDialogOpen(true);
  };

  // Open dialog for adding new team
  const handleAdd = () => {
    setEditingTeam(null);
    setFormData({
      name: '',
      abbr: '',
      points: 0,
      played: 0,
      won: 0,
      lost: 0,
      color: '#0C2340',
    });
    setIsDialogOpen(true);
  };

  // Save team (edit or create)
  const handleSave = async () => {
    if (!formData.name || !formData.abbr) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      if (editingTeam) {
        // Update existing team
        await standingsService.updateStandingsTeam(editingTeam.id, {
          name: formData.name,
          abbr: formData.abbr,
          points: formData.points || 0,
          played: formData.played || 0,
          won: formData.won || 0,
          lost: formData.lost || 0,
          color: formData.color || '#0C2340',
        });
        toast.success('Equipo actualizado exitosamente');
      } else {
        // Add new team
        await standingsService.createStandingsTeam({
          name: formData.name!,
          abbr: formData.abbr!,
          points: formData.points || 0,
          played: formData.played || 0,
          won: formData.won || 0,
          lost: formData.lost || 0,
          color: formData.color || '#0C2340',
        });
        toast.success('Equipo agregado exitosamente');
      }

      await loadStandings();
      setIsDialogOpen(false);
      setEditingTeam(null);
      setFormData({});
    } catch (error) {
      toast.error('Error al guardar equipo');
      console.error(error);
    }
  };

  // Delete team
  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este equipo?')) {
      try {
        await standingsService.deleteStandingsTeam(id);
        await loadStandings();
        toast.success('Equipo eliminado exitosamente');
      } catch (error) {
        toast.error('Error al eliminar equipo');
        console.error(error);
      }
    }
  };

  // Move team up
  const handleMoveUp = async (id: string, index: number) => {
    if (index === 0) return;
    try {
      await standingsService.moveTeamUp(id);
      await loadStandings();
      toast.success('Posición actualizada');
    } catch (error) {
      toast.error('Error al actualizar posición');
      console.error(error);
    }
  };

  // Move team down
  const handleMoveDown = async (id: string, index: number) => {
    if (index === standings.length - 1) return;
    try {
      await standingsService.moveTeamDown(id);
      await loadStandings();
      toast.success('Posición actualizada');
    } catch (error) {
      toast.error('Error al actualizar posición');
      console.error(error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8A963]"></div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const cangrejerasTeam = standings.find(t => t.name.includes('Cangrejeras'));
  const effectiveness = cangrejerasTeam
    ? ((cangrejerasTeam.won / cangrejerasTeam.played) * 100).toFixed(1)
    : '0';
  const pointsDifference = standings.length >= 2
    ? standings[0].points - standings[1].points
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Tabla de Posiciones
          </h2>
          <p className={`text-sm mt-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
            Administra las posiciones de la liga
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-[#C8A963] hover:bg-[#b89850] text-white"
        >
          <Plus size={16} className="mr-2" />
          Agregar Equipo
        </Button>
      </div>

      {/* Standings Table */}
      <div
        className={`rounded-xl border overflow-hidden ${
          darkMode
            ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
            : 'bg-white/80 border-gray-200 backdrop-blur-xl'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={darkMode ? 'bg-white/5' : 'bg-gray-50'}>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-white/70' : 'text-gray-500'
                }`}>
                  Pos
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-white/70' : 'text-gray-500'
                }`}>
                  Equipo
                </th>
                <th className={`px-6 py-4 text-center text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-white/70' : 'text-gray-500'
                }`}>
                  Pts
                </th>
                <th className={`px-6 py-4 text-center text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-white/70' : 'text-gray-500'
                }`}>
                  JJ
                </th>
                <th className={`px-6 py-4 text-center text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-white/70' : 'text-gray-500'
                }`}>
                  JG
                </th>
                <th className={`px-6 py-4 text-center text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-white/70' : 'text-gray-500'
                }`}>
                  JP
                </th>
                <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-white/70' : 'text-gray-500'
                }`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
              {standings.map((team, index) => {
                const trend = getPositionTrend(index);
                return (
                  <tr
                    key={team.id}
                    className={`transition-colors ${
                      darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                    } ${index === 0 ? (darkMode ? 'bg-[#C8A963]/10' : 'bg-[#C8A963]/5') : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {index + 1}
                        </span>
                        {trend === 'up' && <TrendingUp size={14} className="text-[#10B981]" />}
                        {trend === 'down' && <TrendingDown size={14} className="text-[#E01E37]" />}
                        {trend === 'same' && <Minus size={14} className={darkMode ? 'text-white/40' : 'text-gray-400'} />}
                        {index === 0 && <Trophy size={14} className="text-[#C8A963]" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: team.color }}
                        >
                          {team.abbr}
                        </div>
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {team.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 rounded-full font-bold ${
                        darkMode ? 'bg-[#C8A963]/20 text-[#C8A963]' : 'bg-[#C8A963]/10 text-[#C8A963]'
                      }`}>
                        {team.points}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-center ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                      {team.played}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-center ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                      {team.won}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-center ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                      {team.lost}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Move Up/Down */}
                        <button
                          onClick={() => handleMoveUp(team.id, index)}
                          disabled={index === 0}
                          className={`p-1.5 rounded-lg transition-colors ${
                            index === 0
                              ? 'opacity-30 cursor-not-allowed'
                              : darkMode
                              ? 'hover:bg-white/10 text-white/70'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                          title="Subir posición"
                        >
                          <MoveUp size={16} />
                        </button>
                        <button
                          onClick={() => handleMoveDown(team.id, index)}
                          disabled={index === standings.length - 1}
                          className={`p-1.5 rounded-lg transition-colors ${
                            index === standings.length - 1
                              ? 'opacity-30 cursor-not-allowed'
                              : darkMode
                              ? 'hover:bg-white/10 text-white/70'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                          title="Bajar posición"
                        >
                          <MoveDown size={16} />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleEdit(team)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            darkMode
                              ? 'hover:bg-[#C8A963]/20 text-[#C8A963]'
                              : 'hover:bg-[#C8A963]/10 text-[#C8A963]'
                          }`}
                          title="Editar equipo"
                        >
                          <Edit2 size={16} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(team.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            darkMode
                              ? 'hover:bg-[#E01E37]/20 text-[#E01E37]'
                              : 'hover:bg-[#E01E37]/10 text-[#E01E37]'
                          }`}
                          title="Eliminar equipo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`rounded-xl border p-6 ${
            darkMode
              ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
              : 'bg-white/80 border-gray-200 backdrop-blur-xl'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#C8A963]/10">
              <Trophy size={20} className="text-[#C8A963]" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {standings.findIndex(t => t.name.includes('Cangrejeras')) + 1}°
              </div>
              <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Posición Actual
              </div>
            </div>
          </div>
          <div className={`text-xs mt-3 pt-3 border-t ${darkMode ? 'border-white/10 text-white/50' : 'border-gray-200 text-gray-500'}`}>
            {standings[0]?.name.includes('Cangrejeras')
              ? 'Cangrejeras lideran la tabla'
              : `${standings.findIndex(t => t.name.includes('Cangrejeras')) > 0 ? pointsDifference + ' pts del líder' : 'Sin datos'}`
            }
          </div>
        </div>

        <div
          className={`rounded-xl border p-6 ${
            darkMode
              ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
              : 'bg-white/80 border-gray-200 backdrop-blur-xl'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#10B981]/10">
              <TrendingUp size={20} className="text-[#10B981]" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {effectiveness}%
              </div>
              <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Efectividad
              </div>
            </div>
          </div>
          <div className={`text-xs mt-3 pt-3 border-t ${darkMode ? 'border-white/10 text-white/50' : 'border-gray-200 text-gray-500'}`}>
            {cangrejerasTeam ? `${cangrejerasTeam.won} victorias en ${cangrejerasTeam.played} partidos` : 'Sin datos'}
          </div>
        </div>

        <div
          className={`rounded-xl border p-6 ${
            darkMode
              ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
              : 'bg-white/80 border-gray-200 backdrop-blur-xl'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#0C2340]/10">
              <Trophy size={20} style={{ color: '#0C2340' }} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                +{standings.length >= 2 ? pointsDifference : 0}
              </div>
              <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Diferencia de Puntos
              </div>
            </div>
          </div>
          <div className={`text-xs mt-3 pt-3 border-t ${darkMode ? 'border-white/10 text-white/50' : 'border-gray-200 text-gray-500'}`}>
            {standings[0]?.name.includes('Cangrejeras')
              ? 'Ventaja sobre el 2° lugar'
              : standings.length >= 2 ? 'Diferencia con el líder' : 'Sin datos'
            }
          </div>
        </div>
      </div>

      {/* Edit/Add Team Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={`sm:max-w-[500px] ${darkMode ? 'bg-[#0F172A] border-white/20' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
              {editingTeam ? 'Editar Equipo' : 'Agregar Equipo'}
            </DialogTitle>
            <DialogDescription className={darkMode ? 'text-white/60' : 'text-gray-600'}>
              {editingTeam
                ? 'Actualiza la información del equipo'
                : 'Agrega un nuevo equipo a la tabla de posiciones'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Team Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className={darkMode ? 'text-white' : 'text-gray-900'}>
                Nombre del Equipo *
              </Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Cangrejeras de Santurce"
                className={darkMode ? 'bg-[#1E293B] border-white/20 text-white placeholder:text-white/40' : ''}
              />
            </div>

            {/* Team Abbreviation */}
            <div className="space-y-2">
              <Label htmlFor="abbr" className={darkMode ? 'text-white' : 'text-gray-900'}>
                Abreviatura (máx. 3 letras) *
              </Label>
              <Input
                id="abbr"
                value={formData.abbr || ''}
                onChange={(e) => setFormData({ ...formData, abbr: e.target.value.toUpperCase().slice(0, 3) })}
                placeholder="Ej: CAN"
                maxLength={3}
                className={darkMode ? 'bg-[#1E293B] border-white/20 text-white placeholder:text-white/40' : ''}
              />
            </div>

            {/* Team Color */}
            <div className="space-y-2">
              <Label htmlFor="color" className={darkMode ? 'text-white' : 'text-gray-900'}>
                Color del Equipo
              </Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="color"
                  type="color"
                  value={formData.color || '#0C2340'}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  value={formData.color || '#0C2340'}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#0C2340"
                  className={`flex-1 ${darkMode ? 'bg-[#1E293B] border-white/20 text-white placeholder:text-white/40' : ''}`}
                />
                <div
                  className="w-10 h-10 rounded-lg border-2 border-white/20"
                  style={{ backgroundColor: formData.color || '#0C2340' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Points */}
              <div className="space-y-2">
                <Label htmlFor="points" className={darkMode ? 'text-white' : 'text-gray-900'}>
                  Puntos
                </Label>
                <Input
                  id="points"
                  type="number"
                  min="0"
                  value={formData.points || 0}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  className={darkMode ? 'bg-[#1E293B] border-white/20 text-white' : ''}
                />
              </div>

              {/* Games Played */}
              <div className="space-y-2">
                <Label htmlFor="played" className={darkMode ? 'text-white' : 'text-gray-900'}>
                  Juegos Jugados
                </Label>
                <Input
                  id="played"
                  type="number"
                  min="0"
                  value={formData.played || 0}
                  onChange={(e) => setFormData({ ...formData, played: parseInt(e.target.value) || 0 })}
                  className={darkMode ? 'bg-[#1E293B] border-white/20 text-white' : ''}
                />
              </div>

              {/* Games Won */}
              <div className="space-y-2">
                <Label htmlFor="won" className={darkMode ? 'text-white' : 'text-gray-900'}>
                  Juegos Ganados
                </Label>
                <Input
                  id="won"
                  type="number"
                  min="0"
                  value={formData.won || 0}
                  onChange={(e) => setFormData({ ...formData, won: parseInt(e.target.value) || 0 })}
                  className={darkMode ? 'bg-[#1E293B] border-white/20 text-white' : ''}
                />
              </div>

              {/* Games Lost */}
              <div className="space-y-2">
                <Label htmlFor="lost" className={darkMode ? 'text-white' : 'text-gray-900'}>
                  Juegos Perdidos
                </Label>
                <Input
                  id="lost"
                  type="number"
                  min="0"
                  value={formData.lost || 0}
                  onChange={(e) => setFormData({ ...formData, lost: parseInt(e.target.value) || 0 })}
                  className={darkMode ? 'bg-[#1E293B] border-white/20 text-white' : ''}
                />
              </div>
            </div>
          </div>

          {/* Dialog Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingTeam(null);
                setFormData({});
              }}
              className={darkMode ? 'border-white/10 text-white hover:bg-white/5' : ''}
            >
              <X size={16} className="mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#C8A963] hover:bg-[#b89850] text-white"
            >
              <Save size={16} className="mr-2" />
              {editingTeam ? 'Actualizar' : 'Agregar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
