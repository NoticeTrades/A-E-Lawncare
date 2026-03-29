function bindQuoteForm(form, formStatus) {
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const supabase = getSupabaseClient();
    if (!supabase) {
      if (formStatus) {
        formStatus.textContent = "Missing Supabase setup. Add keys in supabase-config.js.";
      }
      return;
    }

    const formData = new FormData(form);
    const quote = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      street_address: String(formData.get("street_address") || "").trim(),
      state: String(formData.get("state") || "").trim(),
      city: String(formData.get("city") || "").trim(),
      zip_code: String(formData.get("zip_code") || "").trim(),
      customer_type: String(formData.get("customer_type") || "").trim(),
      service: String(formData.get("service") || "").trim(),
      message: String(formData.get("message") || "").trim()
    };

    const { error } = await supabase.from("quotes").insert([quote]);
    if (error) {
      if (formStatus) {
        let msg = `Submit failed: ${error.message}`;
        if (/column|schema|does not exist/i.test(error.message)) {
          msg +=
            " If you just added new form fields, run the migration SQL in SUPABASE_SETUP.md (section “Add quote form columns”).";
        }
        formStatus.textContent = msg;
      }
      return;
    }

    form.reset();

    if (formStatus) {
      formStatus.textContent = "Thanks! Your quote request was submitted successfully.";
    }
  });
}

bindQuoteForm(document.getElementById("quote-form"), document.getElementById("form-status"));
bindQuoteForm(document.getElementById("quote-form-modal"), document.getElementById("quote-modal-status"));
