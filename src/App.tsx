import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, type NavigationTab } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer } from './components/common/ToastContainer';

import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { MonthlyReportPage } from './pages/MonthlyReportPage';
import { MembersPage } from './pages/MembersPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthModal } from './pages/AuthPage';

import { AddMealModal } from './components/meals/AddMealModal';
import { MealDetailsModal } from './components/meals/MealDetailsModal';
import { SettlementModal } from './components/settlement/SettlementModal';
import type { Meal, MealType } from './types';

const MainApp: React.FC = () => {
  const { loading } = useApp();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  // Modals state
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [addMealInitialType, setAddMealInitialType] = useState<MealType>('lunch');
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  const [selectedMealForDetails, setSelectedMealForDetails] = useState<Meal | null>(null);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOpenAddMeal = (initialType: MealType = 'lunch') => {
    setEditingMeal(null);
    setAddMealInitialType(initialType);
    setIsAddMealOpen(true);
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setIsAddMealOpen(true);
  };

  const handleViewMeal = (meal: Meal) => {
    setSelectedMealForDetails(meal);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-emerald-600">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Loading MealMates...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 transition-colors">
      {/* Top Navbar */}
      <Navbar onOpenAddMeal={() => handleOpenAddMeal('lunch')} />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenAddMeal={() => handleOpenAddMeal('lunch')}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 min-w-0">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onOpenAddMeal={handleOpenAddMeal}
              onViewMeal={handleViewMeal}
              onOpenSettlement={() => setIsSettlementOpen(true)}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'history' && (
            <HistoryPage
              onOpenAddMeal={() => handleOpenAddMeal('lunch')}
              onViewMeal={handleViewMeal}
              onEditMeal={handleEditMeal}
            />
          )}

          {currentTab === 'monthly-report' && (
            <MonthlyReportPage
              onOpenSettlementModal={() => setIsSettlementOpen(true)}
            />
          )}

          {currentTab === 'members' && <MembersPage />}

          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddMeal={() => handleOpenAddMeal('lunch')}
      />

      {/* Global Modals */}
      <AddMealModal
        isOpen={isAddMealOpen}
        onClose={() => {
          setIsAddMealOpen(false);
          setEditingMeal(null);
        }}
        initialType={addMealInitialType}
        editingMeal={editingMeal}
      />

      <MealDetailsModal
        meal={selectedMealForDetails}
        onClose={() => setSelectedMealForDetails(null)}
        onEdit={handleEditMeal}
      />

      <SettlementModal
        isOpen={isSettlementOpen}
        onClose={() => setIsSettlementOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Global Toast System */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
