import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { Save, ArrowLeft } from 'lucide-react';

const NewReceipt: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    receiptNumber: '',
    date: new Date().toISOString().split('T')[0],
    client: '',
    totalValue: '',
    description: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const value = parseFloat(formData.totalValue);

    if (isNaN(value) || value <= 0) {
      setError("O valor total deve ser maior que zero.");
      return;
    }

    if (!formData.receiptNumber || !formData.date || !formData.totalValue) {
       setError("Preencha os campos obrigatórios.");
       return;
    }

    try {
      await StorageService.saveReceipt({
        receiptNumber: formData.receiptNumber,
        date: formData.date,
        client: formData.client || 'Consumidor Final',
        totalValue: value,
        description: formData.description
      });
      navigate('/list');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar recibo.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={18} className="mr-1" /> Voltar
      </button>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-slate-900 p-6">
          <h2 className="text-xl text-white font-bold">Novo Recibo</h2>
          <p className="text-slate-400 text-sm mt-1">Preencha os dados abaixo para cadastrar um novo título.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Número do Recibo *</label>
              <input
                type="text"
                name="receiptNumber"
                value={formData.receiptNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="Ex: 2023-001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de Emissão *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cliente / Parte</label>
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor Total (R$) *</label>
              <input
                type="number"
                name="totalValue"
                step="0.01"
                min="0.01"
                value={formData.totalValue}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição / Observações</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="Detalhes sobre o serviço ou venda..."
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <Save size={20} />
              Salvar Recibo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewReceipt;