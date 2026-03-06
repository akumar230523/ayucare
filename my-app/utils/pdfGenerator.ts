export interface PdfMedicine {
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
}

export interface PdfPrescription {
    medicines: PdfMedicine[];
    doctorDescription?: string;
    prescribedAt?: string;
}

export interface AppointmentPdfData {
    patientName: string;
    doctorName: string;
    doctorSpecialty?: string;
    doctorDegree?: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    appointmentType: string;
    visitType: string;
    consultationType: string;
    patientProblem?: string;
    patientAge?: number;
    patientGender?: string;
    patientAllergies?: string[];
    patientProblems?: string[];
    prescription?: PdfPrescription;
}

export interface PrescriptionPdfData {
    patientName: string;
    doctorName: string;
    doctorSpecialty?: string;
    doctorDegree?: string;
    date: string;
    startTime: string;
    patientProblem?: string;
    prescription: PdfPrescription;
}

const to12Hour = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const fmtDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';

const fmtShortDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const PRIMARY = '#46C2DE';

const BASE_CSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; }
    body {
        font-family: 'Segoe UI', Arial, sans-serif;
        background: #f0f2f5;
        color: #1e293b;
        font-size: 13px;
        line-height: 1.6;
    }

    /* Page — flex column so footer always sits at bottom */
    .page {
        max-width: 760px;
        margin: 0 auto;
        background: white;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    /* ── Header (unchanged) ── */
    .header {
        background: ${PRIMARY};
        padding: 28px 40px 24px;
        color: white;
        position: relative;
        overflow: hidden;
        flex-shrink: 0;
    }
    .header::before {
        content: ''; position: absolute;
        top: -30px; right: -30px;
        width: 130px; height: 130px;
        border-radius: 50%; background: rgba(255,255,255,0.1);
    }
    .header::after {
        content: ''; position: absolute;
        bottom: -20px; left: 30%;
        width: 90px; height: 90px;
        border-radius: 50%; background: rgba(255,255,255,0.1);
    }
    .header-top {
        display: flex; align-items: center;
        justify-content: space-between;
        position: relative; z-index: 1;
    }
    .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .brand span { opacity: 0.7; font-weight: 400; font-size: 13px; display: block; margin-top: 2px; }
    .doc-type {
        background: rgba(255,255,255,0.2);
        border-radius: 20px; padding: 4px 14px;
        font-size: 11px; font-weight: 600;
        letter-spacing: 1px; text-transform: uppercase;
    }

    /* Body grows to push footer down */
    .body { padding: 32px 40px; flex: 1; }

    /* ── Date + status meta bar ── */
    .meta-bar {
        display: flex; align-items: center;
        justify-content: space-between;
        padding-bottom: 20px;
        border-bottom: 2px solid #f1f5f9;
        margin-bottom: 28px;
    }
    .meta-date { font-size: 17px; font-weight: 700; color: #0f172a; }
    .meta-time { font-size: 13px; color: #64748b; margin-top: 3px; }

    .status-pill {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 5px 14px; border-radius: 20px;
        font-size: 11px; font-weight: 700; letter-spacing: 0.4px;
        -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
    .status-scheduled { background: #f0fdf4; color: #15803d; }
    .status-scheduled .status-dot { background: #22c55e; }
    .status-completed  { background: #eff6ff; color: #1d4ed8; }
    .status-completed  .status-dot { background: #3b82f6; }
    .status-cancelled  { background: #fff1f2; color: #be123c; }
    .status-cancelled  .status-dot { background: #f43f5e; }

    /* ── Section ── */
    .section { margin-bottom: 26px; }
    .section-label {
        font-size: 9px; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.18em;
        color: ${PRIMARY}; margin-bottom: 12px;
        display: flex; align-items: center; gap: 8px;
    }
    .section-label::after { content: ''; flex: 1; height: 1px; background: ${PRIMARY}35; }

    /* ── Participants — two columns, thin border ── */
    .participants {
        display: grid; grid-template-columns: 1fr 1fr;
        border: 1px solid #edf2f7; border-radius: 10px; overflow: hidden;
    }
    .participant { padding: 13px 18px; }
    .participant + .participant { border-left: 1px solid #edf2f7; }
    .participant-role {
        font-size: 9px; font-weight: 700;
        letter-spacing: 0.15em; text-transform: uppercase;
        color: #94a3b8; margin-bottom: 4px;
    }
    .participant-name { font-size: 14px; font-weight: 700; color: #0f172a; }
    .participant-sub  { font-size: 12px; color: #64748b; margin-top: 2px; }
    .participant-spec { font-size: 12px; color: ${PRIMARY}; font-weight: 600; margin-top: 2px; }

    /* ── Field rows — clean label + value, dashed divider ── */
    .field-row {
        display: flex; align-items: baseline;
        padding: 7px 0; border-bottom: 1px dashed #e8edf2;
    }
    .field-row:last-child { border-bottom: none; }
    .field-label { font-size: 11px; color: #94a3b8; width: 165px; flex-shrink: 0; }
    .field-value  { font-size: 13px; font-weight: 600; color: #0f172a; }

    /* ── Inline text — plain prose, left accent ── */
    .inline-text {
        font-size: 13px; color: #334155; line-height: 1.75;
        padding-left: 14px;
        border-left: 3px solid ${PRIMARY}45;
    }

    /* ── Health grid — always rendered ── */
    .health-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .health-col-label {
        font-size: 9px; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.12em; color: #64748b; margin-bottom: 7px;
    }
    .tag {
        display: inline-block; padding: 3px 9px; border-radius: 4px;
        font-size: 11px; font-weight: 600; margin: 2px 3px 2px 0;
        -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .tag-yellow { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
    .tag-red    { background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; }
    .none-text  { font-size: 12px; color: #cbd5e1; font-style: italic; }

    /* ── Prescription table — minimal, no heavy borders ── */
    .rx-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
    .rx-table thead tr { border-bottom: 2px solid #e2e8f0; }
    .rx-table thead th {
        padding: 6px 10px 8px 0; text-align: left;
        font-size: 9px; font-weight: 700;
        letter-spacing: 0.14em; text-transform: uppercase; color: #94a3b8;
    }
    .rx-table thead th:first-child { width: 26px; }
    .rx-table tbody tr { border-bottom: 1px solid #f1f5f9; }
    .rx-table tbody tr:last-child { border-bottom: none; }
    .rx-table tbody td {
        padding: 9px 10px 9px 0; font-size: 12px;
        color: #475569; vertical-align: top;
    }
    .rx-table tbody td:first-child { color: #cbd5e1; font-size: 11px; }
    .rx-table tbody td:nth-child(2) { font-weight: 600; color: #0f172a; }

    /* ── Separator used after prescription table before notes ── */
    .sub-label {
        font-size: 9px; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.14em; color: #94a3b8; margin-bottom: 7px;
    }

    /* ── Signature ── */
    .signature-wrap { margin-top: 44px; display: flex; justify-content: flex-end; }
    .signature-block { text-align: center; min-width: 180px; }
    .signature-space { height: 36px; }
    .signature-line { border-top: 1px solid #1e293b; padding-top: 8px; }
    .sig-name  { font-size: 13px; font-weight: 700; color: #0f172a; }
    .sig-title { font-size: 11px; color: #64748b; margin-top: 2px; }
    .sig-note  { font-size: 10px; color: #94a3b8; letter-spacing: 0.04em; margin-top: 4px; }

    /* ── Footer — teal bg, white text, always at bottom ── */
    .footer {
        background: ${PRIMARY};
        padding: 14px 40px;
        display: flex; align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    .footer-brand { font-size: 13px; font-weight: 800; color: white; letter-spacing: -0.3px; }
    .footer-text  { font-size: 11px; color: rgba(255,255,255,0.72); }

    /* ── Print ── */
    @media print {
        html, body { height: 100%; }
        body { background: white; }
        /* flex keeps footer at bottom on short pages; follows content on long pages */
        .page { max-width: 100%; margin: 0; box-shadow: none; min-height: 100vh; display: flex; flex-direction: column; }
        @page { size: A4; margin: 0; }
        .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .footer {
            margin-top: auto;
            page-break-before: avoid;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .body { padding-bottom: 0; }
        .status-pill, .tag { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .section, .rx-table, .participants { page-break-inside: avoid; }
    }
`;

const printWindow = (html: string) => {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 600);
};

// ── 1. APPOINTMENT PDF ────────────────────────────────────────────────────────
export const generateAppointmentPDF = (d: AppointmentPdfData) => {
    const statusClass = `status-${d.status.toLowerCase()}`;
    const rx = d.prescription;

    // Allergies + Conditions — always shown, no surrounding box
    const healthHtml = `
        <div class="section">
            <div class="section-label">Patient Health</div>
            <div class="health-grid">
                <div>
                    <div class="health-col-label">Allergies</div>
                    <div>
                        ${d.patientAllergies?.length
                            ? d.patientAllergies.map(a => `<span class="tag tag-yellow">${a}</span>`).join('')
                            : '<span class="none-text">None reported</span>'}
                    </div>
                </div>
                <div>
                    <div class="health-col-label">Conditions</div>
                    <div>
                        ${d.patientProblems?.length
                            ? d.patientProblems.map(p => `<span class="tag tag-red">${p}</span>`).join('')
                            : '<span class="none-text">None reported</span>'}
                    </div>
                </div>
            </div>
        </div>`;

    // Prescription — clean table + inline notes, no colored boxes
    const prescriptionHtml = rx && rx.medicines.length > 0 ? `
        <div class="section">
            <div class="section-label">Prescription</div>
            <table class="rx-table">
                <thead><tr>
                    <th>#</th><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th>
                </tr></thead>
                <tbody>
                    ${rx.medicines.map((m, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${m.medicineName}</td>
                            <td>${m.dosage || '—'}</td>
                            <td>${m.frequency || '—'}</td>
                            <td>${m.duration || '—'}</td>
                        </tr>`).join('')}
                </tbody>
            </table>
            ${rx.doctorDescription ? `
                <div style="margin-top:18px;padding-top:14px;border-top:1px dashed #e2e8f0;">
                    <div class="sub-label">Doctor's Notes</div>
                    <p class="inline-text">${rx.doctorDescription}</p>
                </div>` : ''}
            ${rx.prescribedAt ? `
                <p style="font-size:10px;color:#94a3b8;margin-top:10px;letter-spacing:0.03em;">
                    Prescribed on ${fmtShortDate(rx.prescribedAt)}
                </p>` : ''}
        </div>` : '';

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Appointment — ${d.patientName}</title>
    <style>${BASE_CSS}</style></head>
    <body><div class="page">

        <div class="header">
            <div class="header-top">
                <div class="brand">Ayucare <span>Appointment Summary</span></div>
                <span class="doc-type">Appointment</span>
            </div>
        </div>

        <div class="body">

            <div class="meta-bar">
                <div>
                    <div class="meta-date">${fmtDate(d.date)}</div>
                    <div class="meta-time">${to12Hour(d.startTime)} – ${to12Hour(d.endTime)} &nbsp;·&nbsp; ${d.consultationType}</div>
                </div>
                <span class="status-pill ${statusClass}">
                    <span class="status-dot"></span>${d.status}
                </span>
            </div>

            <div class="section">
                <div class="section-label">Participants</div>
                <div class="participants">
                    <div class="participant">
                        <div class="participant-role">Physician</div>
                        <div class="participant-name">Dr. ${d.doctorName}</div>
                        ${d.doctorSpecialty ? `<div class="participant-spec">${d.doctorSpecialty}</div>` : ''}
                        ${d.doctorDegree    ? `<div class="participant-sub">${d.doctorDegree}</div>` : ''}
                    </div>
                    <div class="participant">
                        <div class="participant-role">Patient</div>
                        <div class="participant-name">${d.patientName}</div>
                        <div class="participant-sub">
                            ${[d.patientGender, d.patientAge ? `${d.patientAge} yrs` : ''].filter(Boolean).join(' · ') || '—'}
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-label">Visit Details</div>
                <div class="field-row">
                    <span class="field-label">Appointment Type</span>
                    <span class="field-value">${d.appointmentType}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Patient Status</span>
                    <span class="field-value">${d.visitType} Patient</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Consultation Mode</span>
                    <span class="field-value">${d.consultationType}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Record Status</span>
                    <span class="field-value">${d.status}</span>
                </div>
            </div>

            ${healthHtml}

            ${d.patientProblem ? `
            <div class="section">
                <div class="section-label">Chief Complaint</div>
                <p class="inline-text">${d.patientProblem}</p>
            </div>` : ''}

            ${prescriptionHtml}

        </div>

        <div class="footer">
            <span class="footer-brand">Ayucare</span>
            <span class="footer-text">Generated on ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>

    </div></body></html>`;

    printWindow(html);
};

// ── 2. PRESCRIPTION PDF ───────────────────────────────────────────────────────
export const generatePrescriptionPDF = (d: PrescriptionPdfData) => {
    const rx = d.prescription;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Prescription — ${d.patientName}</title>
    <style>${BASE_CSS}</style></head>
    <body><div class="page">

        <div class="header">
            <div class="header-top">
                <div class="brand">Ayucare <span>Medical Prescription</span></div>
            </div>
        </div>

        <div class="body">

            <div class="meta-bar">
                <div>
                    <div class="meta-date">Dr. ${d.doctorName}</div>
                    ${d.doctorSpecialty ? `<div style="font-size:13px;color:${PRIMARY};font-weight:600;margin-top:2px;">${d.doctorSpecialty}</div>` : ''}
                    ${d.doctorDegree ? `<div class="meta-time">${d.doctorDegree}</div>` : ''}
                </div>
                <div style="text-align:right;">
                    <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#94a3b8;margin-bottom:3px;">Date of Issue</div>
                    <div style="font-size:15px;font-weight:700;color:#0f172a;">${fmtShortDate(d.date)}</div>
                    <div style="font-size:12px;color:#64748b;">${to12Hour(d.startTime)}</div>
                </div>
            </div>

            <div class="section">
                <div class="section-label">Patient</div>
                <div class="participants" style="grid-template-columns:1fr;">
                    <div class="participant">
                        <div class="participant-role">Full Name</div>
                        <div class="participant-name">${d.patientName}</div>
                    </div>
                </div>
            </div>

            ${d.patientProblem ? `
            <div class="section">
                <div class="section-label">Chief Complaint</div>
                <p class="inline-text">${d.patientProblem}</p>
            </div>` : ''}

            ${rx.medicines.length > 0 ? `
            <div class="section">
                <div class="section-label">Prescribed Medicines</div>
                <table class="rx-table">
                    <thead><tr>
                        <th>#</th><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th>
                    </tr></thead>
                    <tbody>
                        ${rx.medicines.map((m, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${m.medicineName}</td>
                                <td>${m.dosage || '—'}</td>
                                <td>${m.frequency || '—'}</td>
                                <td>${m.duration || '—'}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>` : ''}

            ${rx.doctorDescription ? `
            <div class="section">
                <div class="section-label">Doctor's Instructions</div>
                <p class="inline-text">${rx.doctorDescription}</p>
            </div>` : ''}

            <div class="signature-wrap">
                <div class="signature-block">
                    <div class="signature-space"></div>
                    <div class="signature-line">
                        <div class="sig-name">Dr. ${d.doctorName}</div>
                        ${d.doctorSpecialty ? `<div class="sig-title">${d.doctorSpecialty}</div>` : ''}
                        <div class="sig-note">Authorised Signature</div>
                    </div>
                </div>
            </div>

        </div>

        <div class="footer">
            <span class="footer-brand">Ayucare</span>
            <span class="footer-text">Valid for 30 days &nbsp;·&nbsp; Issued on ${fmtShortDate(d.date)}</span>
        </div>

    </div></body></html>`;

    printWindow(html);
};