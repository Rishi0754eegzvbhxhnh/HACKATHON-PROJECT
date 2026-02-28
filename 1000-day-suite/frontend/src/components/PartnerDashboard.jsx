import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../hooks/useTranslation';

export default function PartnerDashboard({ user }) {
    const { t } = useTranslation();
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        if (!user) return;
        async function fetchAlerts() {
            const { data } = await supabase
                .from('partner_alerts')
                .select('*')
                .eq('partner_id', user.id)
                .order('created_at', { ascending: false });
            setAlerts(data || []);
        }
        fetchAlerts();
    }, [user]);

    return (
        <section className="dashboard-section" style={{ padding: '40px 20px', maxWidth: 1000, margin: '0 auto' }}>
            <div className="section-tag">Partner Portal</div>
            <h2 className="section-title">Support Your Family</h2>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
                <div className="dash-card">
                    <div className="dash-card-header"><span className="dash-card-title">{t('partnerAlerts')}</span></div>
                    <div className="vital-value" style={{ color: alerts.length > 0 ? 'var(--rose-deep)' : 'var(--sage-deep)' }}>{alerts.length}</div>
                    <div className="vital-unit">Notifications regarding your partner</div>
                </div>
                <div className="dash-card">
                    <div className="dash-card-header"><span className="dash-card-title">Pregnancy Stage</span></div>
                    <div className="vital-value">Monitoring</div>
                    <div className="vital-unit">You will be notified for updates or emergencies.</div>
                </div>
            </div>

            {alerts.length > 0 && (
                <div style={{ marginTop: 40, background: 'white', padding: 20, borderRadius: 16, border: '1px solid var(--wash-gray)' }}>
                    <h3 style={{ marginBottom: 20 }}>Recent Alerts</h3>
                    {alerts.map(a => (
                        <div key={a.id} style={{ padding: 16, borderBottom: '1px solid #eee', color: a.alert_type === 'emergency' ? 'var(--rose-deep)' : 'inherit' }}>
                            <strong>{a.alert_type.toUpperCase()}</strong> - {a.message}
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
