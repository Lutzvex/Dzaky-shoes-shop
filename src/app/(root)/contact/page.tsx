"use client";

import { useState } from "react";
import { submitContactForm } from "@/lib/actions/contact";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const form = new FormData(e.currentTarget);
      await submitContactForm(form);
      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-heading-2 text-dark-900 mb-4">Contact Us</h1>
          <p className="text-body text-dark-700">
            Have a question or need help with your order? Our team is here for you!
          </p>
        </div>

        {status === "success" ? (
          <div className="rounded-xl border border-light-300 bg-light-200 p-8 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-heading-4 text-dark-900 mb-2">Message Sent!</h2>
            <p className="text-body text-dark-700 mb-6">
              Thank you for reaching out. We will get back to you within 24 hours.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="rounded-md bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition-colors hover:bg-dark-700"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-light-300 bg-light-100 p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="contact-name" className="block text-body-medium text-dark-900 mb-2">Name</label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  required
                  className="w-full rounded-lg border border-light-300 bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-700/50 focus:outline-none focus:ring-2 focus:ring-dark-500 transition"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-body-medium text-dark-900 mb-2">Email</label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  required
                  className="w-full rounded-lg border border-light-300 bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-700/50 focus:outline-none focus:ring-2 focus:ring-dark-500 transition"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-body-medium text-dark-900 mb-2">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  className="w-full rounded-lg border border-light-300 bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-700/50 focus:outline-none focus:ring-2 focus:ring-dark-500 transition resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              {status === "error" && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-body text-red-700">
                  {errorMsg || "Failed to send message. Please try again."}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-lg bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition-colors hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-light-300 p-6 text-center">
            <div className="text-2xl mb-2">📧</div>
            <h3 className="text-body-medium text-dark-900 mb-1">Email</h3>
            <p className="text-body text-dark-700">support@dzakyshoes.com</p>
          </div>
          <div className="rounded-xl border border-light-300 p-6 text-center">
            <div className="text-2xl mb-2">📞</div>
            <h3 className="text-body-medium text-dark-900 mb-1">Phone</h3>
            <p className="text-body text-dark-700">+62 812 3456 7890</p>
          </div>
          <div className="rounded-xl border border-light-300 p-6 text-center">
            <div className="text-2xl mb-2">📍</div>
            <h3 className="text-body-medium text-dark-900 mb-1">Location</h3>
            <p className="text-body text-dark-700">Jakarta, Indonesia</p>
          </div>
        </div>
      </div>
    </main>
  );
}
