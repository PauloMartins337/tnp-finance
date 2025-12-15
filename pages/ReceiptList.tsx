import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { ReceiptWithCalculations, ReceiptStatus } from '../types';
import { Search, Filter, Download, Eye, Calendar, User } from 'lucide-react';

const ReceiptList: React.FC = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<ReceiptWithCalculations[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const loadReceipts = async () => {
      const data = await StorageService.getAllReceiptsWithStats();
      setReceipts(data);
    };
    loadReceipts();
  }, []);

  const filteredReceipts = useMemo(() => {
    return receipts.filter(r => {
      const matchesSearch = 
        r.receiptNumber.toLowerCase().includes(filters.search.toLowerCase()) || 
        r.client.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status === 'ALL' || r.status === filters.status;
      
      let matchesDate = true;
      if (filters.startDate) matchesDate = matchesDate && r.date >= filters.startDate;
      if (filters.endDate) matchesDate = matchesDate && r.date <= filters.endDate;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [receipts, filters]);

  const handleExport = () => {
    const headers = ["Número", "Data", "Cliente", "Total", "Abatido", "Saldo", "Status"];
    const rows = filteredReceipts.map(r => [
      r.receiptNumber,
      r.date,
      r.client,
      r.totalValue.toFixed(2),
      r.totalDeducted.toFixed(2),
      r.balance.toFixed(2),
      r.status
    ]);

    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "recibos_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: ReceiptStatus) => {
    switch(status) {
      case ReceiptStatus.PAID: return 'bg-emerald-100 text-emerald-800';
      case ReceiptStatus.OPEN: return 'bg-amber-100 text-amber-800';
      case ReceiptStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gerenciar Recibos</h2>
          <p className="text-gray-500 text-sm">Visualize e gerencie seus lançamentos financeiros.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
        >
          <Download size={18} />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar número ou cliente..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="ALL">Todas as Situações</option>
            <option value={ReceiptStatus.OPEN}>Em Aberto</option>
            <option value={ReceiptStatus.PAID}>Quitado</option>
            <option value={ReceiptStatus.CANCELLED}>Cancelado</option>
          </select>
        </div>

        <div className="relative">
           <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <input 
            type="date"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-600"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
           />
        </div>

        <div className="relative">
           <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <input 
            type="date"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-600"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
           />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                <th className="p-4">Número</th>
                <th className="p-4">Data</th>
                <th className="p-4">Cliente</th>
                <th className="p-4 text-right">Valor Total</th>
                <th className="p-4 text-right">Abatido</th>
                <th className="p-4 text-right">Saldo</th>
                <th className="p-4 text-center">Situação</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredReceipts.length > 0 ? filteredReceipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{receipt.receiptNumber}</td>
                  <td className="p-4 text-gray-600">{new Date(receipt.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 text-gray-600 flex items-center gap-2">
                    <User size={16} className="text-gray-400"/>
                    {receipt.client}
                  </td>
                  <td className="p-4 text-right font-medium text-gray-900">
                    {receipt.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="p-4 text-right text-emerald-600">
                    {receipt.totalDeducted.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="p-4 text-right font-bold text-slate-700">
                    {receipt.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(receipt.status)}`}>
                      {receipt.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => navigate(`/receipt/${receipt.id}`)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-full transition-colors"
                      title="Ver Detalhes"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    Nenhum recibo encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReceiptList;