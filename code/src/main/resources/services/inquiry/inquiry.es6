const libs = {
  portal: require("/lib/xp/portal"),
  repository: require("/lib/repository"),
  util: require("/lib/util")
};

exports.post = (req) => {
  const config = libs.portal.getSiteConfig();
  const identifier = config.identifier;
  const questions = libs.util.forceArray(config.popupQuestions);
  const answers = req.params;
  let savedAnswers = true;

  // Filter out bots by checking if honeypot input field is empty
  // Also check if the identifier input field matches the identifier of currently active inquiry
  if (!answers.inquiryBait && answers.inquiryIdentifier === identifier) {
    delete answers.inquiryBait;
    delete answers.inquiryIdentifier;

    // Sanitize the form inputs
    Object.keys(answers).forEach((key) => {
      const value = answers[key];

      if (Array.isArray(value)) {
        value.forEach((arrayValue, index) => {
          if (arrayValue) {
            value[index] = libs.portal.sanitizeHtml(arrayValue).replace(/\r?\n|\r/g, "<br>").trim();
          }
        });
      } else if (value) {
        answers[key] = libs.portal.sanitizeHtml(value).replace(/\r?\n|\r/g, "<br>").trim();
      }
    });

    // Save/update the current inquiry questions and save the answers
    savedAnswers = libs.repository.runAsAdmin(() => {
      if (libs.repository.checkRepo() && libs.repository.saveInquiry(identifier, questions) && libs.repository.saveAnswers(identifier, answers)) {
        return true;
      }

      return false;
    });
  }

  return {
    body: {
      saved: savedAnswers
    },
    contentType: "application/json"
  };
};
