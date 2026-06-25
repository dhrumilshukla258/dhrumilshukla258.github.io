import { useState, FormEvent } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { usePersonality } from '@/components/PersonalityContext';
import styles from '@/styles/ContactForm.module.css';

const FORM_ID = 'xlgygzwk';

function validateName(v: string) {
  if (v.trim().length < 2) return 'Name must be at least 2 characters.';
  if (v.trim().length > 60) return 'Name is too long (max 60 characters).';
  if (!/^[a-zA-Z\s'\-.]+$/.test(v.trim())) return 'Name may only contain letters, spaces, hyphens, or apostrophes.';
  return '';
}

function validateEmail(v: string) {
  if (!v.trim()) return 'Email is required.';
  if (!/^[a-zA-Z0-9._%+\-]{2,64}@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(v.trim()))
    return 'Enter a valid email address (e.g. name@domain.com).';
  return '';
}

function validateMessage(v: string) {
  if (v.trim().length < 20) return 'Message must be at least 20 characters.';
  if (v.trim().length > 2000) return 'Message is too long (max 2000 characters).';
  return '';
}

interface ClientErrors { name: string; email: string; message: string; }

function useContactForm() {
  const [state, handleFormspreeSubmit] = useForm(FORM_ID);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [clientErrors, setClientErrors] = useState<ClientErrors>({ name: '', email: '', message: '' });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const msgErr = validateMessage(message);
    if (nameErr || emailErr || msgErr) {
      setClientErrors({ name: nameErr, email: emailErr, message: msgErr });
      return;
    }
    setClientErrors({ name: '', email: '', message: '' });
    handleFormspreeSubmit(e);
  };

  const clear = (field: keyof ClientErrors) =>
    setClientErrors(e => ({ ...e, [field]: '' }));

  return { state, name, setName, email, setEmail, message, setMessage, clientErrors, clear, handleSubmit };
}

/* ─── Professional ─────────────────────────────────────── */
export function ContactForm() {
  const { personality } = usePersonality();
  const { state, name, setName, email, setEmail, message, setMessage, clientErrors, clear, handleSubmit } = useContactForm();

  /* ── Gamer ── */
  if (personality === 'gamer') {
    if (state.succeeded) {
      return <div className={styles.gamerForm}><div className={styles.successMsg}>▸ MESSAGE TRANSMITTED — I&apos;ll be in touch!</div></div>;
    }
    return (
      <form className={styles.gamerForm} onSubmit={handleSubmit} noValidate>
        <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
        <div className={styles.gamerHeader}>{'// COMPOSE MESSAGE'}</div>

        <div className={styles.gamerField}>
          <label className={styles.gamerLabel}>PLAYER_NAME</label>
          <input className={`${styles.gamerInput} ${clientErrors.name ? styles.inputErr : ''}`}
            type="text" name="name" placeholder="YourName" value={name} maxLength={60}
            onChange={e => { setName(e.target.value); clear('name'); }} />
          {clientErrors.name && <span className={styles.errMsg}>{clientErrors.name}</span>}
          <ValidationError field="name" errors={state.errors} className={styles.errMsg} />
        </div>

        <div className={styles.gamerField}>
          <label className={styles.gamerLabel}>YOUR_EMAIL</label>
          <input className={`${styles.gamerInput} ${clientErrors.email ? styles.inputErr : ''}`}
            type="email" name="email" placeholder="player@domain.com" value={email}
            onChange={e => { setEmail(e.target.value); clear('email'); }} />
          {clientErrors.email && <span className={styles.errMsg}>{clientErrors.email}</span>}
          <ValidationError field="email" errors={state.errors} className={styles.errMsg} />
        </div>

        <div className={styles.gamerField}>
          <label className={styles.gamerLabel}>MESSAGE_BODY</label>
          <textarea className={`${styles.gamerTextarea} ${clientErrors.message ? styles.inputErr : ''}`}
            name="message" placeholder="Type your message here... (min 20 characters)"
            value={message} rows={5} maxLength={2000}
            onChange={e => { setMessage(e.target.value); clear('message'); }} />
          <span className={styles.charCount}>{message.length} / 2000</span>
          {clientErrors.message && <span className={styles.errMsg}>{clientErrors.message}</span>}
          <ValidationError field="message" errors={state.errors} className={styles.errMsg} />
        </div>

        {state.errors && !state.succeeded &&
          <div className={styles.errorBanner}>Transmission failed. Please try again.</div>}

        <button className={styles.gamerBtn} type="submit" disabled={state.submitting}>
          {state.submitting ? '▸ SENDING...' : '▸ SEND MESSAGE'}
        </button>
      </form>
    );
  }

  /* ── Technical ── */
  if (personality === 'technical') {
    if (state.succeeded) {
      return <div className={styles.techForm}><div className={styles.successMsg}>{'✓ message sent — I\'ll respond soon!'}</div></div>;
    }
    return (
      <form className={styles.techForm} onSubmit={handleSubmit} noValidate>
        <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
        <div className={styles.techComment}>{'// send_message(name, email, body)'}</div>

        <div className={styles.techField}>
          <span className={styles.techPrompt}>name</span>
          <input className={`${styles.techInput} ${clientErrors.name ? styles.inputErr : ''}`}
            type="text" name="name" placeholder="Your Name" value={name} maxLength={60}
            onChange={e => { setName(e.target.value); clear('name'); }} />
          {clientErrors.name && <span className={styles.errMsg}>{clientErrors.name}</span>}
          <ValidationError field="name" errors={state.errors} className={styles.errMsg} />
        </div>

        <div className={styles.techField}>
          <span className={styles.techPrompt}>email</span>
          <input className={`${styles.techInput} ${clientErrors.email ? styles.inputErr : ''}`}
            type="email" name="email" placeholder="you@example.com" value={email}
            onChange={e => { setEmail(e.target.value); clear('email'); }} />
          {clientErrors.email && <span className={styles.errMsg}>{clientErrors.email}</span>}
          <ValidationError field="email" errors={state.errors} className={styles.errMsg} />
        </div>

        <div className={styles.techField}>
          <span className={styles.techPrompt}>message</span>
          <textarea className={`${styles.techTextarea} ${clientErrors.message ? styles.inputErr : ''}`}
            name="message" placeholder="// your message... (min 20 characters)"
            value={message} rows={5} maxLength={2000}
            onChange={e => { setMessage(e.target.value); clear('message'); }} />
          <span className={styles.charCount}>{message.length} / 2000</span>
          {clientErrors.message && <span className={styles.errMsg}>{clientErrors.message}</span>}
          <ValidationError field="message" errors={state.errors} className={styles.errMsg} />
        </div>

        {state.errors && !state.succeeded &&
          <div className={styles.errorBanner}>Request failed. Please try again.</div>}

        <button className={styles.techBtn} type="submit" disabled={state.submitting}>
          {state.submitting ? '> sending...' : '> send()'}
        </button>
      </form>
    );
  }

  /* ── Professional ── */
  if (state.succeeded) {
    return <div className={styles.proForm}><div className={styles.successMsg}>Message sent — I&apos;ll get back to you soon!</div></div>;
  }
  return (
    <form className={styles.proForm} onSubmit={handleSubmit} noValidate>
      <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
      <h2 className={styles.proFormTitle}>Send a Message</h2>

      <div className={styles.proField}>
        <label className={styles.proLabel}>Your Name</label>
        <input className={`${styles.proInput} ${clientErrors.name ? styles.inputErr : ''}`}
          type="text" name="name" placeholder="Jane Smith" value={name} maxLength={60}
          onChange={e => { setName(e.target.value); clear('name'); }} />
        {clientErrors.name && <span className={styles.errMsg}>{clientErrors.name}</span>}
        <ValidationError field="name" errors={state.errors} className={styles.errMsg} />
      </div>

      <div className={styles.proField}>
        <label className={styles.proLabel}>Your Email</label>
        <input className={`${styles.proInput} ${clientErrors.email ? styles.inputErr : ''}`}
          type="email" name="email" placeholder="jane@example.com" value={email}
          onChange={e => { setEmail(e.target.value); clear('email'); }} />
        {clientErrors.email && <span className={styles.errMsg}>{clientErrors.email}</span>}
        <ValidationError field="email" errors={state.errors} className={styles.errMsg} />
      </div>

      <div className={styles.proField}>
        <label className={styles.proLabel}>Message</label>
        <textarea className={`${styles.proTextarea} ${clientErrors.message ? styles.inputErr : ''}`}
          name="message" placeholder="What would you like to say? (min 20 characters)"
          value={message} rows={5} maxLength={2000}
          onChange={e => { setMessage(e.target.value); clear('message'); }} />
        <span className={styles.charCount}>{message.length} / 2000</span>
        {clientErrors.message && <span className={styles.errMsg}>{clientErrors.message}</span>}
        <ValidationError field="message" errors={state.errors} className={styles.errMsg} />
      </div>

      {state.errors && !state.succeeded &&
        <div className={styles.errorBanner}>Something went wrong. Please try again.</div>}

      <button className={styles.proBtn} type="submit" disabled={state.submitting}>
        {state.submitting ? 'Sending...' : 'Send Message →'}
      </button>
    </form>
  );
}
