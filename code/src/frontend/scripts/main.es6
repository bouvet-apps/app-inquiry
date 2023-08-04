import "regenerator-runtime/runtime";

import "../styles/main.scss";

// require.context() to make sure webpack picks up image files.
require.context("../images/", true, /\.(svg|gif|png|jp?g|webp)/i, "lazy");

/* eslint-env browser */

const initInquiryEvents = () => {
  // Get elements
  const box = document.getElementById("inquiry-box");
  const boxClose = document.getElementById("inquiry-box-close");
  const boxContinue = document.getElementById("inquiry-box-continue");
  const popupModal = document.getElementById("inquiry-popupmodal");
  const popupClose = document.getElementById("inquiry-popup-close");
  const popupQuestions = document.getElementById("inquiry-popup-questions");
  const popupResponse = document.getElementById("inquiry-popup-response");
  const popupError = document.getElementById("inquiry-popup-error");
  const popupForm = document.getElementById("inquiry-popup-form");
  const focusableElements = "button, [href], input:not([name=\"inquiryBait\"]), select, textarea, [tabindex]:not([tabindex=\"-1\"])";
  const focusableContent = popupModal.querySelectorAll(focusableElements);

  // Set variables
  const dateToday = new Date();
  const cookieExpirationDate = new Date(dateToday.getFullYear() + 1, dateToday.getMonth() + 1).toUTCString();
  const inquiryID = box.dataset.identifier;
  const testmode = box.dataset.testmode;
  let enableSubmit = true;

  // Bind click/submit events
  const inquiryKeyboardHandler = (event) => {
    if (!popupModal.classList.contains("inquiry-hidden")) {
      if (event.key === "Escape") {
        // Close popupmodal on escape press
        popupModal.classList.add("inquiry-hidden");
        document.cookie = `inquiryIdentifier=${inquiryID}; path=/; expires=${cookieExpirationDate};`;
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
    document.cookie = `inquiryIdentifier=${inquiryID}; path=/; expires=${cookieExpirationDate};`;
  });

  if (boxContinue) {
    boxContinue.addEventListener("click", () => {
      box.classList.add("inquiry-hidden");
      popupModal.classList.remove("inquiry-hidden");

      if (focusableContent.length > 0) {
        focusableContent[0].focus();
      }
      document.addEventListener("keydown", inquiryKeyboardHandler);
    });
  }

  popupClose.addEventListener("click", () => {
    popupModal.classList.add("inquiry-hidden");
    document.cookie = `inquiryIdentifier=${inquiryID}; path=/; expires=${cookieExpirationDate};`;
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
              }

              document.cookie = `inquiryIdentifier=${inquiryID}; path=/; expires=${cookieExpirationDate};`;
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

  // Check cookie before displaying inquiry box
  // Prevents it from showing again in case the browser returns a cached version of the page (like when using back button)
  const cookieIdentifier = document.cookie.split(";").find((row) => row.trim().startsWith("inquiryIdentifier="))?.split("=")[1];
  if (testmode || cookieIdentifier !== inquiryID) {
    box.classList.remove("inquiry-hidden");
  }
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
