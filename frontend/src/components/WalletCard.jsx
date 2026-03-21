import React from 'react';
import { Card, Button } from './ui';
import { Wallet, Banknote, CreditCard, ArrowRightLeft, Edit2, Trash2, PieChart } from 'lucide-react';

function WalletCard({ wallet, onEdit = () => {}, onDelete = () => {}, onTransfer = () => {} }) {
  const getWalletIcon = (type) => {
    switch (type) {
      case 'Cash': return <Banknote className="w-6 h-6" />;
      case 'Bank': return <Wallet className="w-6 h-6" />;
      case 'Card': return <CreditCard className="w-6 h-6" />;
      default: return <PieChart className="w-6 h-6" />;
    }
  };

  const getVariant = (type) => {
    switch (type) {
      case 'Cash': return 'success';
      case 'Bank': return 'primary';
      case 'Card': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card variant="glass" className="saas-card p-6 flex flex-col justify-between group h-full">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-500">
               {getWalletIcon(wallet.type)}
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">{wallet.name}</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{wallet.type}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Current Balance</p>
            <p className="text-3xl font-black text-foreground tracking-tighter">₹{wallet.currentBalance?.toLocaleString('en-IN') || '0'}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-auto relative z-10">
        <Button 
          variant="secondary" 
          size="sm" 
          className="flex-1 text-[10px] font-black uppercase tracking-widest"
          onClick={() => onEdit(wallet)}
        >
          <Edit2 className="w-3.5 h-3.5 mr-1.5" />
          Edit
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          className="flex-1 text-[10px] font-black uppercase tracking-widest"
          onClick={() => onTransfer(wallet)}
        >
          <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />
          Send
        </Button>
        <Button 
          variant="danger" 
          size="sm" 
          className="px-0 hover:bg-rose-500"
          onClick={() => onDelete(wallet)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
      
      {/* Visual Depth Overlay */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -translate-y-12 translate-x-12 group-hover:bg-primary/10 transition-colors"></div>
    </Card>
  );
}

export default WalletCard;
