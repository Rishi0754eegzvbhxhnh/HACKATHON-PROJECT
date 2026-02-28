import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../hooks/useTranslation';

export default function DoctorDashboard({ user, language }) {
    const { t } = useTranslation();
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        if (!user) return;
        async function fetchAppts() {
            const { data } = await supabase
                .from('appointments')
                .select(`*, users:mother_id (name, email)`)
                .eq('doctor_id', user.id);
            setAppointments(data || []);
        }
        fetchAppts();
    }, [user]);

    return (
        <section className="dashboard-section" style={{ padding: '40px 20px', maxWidth: 1000, margin: '0 auto' }}>
            <div className="section-tag">Doctor Portal</div>
            <h2 className="section-title">Your Patients & Appointments</h2>

            <div className="dashboard-grid">
                <div className="dash-card">
                    <div className="dash-card-header"><span className="dash-card-title">Total Patients</span></div>
                    <div className="vital-value">0</div>
                </div>
                <div className="dash-card">
                    <div className="dash-card-header"><span className="dash-card-title">{t('nextAppt')}</span></div>
                    <div className="vital-value">{appointments.length}</div>
                </div>
                <div className="dash-card">
                    <div className="dash-card-header"><span className="dash-card-title">{t('partnerAlerts')}</span></div>
                    <div className="vital-value" style={{ color: 'var(--rose-deep)' }}>0</div>
                </div>
            </div>

            <div style={{ marginTop: 40, background: 'white', padding: 20, borderRadius: 16, border: '1px solid var(--wash-gray)' }}>
                <h3 style={{ marginBottom: 20 }}>Today's Schedule</h3>
                {appointments.length === 0 ? (
                    <p style={{ color: 'var(--ink-light)' }}>No upcoming appointments.</p>
                ) : (
                    appointments.map(a => (
                        <div key={a.id} style={{ padding: 16, borderBottom: '1px solid #eee' }}>
                            <strong>{a.users?.name || 'Patient'}</strong> - {new Date(a.scheduled_at).toLocaleString()}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
