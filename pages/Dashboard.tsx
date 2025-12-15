import React, { useEffect, useState } from 'react';
import { DollarSign, Wallet, TrendingDown, AlertCircle } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { ReceiptWithCalculations } from '../types';
import StatCard from '../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<ReceiptWithCalculations[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const receipts = await StorageService.getAllReceiptsWithStats();
      setData(receipts);
    };
    loadData();
  }, []);

  const totalRecibos = data.length;
  const totalValue = data.reduce((acc, r) => acc + r.totalValue, 0);
  const totalAbatido = data.reduce((acc, r) => acc + r.totalDeducted, 0);
  const totalBalance = data.reduce((acc, r) => acc + r.balance, 0);

  const chartData = data.slice(0, 10).map(r => ({
    name: r.receiptNumber,
    Total: r.totalValue,
    Abatido: r.totalDeducted
  }));

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Visão Geral</h2>
        <p className="text-gray-500 mt-1">Acompanhe os indicadores financeiros dos seus recibos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Lançado" 
          value={formatCurrency(totalValue)} 
          icon={DollarSign} 
          color="blue" 
        />
        <StatCard 
          title="Total Recebido/Abatido" 
          value={formatCurrency(totalAbatido)} 
          icon={Wallet} 
          color="emerald" 
        />
        <StatCard 
          title="Saldo em Aberto" 
          value={formatCurrency(totalBalance)} 
          icon={TrendingDown} 
          color="amber" 
        />
        <StatCard 
          title="Recibos Cadastrados" 
          value={totalRecibos.toString()} 
          icon={AlertCircle} 
          color="red" // Just stylistic
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-6">Top 10 Recibos Recentes (Comparativo)</h3>
        <div className="h-80 w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Abatido" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex items-center justify-center h-full text-gray-400">
               Nenhum dado disponível para gráfico.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;