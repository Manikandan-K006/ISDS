import { forwardRef } from 'react';
import { formatDate } from '../../utils/helpers';

const CertificateTemplate = forwardRef(({ cert }, ref) => (
  <div ref={ref} style={{
    width: '800px',
    padding: '0',
    background: '#fff',
    fontFamily: 'Georgia, "Times New Roman", serif',
    position: 'relative',
  }}>
    <div style={{
      margin: '30px',
      border: '3px double #1e40af',
      padding: '48px 40px',
      textAlign: 'center',
      position: 'relative',
    }}>
      {/* Decorative corners */}
      <div style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '24px', color: '#1e40af', opacity: 0.2, lineHeight: '12px' }}>&#10022;</div>
      <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '24px', color: '#1e40af', opacity: 0.2, lineHeight: '12px' }}>&#10022;</div>
      <div style={{ position: 'absolute', bottom: '12px', left: '12px', fontSize: '24px', color: '#1e40af', opacity: 0.2, lineHeight: '12px' }}>&#10022;</div>
      <div style={{ position: 'absolute', bottom: '12px', right: '12px', fontSize: '24px', color: '#1e40af', opacity: 0.2, lineHeight: '12px' }}>&#10022;</div>

      {/* Seal */}
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="1.5" style={{ opacity: 0.25, margin: '0 auto 16px', display: 'block' }}>
        <circle cx="12" cy="8" r="5" />
        <path d="M5 22v-2a7 7 0 0 1 14 0v2" />
      </svg>

      <h1 style={{
        fontSize: '26px',
        color: '#1e40af',
        fontWeight: 'bold',
        letterSpacing: '2px',
        marginBottom: '4px',
        textTransform: 'uppercase',
      }}>
        Certificate of Completion
      </h1>

      <div style={{
        width: '100px',
        height: '2px',
        background: '#1e40af',
        margin: '14px auto',
        opacity: 0.4,
      }} />

      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
        This is to certify that
      </p>

      <h2 style={{
        fontSize: '34px',
        color: '#0f172a',
        fontWeight: 'bold',
        marginBottom: '6px',
        fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
        fontStyle: 'italic',
      }}>
        {cert.studentName}
      </h2>

      <div style={{
        width: '180px',
        height: '1px',
        background: '#cbd5e1',
        margin: '10px auto',
      }} />

      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', lineHeight: '1.8' }}>
        has successfully completed the course
      </p>

      <h3 style={{
        fontSize: '22px',
        color: '#1e40af',
        fontWeight: '600',
        marginBottom: '28px',
      }}>
        {cert.courseName}
      </h3>

      <table style={{
        margin: '0 auto 28px',
        fontSize: '12px',
        color: '#475569',
        borderCollapse: 'collapse',
      }}>
        <tbody>
          <tr>
            <td style={{ padding: '4px 16px', borderRight: '1px solid #e2e8f0' }}>
              <strong>Issue Date:</strong> {formatDate(cert.issueDate || cert.createdAt)}
            </td>
            <td style={{ padding: '4px 16px', borderRight: '1px solid #e2e8f0' }}>
              <strong>Grade:</strong> <span style={{ color: '#1e40af' }}>{cert.grade}</span>
            </td>
            <td style={{ padding: '4px 16px' }}>
              <strong>ID:</strong> {cert.certificateId}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'end',
        fontSize: '11px',
        color: '#94a3b8',
      }}>
        <div>
          <div style={{ width: '140px', height: '1px', background: '#94a3b8', marginBottom: '4px' }} />
          <span>Authorized Signature</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', color: '#64748b', marginBottom: '2px' }}>ISDS</div>
          <div>Intelligent Student Development System</div>
        </div>
      </div>
    </div>
  </div>
));

export default CertificateTemplate;
