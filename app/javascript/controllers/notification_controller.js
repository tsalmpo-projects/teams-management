import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"

export default class extends Controller {
  static values = { userId: Number }
  static targets = ["container", "badge"]

  connect() {
    this.consumer = createConsumer()
    this.subscription = this.consumer.subscriptions.create(
      { channel: "NotificationChannel" },
      {
        received: (data) => this.handleNotification(data)
      }
    )
  }

  disconnect() {
    if (this.subscription) this.subscription.unsubscribe()
    if (this.consumer) this.consumer.disconnect()
  }

  handleNotification(data) {
    if (data.type === "new_message") {
      this.showToast(`${data.sender_name}: ${data.content}`, data.conversation_url)
      this.incrementBadge()
    } else if (data.type === "join_request") {
      this.showToast(`${data.sender_name} wants to join "${data.assignment_title}"`, data.assignment_url)
    }
  }

  incrementBadge() {
    if (!this.hasBadgeTarget) return
    const badge = this.badgeTarget
    const current = parseInt(badge.textContent) || 0
    badge.textContent = current + 1
    badge.style.display = ""
  }

  showToast(message, url) {
    const container = this.containerTarget

    const toast = document.createElement("div")
    toast.className = "flex items-start gap-3 bg-white border border-gray-200 shadow-lg rounded-xl p-4 max-w-sm cursor-pointer transform transition-all duration-300 translate-x-full opacity-0 hover:bg-gray-50"

    toast.innerHTML = `
      <div class="shrink-0">
        <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
      </div>
      <p class="text-sm text-gray-700 flex-1">${this.escapeHtml(message)}</p>
      <button class="shrink-0 text-gray-400 hover:text-gray-600" data-action="click->notification#dismissToast">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    `

    if (url) {
      toast.addEventListener("click", (e) => {
        if (!e.target.closest("button")) {
          window.Turbo.visit(url)
        }
      })
    }

    container.appendChild(toast)

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove("translate-x-full", "opacity-0")
    })

    // Auto-dismiss after 5 seconds
    setTimeout(() => this.removeToast(toast), 5000)
  }

  dismissToast(event) {
    const toast = event.target.closest("[class*='max-w-sm']") || event.target.parentElement.parentElement
    this.removeToast(toast)
  }

  removeToast(toast) {
    if (!toast || !toast.parentNode) return
    toast.classList.add("translate-x-full", "opacity-0")
    setTimeout(() => toast.remove(), 300)
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }
}
