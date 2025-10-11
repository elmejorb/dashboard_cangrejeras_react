// Componente de demostración visual para el sistema de fotos de jugadoras
// Este archivo es solo para referencia y no se usa en la app principal

import { Upload, Ruler, Info } from "lucide-react";

export function PlayerPhotoDemo() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center">
        Sistema de Fotos de Jugadoras - Demostración
      </h1>

      {/* Ejemplo de Vista Previa */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl mb-4">Vista Previa del Formulario</h2>
        <div className="flex items-start gap-4">
          {/* Vista Previa Grande */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-[#0C2340] flex items-center justify-center text-white text-2xl border-2 border-[#C8A963]">
              AR
            </div>
            <p className="text-xs text-center mt-2 text-gray-500">Vista Previa</p>
          </div>

          {/* Controles */}
          <div className="flex-1 space-y-3">
            <button className="bg-[#0C2340] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <Upload size={16} />
              Subir Imagen
            </button>
            <input 
              type="text" 
              placeholder="https://ejemplo.com/foto.jpg"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <div className="text-xs text-gray-500 space-y-1">
              <p className="font-medium flex items-center gap-1.5">
                <Ruler size={12} />
                Tamaño recomendado: 600x600 píxeles (1:1)
              </p>
              <p>• Formato: JPG, PNG o WebP</p>
              <p>• Tamaño máximo: 2MB</p>
              <p>• La imagen se recortará en círculo automáticamente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ejemplos de Tamaños */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h2 className="text-xl mb-4">Tamaños de Visualización</h2>
        <div className="grid grid-cols-4 gap-6 text-center">
          {/* Pequeño - Tabla */}
          <div>
            <div className="w-12 h-12 mx-auto rounded-full bg-[#0C2340] flex items-center justify-center text-white text-sm">
              AR
            </div>
            <p className="text-xs mt-2 font-medium">Tabla</p>
            <p className="text-xs text-gray-500">48x48px</p>
          </div>

          {/* Mediano - Card */}
          <div>
            <div className="w-16 h-16 mx-auto rounded-full bg-[#0C2340] flex items-center justify-center text-white text-lg">
              AR
            </div>
            <p className="text-xs mt-2 font-medium">Tarjeta</p>
            <p className="text-xs text-gray-500">64x64px</p>
          </div>

          {/* Grande - Perfil */}
          <div>
            <div className="w-20 h-20 mx-auto rounded-full bg-[#0C2340] flex items-center justify-center text-white text-xl">
              AR
            </div>
            <p className="text-xs mt-2 font-medium">Perfil</p>
            <p className="text-xs text-gray-500">80x80px</p>
          </div>

          {/* Extra Grande - Header */}
          <div>
            <div className="w-24 h-24 mx-auto rounded-full bg-[#0C2340] flex items-center justify-center text-white text-2xl">
              AR
            </div>
            <p className="text-xs mt-2 font-medium">Header</p>
            <p className="text-xs text-gray-500">96x96px</p>
          </div>
        </div>
      </div>

      {/* Comparación de Calidad */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl mb-4">Comparación de Calidad</h2>
        <div className="grid grid-cols-3 gap-6 text-center">
          {/* Mala Calidad */}
          <div>
            <div className="w-20 h-20 mx-auto rounded-full bg-gray-300 flex items-center justify-center text-gray-500">
              <X size={32} className="text-red-500" />
            </div>
            <p className="text-xs mt-2 font-medium text-red-600 flex items-center justify-center gap-1">
              <X size={14} />
              Mala
            </p>
            <p className="text-xs text-gray-500">200x200px</p>
            <p className="text-xs text-gray-500">Imagen borrosa</p>
          </div>

          {/* Buena Calidad */}
          <div>
            <div className="w-20 h-20 mx-auto rounded-full bg-[#C8A963] flex items-center justify-center text-white">
              <Check size={32} className="text-white" />
            </div>
            <p className="text-xs mt-2 font-medium text-green-600 flex items-center justify-center gap-1">
              <Check size={14} />
              Buena
            </p>
            <p className="text-xs text-gray-500">600x600px</p>
            <p className="text-xs text-gray-500">Imagen nítida</p>
          </div>

          {/* Excesiva (innecesaria) */}
          <div>
            <div className="w-20 h-20 mx-auto rounded-full bg-[#0C2340] flex items-center justify-center text-white">
              <AlertTriangle size={32} className="text-orange-400" />
            </div>
            <p className="text-xs mt-2 font-medium text-orange-600 flex items-center justify-center gap-1">
              <AlertTriangle size={14} />
              Excesiva
            </p>
            <p className="text-xs text-gray-500">2000x2000px</p>
            <p className="text-xs text-gray-500">Archivo muy pesado</p>
          </div>
        </div>
      </div>

      {/* Guía de Recorte */}
      <div className="bg-gradient-to-br from-blue-50 to-gold-50 rounded-2xl p-6">
        <h2 className="text-xl mb-4">Guía de Composición</h2>
        <div className="grid grid-cols-2 gap-6">
          {/* Correcto */}
          <div className="bg-white rounded-xl p-4">
            <div className="relative w-40 h-40 mx-auto border-4 border-green-500 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <User size={72} className="text-blue-400" />
              </div>
            </div>
            <p className="text-center mt-3 font-medium text-green-600 flex items-center justify-center gap-1">
              <Check size={16} />
              Correcto
            </p>
            <ul className="text-xs text-gray-600 mt-2 space-y-1">
              <li>• Rostro centrado</li>
              <li>• Espacio alrededor</li>
              <li>• Fondo uniforme</li>
            </ul>
          </div>

          {/* Incorrecto */}
          <div className="bg-white rounded-xl p-4">
            <div className="relative w-40 h-40 mx-auto border-4 border-red-500 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-end">
                <User size={72} className="text-red-400 mr-4" />
              </div>
            </div>
            <p className="text-center mt-3 font-medium text-red-600 flex items-center justify-center gap-1">
              <X size={16} />
              Incorrecto
            </p>
            <ul className="text-xs text-gray-600 mt-2 space-y-1">
              <li>• Rostro descentrado</li>
              <li>• Sin espacio lateral</li>
              <li>• Imagen cortada</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Flujo de Trabajo */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl mb-4">Flujo de Trabajo Recomendado</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0C2340] text-white flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <p className="font-medium">Preparar la imagen</p>
              <p className="text-sm text-gray-600">Recortar a 600x600px, fondo limpio</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0C2340] text-white flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <p className="font-medium">Optimizar tamaño</p>
              <p className="text-sm text-gray-600">Comprimir a menos de 2MB si es necesario</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0C2340] text-white flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <p className="font-medium">Subir al CMS</p>
              <p className="text-sm text-gray-600">Click en "Subir Imagen" o pegar URL</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C8A963] text-white flex items-center justify-center text-sm font-bold">✓</div>
            <div>
              <p className="font-medium">Verificar vista previa</p>
              <p className="text-sm text-gray-600">Confirmar que se ve bien en círculo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nota Final */}
      <div className="bg-blue-50 border-l-4 border-[#0C2340] p-4 rounded">
        <p className="text-sm flex items-start gap-2">
          <Info size={16} className="flex-shrink-0 mt-0.5" />
          <span>
            <strong>Tip Pro:</strong> Si no tienes una foto, no te preocupes. El sistema generará
            automáticamente un avatar circular con las iniciales de la jugadora en los colores del equipo.
          </span>
        </p>
      </div>
    </div>
  );
}
