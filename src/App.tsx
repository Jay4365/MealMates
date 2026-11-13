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
import { LoginPage } from './pages/LoginPage';

import { AddMealModal } from './components/meals/AddMealModal';
import { MealDetailsModal } from './components/meals/MealDetailsModal';
import { SettlementModal } from './components/settlement/SettlementModal';
import type { Meal, MealType } from './types';

const MainApp: React.FC = () => {
  const { loading, user } = useApp();
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
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] dark:bg-[#0a0b10] text-slate-900 dark:text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold tracking-tight">
            Loading MealMates...
          </span>
        </div>
      </div>
    );
  }

  // Strict Login Gate
  if (!user) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7] dark:bg-[#0a0b10] text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors duration-200">
      {/* Top Bento Navbar */}
      <Navbar onOpenAddMeal={() => handleOpenAddMeal('lunch')} />

      {/* Main Bento Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        {/* Desktop Sidebar Dock */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenAddMeal={() => handleOpenAddMeal('lunch')}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Bento Content Area */}
        <main className="flex-1 md:pl-6 pb-24 md:pb-8 min-w-0">
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

      {/* Mobile Bottom Floating Dock */}
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
