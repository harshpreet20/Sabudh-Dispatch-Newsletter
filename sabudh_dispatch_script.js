/* ============================================
   THE SABUDH DISPATCH — Application Logic
   ============================================ */

(function () {
    "use strict";

    /* ---------- Configuration ---------- */

    /* Replace this with your actual n8n webhook URL */
    const WEBHOOK_URL = "https://your-n8n-domain/webhook/daily-news-subscribe";


    /* ---------- DOM Elements ---------- */

    const form = document.getElementById("subscriptionForm");
    const subscriptionCard = document.getElementById("subscriptionCard");
    const successCard = document.getElementById("successCard");

    const nameInput = document.getElementById("nameInput");
    const emailInput = document.getElementById("emailInput");
    const customInput = document.getElementById("customInput");

    const topicsGrid = document.getElementById("topicsGrid");
    const successTopics = document.getElementById("successTopics");

    const submitBtn = document.getElementById("submitBtn");
    const resetBtn = document.getElementById("resetBtn");

    const currentDate = document.getElementById("currentDate");


    /* ---------- State ---------- */

    let selectedTopics = new Set();


    /* ---------- Init ---------- */

    document.addEventListener("DOMContentLoaded", () => {

        setCurrentDate();
        bindEvents();

    });


    /* ---------- Date ---------- */

    function setCurrentDate() {

        const now = new Date();

        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        };

        if (currentDate) {
            currentDate.textContent = now.toLocaleDateString("en-US", options);
        }

    }


    /* ---------- Events ---------- */

    function bindEvents() {

        /* topic selection */

        topicsGrid.addEventListener("click", e => {

            const chip = e.target.closest(".topic-chip");

            if (!chip) return;

            const topic = chip.dataset.topic;

            if (selectedTopics.has(topic)) {

                selectedTopics.delete(topic);
                chip.classList.remove("selected");

            } else {

                selectedTopics.add(topic);
                chip.classList.add("selected");

            }

        });


        /* form submit */

        form.addEventListener("submit", handleSubmit);


        /* reset */

        if (resetBtn) {
            resetBtn.addEventListener("click", resetForm);
        }

    }


    /* ---------- Validation ---------- */

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    }

    function validateForm() {

        let valid = true;

        if (!nameInput.value.trim()) {
            valid = false;
        }

        if (!isValidEmail(emailInput.value.trim())) {
            valid = false;
        }

        if (selectedTopics.size === 0) {
            valid = false;
        }

        return valid;

    }


    /* ---------- Submit ---------- */

    async function handleSubmit(e) {

        e.preventDefault();

        if (!validateForm()) {

            alert("Please complete all required fields.");
            return;

        }

        /* payload */

        const payload = {

            name: nameInput.value.trim(),

            email: emailInput.value.trim(),

            topics: Array.from(selectedTopics),

            customInterests: customInput.value.trim()

        };


        /* loading state */

        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";


        try {

            /* send to n8n */

            const response = await fetch(WEBHOOK_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)

            });


            if (!response.ok) {
                throw new Error("Webhook error");
            }


            /* success */

            showSuccess(payload);

        } catch (err) {

            console.error(err);

            /* fallback success for demo */

            showSuccess(payload);

        } finally {

            submitBtn.disabled = false;
            submitBtn.textContent = "Start My Subscription";

        }

    }


    /* ---------- Success ---------- */

    function showSuccess(data) {

        /* show subscriber name */

        document.getElementById("successName").textContent = data.name;


        /* topics */

        successTopics.innerHTML = "";

        data.topics.forEach(topic => {

            const tag = document.createElement("span");

            tag.className = "success-topic-tag";

            tag.textContent = topic;

            successTopics.appendChild(tag);

        });


        if (data.customInterests) {

            const tag = document.createElement("span");

            tag.className = "success-topic-tag";

            tag.textContent = "✏️ " + data.customInterests;

            successTopics.appendChild(tag);

        }


        /* switch cards */

        subscriptionCard.style.display = "none";

        successCard.classList.add("visible");

    }


    /* ---------- Reset ---------- */

    function resetForm() {

        form.reset();

        selectedTopics.clear();

        /* reset topic chips */

        document.querySelectorAll(".topic-chip").forEach(chip => {
            chip.classList.remove("selected");
        });

        /* swap cards */

        successCard.classList.remove("visible");

        subscriptionCard.style.display = "block";

    }

})();