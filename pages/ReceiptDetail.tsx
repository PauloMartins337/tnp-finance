import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { ReceiptWithCalculations, Deduction, ReceiptStatus } from '../types';
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Plus, Calendar, FileText, User } from 'lucide-react';

const ReceiptDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<ReceiptWithCalculations | null>(null);
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Deduction Form State
  const [newDeduction, setNewDeduction] = useState({
    date: new Date().toISOString().split('T')[0],
    value: '',
    description: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    if (!id) return;
    try {
      const allReceipts = await StorageService.getAllReceiptsWithStats();
      const found = allReceipts.find(r => r.id === id);
      if (found) {
        setReceipt(found);
        const deds = await StorageService.getDeductions(id);
        setDeductions(deds);
      }
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddDeduction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!receipt) return;

    const val = parseFloat(newDeduction.value);
    if (isNaN(val) || val <= 0) {
      setFormError("O valor deve ser maior que zero.");
      return;
    }

    try {
      await StorageService.addDeduction({
        receiptId: receipt.id,
        date: newDeduction.date,
        value: val,
        description: newDeduction.description || 'Abatimento parcial'
      });
      
      // Reset form and reload data
      setNewDeduction({
        date: new Date().toISOString().split('T')[0],
        value: '',
        description: ''
      });
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao adicionar abatimento.');
    }
  };

  const handleCancelReceipt = async () => {
    if(!receipt || !window.confirm("Deseja realmente cancelar este recibo?")) return;
    try {
      await StorageService.cancelReceipt(receipt.id);
      await loadData();
    } catch (err) {
      console.error("Erro ao cancelar recibo", err);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando...</div>;
  if (!receipt) return <div className="p-8 text-center text-red-500">Recibo não encontrado.</div>;

  const isPaid = receipt.status === ReceiptStatus.PAID;
  const isCancelled = receipt.status === ReceiptStatus.CANCELLED;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/list')} 
        className="flex items-center text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={18} className="mr-1" /> Voltar para a lista
      </button>

      {/* Header Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
        {isPaid && (
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle size={120} className="text-emerald-500" />
          </div>
        )}
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">Recibo #{receipt.receiptNumber}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                isPaid ? 'bg-emerald-100 text-emerald-700' :
                isCancelled ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {receipt.status}
              </span>
            </div>
            <p className="text-gray-500 flex items-center gap-2">
              <User size={16} /> {receipt.client}
            </p>
            <p className="text-gray-500 flex items-center gap-2 text-sm mt-1">
              <Calendar size={16} /> Emissão: {new Date(receipt.date).toLocaleDateString('pt-BR')}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">Valor Total</p>
            <p className="text-3xl font-bold text-gray-900">
              {receipt.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
           <div className="bg-emerald-50 p-4 rounded-lg">
             <p className="text-xs text-emerald-700 uppercase font-bold tracking-wide mb-1">Total Abatido</p>
             <p className="text-xl font-semibold text-emerald-900">
               {receipt.totalDeducted.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
             </p>
           </div>
           <div className={`p-4 rounded-lg ${isPaid ? 'bg-gray-50' : 'bg-amber-50'}`}>
             <p className={`text-xs uppercase font-bold tracking-wide mb-1 ${isPaid ? 'text-gray-500' : 'text-amber-700'}`}>Saldo Restante</p>
             <p className={`text-xl font-semibold ${isPaid ? 'text-gray-400 line-through' : 'text-amber-900'}`}>
               {receipt.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
             </p>
           </div>
           
           {!isCancelled && !isPaid && (
              <div className="flex items-center justify-end">
                <button 
                  onClick={handleCancelReceipt}
                  className="text-red-500 text-sm hover:text-red-700 underline decoration-red-200"
                >
                  Cancelar Recibo
                </button>
              </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FileText size={18} className="text-gray-500" />
                Histórico de Abatimentos
              </h3>
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                {deductions.length} lançamentos
              </span>
            </div>
            
            {deductions.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Data</th>
                    <th className="px-6 py-3 font-medium">Descrição</th>
                    <th className="px-6 py-3 font-medium text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deductions.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">{new Date(d.date).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-3 text-gray-800">{d.description}</td>
                      <td className="px-6 py-3 text-right font-medium text-emerald-600">
                        - {d.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                Nenhum abatimento registrado ainda.
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Descrição do Recibo</h4>
            <p className="text-gray-800 leading-relaxed">
              {receipt.description || "Sem descrição fornecida."}
            </p>
          </div>
        </div>

        {/* Right Column: Add Deduction Form */}
        <div className="lg:col-span-1">
          {!isPaid && !isCancelled ? (
            <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-emerald-500" />
                Novo Abatimento
              </h3>
              
              <form onSubmit={handleAddDeduction} className="space-y-4">
                {formError && (
                  <div className="bg-red-50 text-red-600 text-xs p-3 rounded border border-red-100 flex items-start gap-2">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={newDeduction.date}
                    onChange={(e) => setNewDeduction({...newDeduction, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Valor (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-400 text-sm">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={newDeduction.value}
                      onChange={(e) => setNewDeduction({...newDeduction, value: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-semibold text-gray-800"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    Máx: {receipt.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
                  <textarea
                    rows={2}
                    value={newDeduction.description}
                    onChange={(e) => setNewDeduction({...newDeduction, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    placeholder="Ref. pagamento..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg shadow-sm transition-all flex justify-center items-center gap-2"
                >
                  Confirmar Saída
                </button>
              </form>
            </div>
          ) : (
            <div className={`rounded-xl p-6 border text-center ${
              isPaid ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
            }`}>
              {isPaid ? (
                 <>
                   <CheckCircle className="mx-auto text-emerald-500 mb-2" size={32} />
                   <h3 className="font-bold text-emerald-800">Recibo Quitado</h3>
                   <p className="text-sm text-emerald-600 mt-1">Não é possível adicionar novos abatimentos pois o saldo é zero.</p>
                 </>
              ) : (
                 <>
                   <XCircle className="mx-auto text-red-500 mb-2" size={32} />
                   <h3 className="font-bold text-red-800">Recibo Cancelado</h3>
                   <p className="text-sm text-red-600 mt-1">Operações bloqueadas.</p>
                 </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptDetail;