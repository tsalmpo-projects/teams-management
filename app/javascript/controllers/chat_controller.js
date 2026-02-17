import { Controller } from "@hotwired/stimulus";
import { createConsumer } from "@rails/actioncable";

export default class extends Controller {
	static targets = ["messagesContainer", "input", "typingIndicator"];
	static values = {
		conversationId: String,
		currentUserId: Number,
		currentUserName: String,
		currentUserInitials: String,
		sendUrl: String,
		csrfToken: String,
		defaultIndicatorText: { type: String, default: "" },
		groupChat: { type: Boolean, default: false },
		recipientId: { type: Number, default: 0 },
		recipientName: { type: String, default: "" },
		recipientInitials: { type: String, default: "" },
		conversationUrl: { type: String, default: "" },
	};

	connect() {
		this.consumer = createConsumer();
		this.typingTimeout = null;
		this.isTyping = false;

		this.subscription = this.consumer.subscriptions.create(
			{
				channel: "ConversationChannel",
				conversation_id: this.conversationIdValue,
			},
			{
				received: (data) => this.handleReceived(data),
			},
		);

		this.scrollToBottom();
	}

	disconnect() {
		if (this.subscription) this.subscription.unsubscribe();
		if (this.consumer) this.consumer.disconnect();
		if (this.typingTimeout) clearTimeout(this.typingTimeout);
	}

	handleReceived(data) {
		if (data.type === "message") {
			if (data.sender_id !== this.currentUserIdValue) {
				this.appendMessage(data, false);
				this.markAsRead(data.id);
			}
			this.clearTyping();
		} else if (data.type === "typing") {
			if (data.user_id !== this.currentUserIdValue) {
				if (data.typing) {
					this.showTyping(data.user_name);
				} else {
					this.clearTyping();
				}
			}
		} else if (data.type === "read") {
			this.markMessageAsReadInUI(data.message_id);
		} else if (data.type === "messages_read") {
			(data.message_ids || []).forEach((id) => {
				this.markMessageAsReadInUI(id);
			});
		}
	}

	markMessageAsReadInUI(messageId) {
		const el = this.messagesContainerTarget.querySelector(
			`[data-message-id="${messageId}"]`,
		);
		if (!el) return;
		const timeEl = el.querySelector(".read-receipt");
		if (timeEl && !timeEl.querySelector(".read-check")) {
			const check = document.createElement("span");
			check.className = "read-check text-blue-500 ml-0.5";
			check.innerHTML = "&#10003;&#10003;";
			timeEl.appendChild(check);
		}
	}

	appendMessage(data, isMine) {
		const container = this.messagesContainerTarget;
		const wrapper = document.createElement("div");
		wrapper.classList.add("flex", "items-end", "gap-2");
		wrapper.classList.add(isMine ? "justify-end" : "justify-start");
		if (data.id) wrapper.dataset.messageId = data.id;
		if (isMine) wrapper.dataset.mine = "true";

		let html = "";
		if (!isMine) {
			if (data.sender_name) {
				html += `<div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700 shrink-0" title="${this.escapeHtml(data.sender_name)}">${data.sender_initials}</div>`;
			} else {
				html += `<div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700 shrink-0">${data.sender_initials}</div>`;
			}
		}
		html += `<div class="max-w-md">`;
		if (!isMine && this.groupChatValue && data.sender_name) {
			html += `<p class="text-[11px] font-medium text-gray-500 mb-0.5">${this.escapeHtml(data.sender_name)}</p>`;
		}
		html += `<div class="rounded-2xl px-4 py-2 text-sm ${isMine ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"}">${this.escapeHtml(data.content)}</div>
      <p class="text-xs text-gray-400 mt-1 ${isMine ? "text-right" : ""} read-receipt">${data.created_at}</p>
    </div>`;

		wrapper.innerHTML = html;
		container.appendChild(wrapper);
		this.scrollToBottom();
	}

	send() {
		const content = this.inputTarget.value.trim();
		if (!content) return;

		const now = new Date();
		const time = now.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
		});

		this.appendMessage(
			{
				content: content,
				sender_initials: this.currentUserInitialsValue,
				created_at: time,
			},
			true,
		);

		this.inputTarget.value = "";
		this.inputTarget.style.height = "auto";
		this.sendTypingStatus(false);

		fetch(this.sendUrlValue, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"X-CSRF-Token": this.csrfTokenValue,
			},
			body: `content=${encodeURIComponent(content)}`,
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.id) {
					const msgs = this.messagesContainerTarget.querySelectorAll(
						'[data-mine="true"]:not([data-message-id])',
					);
					const last = msgs[msgs.length - 1];
					if (last) last.dataset.messageId = data.id;
					this.ensureSidebarEntry(content);
				}
			})
			.catch(() => {});
	}

	onKeydown(event) {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			this.send();
		}
	}

	onTyping() {
		if (!this.isTyping) {
			this.isTyping = true;
			this.sendTypingStatus(true);
		}

		if (this.typingTimeout) clearTimeout(this.typingTimeout);
		this.typingTimeout = setTimeout(() => {
			this.isTyping = false;
			this.sendTypingStatus(false);
		}, 2000);
	}

	sendTypingStatus(typing) {
		if (this.subscription) {
			this.subscription.perform("typing", { typing: typing });
		}
	}

	showTyping(userName) {
		if (this.hasTypingIndicatorTarget) {
			this.typingIndicatorTarget.innerHTML = `
        <span class="inline-flex items-center text-gray-500">
          <span>${this.escapeHtml(userName)} is typing</span>
          <span class="inline-flex ml-1 gap-px items-end h-4">
            <span class="typing-dot w-1 h-1 bg-gray-400 rounded-full" style="animation-delay:0ms"></span>
            <span class="typing-dot w-1 h-1 bg-gray-400 rounded-full" style="animation-delay:150ms"></span>
            <span class="typing-dot w-1 h-1 bg-gray-400 rounded-full" style="animation-delay:300ms"></span>
          </span>
        </span>`;
		}
	}

	clearTyping() {
		if (this.hasTypingIndicatorTarget) {
			if (this.defaultIndicatorTextValue) {
				this.typingIndicatorTarget.textContent = this.defaultIndicatorTextValue;
			} else {
				this.typingIndicatorTarget.innerHTML = "&nbsp;";
			}
		}
	}

	markAsRead(messageId) {
		fetch(`/messages/${messageId}/read`, {
			method: "PATCH",
			headers: {
				"X-CSRF-Token": this.csrfTokenValue,
			},
		});
	}

	scrollToBottom() {
		const container = this.messagesContainerTarget;
		requestAnimationFrame(() => {
			container.scrollTop = container.scrollHeight;
		});
	}

	ensureSidebarEntry(content) {
		if (!this.recipientIdValue || this.groupChatValue) return;

		const url = this.conversationUrlValue;
		// Check if conversation already exists in sidebar
		if (document.querySelector(`a[href="${url}"]`)) return;

		const name = this.escapeHtml(this.recipientNameValue);
		const initials = this.escapeHtml(this.recipientInitialsValue);
		const preview = this.escapeHtml(
			content.length > 40 ? content.substring(0, 37) + "..." : content,
		);

		// Find or create the DM section
		const sidebar = document.querySelector(
			'[data-contacts-target="messagesPanel"]',
		);
		if (!sidebar) return;
		const listContainer = sidebar.querySelector(".overflow-y-auto");
		if (!listContainer) return;

		// Ensure "Direct Messages" header exists
		const dmHeader = listContainer.querySelector("p.uppercase");
		if (!dmHeader) {
			const headerDiv = document.createElement("div");
			headerDiv.className = "px-4 pt-3 pb-1";
			headerDiv.innerHTML =
				'<p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Direct Messages</p>';
			listContainer.prepend(headerDiv);

			// Remove "No conversations yet" placeholder if present
			const placeholder = listContainer.querySelector(".text-center");
			if (placeholder) placeholder.remove();
		}

		// Insert new conversation entry after the DM header
		const entry = document.createElement("a");
		entry.href = url;
		entry.dataset.turboAction = "advance";
		entry.className =
			"flex items-start gap-3 p-4 border-l-4 bg-blue-50 border-l-blue-600 transition-colors";
		entry.innerHTML = `
      <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700 shrink-0">${initials}</div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-semibold text-gray-900 truncate">${name}</p>
        </div>
        <p class="text-xs text-gray-500 truncate">${preview}</p>
      </div>
    `;

		// Insert right after the header div
		const headerParent = dmHeader
			? dmHeader.closest("div.px-4") || dmHeader.parentElement
			: null;
		if (headerParent?.headerParent?.nextSibling) {
			listContainer.insertBefore(entry, headerParent.nextSibling);
		} else {
			listContainer.appendChild(entry);
		}
	}

	escapeHtml(text) {
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}
}
