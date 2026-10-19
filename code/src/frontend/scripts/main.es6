import "regenerator-runtime/runtime";

import "../styles/main.scss";

// require.context() to make sure webpack picks up image files.
require.context("../images/", true, /\.(svg|gif|png|jp?g|webp)/i, "lazy");

/* eslint-env browser */

const initInquiry = (instance, showNextInquiry) => {
  // Get elements
  const box = instance.querySelector("#inquiry-box");
  const boxClose = instance.querySelector("#inquiry-box-close");
  const boxContinue = instance.querySelector("#inquiry-box-continue");
  const popupModal = instance.querySelector("#inquiry-popupmodal");
  const popupClose = instance.querySelector("#inquiry-popup-close");
  const popupQuestions = instance.querySelector("#inquiry-popup-questions");
  const popupResponse = instance.querySelector("#inquiry-popup-response");
  const popupError = instance.querySelector("#inquiry-popup-error");
  const popupForm = instance.querySelector("#inquiry-popup-form");
  const focusableElements = "button, [href], input:not([name=\"inquiryBait\"]), select, textarea, [tabindex]:not([tabindex=\"-1\"])";
  const focusableContent = popupModal.querySelectorAll(focusableElements);

  // Set variables
  const dateToday = new Date();
  const cookieExpirationDate = new Date(dateToday.getFullYear() + 1, dateToday.getMonth() + 1).toUTCString();
  const inquiryID = instance.dataset.identifier;
  const cookieName = `inquiry-${inquiryID}`;
  let enableSubmit = true;

  // Bind click/submit events
  const inquiryKeyboardHandler = (event) => {
    if (!popupModal.classList.contains("inquiry-hidden")) {
      if (event.key === "Escape") {
        // Close popupmodal on escape press
        popupModal.classList.add("inquiry-hidden");
        document.cookie = `${cookieName}=closed; path=/; expires=${cookieExpirationDate};`;
        window.removeEventListener("keydown", inquiryKeyboardHandler);
        showNextInquiry();
      } else if (event.key === "Tab") {
        // Loop the focus within the modal when pressing tab
        if (focusableContent.length > 0) {
          const firstFocusableElement = focusableContent[0];
          const lastFocusableElement = focusableContent[focusableContent.length - 1];

          if (event.shiftKey && document.activeElement === firstFocusableElement) {
            // If shift+tab pressed while first element is focused, set focus to last element
            event.preventDefault();
            lastFocusableElement.focus();
          } else if (!event.shiftKey && document.activeElement === lastFocusableElement) {
            // If tab pressed while last element is focused, set focus to first element
            event.preventDefault();
            firstFocusableElement.focus();
          }
        }
      }
    }
  };

  boxClose.addEventListener("click", () => {
    box.classList.add("inquiry-hidden");
    document.cookie = `${cookieName}=closed; path=/; expires=${cookieExpirationDate};`;
    showNextInquiry();
  });

  if (boxContinue) {
    boxContinue.addEventListener("click", () => {
      box.classList.add("inquiry-hidden");
      popupModal.classList.remove("inquiry-hidden");

      if (focusableContent.length > 0) {
        focusableContent[0].focus();
      }
      window.addEventListener("keydown", inquiryKeyboardHandler);
    });
  }

  popupClose.addEventListener("click", () => {
    popupModal.classList.add("inquiry-hidden");
    document.cookie = `${cookieName}=closed; path=/; expires=${cookieExpirationDate};`;
    window.removeEventListener("keydown", inquiryKeyboardHandler);
    showNextInquiry();
  });

  if (popupForm) {
    popupForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (enableSubmit) {
        enableSubmit = false;

        // Post data and show thank you message if response is ok, show error if not
        const formData = new FormData(popupForm);
        formData.append("inquiryIdentifier", inquiryID);

        fetch(popupForm.action, { method: "post", body: formData })
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            throw new Error(response.status);
          })
          .then((data) => {
            if (data.saved) {
              popupQuestions.classList.add("inquiry-hidden");

              if (popupResponse) {
                popupResponse.classList.remove("inquiry-hidden");
              } else {
                popupModal.classList.add("inquiry-hidden");
                window.removeEventListener("keydown", inquiryKeyboardHandler);
                showNextInquiry();
              }

              document.cookie = `${cookieName}=closed; path=/; expires=${cookieExpirationDate};`;
            } else {
              throw new Error("Data could not be saved!");
            }
          })
          .catch((error) => {
            console.log(error);
            popupError.classList.remove("inquiry-hidden");
            enableSubmit = true;
          });
      }
    });
  }

  box.classList.remove("inquiry-hidden");
};

const initInquiryEvents = () => {
  const inquiries = document.querySelectorAll(".inquiry-instance");
  let nextInquiryIndex = 0;

  const showNextInquiry = () => {
    while (nextInquiryIndex < inquiries.length) {
      const instance = inquiries[nextInquiryIndex];
      nextInquiryIndex += 1;
      const cookieName = `inquiry-${instance.dataset.identifier}`;
      const dismissed = document.cookie.split(";").some((row) => row.trim().startsWith(`${cookieName}=`));
      if (instance.dataset.testmode === "true" || !dismissed) {
        initInquiry(instance, showNextInquiry);
        return;
      }
    }
  };

  showNextInquiry();
};

if (document.readyState !== "loading") {
  // Page was finished loading before we came to this line. Run whatever you like.
  initInquiryEvents();
} else {
  // Page was not finished loading yet, so we attach an event listener.
  window.addEventListener("DOMContentLoaded", () => {
    // Run this when page is finished loading.
    initInquiryEvents();
  });
}
