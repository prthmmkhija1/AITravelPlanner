import { useState, useEffect } from 'react';
import { getBudgets, getBudgetSummary, createBudget, addTransaction, getTransactions } from '../api';

interface BudgetTrackerProps {
  isVisible: boolean;
  onClose: () => void;
}

interface Budget {
  id: number;
  category: string;
  planned_amount: number;
  spent_amount: number;
  notes: string;
  trip_id: number | null;
}

interface Transaction {
  id: number;
  amount: number;
  description: string;
  transaction_type: string;
  transaction_date: string;
}

interface BudgetSummary {
  total_planned: number;
  total_spent: number;
  remaining: number;
  budget_count: number;
  by_category: Array<{ category: string; planned: number; spent: number }>;
}

const BUDGET_CATEGORIES = [
  { value: 'flights', label: '✈️ Flights', color: '#3182ce' },
  { value: 'hotels', label: '🏨 Hotels', color: '#38a169' },
  { value: 'food', label: '🍽️ Food & Dining', color: '#dd6b20' },
  { value: 'activities', label: '🎯 Activities', color: '#805ad5' },
  { value: 'transport', label: '🚕 Local Transport', color: '#d53f8c' },
  { value: 'shopping', label: '🛍️ Shopping', color: '#e53e3e' },
  { value: 'miscellaneous', label: '📦 Miscellaneous', color: '#718096' },
];

export default function BudgetTracker({ isVisible, onClose }: BudgetTrackerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'budgets' | 'add'>('overview');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newCategory, setNewCategory] = useState('flights');
  const [newAmount, setNewAmount] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');

  useEffect(() => {
    if (isVisible) {
      loadData();
    }
  }, [isVisible]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [budgetsRes, summaryRes] = await Promise.all([
        getBudgets(),
        getBudgetSummary()
      ]);
      
      if (budgetsRes.status === 'success') {
        setBudgets(budgetsRes.budgets);
      }
      if (summaryRes.status === 'success') {
        setSummary(summaryRes.summary);
      }
    } catch (error) {
      console.error('Failed to load budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmount) return;

    try {
      const result = await createBudget({
        category: newCategory,
        planned_amount: parseFloat(newAmount),
        notes: newNotes
      });

      if (result.status === 'success') {
        setNewAmount('');
        setNewNotes('');
        setActiveTab('budgets');
        loadData();
      }
    } catch (error) {
      console.error('Failed to create budget:', error);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudget || !expenseAmount) return;

    try {
      const result = await addTransaction({
        budget_id: selectedBudget.id,
        amount: parseFloat(expenseAmount),
        description: expenseDesc,
        transaction_type: 'expense'
      });

      if (result.status === 'success') {
        setExpenseAmount('');
        setExpenseDesc('');
        loadData();
        loadTransactions(selectedBudget.id);
      }
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  const loadTransactions = async (budgetId: number) => {
    try {
      const result = await getTransactions(budgetId);
      if (result.status === 'success') {
        setTransactions(result.transactions);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const selectBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    loadTransactions(budget.id);
  };

  const getCategoryInfo = (category: string) => {
    return BUDGET_CATEGORIES.find(c => c.value === category) || 
           { value: category, label: category, color: '#718096' };
  };

  const getSpentPercentage = (planned: number, spent: number) => {
    if (planned === 0) return 0;
    return Math.min((spent / planned) * 100, 100);
  };

  if (!isVisible) return null;

  return (
    <div className="budget-overlay" onClick={onClose}>
      <div className="budget-modal" onClick={(e) => e.stopPropagation()}>
        <div className="budget-header">
          <h2>💰 Budget Tracker</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="budget-tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'budgets' ? 'active' : ''}`}
            onClick={() => setActiveTab('budgets')}
          >
            My Budgets ({budgets.length})
          </button>
          <button
            className={`tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            + Add Budget
          </button>
        </div>

        <div className="budget-content">
          {loading && <div className="loading">Loading...</div>}

          {/* Overview Tab */}
          {activeTab === 'overview' && summary && (
            <div className="budget-overview">
              <div className="summary-cards">
                <div className="summary-card total">
                  <div className="summary-icon">📊</div>
                  <div className="summary-info">
                    <span className="summary-label">Total Budget</span>
                    <span className="summary-value">₹{summary.total_planned.toLocaleString()}</span>
                  </div>
                </div>
                <div className="summary-card spent">
                  <div className="summary-icon">💸</div>
                  <div className="summary-info">
                    <span className="summary-label">Total Spent</span>
                    <span className="summary-value">₹{summary.total_spent.toLocaleString()}</span>
                  </div>
                </div>
                <div className="summary-card remaining">
                  <div className="summary-icon">💵</div>
                  <div className="summary-info">
                    <span className="summary-label">Remaining</span>
                    <span className="summary-value" style={{ color: summary.remaining >= 0 ? '#38a169' : '#e53e3e' }}>
                      ₹{summary.remaining.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="category-breakdown">
                <h3>By Category</h3>
                {summary.by_category.map((cat) => {
                  const info = getCategoryInfo(cat.category);
                  const percentage = getSpentPercentage(cat.planned, cat.spent);
                  return (
                    <div key={cat.category} className="category-item">
                      <div className="category-header">
                        <span className="category-name">{info.label}</span>
                        <span className="category-amount">
                          ₹{cat.spent.toLocaleString()} / ₹{cat.planned.toLocaleString()}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: percentage > 90 ? '#e53e3e' : info.color
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Budgets List Tab */}
          {activeTab === 'budgets' && (
            <div className="budgets-list">
              {budgets.length === 0 ? (
                <div className="empty-state">
                  <p>No budgets yet. Create your first budget to start tracking!</p>
                  <button className="btn" onClick={() => setActiveTab('add')}>
                    + Create Budget
                  </button>
                </div>
              ) : (
                <div className="budgets-grid">
                  {budgets.map((budget) => {
                    const info = getCategoryInfo(budget.category);
                    const percentage = getSpentPercentage(budget.planned_amount, budget.spent_amount);
                    const isSelected = selectedBudget?.id === budget.id;
                    
                    return (
                      <div 
                        key={budget.id} 
                        className={`budget-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => selectBudget(budget)}
                      >
                        <div className="budget-card-header">
                          <span className="budget-category">{info.label}</span>
                          <span 
                            className="budget-status"
                            style={{ color: percentage > 90 ? '#e53e3e' : '#38a169' }}
                          >
                            {percentage > 90 ? '⚠️ Over budget' : '✅ On track'}
                          </span>
                        </div>
                        <div className="budget-amounts">
                          <div className="budget-spent">
                            <span className="amount">₹{budget.spent_amount.toLocaleString()}</span>
                            <span className="label">spent</span>
                          </div>
                          <div className="budget-planned">
                            <span className="amount">₹{budget.planned_amount.toLocaleString()}</span>
                            <span className="label">planned</span>
                          </div>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: percentage > 90 ? '#e53e3e' : info.color
                            }}
                          />
                        </div>
                        {budget.notes && <p className="budget-notes">{budget.notes}</p>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Expense Panel */}
              {selectedBudget && (
                <div className="expense-panel">
                  <h3>Add Expense to {getCategoryInfo(selectedBudget.category).label}</h3>
                  <form onSubmit={handleAddExpense} className="expense-form">
                    <input
                      type="number"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="Amount (₹)"
                      required
                    />
                    <input
                      type="text"
                      value={expenseDesc}
                      onChange={(e) => setExpenseDesc(e.target.value)}
                      placeholder="Description (optional)"
                    />
                    <button type="submit" className="btn">Add Expense</button>
                  </form>

                  {/* Recent Transactions */}
                  {transactions.length > 0 && (
                    <div className="transactions-list">
                      <h4>Recent Transactions</h4>
                      {transactions.slice(0, 5).map((t) => (
                        <div key={t.id} className="transaction-item">
                          <span className="transaction-desc">{t.description || 'Expense'}</span>
                          <span className="transaction-amount">-₹{t.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Add Budget Tab */}
          {activeTab === 'add' && (
            <div className="add-budget">
              <form onSubmit={handleCreateBudget} className="budget-form">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={newCategory} 
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    {BUDGET_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Planned Amount (₹)</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Notes (Optional)</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Add any notes about this budget..."
                  />
                </div>

                <button type="submit" className="btn">Create Budget</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
