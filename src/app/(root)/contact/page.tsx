export const metadata = {
  title: "Contact Us - Dzaky shoes shop",
  description: "Get in touch with us",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-heading-2 text-dark-900 mb-6">Contact Us</h1>
        <p className="text-body text-dark-700 mb-8">
          Have a question or need help with your order? Our team is here for you!
        </p>
        
        <div className="bg-light-300 p-8 rounded-xl text-left shadow-sm">
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-body-medium text-dark-900 mb-2">Name</label>
              <input type="text" id="name" className="w-full rounded-md border border-light-400 p-3 focus:outline-none focus:ring-2 focus:ring-dark-500" placeholder="Your name" />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-body-medium text-dark-900 mb-2">Email</label>
              <input type="email" id="email" className="w-full rounded-md border border-light-400 p-3 focus:outline-none focus:ring-2 focus:ring-dark-500" placeholder="your@email.com" />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-body-medium text-dark-900 mb-2">Message</label>
              <textarea id="message" rows={4} className="w-full rounded-md border border-light-400 p-3 focus:outline-none focus:ring-2 focus:ring-dark-500" placeholder="How can we help you?"></textarea>
            </div>
            
            <button type="button" onClick={() => alert("Fitur pesan sedang dalam pengembangan!")} className="w-full rounded-md bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition-colors hover:bg-dark-700">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
