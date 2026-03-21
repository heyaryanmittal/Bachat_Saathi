import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import WalletCard from '../components/WalletCard';
import { Card, Button, Input, LoadingSpinner, Modal } from '../components/ui';
import { Link } from 'react-router-dom';
import { Wallet, Banknote, CreditCard, ArrowRightLeft, Plus, RefreshCw, Layers, History, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Wallets = () => {
  const [wallets, setWallets] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newWallet, setNewWallet] = useState({ name: '', type: 'Cash', openingBalance: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [editingWallet, setEditingWallet] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFrom, setTransferFrom] = useState(null);
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, wallet: null });

  useEffect(() => { fetchWallets(); }, []);

  const fetchWallets = async () => {
    try {
      setIsLoading(true);
      const response = await api.getWallets();
      if (response.data?.data?.wallets) {
        setWallets(response.data.data.wallets);
        setError('');
      }
    } catch (err) {
      setError('Connection to node failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitTransfer = async (e) => {
    e.preventDefault();
    if (!transferFrom || !transferTo || !transferAmount) {
      toast.error('Complete all transfer fields');
      return;
    }
    try {
      setIsTransferring(true);
      await api.createTransaction({
        type: 'Transfer',
        amount: Number(transferAmount),
        walletId: transferFrom,
        toWallet: transferTo,
        notes: transferNotes,
        date: new Date()
      });
      await fetchWallets();
      setShowTransferModal(false);
      toast.success('Funds transferred!');
    } catch (err) {
      toast.error('Transfer failed.');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleWalletAction = async (e) => {
    e.preventDefault();
    try {
      const payload = editingWallet 
        ? { name: editingWallet.name, type: editingWallet.type, openingBalance: editingWallet.openingBalance }
        : { name: newWallet.name, type: newWallet.type, openingBalance: newWallet.openingBalance };
      
      if (editingWallet) {
        await api.updateWallet(editingWallet._id, payload);
        toast.success('Wallet updated!');
      } else {
        await api.createWallet(payload);
        toast.success('Wallet created!');
      }
      await fetchWallets();
      setIsCreating(false);
      setEditingWallet(null);
      setNewWallet({ name: '', type: 'Cash', openingBalance: 0 });
    } catch (err) {
        toast.error('Action failed.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LoadingSpinner size="xl" variant="primary" text="Preparing your vault..." />
      </div>
    );
  }

  return (
    <div className="pt-24 space-y-12 animate-entrance pb-12 overflow-x-hidden px-4">
      {/* SaaS Wallets Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">
            My <span className="text-gradient">Wallets</span>
          </h1>
          <p className="text-muted-foreground font-medium text-lg italic tracking-tight">
            Visualizing all your nodes in one SaaS ecosystem.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link to="/transfers">
            <Button variant="secondary" size="md"><History className="mr-2 w-4 h-4" />View Ledger</Button>
          </Link>
          <Button onClick={fetchWallets} variant="secondary" size="md"><RefreshCw className="mr-2 w-4 h-4" />Refresh</Button>
          <Button onClick={() => setIsCreating(true)} className="btn-saas-primary" size="md"><Plus className="mr-2 w-4 h-4" />New Wallet</Button>
        </div>
      </div>

      {infoMessage && (
          <Card variant="warning" className="animate-float shadow-xl border-amber-500/30 p-4 border-2">
              <p className="font-bold text-amber-700">{infoMessage}</p>
          </Card>
      )}

      {/* Wallet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {wallets.length === 0 ? (
          <div className="col-span-full py-20 text-center glass-card border-dashed p-10">
             <Layers className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
             <p className="text-xl font-bold text-muted-foreground">Vault is Empty</p>
          </div>
        ) : (
          wallets.map(wallet => (
            <WalletCard
              key={wallet._id}
              wallet={wallet}
              onEdit={() => setEditingWallet(wallet)}
              onDelete={() => setDeleteModal({ show: true, wallet })}
              onTransfer={() => {
                  setTransferFrom(wallet._id);
                  setTransferTo('');
                  setTransferAmount('');
                  setTransferNotes('');
                  setShowTransferModal(true);
              }}
            />
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {(isCreating || editingWallet) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
              <Card variant="glass" className="max-w-md w-full animate-entrance" size="xl">
                  <h3 className="text-2xl font-black mb-6 tracking-tighter">
                      {editingWallet ? 'Configure Wallet' : 'Node Creation'}
                  </h3>
                  <form onSubmit={handleWalletAction} className="space-y-6">
                      <Input
                        label="Identity Label"
                        value={editingWallet ? editingWallet.name : newWallet.name}
                        onChange={(e) => editingWallet ? setEditingWallet({...editingWallet, name: e.target.value}) : setNewWallet({...newWallet, name: e.target.value})}
                        placeholder="Personal Bank"
                        required
                      />
                      <div>
                          <label className="block text-sm font-black text-muted-foreground uppercase tracking-widest mb-2">Category Key</label>
                          <select 
                            className="input-saas w-full"
                            value={editingWallet ? editingWallet.type : newWallet.type}
                            onChange={(e) => editingWallet ? setEditingWallet({...editingWallet, type: e.target.value}) : setNewWallet({...newWallet, type: e.target.value})}
                          >
                              <option value="Cash">Cash</option>
                              <option value="Bank">Bank</option>
                              <option value="Card">Card</option>
                              <option value="Other">Other</option>
                          </select>
                      </div>
                      <Input
                        label="Initial Value (₹)"
                        type="number"
                        value={editingWallet ? editingWallet.openingBalance : newWallet.openingBalance}
                        onChange={(e) => editingWallet ? setEditingWallet({...editingWallet, openingBalance: Number(e.target.value)}) : setNewWallet({...newWallet, openingBalance: Number(e.target.value)})}
                        placeholder="0.00"
                      />
                      <div className="flex items-center space-x-3 pt-4">
                          <Button variant="secondary" onClick={() => { setIsCreating(false); setEditingWallet(null); }} className="w-full">Cancel</Button>
                          <Button type="submit" className="w-full btn-saas-primary">{editingWallet ? 'Sync Node' : 'Initialize Node'}</Button>
                      </div>
                  </form>
              </Card>
          </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
              <Card variant="glass" className="max-w-md w-full animate-entrance" size="xl">
                  <h3 className="text-2xl font-black mb-6 tracking-tighter">Secure Transfer</h3>
                  <form onSubmit={submitTransfer} className="space-y-6">
                      <div>
                          <label className="block text-sm font-black text-muted-foreground uppercase tracking-widest mb-2 font-black">Target Node</label>
                          <select 
                            className="input-saas w-full"
                            value={transferTo}
                            onChange={(e) => setTransferTo(e.target.value)}
                            required
                          >
                              <option value="">Select Target...</option>
                              {wallets.filter(w => w._id !== transferFrom).map(w => <option key={w._id} value={w._id}>{w.name} (₹{w.currentBalance})</option>)}
                          </select>
                      </div>
                      <Input
                        label="Transmission Value"
                        type="number"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                      <Input
                        label="Meta Notes"
                        value={transferNotes}
                        onChange={(e) => setTransferNotes(e.target.value)}
                        placeholder="Why?"
                      />
                      <div className="flex items-center space-x-3 pt-4">
                          <Button variant="secondary" onClick={() => setShowTransferModal(false)} className="w-full">Abort</Button>
                          <Button type="submit" className="w-full btn-saas-primary" loading={isTransferring}>Initialize Transfer</Button>
                      </div>
                  </form>
              </Card>
          </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
              <Card variant="glass" className="max-w-sm w-full animate-entrance text-center" size="lg">
                  <Trash2 className="w-12 h-12 text-rose-500 mx-auto mb-6 animate-bounce" />
                  <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase tracking-widest">Delete Sequence?</h3>
                  <p className="text-muted-foreground text-sm font-medium mb-8">This action will permanently purge <span className="text-foreground font-black uppercase">{deleteModal.wallet?.name}</span> from your ecosystem. All data will be lost.</p>
                  <div className="grid grid-cols-2 gap-4">
                      <Button variant="secondary" onClick={() => setDeleteModal({ show: false, wallet: null })}>Keep</Button>
                      <Button 
                        variant="danger" 
                        onClick={async () => {
                            try {
                                await api.deleteWallet(deleteModal.wallet._id);
                                await fetchWallets();
                                setDeleteModal({ show: false, wallet: null });
                                toast.success('Node Purged.');
                            } catch (e) { toast.error('Purge Failed.'); }
                        }}
                      > Purge </Button>
                  </div>
              </Card>
          </div>
      )}
    </div>
  );
};

export default Wallets;
