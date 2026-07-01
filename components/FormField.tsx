'use client';

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-input)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '13px',
  color: 'var(--text)',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  color: 'var(--text-dim)',
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  children: React.ReactNode;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
}

export function Field({ label, ...props }: FieldProps) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        {...props}
        style={inputStyle}
        onFocus={e => (e.target.style.borderColor = 'var(--brand)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
      />
    </div>
  );
}

export function Select({ label, children, ...props }: SelectProps) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select
        {...props}
        style={{ ...inputStyle, cursor: 'pointer' }}
        onFocus={e => (e.target.style.borderColor = 'var(--brand)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
      >
        {children}
      </select>
    </div>
  );
}

export function TextArea({ label, ...props }: TextAreaProps) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <textarea
        {...props}
        style={{ ...inputStyle, resize: 'none' }}
        onFocus={e => (e.target.style.borderColor = 'var(--brand)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
      />
    </div>
  );
}

export function ModalActions({ onCancel, loading, label = 'Guardar' }: { onCancel: () => void; loading: boolean; label?: string }) {
  return (
    <div className="flex gap-3 pt-1">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 rounded-lg py-2 text-sm transition-colors"
        style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent' }}
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={loading}
        className="flex-1 rounded-lg py-2 text-sm font-semibold text-white transition-all disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: loading ? 'none' : '0 0 16px rgba(34,197,94,0.3)' }}
      >
        {loading ? 'Guardando...' : label}
      </button>
    </div>
  );
}
