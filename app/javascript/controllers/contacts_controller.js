import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
	static targets = [
		"messagesTab",
		"contactsTab",
		"messagesPanel",
		"contactsPanel",
		"searchInput",
		"clearBtn",
		"loadingSpinner",
		"filterPills",
		"resultCount",
		"searchResults",
		"contactsList",
	];
	static values = {
		searchUrl: String,
		contactsUrl: String,
		createUrl: String,
		csrfToken: String,
	};

	connect() {
		this.selectedDepartment = "";
		this.contactsLoaded = false;
		this.searchTimeout = null;
		this.highlightedIndex = -1;
		this.currentResults = [];
		this.addedContactUserIds = new Set();
		this.handleKeydown = this.handleKeydown.bind(this);
		document.addEventListener("keydown", this.handleKeydown);
	}

	disconnect() {
		document.removeEventListener("keydown", this.handleKeydown);
		clearTimeout(this.searchTimeout);
	}

	// --- Tab Switching ---

	showMessages() {
		this.messagesTabTarget.classList.add(
			"text-blue-600",
			"border-blue-600",
			"font-semibold",
		);
		this.messagesTabTarget.classList.remove(
			"text-gray-500",
			"border-transparent",
			"font-medium",
		);
		this.contactsTabTarget.classList.add(
			"text-gray-500",
			"border-transparent",
			"font-medium",
		);
		this.contactsTabTarget.classList.remove(
			"text-blue-600",
			"border-blue-600",
			"font-semibold",
		);
		this.messagesPanelTarget.classList.remove("hidden");
		this.messagesPanelTarget.classList.add("flex");
		this.contactsPanelTarget.classList.add("hidden");
		this.contactsPanelTarget.classList.remove("flex");
	}

	showContacts() {
		this.contactsTabTarget.classList.add(
			"text-blue-600",
			"border-blue-600",
			"font-semibold",
		);
		this.contactsTabTarget.classList.remove(
			"text-gray-500",
			"border-transparent",
			"font-medium",
		);
		this.messagesTabTarget.classList.add(
			"text-gray-500",
			"border-transparent",
			"font-medium",
		);
		this.messagesTabTarget.classList.remove(
			"text-blue-600",
			"border-blue-600",
			"font-semibold",
		);
		this.contactsPanelTarget.classList.remove("hidden");
		this.contactsPanelTarget.classList.add("flex");
		this.messagesPanelTarget.classList.add("hidden");
		this.messagesPanelTarget.classList.remove("flex");

		if (!this.contactsLoaded) {
			this.loadContacts();
		}
	}

	// --- Search ---

	search() {
		clearTimeout(this.searchTimeout);
		const query = this.searchInputTarget.value.trim();

		this.clearBtnTarget.classList.toggle("hidden", query.length === 0);
		this.clearBtnTarget.classList.toggle("flex", query.length > 0);

		if (query.length < 2) {
			this.hideResults();
			return;
		}

		this.showLoading();

		this.searchTimeout = setTimeout(() => {
			let url = `${this.searchUrlValue}?q=${encodeURIComponent(query)}`;
			if (this.selectedDepartment) {
				url += `&department=${encodeURIComponent(this.selectedDepartment)}`;
			}

			fetch(url, { headers: { Accept: "application/json" } })
				.then((r) => r.json())
				.then((users) => {
					// Filter out users already added as contacts during this session
					const filtered = users.filter(
						(u) => !this.addedContactUserIds.has(String(u.id)),
					);
					this.currentResults = filtered;
					this.highlightedIndex = -1;
					this.renderResults(filtered, query);
				})
				.catch(() => {
					this.searchResultsTarget.innerHTML = `
            <div class="p-4 text-sm text-red-500 text-center">Search failed. Please try again.</div>
          `;
					this.searchResultsTarget.classList.remove("hidden");
					this.hideLoading();
				});
		}, 250);
	}

	clearSearch() {
		this.searchInputTarget.value = "";
		this.clearBtnTarget.classList.add("hidden");
		this.clearBtnTarget.classList.remove("flex");
		this.hideResults();
		this.searchInputTarget.focus();
	}

	showLoading() {
		this.loadingSpinnerTarget.classList.remove("hidden");
	}

	hideLoading() {
		this.loadingSpinnerTarget.classList.add("hidden");
	}

	hideResults() {
		this.searchResultsTarget.classList.add("hidden");
		this.searchResultsTarget.innerHTML = "";
		this.resultCountTarget.classList.add("hidden");
		this.hideLoading();
		this.currentResults = [];
		this.highlightedIndex = -1;
	}

	// --- Keyboard Navigation ---

	handleKeydown(event) {
		if (!this.hasSearchInputTarget) return;
		if (document.activeElement !== this.searchInputTarget) return;
		if (this.searchResultsTarget.classList.contains("hidden")) return;

		const items = this.searchResultsTarget.querySelectorAll(
			"[data-result-index]",
		);
		if (items.length === 0) return;

		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				this.highlightedIndex = Math.min(
					this.highlightedIndex + 1,
					items.length - 1,
				);
				this.updateHighlight(items);
				break;
			case "ArrowUp":
				event.preventDefault();
				this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
				this.updateHighlight(items);
				break;
			case "Enter":
				event.preventDefault();
				if (
					this.highlightedIndex >= 0 &&
					this.highlightedIndex < items.length
				) {
					const addBtn = items[this.highlightedIndex].querySelector(
						"[data-action*='addContact']",
					);
					if (addBtn) addBtn.click();
				}
				break;
			case "Escape":
				this.clearSearch();
				this.searchInputTarget.blur();
				break;
		}
	}

	updateHighlight(items) {
		items.forEach((item, i) => {
			if (i === this.highlightedIndex) {
				item.classList.add("bg-blue-50");
				item.classList.remove("hover:bg-gray-50");
				item.scrollIntoView({ block: "nearest" });
			} else {
				item.classList.remove("bg-blue-50");
				item.classList.add("hover:bg-gray-50");
			}
		});
	}

	// --- Filter Pills ---

	selectFilter(event) {
		const department = event.currentTarget.dataset.department || "";
		this.selectedDepartment = department;

		this.filterPillsTarget
			.querySelectorAll("[data-department]")
			.forEach((btn) => {
				const isActive = (btn.dataset.department || "") === department;
				btn.classList.toggle("bg-gray-900", isActive);
				btn.classList.toggle("text-white", isActive);
				btn.classList.toggle("shadow-sm", isActive);
				btn.classList.toggle("bg-gray-100", !isActive);
				btn.classList.toggle("text-gray-600", !isActive);
			});

		if (this.searchInputTarget.value.trim().length >= 2) {
			this.search();
		}
	}

	// --- Render Search Results ---

	renderResults(users, query) {
		this.hideLoading();

		this.resultCountTarget.textContent = `${users.length} result${users.length !== 1 ? "s" : ""}`;
		this.resultCountTarget.classList.remove("hidden");

		if (users.length === 0) {
			this.searchResultsTarget.innerHTML = `
        <div class="p-6 text-center">
          <svg class="h-8 w-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
          </svg>
          <p class="text-sm font-medium text-gray-500">No users found</p>
          <p class="text-xs text-gray-400 mt-0.5">Try a different name or email</p>
        </div>
      `;
			this.searchResultsTarget.classList.remove("hidden");
			return;
		}

		// Filter out users already in contacts
		const nonContactUsers = users.filter((u) => !u.is_contact);

		if (nonContactUsers.length === 0) {
			this.searchResultsTarget.innerHTML = `
        <div class="p-4 text-center">
          <p class="text-sm text-gray-500">All matching users are already contacts</p>
        </div>
      `;
			this.searchResultsTarget.classList.remove("hidden");
			return;
		}

		this.searchResultsTarget.innerHTML = nonContactUsers
			.map(
				(user, i) => `
      <div class="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-all duration-150 cursor-default result-item"
           data-result-index="${i}" data-user-id="${user.id}"
           style="animation: resultSlideIn ${60 + i * 40}ms ease-out both">
        <div class="h-9 w-9 rounded-full ${this.avatarColor(user.department)} flex items-center justify-center text-xs font-semibold shrink-0">
          ${user.initials}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 truncate">${this.highlightMatch(user.name, query)}</p>
          <p class="text-xs text-gray-500 truncate">${this.highlightMatch(user.email, query)}</p>
        </div>
        <span class="text-[10px] font-medium px-2 py-0.5 rounded-full ${this.departmentBadgeColor(user.department)} shrink-0">${user.department}</span>
        <button data-action="click->contacts#addContact" data-user-id="${user.id}" data-result-index="${i}"
             class="shrink-0 h-8 w-8 flex items-center justify-center rounded-full border-2 border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-110 active:scale-95 transition-all duration-150 cursor-pointer" title="Add to contacts">
             <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        </button>
      </div>
    `,
			)
			.join("");

		this.searchResultsTarget.classList.remove("hidden");
	}

	highlightMatch(text, query) {
		if (!query || !text) return text;
		const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const regex = new RegExp(`(${escaped})`, "gi");
		return text.replace(
			regex,
			'<mark class="bg-yellow-100 text-yellow-900 rounded-sm px-0.5 font-semibold">$1</mark>',
		);
	}

	avatarColor(department) {
		const colors = {
			"Computer Science": "bg-blue-100 text-blue-700",
			Physics: "bg-green-100 text-green-700",
			Math: "bg-purple-100 text-purple-700",
			Chemistry: "bg-yellow-100 text-yellow-700",
		};
		return colors[department] || "bg-gray-100 text-gray-700";
	}

	departmentBadgeColor(department) {
		const colors = {
			"Computer Science": "bg-blue-50 text-blue-600",
			Physics: "bg-green-50 text-green-600",
			Math: "bg-purple-50 text-purple-600",
			Chemistry: "bg-yellow-50 text-yellow-700",
		};
		return colors[department] || "bg-gray-50 text-gray-500";
	}

	// --- Add Contact ---

	addContact(event) {
		event.stopPropagation();
		const btn = event.currentTarget;
		const userId = btn.dataset.userId;
		const row = btn.closest("[data-result-index]");

		// Immediate visual feedback
		btn.disabled = true;
		btn.classList.add("pointer-events-none", "opacity-60");
		btn.innerHTML = `<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>`;

		fetch(this.createUrlValue, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				"X-CSRF-Token": this.csrfTokenValue,
			},
			body: JSON.stringify({ contact_id: userId }),
		})
			.then((r) => {
				if (r.ok) {
					return r.json().then((_) => {
						// Track added contact so it's excluded from future searches
						this.addedContactUserIds.add(String(userId));

						// Animate row out of search results
						row.style.transition = "all 200ms ease-out";
						row.style.opacity = "0";
						row.style.transform = "translateX(-20px)";
						setTimeout(() => {
							row.remove();
							// Update result count
							const remaining = this.searchResultsTarget.querySelectorAll(
								"[data-result-index]",
							).length;
							if (remaining === 0) {
								this.searchResultsTarget.classList.add("hidden");
								this.resultCountTarget.classList.add("hidden");
							} else {
								this.resultCountTarget.textContent = `${remaining} result${remaining !== 1 ? "s" : ""}`;
							}
						}, 200);

						// Reload contacts list to show the new contact
						this.contactsLoaded = false;
						this.loadContacts();
					});
				} else {
					btn.disabled = false;
					btn.classList.remove("pointer-events-none", "opacity-60");
					btn.innerHTML = `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>`;
				}
			})
			.catch(() => {
				btn.disabled = false;
				btn.classList.remove("pointer-events-none", "opacity-60");
				btn.innerHTML = `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>`;
			});
	}

	// --- Contacts List ---

	loadContacts() {
		this.contactsListTarget.innerHTML = `
      <div class="p-4 flex items-center justify-center gap-2 text-sm text-gray-400">
        <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
        Loading...
      </div>
    `;

		fetch(this.contactsUrlValue, { headers: { Accept: "application/json" } })
			.then((r) => r.json())
			.then((contacts) => {
				this.contactsLoaded = true;
				this.renderContacts(contacts);
			})
			.catch(() => {
				this.contactsListTarget.innerHTML = `
          <div class="p-4 text-sm text-red-500 text-center">Failed to load contacts.</div>
        `;
			});
	}

	renderContacts(contacts) {
		if (contacts.length === 0) {
			this.contactsListTarget.innerHTML = `
        <div class="p-5 text-center">
          <svg class="h-8 w-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
          <p class="text-sm font-medium text-gray-500">No contacts yet</p>
          <p class="text-xs text-gray-400 mt-0.5">Search for users above to add them</p>
        </div>
      `;
			return;
		}

		this.contactsListTarget.innerHTML = contacts
			.map(
				(c, i) => `
      <div class="group flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-all duration-150"
           data-contact-row-id="${c.id}" data-user-id="${c.user_id}"
           style="animation: resultSlideIn ${60 + i * 40}ms ease-out both">
        <a href="${c.conversation_url}" data-action="click->contacts#navigateToConversation" data-turbo-action="advance"
           class="flex items-center gap-3 min-w-0 flex-1 rounded-lg transition-colors">
          <div class="h-9 w-9 rounded-full ${this.avatarColor(c.department)} flex items-center justify-center text-xs font-semibold shrink-0 transition-transform group-hover:scale-105">
            ${c.initials}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">${c.name}</p>
            <p class="text-xs text-gray-500 truncate">${c.email}</p>
          </div>
        </a>
        <span class="text-[10px] font-medium px-2 py-0.5 rounded-full ${this.departmentBadgeColor(c.department)} shrink-0">${c.department}</span>
        <button data-action="click->contacts#removeContact" data-contact-id="${c.id}"
          class="shrink-0 h-7 w-7 flex items-center justify-center rounded-full text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 active:scale-90 transition-all duration-150 cursor-pointer" title="Remove contact">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
      </div>
    `,
			)
			.join("");
	}

	// Navigate to conversation and switch to Messages tab
	navigateToConversation() {
		this.showMessages();
	}

	// --- Remove Contact ---

	removeContact(event) {
		event.stopPropagation();
		event.preventDefault();
		const btn = event.currentTarget;
		const contactId = btn.dataset.contactId;
		const row = btn.closest("[data-contact-row-id]");
		const userId = row.dataset.userId;
		if (userId) this.addedContactUserIds.delete(String(userId));

		// Animate out
		row.style.transition = "all 200ms ease-out";
		row.style.opacity = "0";
		row.style.transform = "translateX(20px)";

		fetch(`/contacts/${contactId}`, {
			method: "DELETE",
			headers: { "X-CSRF-Token": this.csrfTokenValue },
		})
			.then((r) => {
				if (r.ok) {
					setTimeout(() => {
						row.remove();
						if (
							this.contactsListTarget.querySelectorAll("[data-contact-row-id]")
								.length === 0
						) {
							this.renderContacts([]);
						}
					}, 200);
				} else {
					row.style.opacity = "1";
					row.style.transform = "translateX(0)";
				}
			})
			.catch(() => {
				row.style.opacity = "1";
				row.style.transform = "translateX(0)";
			});
	}
}
