import { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead, createPriceAlert, getPriceAlerts, cancelPriceAlert } from '../api';

interface NotificationCenterProps {
  isVisible: boolean;
  onClose: () => void;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: number;
  data: any;
  created_at: string;
}

interface PriceAlert {
  id: number;
  alert_type: string;
  search_params: any;
  initial_price: number;
  current_price: number;
  target_price: number | null;
  is_active: number;
  created_at: string;
  last_checked: string | null;
}

const NOTIFICATION_ICONS: Record<string, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
  price_drop: '📉',
  price_increase: '📈',
  trip_reminder: '✈️',
  budget_alert: '💰',
};

export default function NotificationCenter({ isVisible, onClose }: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'alerts'>('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // New alert form
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertType, setAlertType] = useState<'flight' | 'hotel'>('flight');
  const [alertOrigin, setAlertOrigin] = useState('');
  const [alertDestination, setAlertDestination] = useState('');
  const [alertDate, setAlertDate] = useState('');
  const [alertPrice, setAlertPrice] = useState('');

  useEffect(() => {
    if (isVisible) {
      loadData();
    }
  }, [isVisible]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [notifRes, alertsRes] = await Promise.all([
        getNotifications(),
        getPriceAlerts()
      ]);

      if (notifRes.status === 'success') {
        setNotifications(notifRes.notifications);
        setUnreadCount(notifRes.unread_count);
      }
      if (alertsRes.status === 'success') {
        setAlerts(alertsRes.alerts);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: 1 } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertDestination || !alertPrice) return;

    try {
      const searchParams = alertType === 'flight' 
        ? { origin: alertOrigin, destination: alertDestination, date: alertDate }
        : { city: alertDestination, checkin: alertDate };

      const result = await createPriceAlert({
        alert_type: alertType,
        search_params: searchParams,
        initial_price: parseFloat(alertPrice),
      });

      if (result.status === 'success') {
        setShowAlertForm(false);
        setAlertOrigin('');
        setAlertDestination('');
        setAlertDate('');
        setAlertPrice('');
        loadData();
      }
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  };

  const handleCancelAlert = async (alertId: number) => {
    try {
      await cancelPriceAlert(alertId);
      setAlerts(alerts.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Failed to cancel alert:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getPriceChangeClass = (initial: number, current: number) => {
    if (current < initial) return 'price-down';
    if (current > initial) return 'price-up';
    return '';
  };

  if (!isVisible) return null;

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="notification-header">
          <h2>🔔 Notifications & Alerts</h2>
          <div className="header-actions">
            {unreadCount > 0 && (
              <button className="btn-link" onClick={handleMarkAllRead}>
                Mark all as read
              </button>
            )}
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="notification-tabs">
          <button
            className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>
          <button
            className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            Price Alerts ({alerts.length})
          </button>
        </div>

        <div className="notification-content">
          {loading && <div className="loading">Loading...</div>}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="notifications-list">
              {notifications.length === 0 ? (
                <div className="empty-state">
                  <p>No notifications yet</p>
                  <span>You'll be notified about price changes and trip updates here</span>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`notification-item ${notif.is_read ? 'read' : 'unread'}`}
                    onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                  >
                    <div className="notification-icon">
                      {NOTIFICATION_ICONS[notif.notification_type] || 'ℹ️'}
                    </div>
                    <div className="notification-body">
                      <h4>{notif.title}</h4>
                      <p>{notif.message}</p>
                      <span className="notification-time">{formatDate(notif.created_at)}</span>
                    </div>
                    {!notif.is_read && <div className="unread-dot" />}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Price Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="alerts-section">
              <div className="alerts-header">
                <p>Get notified when prices change for your searches</p>
                <button 
                  className="btn secondary"
                  onClick={() => setShowAlertForm(!showAlertForm)}
                >
                  {showAlertForm ? 'Cancel' : '+ New Alert'}
                </button>
              </div>

              {/* New Alert Form */}
              {showAlertForm && (
                <form onSubmit={handleCreateAlert} className="alert-form">
                  <div className="form-row">
                    <select 
                      value={alertType} 
                      onChange={(e) => setAlertType(e.target.value as 'flight' | 'hotel')}
                    >
                      <option value="flight">✈️ Flight</option>
                      <option value="hotel">🏨 Hotel</option>
                    </select>
                  </div>

                  {alertType === 'flight' && (
                    <div className="form-row">
                      <input
                        type="text"
                        value={alertOrigin}
                        onChange={(e) => setAlertOrigin(e.target.value)}
                        placeholder="From (e.g., Delhi)"
                        required
                      />
                    </div>
                  )}

                  <div className="form-row">
                    <input
                      type="text"
                      value={alertDestination}
                      onChange={(e) => setAlertDestination(e.target.value)}
                      placeholder={alertType === 'flight' ? 'To (e.g., Goa)' : 'City (e.g., Goa)'}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <input
                      type="date"
                      value={alertDate}
                      onChange={(e) => setAlertDate(e.target.value)}
                    />
                  </div>

                  <div className="form-row">
                    <input
                      type="number"
                      value={alertPrice}
                      onChange={(e) => setAlertPrice(e.target.value)}
                      placeholder="Current price (₹)"
                      required
                    />
                  </div>

                  <button type="submit" className="btn">Create Alert</button>
                </form>
              )}

              {/* Active Alerts */}
              <div className="alerts-list">
                {alerts.length === 0 ? (
                  <div className="empty-state">
                    <p>No active price alerts</p>
                    <span>Create an alert to track price changes</span>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="alert-card">
                      <div className="alert-icon">
                        {alert.alert_type === 'flight' ? '✈️' : '🏨'}
                      </div>
                      <div className="alert-info">
                        <h4>
                          {alert.alert_type === 'flight' 
                            ? `${alert.search_params.origin} → ${alert.search_params.destination}`
                            : alert.search_params.city
                          }
                        </h4>
                        <div className="alert-prices">
                          <span className="initial-price">
                            Initial: ₹{alert.initial_price.toLocaleString()}
                          </span>
                          <span className={`current-price ${getPriceChangeClass(alert.initial_price, alert.current_price)}`}>
                            Current: ₹{alert.current_price.toLocaleString()}
                            {alert.current_price !== alert.initial_price && (
                              <span className="price-change">
                                ({alert.current_price < alert.initial_price ? '↓' : '↑'}
                                {Math.abs(Math.round((alert.current_price - alert.initial_price) / alert.initial_price * 100))}%)
                              </span>
                            )}
                          </span>
                        </div>
                        <span className="alert-date">
                          Created: {formatDate(alert.created_at)}
                          {alert.last_checked && ` • Last checked: ${formatDate(alert.last_checked)}`}
                        </span>
                      </div>
                      <button 
                        className="btn-icon danger"
                        onClick={() => handleCancelAlert(alert.id)}
                        title="Cancel alert"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
