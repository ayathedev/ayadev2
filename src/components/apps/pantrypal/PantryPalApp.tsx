import React, { useState } from 'react';
import { 
  Apple, 
  Search, 
  Plus, 
  ChevronRight, 
  Clock, 
  AlertTriangle, 
  ChefHat, 
  ShoppingCart, 
  Filter, 
  BarChart3,
  Calendar,
  Utensils,
  History,
  CheckCircle2
} from 'lucide-react';

interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  expiresIn: number; // days
  status: 'fresh' | 'warning' | 'expired';
}

interface Recipe {
  id: string;
  title: string;
  time: string;
  difficulty: string;
  matches: number; // number of pantry items used
  total: number; // total ingredients needed
  imageUrl: string;
}

export const PantryPalApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pantry' | 'recipes' | 'shopping'>('pantry');
  const [searchQuery, setSearchQuery] = useState('');

  const pantryItems: PantryItem[] = [
    { id: '1', name: 'Greek Yogurt', category: 'Dairy', quantity: '1 Tub', expiresIn: 2, status: 'warning' },
    { id: '2', name: 'Fresh Spinach', category: 'Produce', quantity: '1 Bag', expiresIn: 3, status: 'warning' },
    { id: '3', name: 'Chicken Breast', category: 'Proteins', quantity: '1.5 lb', expiresIn: 5, status: 'fresh' },
    { id: '4', name: 'Bell Peppers', category: 'Produce', quantity: '3 pieces', expiresIn: 7, status: 'fresh' },
    { id: '5', name: 'Whole Milk', category: 'Dairy', quantity: '1/2 Gal', expiresIn: -1, status: 'expired' },
    { id: '6', name: 'Brown Rice', category: 'Grains', quantity: '5 lb', expiresIn: 180, status: 'fresh' },
  ];

  const recipes: Recipe[] = [
    { 
      id: '1', 
      title: 'Spinach & Chicken Curry', 
      time: '35 min', 
      difficulty: 'Medium', 
      matches: 4, 
      total: 6,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80'
    },
    { 
      id: '2', 
      title: 'Yogurt Marinated Skewers', 
      time: '20 min', 
      difficulty: 'Easy', 
      matches: 3, 
      total: 5,
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80'
    },
    { 
      id: '3', 
      title: 'Roasted Pepper Salad', 
      time: '15 min', 
      difficulty: 'Easy', 
      matches: 2, 
      total: 4,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80'
    },
  ];

  return (
    <div className="h-full w-full bg-white text-slate-900 flex flex-col font-sans select-none overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-emerald-600 text-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Apple className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight uppercase">PantryPal Pro</h1>
            <p className="text-[10px] text-emerald-100 font-bold opacity-80">Sustainable Kitchen Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-white/10 rounded-lg px-3 py-1.5 border border-white/20">
            <Search className="w-4 h-4 text-emerald-100" />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="bg-transparent border-none focus:ring-0 text-sm placeholder:text-emerald-200 w-48 ml-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="bg-white text-emerald-600 p-2 rounded-lg hover:bg-emerald-50 transition-colors shadow-sm">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 border-r border-slate-100 bg-slate-50/50 flex flex-col p-4 shrink-0">
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('pantry')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'pantry' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <Utensils className="w-4 h-4" />
              My Pantry
              <span className="ml-auto text-[10px] bg-black/10 px-1.5 py-0.5 rounded-full">{pantryItems.length}</span>
            </button>
            <button 
              onClick={() => setActiveTab('recipes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'recipes' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              Smart Recipes
            </button>
            <button 
              onClick={() => setActiveTab('shopping')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'shopping' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Shopping List
            </button>
          </nav>

          <div className="mt-8 px-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <div className="text-xs font-bold">2 Items</div>
                  <div className="text-[10px] text-slate-500">Expiring soon</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold">$42.50</div>
                  <div className="text-[10px] text-slate-500">Value saved this month</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-800">Pro Feature</span>
            </div>
            <p className="text-[10px] text-emerald-700 leading-relaxed">
              Unlock AI-powered waste analysis and family meal planning.
            </p>
          </div>
        </aside>

        {/* Workspace Area */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Action Bar */}
          <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-800">
                {activeTab === 'pantry' ? 'All Ingredients' : activeTab === 'recipes' ? 'Recipe Matches' : 'Planned Purchases'}
              </span>
              <button className="p-1 hover:bg-slate-100 rounded-md text-slate-400 transition-colors">
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
              <button className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                <History className="w-3.5 h-3.5" />
                History
              </button>
              <button className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                <Calendar className="w-3.5 h-3.5" />
                Meal Plan
              </button>
            </div>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30">
            {activeTab === 'pantry' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {pantryItems.map(item => (
                  <div key={item.id} className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          item.status === 'expired' ? 'bg-red-50 text-red-500' : 
                          item.status === 'warning' ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-500'
                        }`}>
                          <Apple className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{item.category}</p>
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-100 rounded-lg transition-all">
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-700">{item.quantity}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'expired' ? 'bg-red-100 text-red-700' : 
                        item.status === 'warning' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {item.expiresIn < 0 ? 'Expired' : item.expiresIn === 0 ? 'Expires today' : `Expires in ${item.expiresIn}d`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'recipes' && (
              <div className="space-y-4">
                {recipes.map(recipe => (
                  <div key={recipe.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-emerald-200 hover:shadow-xl transition-all flex h-40">
                    <div className="w-56 shrink-0 relative">
                      <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-[10px] font-bold">
                        {recipe.time}
                      </div>
                    </div>
                    <div className="flex-1 p-5 flex flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-black tracking-tight text-slate-800">{recipe.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-widest">
                              <BarChart3 className="w-3 h-3" />
                              {recipe.difficulty}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-emerald-600 text-sm font-black">{Math.round((recipe.matches / recipe.total) * 100)}% Match</div>
                          <div className="text-[10px] text-slate-400">{recipe.matches}/{recipe.total} ingredients in pantry</div>
                        </div>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex -space-x-1">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                              <div className="w-full h-full bg-emerald-500/20 text-emerald-600 text-[8px] font-bold flex items-center justify-center">
                                Ing
                              </div>
                            </div>
                          ))}
                        </div>
                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-2">
                          View Instructions
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
