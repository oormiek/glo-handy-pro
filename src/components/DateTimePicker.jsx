import { useEffect, useMemo, useState } from 'react';

const pad = (value) => String(value).padStart(2, '0');

function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(value) {
  const parsed = parseDate(value);
  return parsed
    ? parsed.toLocaleDateString('en-CA', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';
}

function formatTime(value) {
  if (!value) return '';
  const [hour, minute] = value.split(':').map(Number);
  return `${hour % 12 || 12}:${pad(minute)} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function minutesFromTime(value) {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

function isTimeInPast(selectedDate, selectedTime, now = new Date()) {
  return selectedDate === dateKey(now) &&
    minutesFromTime(selectedTime) < now.getHours() * 60 + now.getMinutes();
}

function DateTimePicker({ date, time, onDateChange, onTimeChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(date || '');
  const [draftHour, setDraftHour] = useState('4');
  const [draftMinute, setDraftMinute] = useState('00');
  const [draftPeriod, setDraftPeriod] = useState('PM');
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initial = parseDate(date) || new Date();
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });
  const [validationError, setValidationError] = useState('');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!isOpen) return undefined;
    const updateNow = () => setNow(new Date());
    updateNow();
    const timer = window.setInterval(updateNow, 10000);
    return () => window.clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setValidationError('');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const draftTime = useMemo(() => {
    const hour12 = Number(draftHour);
    const hour24 = (hour12 % 12) + (draftPeriod === 'PM' ? 12 : 0);
    return `${pad(hour24)}:${draftMinute}`;
  }, [draftHour, draftMinute, draftPeriod]);

  const today = dateKey(now);
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const calendarCells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1)
  ];
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const canGoPrevious = visibleMonth > currentMonth;

  function openPicker() {
    let initialDate = date || today;
    let initialTime = time || '';

    if (!initialTime) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const rounded = Math.ceil(currentMinutes / 5) * 5;
      if (rounded >= 1440) {
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        initialDate = date || dateKey(tomorrow);
        initialTime = '00:00';
      } else {
        initialTime = `${pad(Math.floor(rounded / 60))}:${pad(rounded % 60)}`;
      }
    }

    const initial = parseDate(initialDate) || now;
    setDraftDate(initialDate);
    setVisibleMonth(new Date(initial.getFullYear(), initial.getMonth(), 1));

    const [hour, minute] = initialTime.split(':').map(Number);
    setDraftHour(String(hour % 12 || 12));
    setDraftMinute(pad(minute));
    setDraftPeriod(hour >= 12 ? 'PM' : 'AM');
    setValidationError('');
    setIsOpen(true);
  }

  function chooseDate(day) {
    if (!day) return;
    const value = dateKey(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day));
    if (value < today) return;
    setDraftDate(value);
    setValidationError('');
  }

  function changeMonth(offset) {
    const next = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
    if (next < currentMonth) return;
    setVisibleMonth(next);
  }

  function timeFor(hour, minute, period) {
    const hour24 = (Number(hour) % 12) + (period === 'PM' ? 12 : 0);
    return `${pad(hour24)}:${pad(Number(minute))}`;
  }

  function isOptionDisabled(hour, minute, period) {
    return isTimeInPast(draftDate, timeFor(hour, minute, period), now);
  }

  function confirmSelection() {
    const currentNow = new Date();
    const currentToday = dateKey(currentNow);

    if (!draftDate) {
      setValidationError('Please select a visit date.');
      return;
    }
    if (draftDate < currentToday) {
      setValidationError('Please select today or a future date.');
      return;
    }
    if (isTimeInPast(draftDate, draftTime, currentNow)) {
      setValidationError('That time has passed. Please choose the current minute or a later time.');
      setNow(currentNow);
      return;
    }

    onDateChange(draftDate);
    onTimeChange(draftTime);
    setValidationError('');
    setIsOpen(false);
  }

  const monthLabel = visibleMonth.toLocaleDateString('en-CA', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="glo-date-picker">
      <button
        type="button"
        className={`glo-date-picker-trigger ${date && time ? 'has-value' : ''}`}
        onClick={openPicker}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="glo-date-picker-trigger-icon" aria-hidden="true">▦</span>
        <span className="glo-date-picker-trigger-copy">
          <strong>{date && time ? `${formatDate(date)} · ${formatTime(time)}` : 'Choose date & time'}</strong>
          <small>{date && time ? 'Click to change your preferred visit' : 'Select your preferred visit date and time'}</small>
        </span>
        <span className="glo-date-picker-trigger-arrow" aria-hidden="true">›</span>
      </button>

      {isOpen && (
        <div
          className="glo-date-picker-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
              setValidationError('');
            }
          }}
        >
          <section
            className="glo-date-picker-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="glo-date-picker-title"
          >
            <header className="glo-date-picker-header">
              <div>
                <span className="glo-date-picker-eyebrow">GLO HANDY PRO</span>
                <h2 id="glo-date-picker-title">Choose your visit time</h2>
                <p>Choose a preference. We’ll contact you to confirm availability.</p>
              </div>
              <button
                type="button"
                className="glo-date-picker-close"
                aria-label="Close date and time picker"
                onClick={() => {
                  setIsOpen(false);
                  setValidationError('');
                }}
              >×</button>
            </header>

            <div className="glo-date-picker-body">
              <section className="glo-date-calendar" aria-label="Choose a date">
                <div className="glo-date-month">
                  <button
                    type="button"
                    aria-label="Previous month"
                    disabled={!canGoPrevious}
                    onClick={() => changeMonth(-1)}
                  >‹</button>
                  <h3>{monthLabel}</h3>
                  <button type="button" aria-label="Next month" onClick={() => changeMonth(1)}>›</button>
                </div>
                <div className="glo-date-grid">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <span className="glo-date-weekday" key={`${day}-${index}`}>{day}</span>
                  ))}
                  {calendarCells.map((day, index) => {
                    if (!day) return <span className="glo-date-empty" key={`empty-${index}`} />;
                    const value = dateKey(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day));
                    const disabled = value < today;
                    const selected = value === draftDate;
                    return (
                      <button
                        type="button"
                        key={value}
                        className={`glo-date-day ${selected ? 'selected' : ''} ${value === today ? 'today' : ''}`}
                        disabled={disabled}
                        onClick={() => chooseDate(day)}
                        aria-pressed={selected}
                        aria-label={`${value}${value === today ? ', today' : ''}`}
                      >{day}</button>
                    );
                  })}
                </div>
                <p className="glo-date-helper">Past dates are unavailable.</p>
              </section>

              <section className="glo-date-time" aria-label="Choose a time">
                <h3>Preferred time</h3>
                <p className="glo-date-time-summary">
                  {draftDate ? formatDate(draftDate) : 'Select a date first'}
                </p>
                <div className="glo-time-preview">
                  <span aria-hidden="true">◷</span>
                  <strong>{formatTime(draftTime)}</strong>
                </div>
                <div className="glo-time-fields">
                  <label>
                    Hour
                    <select
                      value={draftHour}
                      onChange={(event) => {
                        setDraftHour(event.target.value);
                        setValidationError('');
                      }}
                    >
                      {Array.from({ length: 12 }, (_, index) => String(index + 1)).map((hour) => (
                        <option key={hour} value={hour}>{hour}</option>
                      ))}
                    </select>
                  </label>
                  <span className="glo-time-colon">:</span>
                  <label>
                    Minute
                    <select
                      value={draftMinute}
                      onChange={(event) => {
                        setDraftMinute(event.target.value);
                        setValidationError('');
                      }}
                    >
                      {Array.from({ length: 60 }, (_, index) => pad(index)).map((minute) => (
                        <option
                          key={minute}
                          value={minute}
                          disabled={isOptionDisabled(draftHour, minute, draftPeriod)}
                        >{minute}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="glo-time-period" aria-label="AM or PM">
                  {['AM', 'PM'].map((period) => (
                    <button
                      key={period}
                      type="button"
                      className={draftPeriod === period ? 'active' : ''}
                      disabled={isOptionDisabled(draftHour, draftMinute, period)}
                      aria-pressed={draftPeriod === period}
                      onClick={() => {
                        setDraftPeriod(period);
                        setValidationError('');
                      }}
                    >{period}</button>
                  ))}
                </div>
              </section>
            </div>

            {validationError && <p className="glo-date-error" role="alert">{validationError}</p>}

            <footer className="glo-date-picker-footer">
              <p>
                {draftDate ? <><strong>{formatDate(draftDate)}</strong> · <strong>{formatTime(draftTime)}</strong></> : 'Choose a date and time'}
              </p>
              <div className="glo-date-picker-actions">
                <button
                  type="button"
                  className="glo-date-cancel"
                  onClick={() => {
                    setIsOpen(false);
                    setValidationError('');
                  }}
                >Cancel</button>
                <button type="button" className="glo-date-confirm" onClick={confirmSelection}>
                  Confirm selection
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

export default DateTimePicker;
