import { useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const STATUSES = ["NEW", "IN_PROGRESS", "COMPLETED"];

const SERVICE_LABELS = {
  furniture: "Furniture Assembly",
  "tv-mounting": "TV & Wall Mounting",
  faucet: "Faucet Installation",
  repairs: "Minor Repairs",
  hanging: "Hanging & Installing",
  drywall: "Drywall Patching",
  carpentry: "Light Carpentry",
  doors: "Door & Cabinet Adjustments",
  moving: "Loading & Unloading",
  others: "Other Services",
};

const VALID_SERVICES = Object.keys(SERVICE_LABELS);

const formatStatus = (status = "") => status.replaceAll("_", " ");

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(Number(amount ?? 0));

const formatSubmittedAt = (submittedAt) => {
  if (!submittedAt) return "Not available";
  const date = new Date(submittedAt);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatCompletedDate = (dateString) => {
  if (!dateString) return "Not available";
  const [year, month, day] = String(dateString).slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return "Not available";
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getLocalDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatAppointmentDate = (dateString) => {
  if (!dateString) return "Not specified";
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatAppointmentTime = (timeString) => {
  if (!timeString) return "Not specified";
  const [hours, minutes] = timeString.split(":");
  if (hours === undefined || minutes === undefined) return timeString;
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  if (Number.isNaN(date.getTime())) return timeString;
  return date.toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [quotes, setQuotes] = useState([]);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");

  const [completionQuoteId, setCompletionQuoteId] = useState(null);
  const [completionDrafts, setCompletionDrafts] = useState({});
  const [appointmentQuoteId, setAppointmentQuoteId] = useState(null);
  const [appointmentDrafts, setAppointmentDrafts] = useState({});

  const today = getLocalDateInputValue(new Date());
  const firstDayOfMonth = getLocalDateInputValue(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [activeTab, setActiveTab] = useState("quotes");
  const [reportFromDate, setReportFromDate] = useState(firstDayOfMonth);
  const [reportToDate, setReportToDate] = useState(today);

  function authHeaders() {
    return {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
      "Content-Type": "application/json",
    };
  }

  async function loadQuotes(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/quotes`, {
        headers: authHeaders(),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Invalid credentials or access denied.");
      }
      if (!response.ok) throw new Error("Unable to load quote requests.");

      const data = await response.json();
      setQuotes(data);
      setAuthenticated(true);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the backend. Check that it is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, newStatus) {
    const previousQuote = quotes.find((quote) => quote.id === id);
    if (!previousQuote || previousQuote.status === newStatus) return;

    // Completing a task requires hours and rate first.
    if (newStatus === "COMPLETED") {
      setCompletionDrafts((current) => ({
        ...current,
        [id]: {
          hoursWorked: previousQuote.hoursWorked ?? "",
          hourlyRate: previousQuote.hourlyRate ?? "",
        },
      }));
      setCompletionQuoteId(id);
      setError("");
      setNotice("");
      return;
    }

    setError("");
    setNotice("");
    setSavingId(id);

    try {
      const response = await fetch(`${API_URL}/api/admin/quotes/${id}/status`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Authentication failed or access denied.");
      }
      if (!response.ok) throw new Error("Could not update this quote's status.");

      const updatedQuote = await response.json();
      setQuotes((current) =>
        current.map((quote) =>
          quote.id === id ? { ...quote, ...updatedQuote } : quote
        )
      );
      setNotice(`Request #${id} updated to ${formatStatus(updatedQuote.status)}.`);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the backend. Your change was not confirmed."
          : err.message
      );
    } finally {
      setSavingId(null);
    }
  }

  function openCompletionForm(quote) {
    setError("");
    setNotice("");
    setCompletionDrafts((current) => ({
      ...current,
      [quote.id]: {
        hoursWorked: quote.hoursWorked ?? "",
        hourlyRate: quote.hourlyRate ?? "",
      },
    }));
    setCompletionQuoteId(quote.id);
  }

  function updateCompletionDraft(id, field, value) {
    setCompletionDrafts((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? { hoursWorked: "", hourlyRate: "" }),
        [field]: value,
      },
    }));
  }

  async function saveCompletion(event, id) {
    event.preventDefault();
    const draft = completionDrafts[id];
    const hours = Number(draft?.hoursWorked);
    const rate = Number(draft?.hourlyRate);

    if (!Number.isFinite(hours) || hours <= 0) {
      setError("Enter hours worked greater than zero.");
      return;
    }
    if (!Number.isFinite(rate) || rate < 0) {
      setError("Enter a valid hourly rate of zero or more.");
      return;
    }

    setError("");
    setNotice("");
    setSavingId(id);

    try {
      const response = await fetch(`${API_URL}/api/admin/quotes/${id}/complete`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          hoursWorked: draft.hoursWorked,
          hourlyRate: draft.hourlyRate,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Authentication failed or access denied.");
      }
      if (!response.ok) {
        let message = "Could not save the completion details.";
        try {
          const body = await response.json();
          if (body.message) message = body.message;
          else if (body.errors?.length) {
            message = body.errors.map((item) => item.defaultMessage).join(" ");
          }
        } catch {
          // Keep the default error if the response body is not JSON.
        }
        throw new Error(message);
      }

      const updatedQuote = await response.json();
      setQuotes((current) =>
        current.map((quote) =>
          quote.id === id ? { ...quote, ...updatedQuote } : quote
        )
      );
      setCompletionQuoteId(null);
      setNotice(
        `Request #${id} marked completed. Total earned: ${formatCurrency(updatedQuote.totalEarned)}.`
      );
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the backend. Your completion details were not confirmed."
          : err.message
      );
    } finally {
      setSavingId(null);
    }
  }

  function cancelCompletion() {
    setCompletionQuoteId(null);
    setError("");
  }

  function logout() {
    setUsername("");
    setPassword("");
    setQuotes([]);
    setAuthenticated(false);
    setSearch("");
    setStatusFilter("ALL");
    setServiceFilter("ALL");
    setError("");
    setNotice("");
    setCompletionQuoteId(null);
    setCompletionDrafts({});
    setAppointmentQuoteId(null);
    setAppointmentDrafts({});
    setActiveTab("quotes");
  }

  function openAppointmentForm(quote) {
    if (quote.status === "COMPLETED") return;
    setError("");
    setNotice("");
    setAppointmentDrafts((current) => ({
      ...current,
      [quote.id]: {
        preferredDate: quote.preferredDate ?? "",
        preferredTime: quote.preferredTime ? quote.preferredTime.slice(0, 5) : "",
      },
    }));
    setAppointmentQuoteId(quote.id);
  }

  function updateAppointmentDraft(id, field, value) {
    setAppointmentDrafts((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? { preferredDate: "", preferredTime: "" }),
        [field]: value,
      },
    }));
  }

  async function saveAppointment(event, id) {
    event.preventDefault();
    const draft = appointmentDrafts[id];
    setError("");
    setNotice("");
    setSavingId(id);

    try {
      const response = await fetch(`${API_URL}/api/admin/quotes/${id}/appointment`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          preferredDate: draft?.preferredDate || null,
          preferredTime: draft?.preferredTime || null,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Authentication failed or access denied.");
      }
      if (!response.ok) {
        throw new Error("Could not update the preferred appointment.");
      }

      const updatedQuote = await response.json();
      setQuotes((current) =>
        current.map((quote) =>
          quote.id === id ? { ...quote, ...updatedQuote } : quote
        )
      );
      setAppointmentQuoteId(null);
      setNotice(`Preferred appointment updated for Request #${id}.`);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the backend. Your appointment change was not confirmed."
          : err.message
      );
    } finally {
      setSavingId(null);
    }
  }

  function cancelAppointmentEdit() {
    setAppointmentQuoteId(null);
    setError("");
  }

  const services = useMemo(
    () => VALID_SERVICES.filter((service) => quotes.some((quote) => quote.service === service)),
    [quotes]
  );

  const counts = useMemo(
    () => ({
      total: quotes.length,
      new: quotes.filter((quote) => quote.status === "NEW").length,
      inProgress: quotes.filter((quote) => quote.status === "IN_PROGRESS").length,
      completed: quotes.filter((quote) => quote.status === "COMPLETED").length,
    }),
    [quotes]
  );

  const filteredQuotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return quotes
      .filter((quote) => {
        const matchesSearch = [
          quote.id,
          quote.name,
          quote.email,
          quote.phone,
          quote.service,
          quote.message,
          quote.preferredDate,
          quote.preferredTime,
          quote.submittedAt,
        ].some((value) => String(value ?? "").toLowerCase().includes(term));
        const matchesStatus = statusFilter === "ALL" || quote.status === statusFilter;
        const matchesService = serviceFilter === "ALL" || quote.service === serviceFilter;
        return matchesSearch && matchesStatus && matchesService;
      })
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [quotes, search, statusFilter, serviceFilter]);

  const reportQuotes = useMemo(() => {
    if (!reportFromDate || !reportToDate || reportFromDate > reportToDate) return [];
    return quotes
      .filter((quote) => {
        if (quote.status !== "COMPLETED" || !quote.preferredDate) return false;
        const completedDate = String(quote.preferredDate).slice(0, 10);
        return completedDate >= reportFromDate && completedDate <= reportToDate;
      })
      .sort((a, b) => String(b.preferredDate).localeCompare(String(a.preferredDate)));
  }, [quotes, reportFromDate, reportToDate]);

  const reportTotalEarned = useMemo(
    () => reportQuotes.reduce((total, quote) => total + Number(quote.totalEarned ?? 0), 0),
    [reportQuotes]
  );

  if (!authenticated) {
    return (
      <main className="admin-page">
        <section className="admin-panel admin-login">
          <h1>GLO Handy Pro</h1>
          <h2>Admin Login</h2>
          <p>Sign in to view customer quote requests.</p>
          <form onSubmit={loadQuotes}>
            <label htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />

            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            {error && <p className="admin-error" role="alert">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <h1>GLO Handy Pro</h1>
          <p>Quote Management</p>
        </div>
        <button onClick={logout}>Log out</button>
      </header>

      <section className="admin-panel">
        <h2>Dashboard Overview</h2>
        <div className="admin-stats">
          <article className="stat-card">
            <span>Total Requests</span>
            <strong>{counts.total}</strong>
          </article>
          <article className="stat-card stat-new">
            <span>New</span>
            <strong>{counts.new}</strong>
          </article>
          <article className="stat-card stat-progress">
            <span>In Progress</span>
            <strong>{counts.inProgress}</strong>
          </article>
          <article className="stat-card stat-completed">
            <span>Completed</span>
            <strong>{counts.completed}</strong>
          </article>
        </div>

        <div className="admin-tabs">
          <button
            type="button"
            className={activeTab === "quotes" ? "active" : ""}
            onClick={() => setActiveTab("quotes")}
          >
            Quote Requests
          </button>
          <button
            type="button"
            className={activeTab === "reports" ? "active" : ""}
            onClick={() => setActiveTab("reports")}
          >
            Earnings &amp; Job Reports
          </button>

        </div>

        {error && <p className="admin-error" role="alert">{error}</p>}
        {notice && <p className="admin-notice" role="status">{notice}</p>}

        {activeTab === "quotes" && (
          <>
            <h2>Customer Quote Requests</h2>
            <div className="admin-filters">
              <label>
                Search requests
                <input
                  type="search"
                  placeholder="Name, email, phone, ID..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <label>
                Filter by status
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="ALL">All statuses</option>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>{formatStatus(status)}</option>
                  ))}
                </select>
              </label>

              <label>
                Filter by service
                <select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)}>
                  <option value="ALL">All services</option>
                  {services.map((service) => (
                    <option key={service} value={service}>{SERVICE_LABELS[service]}</option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setServiceFilter("ALL");
                }}
              >
                Clear filters
              </button>
            </div>

            <p className="admin-result-count">
              Showing {filteredQuotes.length} of {quotes.length} requests
            </p>

            {filteredQuotes.length === 0 ? (
              <p>No matching quote requests found.</p>
            ) : (
              <div className="quote-list">
                {filteredQuotes.map((quote) => {
                  const draft = completionDrafts[quote.id] ?? {
                    hoursWorked: quote.hoursWorked ?? "",
                    hourlyRate: quote.hourlyRate ?? "",
                  };
                  const hoursNumber = Number(draft.hoursWorked);
                  const rateNumber = Number(draft.hourlyRate);
                  const hasPreview =
                    draft.hoursWorked !== "" &&
                    draft.hourlyRate !== "" &&
                    Number.isFinite(hoursNumber) &&
                    hoursNumber > 0 &&
                    Number.isFinite(rateNumber) &&
                    rateNumber >= 0;
                  const previewTotal = hasPreview ? hoursNumber * rateNumber : 0;

                  return (
                    <article className="quote-card" key={quote.id}>
                      <div className="quote-card-heading">
                        <h3>Request #{quote.id} — {quote.name}</h3>
                        <span className={`status-badge status-${String(quote.status ?? "").toLowerCase()}`}>
                          {formatStatus(quote.status)}
                        </span>
                      </div>

                      <p><strong>Service:</strong> {SERVICE_LABELS[quote.service] || quote.service}</p>
                      <p><strong>Email:</strong> {quote.email}</p>
                      <p><strong>Phone:</strong> {quote.phone}</p>
                      <p><strong>Submitted On:</strong> {formatSubmittedAt(quote.submittedAt)}</p>

                      <div className="appointment-details">
                        <h4>Preferred Appointment</h4>
                        {appointmentQuoteId === quote.id && quote.status !== "COMPLETED" ? (
                          <form onSubmit={(event) => saveAppointment(event, quote.id)}>
                            <label htmlFor={`appointment-date-${quote.id}`}>Preferred date</label>
                            <input
                              id={`appointment-date-${quote.id}`}
                              type="date"
                              value={appointmentDrafts[quote.id]?.preferredDate ?? ""}
                              onChange={(event) => updateAppointmentDraft(quote.id, "preferredDate", event.target.value)}
                              disabled={savingId === quote.id}
                            />

                            <label htmlFor={`appointment-time-${quote.id}`}>Preferred time</label>
                            <input
                              id={`appointment-time-${quote.id}`}
                              type="time"
                              value={appointmentDrafts[quote.id]?.preferredTime ?? ""}
                              onChange={(event) => updateAppointmentDraft(quote.id, "preferredTime", event.target.value)}
                              disabled={savingId === quote.id}
                            />

                            <button type="submit" disabled={savingId === quote.id}>
                              {savingId === quote.id ? "Saving..." : "Save changes"}
                            </button>
                            <button type="button" onClick={cancelAppointmentEdit} disabled={savingId === quote.id}>
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <>
                            <p><strong>Date:</strong> {formatAppointmentDate(quote.preferredDate)}</p>
                            <p><strong>Time:</strong> {formatAppointmentTime(quote.preferredTime)}</p>
                            {quote.status === "COMPLETED" ? (
                              <p><strong>Completion date/time:</strong> Locked after completion</p>
                            ) : (
                              <button type="button" onClick={() => openAppointmentForm(quote)} disabled={savingId === quote.id}>
                                Edit appointment
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      <p><strong>Message:</strong> {quote.message}</p>

                      {quote.status === "COMPLETED" && (
                        <div className="appointment-details">
                          <h4>Work Earnings</h4>
                          <p><strong>Hours worked:</strong> {quote.hoursWorked ?? "Not recorded"}</p>
                          <p><strong>Hourly rate:</strong> {quote.hourlyRate != null ? formatCurrency(quote.hourlyRate) : "Not recorded"}</p>
                          <p><strong>Total earned:</strong> {quote.totalEarned != null ? formatCurrency(quote.totalEarned) : "Not recorded"}</p>
                          <button type="button" onClick={() => openCompletionForm(quote)} disabled={savingId === quote.id}>
                            Edit earnings
                          </button>
                        </div>
                      )}

                      <label className="status-control" htmlFor={`status-${quote.id}`}>Update status</label>
                      <select
                        id={`status-${quote.id}`}
                        value={quote.status}
                        disabled={savingId === quote.id}
                        onChange={(event) => updateStatus(quote.id, event.target.value)}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>{formatStatus(status)}</option>
                        ))}
                      </select>

                      {completionQuoteId === quote.id && (
                        <form className="appointment-details" onSubmit={(event) => saveCompletion(event, quote.id)}>
                          <h4>{quote.status === "COMPLETED" ? "Edit Work Earnings" : "Complete Task & Record Earnings"}</h4>
                          <p>Enter the time spent and hourly rate. The total is calculated automatically.</p>

                          <label htmlFor={`hours-${quote.id}`}>Hours worked</label>
                          <input
                            id={`hours-${quote.id}`}
                            type="number"
                            min="0.01"
                            max="99999"
                            step="0.01"
                            required
                            value={draft.hoursWorked}
                            onChange={(event) => updateCompletionDraft(quote.id, "hoursWorked", event.target.value)}
                            placeholder="e.g. 2.5"
                          />

                          <label htmlFor={`rate-${quote.id}`}>Hourly rate (CAD)</label>
                          <input
                            id={`rate-${quote.id}`}
                            type="number"
                            min="0"
                            max="99999999.99"
                            step="0.01"
                            required
                            value={draft.hourlyRate}
                            onChange={(event) => updateCompletionDraft(quote.id, "hourlyRate", event.target.value)}
                            placeholder="e.g. 40.00"
                          />

                          <p><strong>Total earned:</strong> {hasPreview ? formatCurrency(previewTotal) : formatCurrency(0)}</p>
                          <button type="submit" disabled={savingId === quote.id}>
                            {savingId === quote.id ? "Saving..." : "Save completion"}
                          </button>
                          <button type="button" onClick={cancelCompletion} disabled={savingId === quote.id}>
                            Cancel
                          </button>
                        </form>
                      )}

                      {savingId === quote.id && <span> Saving...</span>}
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === "reports" && (
          <div className="earnings-report">
            <h2>Earnings &amp; Job Reports</h2>

            <div className="admin-filters report-date-filters">
              <label>
                From date
                <input
                  type="date"
                  value={reportFromDate}
                  max={reportToDate || undefined}
                  onChange={(event) => setReportFromDate(event.target.value)}
                />
              </label>
              <label>
                To date
                <input
                  type="date"
                  value={reportToDate}
                  min={reportFromDate || undefined}
                  onChange={(event) => setReportToDate(event.target.value)}
                />
              </label>
            </div>

            {reportFromDate > reportToDate && (
              <p className="admin-error" role="alert">The From date must be on or before the To date.</p>
            )}

            <div className="admin-stats">
              <article className="stat-card stat-completed">
                <span>Total earned in selected period</span>
                <strong>{formatCurrency(reportTotalEarned)}</strong>
              </article>
              <article className="stat-card">
                <span>Tasks completed in selected period</span>
                <strong>{reportQuotes.length}</strong>
              </article>
            </div>

            <div className="earnings-report-table-wrapper">
              <table className="earnings-report-table">
                <thead>
                  <tr>
                    <th>Request number</th>
                    <th>Request name</th>
                    <th>Service name</th>
                    <th>Date completed</th>
                    <th>Amount earned</th>
                  </tr>
                </thead>
                <tbody>
                  {reportQuotes.length === 0 ? (
                    <tr>
                      <td colSpan={4}>No completed tasks found for this date range.</td>
                    </tr>
                  ) : (
                    reportQuotes.map((quote) => (
                      <tr key={quote.id}>
                        <td>#{quote.id}</td>
                        <td>{quote.name}</td>
                        <td>{SERVICE_LABELS[quote.service] || quote.service}</td>
                        <td>{formatCompletedDate(quote.preferredDate)}</td>
                        <td>{formatCurrency(quote.totalEarned)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </section>
    </main>
  );
}
